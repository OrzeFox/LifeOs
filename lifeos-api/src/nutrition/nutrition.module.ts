import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Meal } from './entities/meal.entity';
import { NutritionController } from './nutrition.controller';
import { NutritionService } from './nutrition.service';
import { NutritionAnalyzerService } from './nutrition-analyzer.service';

@Module({
  imports: [TypeOrmModule.forFeature([Meal])],
  controllers: [NutritionController],
  providers: [NutritionService, NutritionAnalyzerService],
  exports: [NutritionService],
})
export class NutritionModule {}
