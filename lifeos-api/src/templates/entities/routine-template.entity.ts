import {
  Column, CreateDateColumn, Entity, Index, ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export interface TemplateHabitSpec {
  name: string;
  description?: string | null;
  habitType: 'simple' | 'timer' | 'numeric' | 'checklist';
  targetValue?: number | null;
  frequencyType: 'daily' | 'weekly' | 'custom';
  timesPerWeek?: number | null;
  scheduleDays?: number[] | null;
  color?: string | null;
  checklistItems?: string[] | null;
}

@Entity('routine_templates')
@Index(['user', 'name'], { unique: true })
export class RoutineTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.templates, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'jsonb' })
  habits: TemplateHabitSpec[];

  @Column({ name: 'last_applied_at', type: 'timestamptz', nullable: true })
  lastAppliedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
