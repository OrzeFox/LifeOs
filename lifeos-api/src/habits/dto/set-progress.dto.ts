import { IsString, IsOptional, IsNumber, IsArray, IsBoolean } from 'class-validator';

export class SetProgressDto {
  @IsString()
  date: string;

  @IsOptional() @IsNumber()
  value?: number;

  @IsOptional() @IsArray()
  checklistState?: boolean[];
}
