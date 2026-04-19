import { IsString, IsOptional, IsEnum } from 'class-validator';
import { MealType } from '../entities/meal.entity';

export class UpdateMealDto {
  @IsOptional() @IsEnum(MealType)
  mealType?: MealType;

  @IsOptional() @IsString()
  scheduledTime?: string;

  @IsOptional() @IsString()
  description?: string;
}
