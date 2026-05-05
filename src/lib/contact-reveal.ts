const CONTACT_REVEAL_STORAGE_KEY = 'contact-reveal-unlocked';
const CONTACT_REVEAL_PAYLOAD_STORAGE_KEY = 'contact-reveal-payload';
const CONTACT_REVEAL_EVENT = 'contact-reveal-change';

export type RevealedContactPayload = {
  mailto: string;
  emailValue: string;
  phoneHref: string;
  phoneDisplay: string;
  whatsAppValue: string;
};

export function getContactRevealStorageKey() {
  return CONTACT_REVEAL_STORAGE_KEY;
}

export function getContactRevealEventName() {
  return CONTACT_REVEAL_EVENT;
}

export function readContactRevealUnlocked(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.sessionStorage.getItem(CONTACT_REVEAL_STORAGE_KEY) === '1';
}

function isRevealedContactPayload(
  value: unknown
): value is RevealedContactPayload {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return [
    'mailto',
    'emailValue',
    'phoneHref',
    'phoneDisplay',
    'whatsAppValue',
  ].every((key) => typeof candidate[key] === 'string' && candidate[key].trim());
}

export function readRevealedContact(): RevealedContactPayload | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawValue = window.sessionStorage.getItem(
    CONTACT_REVEAL_PAYLOAD_STORAGE_KEY
  );

  if (!rawValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(rawValue) as unknown;

    if (isRevealedContactPayload(parsedValue)) {
      return parsedValue;
    }
  } catch {
    // Ignore invalid session data and clear it below.
  }

  window.sessionStorage.removeItem(CONTACT_REVEAL_PAYLOAD_STORAGE_KEY);
  window.sessionStorage.removeItem(CONTACT_REVEAL_STORAGE_KEY);
  return null;
}

export function writeContactRevealUnlocked(unlocked: boolean) {
  if (typeof window === 'undefined') {
    return;
  }

  if (unlocked) {
    window.sessionStorage.setItem(CONTACT_REVEAL_STORAGE_KEY, '1');
  } else {
    window.sessionStorage.removeItem(CONTACT_REVEAL_STORAGE_KEY);
    window.sessionStorage.removeItem(CONTACT_REVEAL_PAYLOAD_STORAGE_KEY);
  }

  window.dispatchEvent(
    new CustomEvent(CONTACT_REVEAL_EVENT, {
      detail: { unlocked },
    })
  );
}

export function writeRevealedContact(payload: RevealedContactPayload | null) {
  if (typeof window === 'undefined') {
    return;
  }

  if (payload) {
    window.sessionStorage.setItem(
      CONTACT_REVEAL_PAYLOAD_STORAGE_KEY,
      JSON.stringify(payload)
    );
  } else {
    window.sessionStorage.removeItem(CONTACT_REVEAL_PAYLOAD_STORAGE_KEY);
  }

  writeContactRevealUnlocked(Boolean(payload));
}
