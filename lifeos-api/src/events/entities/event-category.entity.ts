import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn, OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Event } from './event.entity';

@Entity('event_categories')
export class EventCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  name: string;

  @Column({ default: '#4EDEA3' })
  color: string;

  @OneToMany(() => Event, (event) => event.category)
  events: Event[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
