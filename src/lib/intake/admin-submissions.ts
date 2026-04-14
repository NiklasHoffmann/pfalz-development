import IntakeAccessLink from '@/models/IntakeAccessLink';
import IntakeSubmission from '@/models/IntakeSubmission';
import StaffUser from '@/models/StaffUser';
import {
  formatSubmissionAnswerValue,
  isSubmissionAnswerFilled,
} from '@/lib/intake/submission-format';

export interface SubmissionAnswerFile {
  fileAssetId: string;
  originalFilename: string;
  mimeType: string;
  size: number;
}

export interface SubmissionAnswer {
  questionId: string;
  questionKey: string;
  value: unknown;
  displayValue?: string;
  files?: SubmissionAnswerFile[];
}

export interface SubmissionQuestion {
  id: string;
  key: string;
  label: string;
  required?: boolean;
}

export interface SubmissionSection {
  id: string;
  title: string;
  description?: string;
  stepKey?: string;
  order?: number;
  questions: SubmissionQuestion[];
}

export interface AdminSubmissionPrintExport {
  exportType: 'intake-submission-print';
  exportedAt: string;
  submission: {
    id: string;
    projectId: string;
    status: string;
    currentStep?: string | null;
    progressPercent: number;
    internalNotes?: string | null;
    timestamps: {
      lastSavedAt?: string | null;
      submittedAt?: string | null;
      updatedAt: string;
    };
    customer: {
      name: string;
      company?: string;
      email?: string;
      phone?: string;
    };
    form: {
      title?: string;
      formType?: string;
    };
    consent: {
      accepted: boolean;
      acceptedAt?: string | null;
      privacyVersion?: string;
    };
    assignee: AdminSubmissionDetail['assignee'];
    sections: Array<{
      id: string;
      title: string;
      description?: string;
      stepKey?: string;
      order?: number;
      questions: Array<{
        id: string;
        key: string;
        label: string;
        required: boolean;
        isFilled: boolean;
        value: unknown;
        displayValue?: string;
        formattedValue: string;
        files: Array<{
          fileAssetId: string;
          originalFilename: string;
          mimeType: string;
          size: number;
          downloadPath: string;
        }>;
      }>;
    }>;
    fallbackAnswers: Array<{
      questionId: string;
      questionKey: string;
      value: unknown;
      displayValue?: string;
      formattedValue: string;
      files: Array<{
        fileAssetId: string;
        originalFilename: string;
        mimeType: string;
        size: number;
        downloadPath: string;
      }>;
    }>;
  };
}

function toOptionalIsoString(value?: string | Date | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function mapSubmissionAnswerFiles(files?: SubmissionAnswerFile[]) {
  return (files || []).map((file) => ({
    fileAssetId: file.fileAssetId,
    originalFilename: file.originalFilename,
    mimeType: file.mimeType,
    size: file.size,
    downloadPath: `/api/intake/uploads/${file.fileAssetId}`,
  }));
}

export interface AdminSubmissionDetail {
  id: string;
  projectId: string;
  status: string;
  currentStep?: string | null;
  progressPercent: number;
  internalNotes?: string | null;
  assigneeUserId?: string;
  lastSavedAt?: string | Date;
  submittedAt?: string | Date | null;
  updatedAt: string | Date;
  answers: SubmissionAnswer[];
  customerSnapshot: {
    name: string;
    company?: string;
    email?: string;
    phone?: string;
  };
  consent?: {
    accepted?: boolean;
    acceptedAt?: string | Date;
    privacyVersion?: string;
  };
  accessLink?: {
    customerName?: string;
    company?: string;
    email?: string;
    phone?: string;
    formSnapshot?: {
      title?: string;
      formType?: string;
      sections?: SubmissionSection[];
    };
  } | null;
  assignee?: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
}

export async function getAdminSubmissionDetail(
  submissionId: string
): Promise<AdminSubmissionDetail | null> {
  const submission = await IntakeSubmission.findById(submissionId)
    .select('-__v')
    .exec();

  if (!submission) {
    return null;
  }

  const accessLink = await IntakeAccessLink.findById(submission.accessLinkId)
    .select('-__v -tokenHash')
    .exec();
  const assignee = submission.assigneeUserId
    ? await StaffUser.findById(submission.assigneeUserId)
        .select('_id name email role')
        .exec()
    : null;

  return {
    ...submission.toJSON(),
    accessLink: accessLink?.toJSON() ?? null,
    assignee: assignee
      ? {
          id: String(assignee.id ?? assignee._id),
          name: assignee.name,
          email: assignee.email,
          role: assignee.role,
        }
      : null,
  } as AdminSubmissionDetail;
}

export function buildAdminSubmissionPrintExport(
  detail: AdminSubmissionDetail
): AdminSubmissionPrintExport {
  const sections = detail.accessLink?.formSnapshot?.sections || [];
  const answerMap = new Map(
    detail.answers.map((answer) => [answer.questionKey, answer])
  );
  const knownQuestionKeys = new Set(
    sections.flatMap((section) =>
      section.questions.map((question) => question.key)
    )
  );

  return {
    exportType: 'intake-submission-print',
    exportedAt: new Date().toISOString(),
    submission: {
      id: detail.id,
      projectId: detail.projectId,
      status: detail.status,
      currentStep: detail.currentStep || null,
      progressPercent: detail.progressPercent,
      internalNotes: detail.internalNotes || null,
      timestamps: {
        lastSavedAt: toOptionalIsoString(detail.lastSavedAt),
        submittedAt: toOptionalIsoString(detail.submittedAt),
        updatedAt:
          toOptionalIsoString(detail.updatedAt) || new Date().toISOString(),
      },
      customer: {
        name: detail.accessLink?.customerName || detail.customerSnapshot.name,
        company: detail.accessLink?.company || detail.customerSnapshot.company,
        email: detail.accessLink?.email || detail.customerSnapshot.email,
        phone: detail.accessLink?.phone || detail.customerSnapshot.phone,
      },
      form: {
        title: detail.accessLink?.formSnapshot?.title,
        formType: detail.accessLink?.formSnapshot?.formType,
      },
      consent: {
        accepted: Boolean(detail.consent?.accepted),
        acceptedAt: toOptionalIsoString(detail.consent?.acceptedAt),
        privacyVersion: detail.consent?.privacyVersion,
      },
      assignee: detail.assignee || null,
      sections: sections.map((section) => ({
        id: section.id,
        title: section.title,
        description: section.description,
        stepKey: section.stepKey,
        order: section.order,
        questions: section.questions.map((question) => {
          const answer = answerMap.get(question.key);

          return {
            id: question.id,
            key: question.key,
            label: question.label,
            required: Boolean(question.required),
            isFilled: isSubmissionAnswerFilled(answer),
            value: answer?.value,
            displayValue: answer?.displayValue,
            formattedValue:
              answer?.displayValue ||
              formatSubmissionAnswerValue(answer?.value),
            files: mapSubmissionAnswerFiles(answer?.files),
          };
        }),
      })),
      fallbackAnswers: detail.answers
        .filter((answer) => !knownQuestionKeys.has(answer.questionKey))
        .map((answer) => ({
          questionId: answer.questionId,
          questionKey: answer.questionKey,
          value: answer.value,
          displayValue: answer.displayValue,
          formattedValue:
            answer.displayValue || formatSubmissionAnswerValue(answer.value),
          files: mapSubmissionAnswerFiles(answer.files),
        })),
    },
  };
}
