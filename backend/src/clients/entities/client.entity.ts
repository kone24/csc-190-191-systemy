import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'first_name' })
  first_name: string;

  @Column({ name: 'last_name' })
  last_name: string;

  @Column()
  email: string;

  @Column({ name: 'phone_number' })
  phone_number: string;

  @Column({ name: 'business_name' })
  business_name: string;

  @Column('jsonb', { nullable: true })
  address: any;

  @Column({ nullable: true })
  title?: string;

  @Column({ nullable: true })
  industry?: string;

  @Column({ nullable: true })
  website?: string;

  @Column('jsonb', { nullable: true, name: 'social_links' })
  social_links?: any;

  @Column('text', { nullable: true, name: 'additional_info' })
  additional_info?: string;

  @Column({ nullable: true })
  company?: string;

  @Column({ nullable: true, name: 'relationship_owner' })
  relationship_owner?: string;

  @Column({ nullable: true })
  status?: string;

  @Column({ nullable: true, name: 'contact_medium' })
  contact_medium?: string;

  @Column('date', { nullable: true, name: 'date_of_contact' })
  date_of_contact?: Date;

  @Column({ nullable: true, name: 'where_met' })
  where_met?: string;

  @Column('text', { nullable: true, name: 'chat_summary' })
  chat_summary?: string;

  @Column({ nullable: true })
  outcome?: string;

  @Column({ nullable: true, name: 'relationship_status' })
  relationship_status?: string;

  @Column('text', { nullable: true })
  notes?: string;

  @Column('text', { array: true, default: '{}' })
  tags: string[];

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
