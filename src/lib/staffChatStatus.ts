export type StaffChatStatus = 'expired' | 'forbidden' | 'busy' | 'unavailable' | 'service' | null;

export function getStaffChatStatus(status: number): StaffChatStatus {
  if (status === 401) return 'expired';
  if (status === 403) return 'forbidden';
  if (status === 429) return 'busy';
  if (status === 503 || status === 0) return 'unavailable';
  return status >= 500 ? 'service' : null;
}

export function getStaffChatStatusMessage(status: StaffChatStatus): string {
  switch (status) {
    case 'expired': return 'Staff session expired. Please sign out and sign back in.';
    case 'forbidden': return 'Your account does not have permission to access Staff Chat.';
    case 'busy': return 'Authentication service is temporarily busy. Retrying shortly.';
    case 'unavailable': return 'Staff Chat is temporarily unavailable. Retrying connection.';
    case 'service': return 'Staff Chat encountered a temporary service error.';
    default: return '';
  }
}
