import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';
import { PASSWORD_MESSAGE, PASSWORD_PATTERN, UserFieldsDto } from './user-fields.dto';

export class CreateUserDto extends UserFieldsDto {
  @ApiProperty({
    example: 'Ab12!@',
    minLength: 6,
    maxLength: 6,
    description: PASSWORD_MESSAGE,
    writeOnly: true,
  })
  @IsString({ message: 'Informe a senha.' })
  @Matches(PASSWORD_PATTERN, { message: PASSWORD_MESSAGE })
  password!: string;
}
