import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Unique, Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('journal_entries')
@Unique(['user', 'date'])
@Index(['user', 'date'])
export class JournalEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.journalEntries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'int' })
  mood: number;            // 1..10

  @Column({ name: 'energy_level', type: 'int' })
  energyLevel: number;     // 1..10

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
