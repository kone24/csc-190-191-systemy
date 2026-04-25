import { buildFollowUpTemplate, FollowUpTemplateInput } from './followup.template';

const BASE_INPUT: FollowUpTemplateInput = {
    clientName: 'Jane Doe',
    clientId: 'client-001',
    interactionId: 'interaction-001',
    interactionDate: '2026-01-15T10:00:00.000Z',
    dueAt: '2026-01-22T10:00:00.000Z',
};

describe('buildFollowUpTemplate', () => {
    // =========================================================================
    // Title / Subject
    // =========================================================================

    it('returns title containing client name', () => {
        const result = buildFollowUpTemplate(BASE_INPUT);
        expect(result.title).toContain('Jane Doe');
        expect(result.title).toBe('Follow up with Jane Doe');
    });

    it('emailSubject equals title', () => {
        const result = buildFollowUpTemplate(BASE_INPUT);
        expect(result.emailSubject).toBe(result.title);
    });

    // =========================================================================
    // Body / emailText
    // =========================================================================

    it('emailText equals body', () => {
        const result = buildFollowUpTemplate(BASE_INPUT);
        expect(result.emailText).toBe(result.body);
    });

    it('includes client name and ID in body', () => {
        const result = buildFollowUpTemplate(BASE_INPUT);
        expect(result.body).toContain('Jane Doe');
        expect(result.body).toContain('client-001');
    });

    it('includes interaction ID in body', () => {
        const result = buildFollowUpTemplate(BASE_INPUT);
        expect(result.body).toContain('interaction-001');
    });

    // =========================================================================
    // followUpDays — conditional
    // =========================================================================

    it('includes followUpDays line when followUpDays provided', () => {
        const result = buildFollowUpTemplate({ ...BASE_INPUT, followUpDays: 7 });
        expect(result.body).toContain('Follow-up interval: 7 day(s)');
    });

    it('omits followUpDays line when followUpDays is not provided', () => {
        const result = buildFollowUpTemplate(BASE_INPUT);
        expect(result.body).not.toContain('Follow-up interval');
    });

    it('includes followUpDays when followUpDays is 0', () => {
        const result = buildFollowUpTemplate({ ...BASE_INPUT, followUpDays: 0 });
        expect(result.body).toContain('Follow-up interval: 0 day(s)');
    });

    // =========================================================================
    // notesPreview — conditional
    // =========================================================================

    it('includes notes preview when notesPreview provided', () => {
        const result = buildFollowUpTemplate({ ...BASE_INPUT, notesPreview: 'Discussed budget' });
        expect(result.body).toContain('Notes: Discussed budget');
    });

    it('omits notes when notesPreview is not provided', () => {
        const result = buildFollowUpTemplate(BASE_INPUT);
        expect(result.body).not.toContain('Notes:');
    });

    // =========================================================================
    // interactionType
    // =========================================================================

    it('uses provided interactionType in body', () => {
        const result = buildFollowUpTemplate({ ...BASE_INPUT, interactionType: 'CALL' });
        expect(result.body).toContain('CALL');
    });

    it('defaults interactionType to "Meeting" when not provided', () => {
        const result = buildFollowUpTemplate(BASE_INPUT);
        expect(result.body).toContain('Meeting');
    });
});
