# 🚀 Guia de Início Rápido

## Passo a Passo para Rodar o Projeto

### 1️⃣ Instalar PostgreSQL

**Windows:**
- Baixar: https://www.postgresql.org/download/windows/
- Instalar com senha: `root` (ou outra de sua escolha)
- Porta padrão: `5432`

**Linux/Mac:**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Mac
brew install postgresql
```

### 2️⃣ Criar Banco de Dados

```bash
# Acessar PostgreSQL
psql -U postgres

# Criar banco
CREATE DATABASE rifa_db;

# Sair
\q
```

### 3️⃣ Configurar .env

Copie o `.env.example` para `.env` e ajuste:

```env
DATABASE_URL="postgresql://postgres:root@localhost:5432/rifa_db?schema=public"

# Suas credenciais EfiPay
EFI_CLIENT_ID="Client_Id_f11541ee3ed3b1e0ecc8525547c97d54621c94fc"
EFI_CLIENT_SECRET="Client_Secret_dcf38a8a485a151f9eb286264258c0f4c7bb322a"
EFI_PIX_KEY="d3af499e-36ae-4e62-bc40-5369102855e6"
EFI_CERT_PATH="./cert/producao-747176-MinkBot-PROD.p12"
EFI_CERT_PASSPHRASE=""

PORT=3333
NODE_ENV="development"

RIFA_PRICE=5.00
PIX_EXPIRATION_SECONDS=300
```

### 4️⃣ Instalar Dependências

```bash
yarn install
```

### 5️⃣ Executar Migrations

```bash
yarn prisma migrate dev --name init
```

### 6️⃣ Popular Números da Rifa

Edite `prisma/seed.ts` para definir quantos números sua rifa terá (padrão: 100).

```bash
yarn prisma-seed
```

### 7️⃣ Iniciar Servidor

```bash
yarn dev
```

Servidor rodando em: http://localhost:3333

### 8️⃣ Testar API

**Listar números disponíveis:**
```bash
curl http://localhost:3333/rifas/available
```

**Criar pagamento:**
```bash
curl -X POST http://localhost:3333/payment \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "João Silva",
    "cpf": "12345678900",
    "phone": "11999999999",
    "numbers": [1, 2, 3]
  }'
```

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
yarn dev

# Prisma Studio (visualizar banco)
yarn prisma studio

# Gerar Prisma Client
yarn prisma generate

# Resetar banco (CUIDADO!)
yarn prisma migrate reset

# Popular números novamente
yarn prisma-seed
```

## 🐛 Problemas Comuns

### Erro: "Can't reach database server"
- Verifique se PostgreSQL está rodando
- Confirme usuário/senha no DATABASE_URL
- Teste conexão: `psql -U postgres`

### Erro: "Certificate not found"
- Verifique se o arquivo `.p12` está na pasta `cert/`
- Confirme o caminho em `EFI_CERT_PATH`

### Erro: "Port 3333 already in use"
- Altere a porta no `.env`
- Ou mate o processo: `lsof -ti:3333 | xargs kill` (Mac/Linux)

### Números não aparecem
- Execute: `yarn prisma-seed`
- Verifique no Prisma Studio: `yarn prisma studio`

## 📱 Configurar Webhook (Produção)

1. Acesse: https://app.efipay.com.br/
2. Vá em: Configurações > Webhooks
3. Adicione: `https://seu-dominio.com/webhook/efi`
4. Tipo: PIX

## ✅ Checklist de Funcionamento

- [ ] PostgreSQL instalado e rodando
- [ ] Banco `rifa_db` criado
- [ ] `.env` configurado
- [ ] Migrations executadas
- [ ] Números populados (seed)
- [ ] Servidor iniciado sem erros
- [ ] Endpoint `/health` responde
- [ ] Endpoint `/rifas/available` lista números
- [ ] Certificado EfiPay na pasta `cert/`

## 🎯 Próximos Passos

1. Testar criação de pagamento
2. Verificar QR Code gerado
3. Testar pagamento em homologação
4. Configurar webhook
5. Desenvolver frontend
6. Deploy em produção

## 📞 Suporte

- Documentação EfiPay: https://dev.efipay.com.br/
- Issues: Abra uma issue no repositório
- Email: seu-email@exemplo.com

---

**Dica:** Use o Prisma Studio para visualizar os dados:
```bash
yarn prisma studio
```
Acesse: http://localhost:5555
