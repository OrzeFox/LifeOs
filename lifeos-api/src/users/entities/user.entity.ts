import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, OneToMany,
} from 'typeorm';
import { Expense } from '../../finances/entities/expense.entity';
import { MonthlyIncome } from '../../finances/entities/monthly-income.entity';
import { Habit } from '../../habits/entities/habit.entity';
import { Meal } from '../../nutrition/entities/meal.entity';
import { EnergyLog } from '../../energy/entities/energy-log.entity';
import { GymActivity } from '../../gym/entities/gym-activity.entity';
import { SleepLog } from '../../sleep/entities/sleep-log.entity';
import { JournalEntry } from '../../journal/entities/journal-entry.entity';
import { Insight } from '../../insights/entities/insight.entity';
import { Goal } from '../../goals/entities/goal.entity';
import { RoutineTemplate } from '../../templates/entities/routine-template.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash', nullable: true })
  passwordHash: string;

  @Column()
  name: string;

  @Column({ name: 'google_id', nullable: true, unique: true })
  googleId: string;

  @Column({ type: 'date', nullable: true })
  birthdate: Date;

  @Column({ name: 'height_cm', type: 'float', nullable: true })
  heightCm: number;

  @Column({ name: 'weight_kg', type: 'float', nullable: true })
  weightKg: number;

  @Column({ type: 'varchar', length: 16, nullable: true })
  goal: 'gain' | 'lose' | 'maintain';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => Expense, (expense) => expense.user)
  expenses: Expense[];

  @OneToMany(() => MonthlyIncome, (income) => income.user)
  incomes: MonthlyIncome[];

  @OneToMany(() => Habit, (habit) => habit.user)
  habits: Habit[];

  @OneToMany(() => Meal, (meal) => meal.user)
  meals: Meal[];

  @OneToMany(() => EnergyLog, (log) => log.user)
  energyLogs: EnergyLog[];

  @OneToMany(() => GymActivity, (activity) => activity.user)
  gymActivities: GymActivity[];

  @OneToMany(() => SleepLog, (log) => log.user)
  sleepLogs: SleepLog[];

  @OneToMany(() => JournalEntry, (entry) => entry.user)
  journalEntries: JournalEntry[];

  @OneToMany(() => Insight, (insight) => insight.user)
  insights: Insight[];

  @OneToMany(() => Goal, (goal) => goal.user)
  goals: Goal[];

  @OneToMany(() => RoutineTemplate, (t) => t.user)
  templates: RoutineTemplate[];
}
