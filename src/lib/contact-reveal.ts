const CONTACT_REVEAL_STORAGE_KEY = 'contact-reveal-unlocked';
const CONTACT_REVEAL_EVENT = 'contact-reveal-change';

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

export function writeContactRevealUnlocked(unlocked: boolean) {
  if (typeof window === 'undefined') {
    return;
  }

  if (unlocked) {
    window.sessionStorage.setItem(CONTACT_REVEAL_STORAGE_KEY, '1');
  } else {
    window.sessionStorage.removeItem(CONTACT_REVEAL_STORAGE_KEY);
  }

  window.dispatchEvent(
    new CustomEvent(CONTACT_REVEAL_EVENT, {
      detail: { unlocked },
    })
  );
}
