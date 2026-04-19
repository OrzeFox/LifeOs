import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, OneToMany, JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { HabitLog } from './habit-log.entity';

export enum HabitType {
  SIMPLE    = 'simple',
  TIMER     = 'timer',
  NUMERIC   = 'numeric',
  CHECKLIST = 'checklist',
}

export enum HabitKind {
  HABIT = 'habit',
  TASK  = 'task',
}

export enum FrequencyType {
  DAILY  = 'daily',
  WEEKLY = 'weekly',
  CUSTOM = 'custom',
}

@Entity('habits')
export class Habit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.habits, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ type: 'enum', enum: HabitKind, default: HabitKind.HABIT, name: 'kind' })
  kind: HabitKind;

  @Column({ type: 'enum', enum: HabitType, default: HabitType.SIMPLE, name: 'habit_type' })
  habitType: HabitType;

  @Column({ type: 'float', nullable: true, name: 'target_value' })
  targetValue: number;

  @Column({ type: 'enum', enum: FrequencyType, default: FrequencyType.DAILY, name: 'frequency_type' })
  frequencyType: FrequencyType;

  @Column({ type: 'int', nullable: true, name: 'times_per_week' })
  timesPerWeek: number;

  // [1,3,5] = Mon/Wed/Fri (JS weekday). Used when frequencyType = 'custom'.
  @Column({ type: 'simple-json', nullable: true, name: 'schedule_days' })
  scheduleDays: number[];

  @Column({ type: 'date', nullable: true, name: 'start_date' })
  startDate: string;

  @Column({ type: 'date', nullable: true, name: 'end_date' })
  endDate: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true, default: '#4EDEA3' })
  color: string;

  // For checklist type: task names
  @Column({ type: 'simple-json', nullable: true, name: 'checklist_items' })
  checklistItems: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => HabitLog, (log) => log.habit)
  logs: HabitLog[];
}
