export interface FollowUpTemplateInput {
  clientName: string;
  clientId: string;
  interactionId: string;
  interactionDate: string; 
  interactionType?: string; 
  notesPreview?: string;
  dueAt: string; 
  followUpDays?: number;
}

export function buildFollowUpTemplate(input: FollowUpTemplateInput) {
  const dateStr = new Date(input.interactionDate).toLocaleString();
  const dueStr = new Date(input.dueAt).toLocaleString();

  const title = `Follow up with ${input.clientName}`;
  const bodyLines = [
  `Client: ${input.clientName} (ID: ${input.clientId})`,
  `Interaction: ${input.interactionType ?? 'Meeting'} (ID: ${input.interactionId})`,
  `Last interaction: ${dateStr}`,
];

if (typeof input.followUpDays === 'number') {
  bodyLines.push(`Follow-up interval: ${input.followUpDays} day(s)`);
}

bodyLines.push(`Follow-up due: ${dueStr}`);

if (input.notesPreview) {
  bodyLines.push(`Notes: ${input.notesPreview}`);
}

  return {
    title,
    body: bodyLines.join('\n'),
    emailSubject: title,
    emailText: bodyLines.join('\n'),
  };
}