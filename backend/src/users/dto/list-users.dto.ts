import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

const integerQuery = ({ value }: { value: unknown }) =>
  typeof value === 'string' && /^[0-9]+$/.test(value) ? Number(value) : value;

export class ListUsersDto {
  @ApiPropertyOptional({ default: 1, minimum: 1, maximum: 2147483647 })
  @Transform(integerQuery)
  @IsInt({ message: 'A página deve ser um inteiro positivo.' })
  @Min(1)
  @Max(2147483647)
  page = 1;

  @ApiPropertyOptional({ default: 15, minimum: 1, maximum: 100 })
  @Transform(integerQuery)
  @IsInt({ message: 'A quantidade por página deve ser um inteiro.' })
  @Min(1)
  @Max(100)
  pageSize = 15;

  @ApiPropertyOptional({
    maxLength: 100,
    description: 'Trecho literal do nome; ignora maiúsculas e minúsculas.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.normalize('NFC').trim() : value,
  )
  search?: string;
}
