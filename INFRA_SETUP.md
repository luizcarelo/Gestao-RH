# Setup de Infraestrutura - Gestão RH Pro

Este documento descreve como inicializar os bancos de dados (PostgreSQL e Redis) necessários para a operação do sistema conforme os requisitos de conformidade.

## Pré-requisitos

- Docker e Docker Compose instalados.
- Node.js (para rodar as migrações do Prisma).

## 1. Inicializar os Serviços

Na raiz do projeto, execute o comando para subir os containers definidos no `docker-compose.yml`:

```bash
docker-compose up -d
```

Isso irá iniciar:
- **PostgreSQL** na porta `5432` (Banco Principal)
- **Redis** na porta `6379` (Fila/Cache)
- **Adminer** na porta `8080` (Interface Web para gestão do banco)

## 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto (se não houver) e adicione a string de conexão:

```env
# Conexão com o container PostgreSQL criado acima
DATABASE_URL="postgresql://admin:secure_password_123@localhost:5432/rh_pro_db?schema=public"
```

## 3. Criar o Schema do Banco (Migração)

Utilize o Prisma para criar as tabelas definidas em `prisma/schema.prisma` no banco de dados real:

```bash
# Instalar dependências de dev (se necessário)
npm install prisma --save-dev

# Aplicar o schema ao banco
npx prisma db push
```

## 4. Verificar Operação

1. Acesse o Adminer em: `http://localhost:8080`
2. Sistema: `PostgreSQL`
3. Servidor: `postgres`
4. Usuário: `admin`
5. Senha: `secure_password_123`
6. Banco: `rh_pro_db`

Você deverá ver as tabelas `employees`, `punches`, `audit_logs`, etc., criadas e prontas para receber dados.

---

## Observação sobre a Arquitetura

Atualmente, o frontend Angular utiliza o `HrService` em modo "Mock" (memória local) para demonstração. Para conectar este frontend ao banco de dados criado acima, é necessário implementar a camada de API (Backend NestJS) que servirá como ponte entre o Angular e o Prisma.
