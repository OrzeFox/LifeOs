import { IsString, IsNumber, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ExpenseType } from '../entities/expense.entity';

export class CreateExpenseDto {
  @IsString() name: string;
  @IsNumber() @Type(() => Number) amount: number;
  @IsEnum(ExpenseType) type: ExpenseType;
  @IsOptional() @IsString() category?: string;
  @IsDateString() date: string;
}
