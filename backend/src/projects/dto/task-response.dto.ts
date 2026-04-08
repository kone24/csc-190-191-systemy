export interface TaskResponseDto {
    /** UUID of the task */
    task_id: string;
    /** UUID of the parent project */
    project_id: string;
    /** UUID of the phase this task belongs to */
    phase_id: string;
    /** Task title */
    title: string;
    /** Task description (nullable) */
    description: string | null;
    /** Priority level (integer) */
    priority: number | null;
    /** Status: "todo" | "in_progress" | "review" | "done" */
    status: string | null;
    /** Due date as ISO timestamp (nullable) */
    due_date: string | null;
    /** UUID of the primary assigned user (nullable) */
    assigned_to: string | null;
    /** Resolved name of the primary assignee (nullable) */
    assignee_name: string | null;
    /** Array of additional assignee UUIDs */
    assignees: string[];
    /** Resolved names for the assignees UUIDs */
    assignee_names: string[];
}
