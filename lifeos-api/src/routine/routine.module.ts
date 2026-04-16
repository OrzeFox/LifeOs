import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Meal } from './meal.entity';
import { RoutineController } from './routine.controller';
import { RoutineService } from './routine.service';

@Module({
  imports: [TypeOrmModule.forFeature([Meal])],
  controllers: [RoutineController],
  providers: [RoutineService],
  exports: [RoutineService],
})
export class RoutineModule {}
