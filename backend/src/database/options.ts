import { config } from 'dotenv';
import { resolve } from 'node:path';
import { DataSourceOptions } from 'typeorm';
import { User } from '../users/user.entity';
import { CreateUsers1788300000000 } from './migrations/1788300000000-CreateUsers';

config({ path: resolve(__dirname, '../../../.env'), quiet: true });

export function databaseOptions(): DataSourceOptions {
  const url = process.env.DATABASE_URL;
  if (!url || !/^postgres(ql)?:\/\//.test(url)) {
    throw new Error('Configure DATABASE_URL com uma conexão PostgreSQL no arquivo .env.');
  }
  return {
    type: 'postgres',
    url,
    entities: [User],
    migrations: [CreateUsers1788300000000],
    synchronize: false,
    migrationsRun: false,
    logging: false,
    extra: { max: 10, connectionTimeoutMillis: 5000, statement_timeout: 10000 },
  };
}
