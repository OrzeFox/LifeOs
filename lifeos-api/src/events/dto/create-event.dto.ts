import { IsBoolean, IsDateString, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateEventDto {
  @IsString() @MaxLength(200)
  title: string;

  @IsOptional() @IsString() @MaxLength(2000)
  description?: string;

  @IsDateString()
  startAt: string;

  @IsDateString()
  endAt: string;

  @IsOptional() @IsBoolean()
  allDay?: boolean;

  @IsOptional() @IsString() @MaxLength(200)
  location?: string;

  @IsOptional() @IsUUID()
  categoryId?: string;
}
