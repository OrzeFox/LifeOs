import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('meals')
export class Meal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.meals, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  name: string; // desayuno, almuerzo, cena, snack

  @Column({ name: 'scheduled_time', type: 'time', nullable: true })
  scheduledTime: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ nullable: true })
  description: string;
}
