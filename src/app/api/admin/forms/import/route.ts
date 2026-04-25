import { NextRequest } from 'next/server';
import { z } from 'zod';
import {
  errorResponse,
  handleApiError,
  successResponse,
} from '@/lib/api-response';
import { writeAdminAuditLog } from '@/lib/admin-audit';
import {
  requireIntakeAdminMutationAccess,
} from '@/lib/api-auth';
import connectToDatabase from '@/lib/mongodb';
import IntakeForm from '@/models/IntakeForm';
import {
  importedIntakeFormSchema,
  importIntakeFormSchema,
  previewImportedIntakeFormSchema,
  type ImportedIntakeFormDocument,
} from '@/schemas/intake/form-import.schema';

const importActionSchema = z.object({
  action: z.enum(['preview', 'import']),
});

interface ImportPreviewWarning {
  code: string;
  message: string;
  path?: string;
}

const optionFieldTypes = new Set(['dropdown', 'radio', 'checkbox-group']);

function findDuplicates(values: string[]) {
  const counts = new Map<string, number>();

  values.forEach((value) => {
    counts.set(value, (counts.get(value) || 0) + 1);
  });

  return Array.from(counts.entries())
    .filter(([, count]) => count > 1)
    .map(([value]) => value);
}

function buildImportWarnings(
  document: ImportedIntakeFormDocument
): ImportPreviewWarning[] {
  const warnings: ImportPreviewWarning[] = [];
  const sections = document.sections;
  const allQuestions = sections.flatMap((section) => section.questions);
  const questionKeys = new Set(allQuestions.map((question) => question.key));

  const duplicateSectionIds = findDuplicates(
    sections.map((section) => section.id)
  );
  const duplicateStepKeys = findDuplicates(
    sections.map((section) => section.stepKey)
  );
  const duplicateSectionOrders = findDuplicates(
    sections.map((section) => String(section.order))
  );
  const duplicateQuestionIds = findDuplicates(
    allQuestions.map((question) => question.id)
  );
  const duplicateQuestionKeys = findDuplicates(
    allQuestions.map((question) => question.key)
  );

  duplicateSectionIds.forEach((sectionId) => {
    warnings.push({
      code: 'duplicate-section-id',
      path: sectionId,
      message: `Section-ID "${sectionId}" ist mehrfach vorhanden. Das erschwert stabile Updates und Zuordnung im Admin.`,
    });
  });

  duplicateStepKeys.forEach((stepKey) => {
    warnings.push({
      code: 'duplicate-step-key',
      path: stepKey,
      message: `Der Step-Key "${stepKey}" wird mehrfach verwendet. Fortschritt und Navigation sollten pro Section eindeutig sein.`,
    });
  });

  duplicateSectionOrders.forEach((orderValue) => {
    warnings.push({
      code: 'duplicate-section-order',
      path: `order:${orderValue}`,
      message: `Mehrere Sections verwenden die Reihenfolge ${orderValue}. Die Anzeige kann dadurch uneindeutig werden.`,
    });
  });

  duplicateQuestionIds.forEach((questionId) => {
    warnings.push({
      code: 'duplicate-question-id',
      path: questionId,
      message: `Frage-ID "${questionId}" ist mehrfach vorhanden. Das erschwert saubere Zuordnung in Datenbank und UI.`,
    });
  });

  duplicateQuestionKeys.forEach((questionKey) => {
    warnings.push({
      code: 'duplicate-question-key',
      path: questionKey,
      message: `Frage-Key "${questionKey}" ist mehrfach vorhanden. Antworten und Sichtbarkeitsregeln koennen dadurch falsch aufgeloest werden.`,
    });
  });

  sections.forEach((section) => {
    const questionOrders = section.questions.map((question) =>
      String(question.order)
    );
    const duplicateQuestionOrders = findDuplicates(questionOrders);

    if (!section.description?.trim()) {
      warnings.push({
        code: 'missing-section-description',
        path: section.stepKey,
        message: `Section "${section.title}" hat keine Beschreibung. Fuer grosse Formulare verbessert eine kurze Einordnung die Lesbarkeit deutlich.`,
      });
    }

    duplicateQuestionOrders.forEach((orderValue) => {
      warnings.push({
        code: 'duplicate-question-order',
        path: `${section.stepKey}#${orderValue}`,
        message: `In der Section "${section.title}" wird die Frage-Reihenfolge ${orderValue} mehrfach verwendet.`,
      });
    });

    const sortedOrders = section.questions
      .map((question) => question.order)
      .slice()
      .sort((left, right) => left - right);

    const hasSequentialOrderIssue = sortedOrders.some(
      (orderValue, index) => orderValue !== index + 1
    );

    if (hasSequentialOrderIssue) {
      warnings.push({
        code: 'non-sequential-question-order',
        path: section.stepKey,
        message: `Die Fragen in "${section.title}" sind nicht lueckenlos ab 1 durchnummeriert. Das ist technisch erlaubt, macht die Pflege aber unnoetig schwerer.`,
      });
    }

    section.questions.forEach((question) => {
      const questionPath = `${section.stepKey}.${question.key}`;
      const optionValues =
        question.options?.map((option) => option.value) || [];
      const duplicateOptionValues = findDuplicates(optionValues);

      if (
        optionFieldTypes.has(question.fieldType) &&
        !question.options?.length
      ) {
        warnings.push({
          code: 'missing-options',
          path: questionPath,
          message: `Die Frage "${question.label}" verwendet den Typ "${question.fieldType}", hat aber keine Optionen hinterlegt.`,
        });
      }

      if (
        !optionFieldTypes.has(question.fieldType) &&
        question.options?.length
      ) {
        warnings.push({
          code: 'unused-options',
          path: questionPath,
          message: `Die Frage "${question.label}" hat Optionen definiert, obwohl der Typ "${question.fieldType}" diese normalerweise nicht nutzt.`,
        });
      }

      duplicateOptionValues.forEach((optionValue) => {
        warnings.push({
          code: 'duplicate-option-value',
          path: questionPath,
          message: `Die Frage "${question.label}" verwendet den Optionswert "${optionValue}" mehrfach.`,
        });
      });

      if (
        question.validationRules?.minLength !== undefined &&
        question.validationRules?.maxLength !== undefined &&
        question.validationRules.minLength > question.validationRules.maxLength
      ) {
        warnings.push({
          code: 'invalid-length-range',
          path: questionPath,
          message: `Die Frage "${question.label}" hat minLength groesser als maxLength.`,
        });
      }

      if (
        question.validationRules?.min !== undefined &&
        question.validationRules?.max !== undefined &&
        question.validationRules.min > question.validationRules.max
      ) {
        warnings.push({
          code: 'invalid-value-range',
          path: questionPath,
          message: `Die Frage "${question.label}" hat min groesser als max.`,
        });
      }

      if (
        question.validationRules?.minSelections !== undefined &&
        question.validationRules?.maxSelections !== undefined &&
        question.validationRules.minSelections >
          question.validationRules.maxSelections
      ) {
        warnings.push({
          code: 'invalid-selection-range',
          path: questionPath,
          message: `Die Frage "${question.label}" hat minSelections groesser als maxSelections.`,
        });
      }

      if (
        question.validationRules?.minSelections !== undefined &&
        question.options?.length !== undefined &&
        question.validationRules.minSelections > question.options.length
      ) {
        warnings.push({
          code: 'min-selections-exceeds-options',
          path: questionPath,
          message: `Die Frage "${question.label}" fordert mehr Auswahlen als Optionen vorhanden sind.`,
        });
      }

      question.visibilityRules?.forEach((rule, index) => {
        if (!questionKeys.has(rule.sourceQuestionKey)) {
          warnings.push({
            code: 'unknown-visibility-source',
            path: `${questionPath}.visibilityRules[${index}]`,
            message: `Die Sichtbarkeitsregel von "${question.label}" verweist auf den unbekannten Frage-Key "${rule.sourceQuestionKey}".`,
          });
        }

        if (
          ['eq', 'neq', 'contains', 'gt', 'lt'].includes(rule.operator) &&
          rule.value === undefined
        ) {
          warnings.push({
            code: 'missing-visibility-value',
            path: `${questionPath}.visibilityRules[${index}]`,
            message: `Die Sichtbarkeitsregel ${index + 1} von "${question.label}" erwartet einen Einzelwert, hat aber keinen.`,
          });
        }

        if (
          rule.operator === 'in' &&
          (!rule.values || rule.values.length === 0)
        ) {
          warnings.push({
            code: 'missing-visibility-values',
            path: `${questionPath}.visibilityRules[${index}]`,
            message: `Die Sichtbarkeitsregel ${index + 1} von "${question.label}" verwendet "in", aber ohne Werte-Liste.`,
          });
        }
      });
    });
  });

  return warnings;
}

