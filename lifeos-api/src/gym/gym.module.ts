import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GymActivity } from './entities/gym-activity.entity';
import { Recommendation } from './entities/recommendation.entity';
import { GymController } from './gym.controller';
import { GymService } from './gym.service';
import { UsersModule } from '../users/users.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GymActivity, Recommendation]),
    UsersModule,
    AiModule,
  ],
  controllers: [GymController],
  providers: [GymService],
  exports: [GymService],
})
export class GymModule {}
