export class Vendor {
  id: string;
  project_id?: string;
  first_name: string;
  last_name?: string;
  email?: string;
  company?: string;
  business_name?: string;
  status?: string;
  date_meet?: string;
  outcome?: string;
  additional_info?: string;
  tags: string[];
  created_at?: string;
  updated_at?: string;
  // Joined from project table
  project?: { project_id: string; name: string };
}
