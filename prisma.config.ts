
// prisma.config.ts (coloque na raiz do projeto, ex.: /root/app/gestao-rh)
import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  // caminho do seu schema
  schema: 'prisma/schema.prisma',

  // onde o Prisma Migrate criará os arquivos de migração (opcional, recomendado)
  migrations: {
    path: 'prisma/migrations',
  },

  // em Prisma v7, a URL do banco sai do schema.prisma e vem para cá
  datasource: {
    url: env('DATABASE_URL'),
    // Se futuramente usar shadow DB para Migrate:
    // shadowDatabaseUrl: env('SHADOW_DATABASE_URL'),
  },
})
