'use client';

import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  useTransition,
} from 'react';
import { useRouter } from 'next/navigation';
import Checkbox from '@/components/ui/Form/Checkbox';
import Form from '@/components/ui/Form/Form';
import Input from '@/components/ui/Form/Input';
import Select from '@/components/ui/Form/Select';
import Textarea from '@/components/ui/Form/Textarea';
import { formatFileSize } from '@/lib/file-utils';
import { INTAKE_DEFAULT_UPLOAD_TYPES } from '@/lib/intake/constants';
import { cn } from '@/lib/utils';
import type {
  IntakeAnswer,
  IntakeAnswerFileReference,
  IntakeFieldOption,
  IntakeFormSnapshot,
  IntakeQuestionDefinition,
  IntakeSectionDefinition,
  IntakeVisibilityRule,
} from '@/types/intake';

type AnswerMap = Record<string, unknown>;
type ErrorMap = Record<string, string>;
type SaveState = 'idle' | 'saving' | 'saved' | 'error';
type UploadStateMap = Record<string, boolean>;
type UploadErrorMap = Record<string, string>;

function createInitialAnswerMap(
  formSnapshot: IntakeFormSnapshot,
  initialAnswers: IntakeAnswer[]
): AnswerMap {
  const answerMap: AnswerMap = {};

  for (const section of formSnapshot.sections) {
    for (const question of section.questions) {
      if (question.defaultValue !== undefined) {
        answerMap[question.key] = question.defaultValue;
      }
    }
  }

  for (const answer of initialAnswers) {
    answerMap[answer.questionKey] = answer.value;
  }

  return answerMap;
}

