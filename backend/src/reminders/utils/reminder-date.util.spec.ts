import { calculateRemindAt } from './reminder-date.util';

describe('calculateRemindAt', () => {
    // =========================================================================
    // explicitRemindAt path
    // =========================================================================

    it('returns explicitRemindAt as ISO string when provided', () => {
        const explicit = '2026-05-01T10:00:00.000Z';
        const result = calculateRemindAt(undefined, undefined, explicit);
        expect(result).toBe(new Date(explicit).toISOString());
    });

    it('prefers explicitRemindAt over interactionDate+daysAfter when both provided', () => {
        const explicit = '2026-05-01T10:00:00.000Z';
        const result = calculateRemindAt('2026-01-01', 7, explicit);
        expect(result).toBe(new Date(explicit).toISOString());
    });

    // =========================================================================
    // Error paths
    // =========================================================================

    it('throws when neither explicit date nor interactionDate+daysAfter provided', () => {
        expect(() => calculateRemindAt()).toThrow(
            'Either remind_at or interaction_date + days_after_interaction must be provided',
        );
    });

    it('throws when interactionDate provided but daysAfter is undefined', () => {
        expect(() => calculateRemindAt('2026-01-01', undefined, undefined)).toThrow(
            'Either remind_at or interaction_date + days_after_interaction must be provided',
        );
    });

    it('throws when daysAfter provided but interactionDate is undefined', () => {
        expect(() => calculateRemindAt(undefined, 5, undefined)).toThrow(
            'Either remind_at or interaction_date + days_after_interaction must be provided',
        );
    });

    // =========================================================================
    // Date arithmetic
    // =========================================================================

    it('correctly adds N days to interactionDate', () => {
        const result = calculateRemindAt('2026-01-01T00:00:00.000Z', 7);
        const expected = new Date('2026-01-08T00:00:00.000Z').toISOString();
        expect(result).toBe(expected);
    });

    it('handles zero days (same day as interaction)', () => {
        const result = calculateRemindAt('2026-03-15T00:00:00.000Z', 0);
        const expected = new Date('2026-03-15T00:00:00.000Z').toISOString();
        expect(result).toBe(expected);
    });

    it('handles large day values', () => {
        const result = calculateRemindAt('2026-01-01T00:00:00.000Z', 365);
        const expected = new Date('2027-01-01T00:00:00.000Z').toISOString();
        expect(result).toBe(expected);
    });

    it('returns a valid ISO 8601 string', () => {
        const result = calculateRemindAt('2026-06-15', 3);
        expect(() => new Date(result)).not.toThrow();
        expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
});
