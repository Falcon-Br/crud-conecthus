import { ApiProperty } from '@nestjs/swagger';
import { User } from '../user.entity';

export class UserResponseDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 'João da Silva' }) name!: string;
  @ApiProperty({ example: 'joao@example.com' }) email!: string;
  @ApiProperty({ example: '001234' }) registration!: string;
  @ApiProperty({ format: 'date-time' }) createdAt!: Date;
  @ApiProperty({ format: 'date-time' }) updatedAt!: Date;

  static from(user: User): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      registration: user.registration,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

export class PaginationMetaDto {
  @ApiProperty({ example: 1 }) page!: number;
  @ApiProperty({ example: 15 }) pageSize!: number;
  @ApiProperty({ example: 23 }) total!: number;
  @ApiProperty({ example: 2 }) totalPages!: number;
}

export class UserListResponseDto {
  @ApiProperty({ type: [UserResponseDto] }) data!: UserResponseDto[];
  @ApiProperty({ type: PaginationMetaDto }) meta!: PaginationMetaDto;
}
