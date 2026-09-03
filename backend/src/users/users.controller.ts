import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiErrorDto } from '../common/api-error';
import { CreateUserDto } from './dto/create-user.dto';
import { ListUsersDto } from './dto/list-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserListResponseDto, UserResponseDto } from './dto/user-response.dto';
import { UsersService } from './users.service';

@ApiTags('Usuários')
@ApiBadRequestResponse({ type: ApiErrorDto, description: 'Campos ou identificador inválidos.' })
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastrar usuário' })
  @ApiCreatedResponse({ type: UserResponseDto })
  @ApiConflictResponse({ type: ApiErrorDto, description: 'Email ou matrícula já cadastrado.' })
  create(@Body() input: CreateUserDto) {
    return this.users.create(input);
  }

  @Get()
  @ApiOperation({ summary: 'Listar, pesquisar e paginar usuários' })
  @ApiOkResponse({ type: UserListResponseDto })
  list(@Query() input: ListUsersDto) {
    return this.users.list(input);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar usuário sem dados de senha' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiNotFoundResponse({ type: ApiErrorDto })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.users.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Editar usuário',
    description:
      'Envie apenas campos alterados. Senha omitida ou vazia mantém a atual; null é inválido.',
  })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiConflictResponse({ type: ApiErrorDto })
  @ApiNotFoundResponse({ type: ApiErrorDto })
  update(@Param('id', new ParseUUIDPipe()) id: string, @Body() input: UpdateUserDto) {
    return this.users.update(id, input);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Excluir usuário' })
  @ApiNoContentResponse({ description: 'Usuário excluído.' })
  @ApiNotFoundResponse({ type: ApiErrorDto })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.users.remove(id);
  }
}
