import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, Unique,
} from 'typeorm';
import { Habit } from './habit.entity';

@Entity('habit_logs')
@Unique(['habit', 'date'])
export class HabitLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Habit, (habit) => habit.logs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'habit_id' })
  habit: Habit;

  @Column({ type: 'date' })
  date: string;

  @Column({ default: false })
  completed: boolean;

  // Achieved value: minutes for timer, count for numeric, % for checklist/simple
  @Column({ type: 'float', default: 0 })
  value: number;

  // Checklist per-item completion state
  @Column({ type: 'simple-json', nullable: true, name: 'checklist_state' })
  checklistState: boolean[];
}
