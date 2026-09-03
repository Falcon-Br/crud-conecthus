import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { ListUsersDto } from './dto/list-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserListResponseDto, UserResponseDto } from './dto/user-response.dto';
import { hashPassword } from './password';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly db: DataSource,
  ) {}

  async create(input: CreateUserDto): Promise<UserResponseDto> {
    const user = this.users.create({
      name: input.name,
      email: input.email,
      registration: input.registration,
      passwordHash: await hashPassword(input.password),
    });
    return UserResponseDto.from(await this.users.save(user));
  }

  async list(input: ListUsersDto): Promise<UserListResponseDto> {
    return this.db.transaction('REPEATABLE READ', async (manager) => {
      const query = manager.getRepository(User).createQueryBuilder('user');
      if (input.search) {
        const literal = input.search.replace(/[\\%_]/g, '\\$&');
        query.where('user.name ILIKE :search', { search: `%${literal}%` });
      }
      const total = await query.getCount();
      const totalPages = Math.ceil(total / input.pageSize);
      const page = Math.min(input.page, Math.max(1, totalPages));
      const users = await query
        .orderBy('user.name', 'ASC')
        .addOrderBy('user.id', 'ASC')
        .skip((page - 1) * input.pageSize)
        .take(input.pageSize)
        .getMany();
      return {
        data: users.map(UserResponseDto.from),
        meta: { page, pageSize: input.pageSize, total, totalPages },
      };
    });
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.users.findOneBy({ id });
    if (!user) throw new NotFoundException('Usuário não encontrado.');
    return UserResponseDto.from(user);
  }

  async update(id: string, input: UpdateUserDto): Promise<UserResponseDto> {
    const changes: Partial<User> = {};
    if (input.name !== undefined) changes.name = input.name;
    if (input.email !== undefined) changes.email = input.email;
    if (input.registration !== undefined) changes.registration = input.registration;
    if (input.password !== undefined) changes.passwordHash = await hashPassword(input.password);
    if (!Object.keys(changes).length)
      throw new BadRequestException('Informe pelo menos uma alteração.');
    const result = await this.users.update({ id }, changes);
    if (!result.affected) throw new NotFoundException('Usuário não encontrado.');
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.users.delete({ id });
    if (!result.affected) throw new NotFoundException('Usuário não encontrado.');
  }
}
