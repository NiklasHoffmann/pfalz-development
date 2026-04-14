export interface SubmissionAnswerValueLike {
  value?: unknown;
  files?: Array<unknown>;
}

export function formatSubmissionAnswerValue(value: unknown) {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  if (Array.isArray(value)) {
    return value.join(', ');
  }

  if (typeof value === 'boolean') {
    return value ? 'Ja' : 'Nein';
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
}

export function isSubmissionAnswerFilled(answer?: SubmissionAnswerValueLike) {
  if (!answer) {
    return false;
  }

  if (answer.files?.length) {
    return true;
  }

  if (Array.isArray(answer.value)) {
    return answer.value.length > 0;
  }

  return (
    answer.value !== null && answer.value !== undefined && answer.value !== ''
  );
}
