export interface PhaseResponseDto {
    /** UUID of the phase */
    phase_id: string;
    /** UUID of the parent project */
    project_id: string;
    /** Phase display name */
    name: string;
    /** Sort order within the project */
    order_index: number;
    /** UUID of the assigned user (nullable) */
    assignee_id: string | null;
    /** Resolved name from users table (nullable) */
    assignee_name: string | null;
}
