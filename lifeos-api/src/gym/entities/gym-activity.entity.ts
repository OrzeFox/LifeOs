import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ActivityType {
  WALK    = 'walk',
  WEIGHTS = 'weights',
  CARDIO  = 'cardio',
  OTHER   = 'other',
}

@Entity('gym_activities')
export class GymActivity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.gymActivities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: ActivityType, name: 'activity_type' })
  activityType: ActivityType;

  @Column({ type: 'int' })
  duration: number;

  @Column({ type: 'float', nullable: true })
  weight: number;

  @Column({ nullable: true })
  notes: string;

  @Column({ type: 'date' })
  date: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