function parseImportedDocument(json: string): ImportedIntakeFormDocument {
  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(json);
  } catch {
    throw new Error('Das eingefuegte Dokument ist kein gueltiges JSON.');
  }

  return importedIntakeFormSchema.parse(parsedJson);
}

function buildImportSummary(document: ImportedIntakeFormDocument) {
  const sectionCount = document.sections.length;
  const questions = document.sections.flatMap((section) => section.questions);

  return {
    sectionCount,
    questionCount: questions.length,
    conditionalQuestionCount: questions.filter(
      (question) => question.visibilityRules?.length
    ).length,
    fileQuestionCount: questions.filter(
      (question) => question.fieldType === 'file'
    ).length,
  };
}

async function findExistingForm(slug: string) {
  const existingForm = await IntakeForm.findOne({ slug })
    .select('_id title slug status updatedAt')
    .exec();

  if (!existingForm) {
    return null;
  }

  return {
    id: String(existingForm.id ?? existingForm._id),
    title: existingForm.title,
    slug: existingForm.slug,
    status: existingForm.status,
    updatedAt: existingForm.updatedAt,
  };
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = (await request.json()) as unknown;
    const { action } = importActionSchema.parse(rawBody);
    const authState = await requireIntakeAdminMutationAccess(
      request,
      ['admin'],
      action === 'preview' ? 'intake-form-import-preview' : 'intake-form-import'
    );

    if ('status' in authState) {
      return authState;
    }

    await connectToDatabase();

    if (action === 'preview') {
      const body = previewImportedIntakeFormSchema.parse(rawBody);
      const document = parseImportedDocument(body.json);
      const existingForm = await findExistingForm(document.slug);

      return successResponse(
        {
          document,
          summary: buildImportSummary(document),
          warnings: buildImportWarnings(document),
          existingForm,
        },
        'Import-Vorschau erfolgreich erstellt.'
      );
    }

    const body = importIntakeFormSchema.parse(rawBody);
    const document = parseImportedDocument(body.json);
    const existingForm = await IntakeForm.findOne({
      slug: document.slug,
    }).exec();

    if (existingForm && !body.overwrite) {
      return errorResponse(
        'Ein Formular mit diesem Slug existiert bereits. Aktiviere Ueberschreiben, um es zu aktualisieren.',
        409
      );
    }

    const savedForm = existingForm
      ? await IntakeForm.findByIdAndUpdate(
          existingForm._id,
          {
            $set: document,
          },
          { new: true }
        )
          .select('-__v')
          .exec()
      : await IntakeForm.create(document);

    if (!savedForm) {
      return errorResponse('Formular konnte nicht gespeichert werden', 500);
    }

    await writeAdminAuditLog({
      request,
      authState,
      action: existingForm
        ? 'intake.form.import.update'
        : 'intake.form.import.create',
      resourceType: 'form',
      resourceId: String(savedForm.id ?? savedForm._id),
      required: true,
      metadata: {
        slug: document.slug,
        title: document.title,
        overwrite: Boolean(body.overwrite),
        existingFormId: existingForm
          ? String(existingForm.id ?? existingForm._id)
          : undefined,
        summary: buildImportSummary(document),
        warningCount: buildImportWarnings(document).length,
      },
    });

    return successResponse(
      savedForm,
      existingForm
        ? 'Importiertes Formular wurde aktualisiert.'
        : 'Importiertes Formular wurde gespeichert.',
      existingForm ? 200 : 201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
