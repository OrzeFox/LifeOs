import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum MealType {
  DESAYUNO = 'desayuno',
  ALMUERZO = 'almuerzo',
  CENA     = 'cena',
  SNACK    = 'snack',
  MERIENDA = 'merienda',
  OTRO     = 'otro',
}

@Entity('meals')
export class Meal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.meals, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: MealType, default: MealType.OTRO })
  mealType: MealType;

  @Column({ name: 'scheduled_time', type: 'time', nullable: true })
  scheduledTime: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'float', nullable: true })
  calories: number;

  @Column({ type: 'float', nullable: true })
  protein: number;

  @Column({ type: 'float', nullable: true })
  carbs: number;

  @Column({ type: 'float', nullable: true })
  fat: number;

  @Column({ type: 'float', nullable: true })
  fiber: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
