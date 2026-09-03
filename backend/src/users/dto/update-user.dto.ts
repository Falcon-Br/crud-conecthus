import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, Matches, ValidateIf } from 'class-validator';
import { PASSWORD_MESSAGE, PASSWORD_PATTERN, UserFieldsDto } from './user-fields.dto';

export class UpdateUserDto extends PartialType(UserFieldsDto, { skipNullProperties: false }) {
  @ApiPropertyOptional({
    example: 'Cd34!@',
    minLength: 6,
    maxLength: 6,
    description: 'Omitir ou enviar vazio para manter a senha atual. ' + PASSWORD_MESSAGE,
    writeOnly: true,
  })
  @Transform(({ value }: { value: unknown }) => (value === '' ? undefined : value))
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsString({ message: 'Informe uma senha válida.' })
  @Matches(PASSWORD_PATTERN, { message: PASSWORD_MESSAGE })
  password?: string;
}
