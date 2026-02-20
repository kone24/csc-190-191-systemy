import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  phone: string;

  @Column()
  company: string;

  @Column({ type: 'jsonb' })
  address: Record<string, unknown>;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  industry: string;

  @Column({ nullable: true })
  website: string;

  @Column({ type: 'jsonb', nullable: true })
  socialLinks: Record<string, unknown>;

  @Column({ nullable: true })
  notes: string;

  @Column('text', { array: true, default: '{}' })
  tags: string[];

  @Column()
  createdAt: string;

  @Column()
  updatedAt: string;
}
