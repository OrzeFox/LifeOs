import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, OneToMany,
} from 'typeorm';
import { Expense } from '../../finances/entities/expense.entity';
import { MonthlyIncome } from '../../finances/entities/monthly-income.entity';
import { Habit } from '../../habits/entities/habit.entity';
import { Meal } from '../../routine/entities/meal.entity';
import { EnergyLog } from '../../energy/entities/energy-log.entity';
import { GymActivity } from '../../gym/entities/gym-activity.entity';

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
}
