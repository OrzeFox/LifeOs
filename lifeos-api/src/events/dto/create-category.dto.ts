import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class CreateEventCategoryDto {
  @IsString() @MaxLength(60)
  name: string;

  @IsOptional() @IsString() @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'color must be hex like #4EDEA3' })
  color?: string;
}