function hasValue(
  value: unknown,
  fieldType: IntakeQuestionDefinition['fieldType']
) {
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

function isIntakeFileReference(
  value: unknown
): value is IntakeAnswerFileReference {
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

function isIntakeFileReferenceArray(
  value: unknown
): value is IntakeAnswerFileReference[] {
  return Array.isArray(value) && value.every(isIntakeFileReference);
}

function isPreviewableImageMimeType(mimeType: string) {
  return mimeType.startsWith('image/');
}

function evaluateVisibilityRule(
  rule: IntakeVisibilityRule,
  answers: AnswerMap
) {
  const currentValue = answers[rule.sourceQuestionKey];

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

function getVisibleQuestions(
  section: IntakeSectionDefinition,
  answers: AnswerMap
) {
  return section.questions
    .slice()
    .sort((left, right) => left.order - right.order)
    .filter((question) => isQuestionVisible(question, answers));
}

function getQuestionValue(
  answerMap: AnswerMap,
  question: IntakeQuestionDefinition
) {
  const value = answerMap[question.key];

  if (value !== undefined) {
    return value;
  }

  if (question.fieldType === 'checkbox-group') {
    return [];
  }

  if (question.fieldType === 'file') {
    return [];
  }

  return question.defaultValue ?? '';
}

function validateQuestion(
  question: IntakeQuestionDefinition,
  value: unknown
): string | null {
  if (question.required && !hasValue(value, question.fieldType)) {
    return 'Dieses Feld ist erforderlich.';
  }

  if (!hasValue(value, question.fieldType)) {
    return null;
  }

  if (typeof value === 'string') {
    if (
      question.validationRules?.minLength &&
      value.trim().length < question.validationRules.minLength
    ) {
      return `Bitte mindestens ${question.validationRules.minLength} Zeichen eingeben.`;
    }

    if (
      question.validationRules?.maxLength &&
      value.trim().length > question.validationRules.maxLength
    ) {
      return `Bitte maximal ${question.validationRules.maxLength} Zeichen eingeben.`;
    }

    if (question.fieldType === 'email') {
      const emailPattern = /^\S+@\S+\.\S+$/;

      if (!emailPattern.test(value.trim())) {
        return 'Bitte eine gueltige E-Mail-Adresse eingeben.';
      }
    }

    if (question.fieldType === 'url') {
      try {
        new URL(value.trim());
      } catch {
        return 'Bitte eine gültige URL eingeben.';
      }
    }
  }

  if (question.fieldType === 'consent' && value !== true) {
    return 'Bitte bestätige die Einwilligung vor dem Absenden.';
  }

  if (
    question.fieldType === 'checkbox-group' &&
    Array.isArray(value) &&
    question.validationRules?.minSelections &&
    value.length < question.validationRules.minSelections
  ) {
    return `Bitte mindestens ${question.validationRules.minSelections} Option(en) auswählen.`;
  }

  return null;
}

function buildAnswerPayload(
  formSnapshot: IntakeFormSnapshot,
  answerMap: AnswerMap
): IntakeAnswer[] {
  const answers: IntakeAnswer[] = [];

  for (const section of formSnapshot.sections) {
    for (const question of section.questions) {
      const value = answerMap[question.key];

      if (!hasValue(value, question.fieldType)) {
        continue;
      }

      const fileReferences = isIntakeFileReferenceArray(value)
        ? value
        : undefined;
      const displayValue = fileReferences
        ? fileReferences
            .map((fileReference) => fileReference.originalFilename)
            .join(', ')
        : Array.isArray(value)
          ? value.join(', ')
          : typeof value === 'boolean'
            ? value
              ? 'Ja'
              : 'Nein'
            : typeof value === 'number'
              ? String(value)
              : String(value);

      answers.push({
        questionId: question.id,
        questionKey: question.key,
        value,
        displayValue,
        files: fileReferences,
      });
    }
  }

  return answers;
}

function progressForStep(currentStepIndex: number, totalSteps: number): number {
  if (totalSteps <= 1) {
    return 100;
  }

  return Math.round(((currentStepIndex + 1) / totalSteps) * 100);
}

function getSectionValidationErrors(
  section: IntakeSectionDefinition,
  answers: AnswerMap
): ErrorMap {
  const nextErrors: ErrorMap = {};

  for (const question of getVisibleQuestions(section, answers)) {
    const value = answers[question.key];
    const message = validateQuestion(question, value);

    if (message) {
      nextErrors[question.key] = message;
    }
  }

  return nextErrors;
}

function SaveIndicator({ saveState }: { saveState: SaveState }) {
  const labels: Record<SaveState, string> = {
    idle: 'Noch nicht gespeichert',
    saving: 'Speichert ...',
    saved: 'Zwischenspeicherung erfolgreich',
    error: 'Speichern fehlgeschlagen',
  };

  const tone: Record<SaveState, string> = {
    idle: 'text-stone-500 dark:text-stone-400',
    saving: 'text-blue-600 dark:text-blue-300',
    saved: 'text-emerald-700 dark:text-emerald-300',
    error: 'text-red-700 dark:text-red-300',
  };

  return (
    <p className={cn('text-sm font-medium', tone[saveState])}>
      {labels[saveState]}
    </p>
  );
}

function ErrorSummary({
  hasAttemptedSubmit,
  totalErrorCount,
  currentStepErrorCount,
  errorSteps,
  onSelectStep,
}: {
  hasAttemptedSubmit: boolean;
  totalErrorCount: number;
  currentStepErrorCount: number;
  errorSteps: Array<{
    index: number;
    title: string;
    errorCount: number;
    isCurrent: boolean;
  }>;
  onSelectStep: (stepIndex: number) => void;
}) {
  if (!hasAttemptedSubmit || totalErrorCount === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-900 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-100">
      <p className="font-semibold">
        Es fehlen noch {totalErrorCount} Angabe
        {totalErrorCount === 1 ? '' : 'n'}.
      </p>
      <p className="mt-1 leading-6 text-red-800 dark:text-red-200">
        Bitte prüfe die markierten Felder, bevor du den Fragebogen absendest.
        {currentStepErrorCount > 0
          ? ` Auf diesem Schritt fehlen noch ${currentStepErrorCount} Angabe${currentStepErrorCount === 1 ? '' : 'n'}.`
          : ' Auf diesem Schritt ist aktuell nichts mehr offen.'}
      </p>
      {errorSteps.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {errorSteps.map((step) => (
            <button
              key={step.index}
              type="button"
              onClick={() => onSelectStep(step.index)}
              className={cn(
                'inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium transition',
                step.isCurrent
                  ? 'border-red-700 bg-red-700 text-white dark:border-red-400 dark:bg-red-400 dark:text-red-950'
                  : 'border-red-300 bg-white text-red-900 hover:border-red-500 dark:border-red-800 dark:bg-red-950/20 dark:text-red-100 dark:hover:border-red-600'
              )}
            >
              {step.title} ({step.errorCount})
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function RadioGroup({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: IntakeFieldOption[];
  value: string;
  onChange: (nextValue: string) => void;
}) {
  return (
    <div className="space-y-2">
      {options.map((option) => (
        <label
          key={option.value}
          className="flex cursor-pointer items-start gap-3 rounded-2xl border border-stone-200 px-4 py-3 dark:border-stone-800"
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="mt-1 h-4 w-4"
          />
          <span className="text-sm text-stone-700 dark:text-stone-200">
            {option.label}
          </span>
        </label>
      ))}
    </div>
  );
}

function CheckboxGroup({
  question,
  value,
  onToggle,
}: {
  question: IntakeQuestionDefinition;
  value: string[];
  onToggle: (optionValue: string) => void;
}) {
  return (
    <div className="space-y-2">
      {question.options?.map((option) => (
        <label
          key={option.value}
          className="flex cursor-pointer items-start gap-3 rounded-2xl border border-stone-200 px-4 py-3 dark:border-stone-800"
        >
          <input
            type="checkbox"
            checked={value.includes(option.value)}
            onChange={() => onToggle(option.value)}
            className="mt-1 h-4 w-4"
          />
          <span className="text-sm text-stone-700 dark:text-stone-200">
            {option.label}
          </span>
        </label>
      ))}
    </div>
  );
}

function RatingField({
  value,
  onChange,
}: {
  value: number;
  onChange: (nextValue: number) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          onClick={() => onChange(rating)}
          className={cn(
            'inline-flex h-11 w-11 items-center justify-center rounded-full border text-sm font-semibold transition',
            value === rating
              ? 'border-stone-950 bg-stone-950 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-950'
              : 'border-stone-300 bg-white text-stone-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100'
          )}
        >
          {rating}
        </button>
      ))}
    </div>
  );
}

function QuestionField({
  question,
  value,
  error,
  isUploading,
  uploadError,
  onChange,
  onUpload,
  onRemoveFile,
}: {
  question: IntakeQuestionDefinition;
  value: unknown;
  error?: string;
  isUploading: boolean;
  uploadError?: string;
  onChange: (nextValue: unknown) => void;
  onUpload: (
    question: IntakeQuestionDefinition,
    selectedFiles: File[]
  ) => Promise<void>;
  onRemoveFile: (
    question: IntakeQuestionDefinition,
    fileAssetId: string
  ) => Promise<void>;
}) {
  const commonProps = {
    label: question.label,
    hint: question.helpText,
    required: question.required,
    error,
    name: question.key,
  };

  if (question.fieldType === 'notice') {
    return (
      <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm leading-6 text-stone-700 dark:border-stone-800 dark:bg-stone-950/60 dark:text-stone-200">
        {question.label}
      </div>
    );
  }

  if (question.fieldType === 'heading') {
    return (
      <h3 className="text-lg font-semibold tracking-tight">{question.label}</h3>
    );
  }

  if (
    question.fieldType === 'text' ||
    question.fieldType === 'email' ||
    question.fieldType === 'phone' ||
    question.fieldType === 'url' ||
    question.fieldType === 'company' ||
    question.fieldType === 'contactPerson' ||
    question.fieldType === 'budget'
  ) {
    return (
      <Input
        {...commonProps}
        type={
          question.fieldType === 'email'
            ? 'email'
            : question.fieldType === 'phone'
              ? 'tel'
              : question.fieldType === 'url'
                ? 'url'
                : 'text'
        }
        value={typeof value === 'string' ? value : ''}
        placeholder={question.placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  if (question.fieldType === 'textarea') {
    return (
      <Textarea
        {...commonProps}
        rows={5}
        value={typeof value === 'string' ? value : ''}
        placeholder={question.placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  if (question.fieldType === 'dropdown' || question.fieldType === 'priority') {
    const options =
      question.fieldType === 'priority'
        ? [
            { value: 'high', label: 'Hoch' },
            { value: 'medium', label: 'Mittel' },
            { value: 'low', label: 'Niedrig' },
          ]
        : (question.options ?? []).map((option) => ({
            value: option.value,
            label: option.label,
          }));

    return (
      <Select
        {...commonProps}
        options={options}
        value={typeof value === 'string' ? value : ''}
        placeholder="Bitte auswählen"
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  if (question.fieldType === 'radio') {
    return (
      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium text-stone-900 dark:text-white">
            {question.label}
            {question.required && <span className="ml-1 text-red-500">*</span>}
          </p>
          {question.helpText && (
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
              {question.helpText}
            </p>
          )}
        </div>
        <RadioGroup
          name={question.key}
          options={question.options ?? []}
          value={typeof value === 'string' ? value : ''}
          onChange={onChange}
        />
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }

  if (question.fieldType === 'checkbox-group') {
    return (
      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium text-stone-900 dark:text-white">
            {question.label}
            {question.required && <span className="ml-1 text-red-500">*</span>}
          </p>
          {question.helpText && (
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
              {question.helpText}
            </p>
          )}
        </div>
        <CheckboxGroup
          question={question}
          value={Array.isArray(value) ? (value as string[]) : []}
          onToggle={(optionValue) => {
            const currentValues = Array.isArray(value)
              ? (value as string[])
              : [];
            const nextValues = currentValues.includes(optionValue)
              ? currentValues.filter(
                  (currentValue) => currentValue !== optionValue
                )
              : [...currentValues, optionValue];
            onChange(nextValues);
          }}
        />
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }

  if (question.fieldType === 'yes-no') {
    return (
      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium text-stone-900 dark:text-white">
            {question.label}
            {question.required && <span className="ml-1 text-red-500">*</span>}
          </p>
          {question.helpText && (
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
              {question.helpText}
            </p>
          )}
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            { label: 'Ja', value: true },
            { label: 'Nein', value: false },
          ].map((option) => (
            <button
              key={String(option.value)}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                'rounded-2xl border px-4 py-3 text-left text-sm font-medium transition',
                value === option.value
                  ? 'border-stone-950 bg-stone-950 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-950'
                  : 'border-stone-300 bg-white text-stone-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }

  if (question.fieldType === 'date') {
    return (
      <Input
        {...commonProps}
        type="date"
        value={typeof value === 'string' ? value : ''}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  if (question.fieldType === 'rating') {
    return (
      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium text-stone-900 dark:text-white">
            {question.label}
            {question.required && <span className="ml-1 text-red-500">*</span>}
          </p>
          {question.helpText && (
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
              {question.helpText}
            </p>
          )}
        </div>
        <RatingField
          value={typeof value === 'number' ? value : 0}
          onChange={(nextValue) => onChange(nextValue)}
        />
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }

  if (question.fieldType === 'file') {
    const uploadedFiles = isIntakeFileReferenceArray(value) ? value : [];
    const acceptValue = (
      question.validationRules?.allowedMimeTypes?.length
        ? question.validationRules.allowedMimeTypes
        : INTAKE_DEFAULT_UPLOAD_TYPES
    ).join(',');
    const maxFileSize = question.validationRules?.maxFileSize;

    return (
      <div className="space-y-4 rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-4 py-4 text-sm leading-6 text-stone-600 dark:border-stone-700 dark:bg-stone-950/60 dark:text-stone-300">
        <div>
          <p className="font-medium text-stone-900 dark:text-stone-50">
            {question.label}
            {question.required && <span className="ml-1 text-red-500">*</span>}
          </p>
          {question.helpText && <p className="mt-1">{question.helpText}</p>}
          <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">
            Uploads werden lokal gespeichert und nur über geschützte Endpunkte
            ausgeliefert.
            {maxFileSize
              ? ` Maximal ${formatFileSize(maxFileSize)} pro Datei.`
              : ''}
          </p>
        </div>

        <label className="inline-flex cursor-pointer items-center justify-center rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-950 hover:text-stone-950 dark:border-stone-700 dark:text-stone-100 dark:hover:border-stone-100 dark:hover:text-stone-50">
          Dateien auswählen
          <input
            type="file"
            name={question.key}
            className="sr-only"
            accept={acceptValue}
            multiple={Boolean(question.validationRules?.allowMultiple)}
            disabled={isUploading}
            onChange={async (event) => {
              const selectedFiles = Array.from(event.target.files ?? []);

              if (!selectedFiles.length) {
                return;
              }
              await onUpload(question, selectedFiles);
              event.currentTarget.value = '';
            }}
          />
        </label>

        {isUploading && (
          <p className="text-sm font-medium text-blue-600 dark:text-blue-300">
            Dateien werden hochgeladen ...
          </p>
        )}

        {uploadError && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {uploadError}
          </p>
        )}

        {uploadedFiles.length > 0 && (
          <ul className="space-y-2">
            {uploadedFiles.map((fileReference) => (
              <li
                key={fileReference.fileAssetId}
                className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3 dark:border-stone-800 dark:bg-stone-900 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-3">
                  {isPreviewableImageMimeType(fileReference.mimeType) && (
                    <img
                      src={`/api/intake/uploads/${fileReference.fileAssetId}?disposition=inline`}
                      alt={fileReference.originalFilename}
                      className="h-28 w-full rounded-2xl border border-stone-200 object-cover dark:border-stone-800 sm:w-44"
                      loading="lazy"
                    />
                  )}
                  <a
                    href={`/api/intake/uploads/${fileReference.fileAssetId}`}
                    className="font-medium text-stone-900 underline decoration-stone-300 underline-offset-4 dark:text-stone-50 dark:decoration-stone-700"
                  >
                    {fileReference.originalFilename}
                  </a>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    {fileReference.mimeType} ·{' '}
                    {formatFileSize(fileReference.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    void onRemoveFile(question, fileReference.fileAssetId)
                  }
                  className="inline-flex items-center justify-center rounded-full border border-stone-300 px-3 py-2 text-xs font-medium text-stone-700 transition hover:border-red-600 hover:text-red-700 dark:border-stone-700 dark:text-stone-200 dark:hover:border-red-400 dark:hover:text-red-300"
                >
                  Datei entfernen
                </button>
              </li>
            ))}
          </ul>
        )}

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }

  if (question.fieldType === 'consent') {
    return (
      <Checkbox
        label={question.label}
        hint={question.helpText}
        required={question.required}
        checked={value === true}
        error={error}
        onChange={(event) => onChange(event.target.checked)}
      />
    );
  }

  return null;
}

export interface IntakeQuestionnaireShellProps {
  submissionId: string;
  formSnapshot: IntakeFormSnapshot;
  initialAnswers: IntakeAnswer[];
  initialStepKey?: string | null;
  completionPath: string;
}

export function IntakeQuestionnaireShell({
  submissionId,
  formSnapshot,
  initialAnswers,
  initialStepKey,
  completionPath,
}: IntakeQuestionnaireShellProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const orderedSections = formSnapshot.sections
    .slice()
    .sort((left, right) => left.order - right.order);
  const initialStepIndex = Math.max(
    orderedSections.findIndex((section) => section.stepKey === initialStepKey),
    0
  );
  const [answers, setAnswers] = useState<AnswerMap>(() =>
    createInitialAnswerMap(formSnapshot, initialAnswers)
  );
  const [currentStepIndex, setCurrentStepIndex] = useState(initialStepIndex);
  const [errors, setErrors] = useState<ErrorMap>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [uploadingQuestionKeys, setUploadingQuestionKeys] =
    useState<UploadStateMap>({});
  const [uploadErrors, setUploadErrors] = useState<UploadErrorMap>({});
  const hasMountedRef = useRef(false);
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentSection = orderedSections[currentStepIndex];
  const visibleQuestions = currentSection
    ? getVisibleQuestions(currentSection, answers)
    : [];
  const errorSteps = orderedSections
    .map((section, index) => {
      const errorCount = getVisibleQuestions(section, answers).filter(
        (question) => Boolean(errors[question.key])
      ).length;

      if (errorCount === 0) {
        return null;
      }

      return {
        index,
        title: section.title,
        errorCount,
        isCurrent: index === currentStepIndex,
      };
    })
    .filter(
      (
        step
      ): step is {
        index: number;
        title: string;
        errorCount: number;
        isCurrent: boolean;
      } => step !== null
    );
  const currentStepErrorCount = visibleQuestions.filter((question) =>
    Boolean(errors[question.key])
  ).length;
  const totalErrorCount = Object.keys(errors).length;
  const progressPercent = progressForStep(
    currentStepIndex,
    orderedSections.length
  );
  const isLastStep = currentStepIndex === orderedSections.length - 1;
  const hasPendingUploads = Object.values(uploadingQuestionKeys).some(Boolean);

  async function persistDraftRequest(
    nextAnswers: AnswerMap,
    nextStepIndex: number
  ) {
    setSaveState('saving');

    const response = await fetch(`/api/intake/submissions/${submissionId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        answers: buildAnswerPayload(formSnapshot, nextAnswers),
        currentStep: orderedSections[nextStepIndex]?.stepKey,
        progressPercent: progressForStep(nextStepIndex, orderedSections.length),
      }),
    });

    if (!response.ok) {
      throw new Error('Draft update failed');
    }

    setSaveState('saved');
  }

  const autosaveDraft = useEffectEvent(
    async (nextAnswers: AnswerMap, nextStepIndex: number) => {
      await persistDraftRequest(nextAnswers, nextStepIndex);
    }
  );

  async function submitForm() {
    setSaveState('saving');

    const response = await fetch(
      `/api/intake/submissions/${submissionId}/submit`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers: buildAnswerPayload(formSnapshot, answers),
          currentStep: orderedSections[currentStepIndex]?.stepKey,
          progressPercent: 100,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Submission failed');
    }

    setSaveState('saved');
    startTransition(() => {
      router.push(completionPath);
    });
  }

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    autosaveTimerRef.current = setTimeout(() => {
      void autosaveDraft(answers, currentStepIndex).catch(() => {
        setSaveState('error');
      });
    }, 900);

    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [answers, currentStepIndex]);

  function updateAnswer(
    question: IntakeQuestionDefinition,
    nextValue: unknown
  ) {
    setErrors((currentErrors) => {
      if (!currentErrors[question.key]) {
        return currentErrors;
      }

      const nextErrors = { ...currentErrors };
      delete nextErrors[question.key];
      return nextErrors;
    });

    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [question.key]: nextValue,
    }));
  }

  async function uploadFiles(
    question: IntakeQuestionDefinition,
    selectedFiles: File[]
  ) {
    if (!selectedFiles.length) {
      return;
    }

    setUploadErrors((currentErrors) => {
      if (!currentErrors[question.key]) {
        return currentErrors;
      }

      const nextErrors = { ...currentErrors };
      delete nextErrors[question.key];
      return nextErrors;
    });
    setUploadingQuestionKeys((currentState) => ({
      ...currentState,
      [question.key]: true,
    }));

    try {
      const currentValue = answers[question.key];
      const existingFiles = isIntakeFileReferenceArray(currentValue)
        ? [...currentValue]
        : [];

      if (!question.validationRules?.allowMultiple && existingFiles.length) {
        for (const existingFile of existingFiles) {
          await removeUploadedFile(question, existingFile.fileAssetId);
        }
      }

      const uploadedReferences: IntakeAnswerFileReference[] = [];

      for (const selectedFile of selectedFiles) {
        const formData = new FormData();
        formData.set('submissionId', submissionId);
        formData.set('questionKey', question.key);
        formData.set('file', selectedFile);

        const response = await fetch('/api/intake/uploads', {
          method: 'POST',
          body: formData,
        });

        const payload = (await response.json().catch(() => null)) as {
          success?: boolean;
          data?: { file?: IntakeAnswerFileReference };
          error?: string;
        } | null;

        if (!response.ok || !payload?.data?.file) {
          throw new Error(payload?.error || 'Upload fehlgeschlagen');
        }

        uploadedReferences.push(payload.data.file);
      }

      const nextCurrentValue = answers[question.key];
      const currentFiles =
        question.validationRules?.allowMultiple &&
        isIntakeFileReferenceArray(nextCurrentValue)
          ? nextCurrentValue
          : [];

      updateAnswer(question, [...currentFiles, ...uploadedReferences]);
    } catch (error) {
      setUploadErrors((currentErrors) => ({
        ...currentErrors,
        [question.key]:
          error instanceof Error ? error.message : 'Upload fehlgeschlagen',
      }));
    } finally {
      setUploadingQuestionKeys((currentState) => ({
        ...currentState,
        [question.key]: false,
      }));
    }
  }

  async function removeUploadedFile(
    question: IntakeQuestionDefinition,
    fileAssetId: string
  ) {
    const response = await fetch(`/api/intake/uploads/${fileAssetId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      throw new Error(payload?.error || 'Datei konnte nicht entfernt werden');
    }

    const currentValue = answers[question.key];
    const currentFiles = isIntakeFileReferenceArray(currentValue)
      ? currentValue
      : [];

    updateAnswer(
      question,
      currentFiles.filter(
        (fileReference) => fileReference.fileAssetId !== fileAssetId
      )
    );
  }

  function validateAllSections() {
    const nextErrors: ErrorMap = {};
    let firstInvalidStepIndex = -1;

    orderedSections.forEach((section, index) => {
      const sectionErrors = getSectionValidationErrors(section, answers);

      if (
        Object.keys(sectionErrors).length > 0 &&
        firstInvalidStepIndex === -1
      ) {
        firstInvalidStepIndex = index;
      }

      Object.assign(nextErrors, sectionErrors);
    });

    setErrors(nextErrors);

    return {
      isValid: Object.keys(nextErrors).length === 0,
      firstInvalidStepIndex,
    };
  }

  async function handlePrevious() {
    const nextStepIndex = Math.max(currentStepIndex - 1, 0);

    setCurrentStepIndex(nextStepIndex);

    try {
      await persistDraftRequest(answers, nextStepIndex);
    } catch {
      setSaveState('error');
    }
  }

  async function handleNext() {
    if (hasPendingUploads) {
      setSaveState('error');
      return;
    }

    const nextStepIndex = Math.min(
      currentStepIndex + 1,
      orderedSections.length - 1
    );
    setCurrentStepIndex(nextStepIndex);

    try {
      await persistDraftRequest(answers, nextStepIndex);
    } catch {
      setSaveState('error');
    }
  }

  async function handleSubmit() {
    setHasAttemptedSubmit(true);

    const validationResult = validateAllSections();

    if (!validationResult.isValid) {
      if (validationResult.firstInvalidStepIndex >= 0) {
        setCurrentStepIndex(validationResult.firstInvalidStepIndex);
      }

      return;
    }

    if (hasPendingUploads) {
      setSaveState('error');
      return;
    }

    try {
      await submitForm();
    } catch {
      setSaveState('error');
    }
  }

  if (!currentSection) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-8">
      <div className="flex flex-col gap-4 border-b border-stone-200 pb-6 dark:border-stone-800 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
            Schritt {currentStepIndex + 1} von {orderedSections.length}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            {currentSection.title}
          </h2>
          {currentSection.description && (
            <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-300">
              {currentSection.description}
            </p>
          )}
        </div>
        <div className="space-y-2 sm:w-72">
          <div className="h-2 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
            <div
              className="h-full rounded-full bg-stone-950 transition-[width] duration-300 dark:bg-stone-100"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <SaveIndicator saveState={saveState} />
        </div>
      </div>

      <Form
        className="mt-6 space-y-6"
        onSubmit={async (event) => {
          event.preventDefault();
          if (isLastStep) {
            await handleSubmit();
            return;
          }
          await handleNext();
        }}
        isLoading={isPending}
      >
        <ErrorSummary
          hasAttemptedSubmit={hasAttemptedSubmit}
          totalErrorCount={totalErrorCount}
          currentStepErrorCount={currentStepErrorCount}
          errorSteps={errorSteps}
          onSelectStep={setCurrentStepIndex}
        />

        {visibleQuestions.map((question) => (
          <QuestionField
            key={question.id}
            question={question}
            value={getQuestionValue(answers, question)}
            error={errors[question.key]}
            isUploading={Boolean(uploadingQuestionKeys[question.key])}
            uploadError={uploadErrors[question.key]}
            onChange={(nextValue) => updateAnswer(question, nextValue)}
            onUpload={uploadFiles}
            onRemoveFile={removeUploadedFile}
          />
        ))}

        <div className="flex flex-col gap-3 border-t border-stone-200 pt-6 dark:border-stone-800 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStepIndex === 0 || isPending || hasPendingUploads}
            className="inline-flex items-center justify-center rounded-full border border-stone-300 px-5 py-3 text-sm font-medium text-stone-700 transition hover:border-stone-950 hover:text-stone-950 disabled:cursor-not-allowed disabled:opacity-40 dark:border-stone-700 dark:text-stone-100 dark:hover:border-stone-100 dark:hover:text-stone-50"
          >
            Zurück
          </button>
          <button
            type="submit"
            disabled={isPending || hasPendingUploads}
            className="inline-flex items-center justify-center rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-stone-200"
          >
            {isLastStep ? 'Fragebogen absenden' : 'Weiter'}
          </button>
        </div>

        {isLastStep && (
          <p className="text-sm leading-6 text-stone-500 dark:text-stone-400 sm:text-right">
            Pflichtfelder werden erst beim Absenden vollständig geprüft.
          </p>
        )}
      </Form>
    </section>
  );
}
