import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'change_audit' })
export class ChangeAudit {
  @PrimaryGeneratedColumn('uuid', { name: 'audit_id' })
  audit_id: string;

  @Column('text', { name: 'entity_type' })
  entity_type: string;

  @Column('uuid', { name: 'entity_id' })
  entity_id: string;

  @Column('text')
  action: 'create' | 'update' | 'delete';

  @Column('uuid', { name: 'performed_by', nullable: true })
  performed_by: string | null;

  @Column('jsonb', { nullable: true })
  diff: any | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  created_at: Date;
}