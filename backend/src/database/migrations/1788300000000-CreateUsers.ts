import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsers1788300000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE users (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name varchar(30) NOT NULL CHECK (char_length(btrim(name)) > 0),
        email varchar(40) NOT NULL CHECK (email = lower(btrim(email))),
        registration varchar(10) NOT NULL CHECK (registration ~ '^[0-9]{4,10}$'),
        password_hash text NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT uq_users_email UNIQUE (email),
        CONSTRAINT uq_users_registration UNIQUE (registration)
      )
    `);
    await queryRunner.query('CREATE INDEX idx_users_name_id ON users (name, id)');
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE users');
  }
}
