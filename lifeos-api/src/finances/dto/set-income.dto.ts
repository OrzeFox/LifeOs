import { IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class SetIncomeDto {
  @IsNumber() @Type(() => Number) amount: number;
  @IsString() month: string;
}
