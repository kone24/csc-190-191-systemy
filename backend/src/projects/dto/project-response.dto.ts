export interface ProjectResponseDto {
    project_id: string;
    name: string;
    status: string | null;
    service_type: string | null;
    start_date: string | null;
    end_date: string | null;
    client_id: string | null;
    client_name: string | null;
    owner_id: string | null;
    owner_name: string | null;
    task_count: number;
    budget: number | null;
    description: string | null;
}
