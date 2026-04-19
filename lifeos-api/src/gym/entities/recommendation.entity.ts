import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('gym_recommendations')
@Index(['user', 'generatedAt'])
export class Recommendation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 16 })
  goal: 'gain' | 'lose' | 'maintain';

  @Column({ name: 'height_cm', type: 'float', nullable: true })
  heightCm: number;

  @Column({ name: 'weight_kg', type: 'float', nullable: true })
  weightKg: number;

  @Column({ name: 'ai_provider', type: 'varchar', length: 32 })
  aiProvider: string;

  @Column({ type: 'jsonb' })
  summary: string;

  @Column({ name: 'workout_plan', type: 'jsonb' })
  workoutPlan: any;

  @Column({ name: 'meal_plan', type: 'jsonb' })
  mealPlan: any;

  @CreateDateColumn({ name: 'generated_at' })
  generatedAt: Date;
}
