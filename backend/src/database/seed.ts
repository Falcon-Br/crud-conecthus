import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { databaseOptions } from './options';
import { hashPassword } from '../users/password';
import { User } from '../users/user.entity';

const names = [
  'Ana Beatriz',
  'Bruno Ferreira',
  'Camila Rodrigues',
  'Daniel Almeida',
  'Eduarda Martins',
  'Felipe Oliveira',
  'Gabriela Costa',
  'Henrique Souza',
  'Isabela Lima',
  'João Pedro',
  'Juliana Barros',
  'Lucas Pereira',
  'Luísa Melo',
  'Marcos Vinícius',
  'Maria Clara',
  'Mateus Ribeiro',
  'Natália Rocha',
  'Otávio Santos',
  'Paula Fernandes',
  'Rafael Teixeira',
  'Renata Cardoso',
  'Sofia Nascimento',
  'Vitória Araújo',
];

async function seed() {
  const db = await new DataSource(databaseOptions()).initialize();
  try {
    await db.transaction(async (manager) => {
      const repository = manager.getRepository(User);
      for (const [index, name] of names.entries()) {
        const registration = String(100001 + index);
        const email = `demo${index + 1}@example.com`;
        // Never overwrite an edited user when the seed is run again.
        if (await repository.exists({ where: [{ registration }, { email }] })) continue;
        await repository.insert({
          name,
          email,
          registration,
          passwordHash: await hashPassword('Demo1!'),
        });
      }
    });
    console.log(
      'Seed concluído: até 23 usuários fictícios disponíveis. Registros existentes foram preservados.',
    );
  } finally {
    await db.destroy();
  }
}

seed().catch(() => {
  console.error('Falha no seed. Verifique o banco e execute as migrations antes.');
  process.exitCode = 1;
});
