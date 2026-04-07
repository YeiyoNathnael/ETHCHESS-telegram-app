import { initData } from '@tma.js/sdk-vue';

export type RegistrationType = 'individual' | 'team';

const LOCK_PREFIX = 'ethchess_submitted';

function getTelegramUserId(): string | null {
  const user = initData.user();
  if (!user || user.id === undefined || user.id === null) {
    return null;
  }
  return String(user.id);
}

export function getSubmissionLockKey(type: RegistrationType): string {
  const userId = getTelegramUserId();
  return userId
    ? `${LOCK_PREFIX}_${type}_tg_${userId}`
    : `${LOCK_PREFIX}_${type}_tg_unknown`;
}

export function isSubmissionLocked(type: RegistrationType): boolean {
  return localStorage.getItem(getSubmissionLockKey(type)) === '1';
}

export function setSubmissionLocked(type: RegistrationType): void {
  localStorage.setItem(getSubmissionLockKey(type), '1');
}
