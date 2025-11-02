import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Client {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  notes: string;

  @Column("text", { array: true, default: '{}' })
  tags: string[];
}
