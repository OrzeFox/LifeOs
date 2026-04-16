import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, Unique,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('energy_logs')
@Unique(['user', 'date'])
export class EnergyLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.energyLogs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'int' })
  level: number; // 1-10

  @Column({ nullable: true })
  notes: string;
}
