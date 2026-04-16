import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Meal } from './entities/meal.entity';
import { RoutineController } from './routine.controller';
import { RoutineService } from './routine.service';
import { NutritionService } from './nutrition.service';

@Module({
  imports: [TypeOrmModule.forFeature([Meal])],
  controllers: [RoutineController],
  providers: [RoutineService, NutritionService],
  exports: [RoutineService],
})
export class RoutineModule {}
