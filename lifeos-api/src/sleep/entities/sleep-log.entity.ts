import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('sleep_logs')
@Index(['user', 'sleepAt'])
export class SleepLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.sleepLogs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'sleep_at', type: 'timestamptz' })
  sleepAt: Date;

  @Column({ name: 'wake_at', type: 'timestamptz' })
  wakeAt: Date;

  @Column({ name: 'duration_min', type: 'int' })
  durationMin: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
