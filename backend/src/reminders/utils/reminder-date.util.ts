export function calculateRemindAt(
  interactionDate?: string,
  daysAfterInteraction?: number,
  explicitRemindAt?: string,
): string {
  if (explicitRemindAt) {
    return new Date(explicitRemindAt).toISOString();
  }

  if (!interactionDate || daysAfterInteraction === undefined) {
    throw new Error(
      'Either remind_at or interaction_date + days_after_interaction must be provided',
    );
  }

  const base = new Date(interactionDate);
  base.setUTCDate(base.getUTCDate() + daysAfterInteraction);

  return base.toISOString();
}