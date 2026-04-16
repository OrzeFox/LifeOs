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

  @Column({ type: 'enum', enum: HabitType, default: HabitType.SIMPLE, name: 'habit_type' })
  habitType: HabitType;

  @Column({ type: 'float', nullable: true, name: 'target_value' })
  targetValue: number;

  // null / [] = every day; [1,3,5] = Mon/Wed/Fri (JS weekday)
  @Column({ type: 'simple-json', nullable: true, name: 'schedule_days' })
  scheduleDays: number[];

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
