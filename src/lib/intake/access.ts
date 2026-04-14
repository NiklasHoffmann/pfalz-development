import connectToDatabase from '@/lib/mongodb';
import IntakeAccessLink from '@/models/IntakeAccessLink';
import IntakeSubmission from '@/models/IntakeSubmission';
import type { IntakeSessionPayload } from '@/types/intake';
import { hashIntakeToken } from './token';

function toDocumentId(document: { _id?: unknown; id?: unknown }): string {
  if (typeof document.id === 'string') {
    return document.id;
  }

  return String(document._id);
}

export function isExpired(expiresAt?: Date | null): boolean {
  return Boolean(expiresAt && expiresAt.getTime() <= Date.now());
}

export async function findActiveAccessLinkByToken(token: string) {
  await connectToDatabase();

  const accessLink = await IntakeAccessLink.findOne({
    tokenHash: hashIntakeToken(token),
    isActive: true,
  }).exec();

  if (!accessLink || isExpired(accessLink.expiresAt)) {
    return null;
  }

  return accessLink;
}

export async function findActiveAccessLinkById(accessLinkId: string) {
  await connectToDatabase();

  const accessLink = await IntakeAccessLink.findById(accessLinkId).exec();

  if (!accessLink || !accessLink.isActive || isExpired(accessLink.expiresAt)) {
    return null;
  }

  return accessLink;
}

function getFirstStepKey(
  sections: Array<{ stepKey: string; order?: number }>
): string | undefined {
  return sections.slice().sort((left, right) => {
    const leftOrder =
      typeof left.order === 'number' ? left.order : Number.MAX_SAFE_INTEGER;
    const rightOrder =
      typeof right.order === 'number' ? right.order : Number.MAX_SAFE_INTEGER;

    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    return left.stepKey.localeCompare(right.stepKey);
  })[0]?.stepKey;
}

export async function getOrCreateDraftSubmission(accessLink: {
  _id?: unknown;
  id?: unknown;
  formId: string;
  formVersion: number;
  formSnapshot: {
    sections: Array<{ stepKey: string; order?: number }>;
    slug: string;
  };
  projectId: string;
  customerName: string;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
}) {
  await connectToDatabase();

  const accessLinkId = toDocumentId(accessLink);
  const firstStepKey = getFirstStepKey(accessLink.formSnapshot.sections);

  const existingSubmission = await IntakeSubmission.findOne({
    accessLinkId,
    submittedAt: null,
  })
    .sort({ updatedAt: -1 })
    .exec();

  if (existingSubmission) {
    if (
      firstStepKey &&
      existingSubmission.progressPercent === 0 &&
      existingSubmission.answers.length === 0 &&
      existingSubmission.currentStep !== firstStepKey
    ) {
      existingSubmission.currentStep = firstStepKey;
      existingSubmission.lastSavedAt = new Date();
      await existingSubmission.save();
    }

    return existingSubmission;
  }

  return IntakeSubmission.create({
    formId: accessLink.formId,
    formVersion: accessLink.formVersion,
    accessLinkId,
    projectId: accessLink.projectId,
    customerSnapshot: {
      name: accessLink.customerName,
      company: accessLink.company,
      email: accessLink.email,
      phone: accessLink.phone,
    },
    status: 'begonnen',
    currentStep: firstStepKey,
    progressPercent: 0,
    answers: [],
    lastSavedAt: new Date(),
  });
}

export async function markAccessLinkOpened(accessLinkId: string) {
  await connectToDatabase();

  await IntakeAccessLink.findByIdAndUpdate(accessLinkId, {
    $set: {
      lastOpenedAt: new Date(),
    },
  }).exec();
}

export async function resolveAccessFromToken(token: string, locale: string) {
  const accessLink = await findActiveAccessLinkByToken(token);

  return resolveAccessFromAccessLink(accessLink, locale);
}

export async function resolveAccessFromAccessLink(
  accessLink:
    | Awaited<ReturnType<typeof findActiveAccessLinkById>>
    | Awaited<ReturnType<typeof findActiveAccessLinkByToken>>,
  locale: string
) {
  if (!accessLink) {
    return null;
  }

  const submission = await getOrCreateDraftSubmission(accessLink);
  const accessLinkId = toDocumentId(accessLink);
  const submissionId = toDocumentId(submission);

  await markAccessLinkOpened(accessLinkId);

  const session: IntakeSessionPayload = {
    accessLinkId,
    submissionId,
    formSlug: accessLink.formSnapshot.slug,
    locale,
    issuedAt: Date.now(),
  };

  return {
    accessLink,
    submission,
    session,
  };
}

export async function getIntakeContextFromSession(
  session: IntakeSessionPayload,
  slug: string
) {
  await connectToDatabase();

  const accessLink = await IntakeAccessLink.findById(
    session.accessLinkId
  ).exec();

  if (!accessLink || !accessLink.isActive || isExpired(accessLink.expiresAt)) {
    return null;
  }

  if (accessLink.formSnapshot.slug !== slug) {
    return null;
  }

  let submission = await IntakeSubmission.findById(session.submissionId).exec();

  if (!submission || submission.accessLinkId !== toDocumentId(accessLink)) {
    submission = await getOrCreateDraftSubmission(accessLink);
  }

  return {
    accessLink,
    submission,
  };
}
