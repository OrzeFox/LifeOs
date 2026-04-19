import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GymActivity } from './entities/gym-activity.entity';
import { GymController } from './gym.controller';
import { GymService } from './gym.service';

@Module({
  imports: [TypeOrmModule.forFeature([GymActivity])],
  controllers: [GymController],
  providers: [GymService],
  exports: [GymService],
})
export class GymModule {}
