import type {
  IntakeAnswer,
  IntakeAnswerFileReference,
  IntakeFieldType,
  IntakeFormSnapshot,
  IntakeQuestionDefinition,
  IntakeVisibilityRule,
} from '@/types/intake';

type AnswerMap = Map<string, IntakeAnswer>;

function hasValue(value: unknown, fieldType: IntakeFieldType): boolean {
  if (fieldType === 'yes-no') {
    return typeof value === 'boolean';
  }

  if (fieldType === 'consent') {
    return value === true;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value);
  }

  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  return value !== undefined && value !== null;
}

function evaluateVisibilityRule(
  rule: IntakeVisibilityRule,
  answers: AnswerMap
) {
  const currentValue = answers.get(rule.sourceQuestionKey)?.value;

  switch (rule.operator) {
    case 'eq':
      return currentValue === rule.value;
    case 'neq':
      return currentValue !== rule.value;
    case 'in':
      if (!Array.isArray(rule.values)) {
        return false;
      }

      if (Array.isArray(currentValue)) {
        return currentValue.some((value) => rule.values?.includes(value));
      }

      return rule.values.includes(currentValue);
    case 'contains':
      if (typeof currentValue === 'string') {
        return currentValue.includes(String(rule.value ?? ''));
      }

      if (Array.isArray(currentValue)) {
        return currentValue.includes(rule.value);
      }

      return false;
    case 'gt':
      return Number(currentValue) > Number(rule.value);
    case 'lt':
      return Number(currentValue) < Number(rule.value);
    case 'isTrue':
      return currentValue === true;
    default:
      return true;
  }
}

function isQuestionVisible(
  question: IntakeQuestionDefinition,
  answers: AnswerMap
) {
  if (!question.visibilityRules?.length) {
    return true;
  }

  return question.visibilityRules.every((rule) =>
    evaluateVisibilityRule(rule, answers)
  );
}

function isFileReference(value: unknown): value is IntakeAnswerFileReference {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return (
    'fileAssetId' in value &&
    'originalFilename' in value &&
    'mimeType' in value &&
    'size' in value
  );
}

function formatAnswerValue(value: unknown): string {
  if (Array.isArray(value)) {
    if (value.every(isFileReference)) {
      return value.map((file) => file.originalFilename).join(', ');
    }

    return value.join(', ');
  }

  if (typeof value === 'boolean') {
    return value ? 'Ja' : 'Nein';
  }

  if (value === undefined || value === null) {
    return '';
  }

  return String(value);
}

function validateQuestion(
  question: IntakeQuestionDefinition,
  answer: IntakeAnswer | undefined
): string | null {
  const value = answer?.value;

  if (question.required && !hasValue(value, question.fieldType)) {
    return `${question.label} ist erforderlich.`;
  }

  if (!hasValue(value, question.fieldType)) {
    return null;
  }

  if (typeof value === 'string') {
    if (
      question.validationRules?.minLength &&
      value.trim().length < question.validationRules.minLength
    ) {
      return `${question.label} muss mindestens ${question.validationRules.minLength} Zeichen enthalten.`;
    }

    if (
      question.fieldType === 'email' &&
      !/^\S+@\S+\.\S+$/.test(value.trim())
    ) {
      return `${question.label} muss eine gueltige E-Mail-Adresse sein.`;
    }

    if (question.fieldType === 'url') {
      try {
        new URL(value.trim());
      } catch {
        return `${question.label} muss eine gueltige URL sein.`;
      }
    }
  }

  if (
    question.fieldType === 'checkbox-group' &&
    Array.isArray(value) &&
    question.validationRules?.minSelections &&
    value.length < question.validationRules.minSelections
  ) {
    return `${question.label} benötigt mindestens ${question.validationRules.minSelections} Auswahl(en).`;
  }

  if (question.fieldType === 'consent' && value !== true) {
    return `${question.label} muss bestätigt werden.`;
  }

  return null;
}

export interface IntakeValidationResult {
  isValid: boolean;
  errors: string[];
  consentAccepted: boolean;
  summary: Array<{ label: string; value: string }>;
}

export function validateIntakeSubmission(
  formSnapshot: IntakeFormSnapshot,
  answers: IntakeAnswer[]
): IntakeValidationResult {
  const answerMap: AnswerMap = new Map(
    answers.map((answer) => [answer.questionKey, answer])
  );
  const errors: string[] = [];
  const summary: Array<{ label: string; value: string }> = [];
  let consentAccepted = false;

  for (const section of formSnapshot.sections) {
    for (const question of section.questions) {
      if (!isQuestionVisible(question, answerMap)) {
        continue;
      }

      const answer = answerMap.get(question.key);
      const validationError = validateQuestion(question, answer);

      if (validationError) {
        errors.push(validationError);
        continue;
      }

      if (answer && hasValue(answer.value, question.fieldType)) {
        summary.push({
          label: question.label,
          value: formatAnswerValue(answer.value),
        });
      }

      if (question.fieldType === 'consent' && answer?.value === true) {
        consentAccepted = true;
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    consentAccepted,
    summary,
  };
}
