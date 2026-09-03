import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length, Matches, MaxLength } from 'class-validator';

export class UserFieldsDto {
  @ApiProperty({
    example: 'João da Silva',
    maxLength: 30,
    description: 'Letras acentuadas e espaços. Normalizado em NFC.',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.normalize('NFC').trim().replace(/ +/g, ' ') : value,
  )
  @IsString({ message: 'Informe o nome.' })
  @Length(1, 30, { message: 'O nome deve ter entre 1 e 30 caracteres.' })
  @Matches(/^\p{L}+(?: \p{L}+)*$/u, { message: 'Use apenas letras e espaços entre nomes.' })
  name!: string;

  @ApiProperty({ example: 'joao@example.com', maxLength: 40, format: 'email' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsString({ message: 'Informe o email.' })
  @IsEmail({}, { message: 'Informe um email válido.' })
  @MaxLength(40, { message: 'O email deve ter no máximo 40 caracteres.' })
  email!: string;

  @ApiProperty({
    example: '001234',
    minLength: 4,
    maxLength: 10,
    pattern: '^[0-9]{4,10}$',
    description: 'Texto numérico; preserva zeros iniciais.',
  })
  @IsString({ message: 'Informe a matrícula como texto.' })
  @Matches(/^[0-9]{4,10}$/, { message: 'A matrícula deve ter de 4 a 10 dígitos.' })
  registration!: string;
}

export const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*[0-9])[\x21-\x7E]{6}$/;
export const PASSWORD_MESSAGE =
  'Use 6 caracteres com pelo menos uma letra e um número. Símbolos são permitidos; espaços não.';
