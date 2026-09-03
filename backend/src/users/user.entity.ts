import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type: 'varchar', length: 30 }) name!: string;
  @Column({ type: 'varchar', length: 40 }) email!: string;
  @Column({ type: 'varchar', length: 10 }) registration!: string;
  @Column({ name: 'password_hash', type: 'text', select: false }) passwordHash!: string;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}
