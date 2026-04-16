import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, Unique,
} from 'typeorm';
import { Habit } from './habit.entity';

@Entity('habit_logs')
@Unique(['habit', 'date']) // un registro por hábito por día
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
}
