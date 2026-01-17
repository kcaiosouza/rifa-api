# 📁 Estrutura do Projeto

```
rifa-api/
│
├── 📂 cert/                                    # Certificados EfiPay
│   ├── homologacao-747176-MinkBot-DEV.p12     # Certificado de teste
│   └── producao-747176-MinkBot-PROD.p12       # Certificado de produção
│
├── 📂 prisma/                                  # Banco de dados
│   ├── schema.prisma                          # ✨ Schema PostgreSQL (3 tabelas)
│   └── seed.ts                                # ✨ Popular números da rifa
│
├── 📂 src/                                     # Código fonte
│   │
│   ├── 📂 config/                             # ✨ Configurações
│   │   └── env.ts                             # Variáveis de ambiente centralizadas
│   │
│   ├── 📂 services/                           # ✨ Lógica de negócio
│   │   ├── efiPay.service.ts                  # Integração com EfiPay
│   │   └── rifa.service.ts                    # Gerenciamento de rifas
│   │
│   ├── 📂 routes/                             # ✨ Rotas da API
│   │   ├── payment.routes.ts                  # POST /payment, GET /payment/:txid
│   │   ├── rifa.routes.ts                     # GET /rifas/available
│   │   └── webhook.routes.ts                  # POST /webhook/efi
│   │
│   ├── 📂 types/                              # ✨ TypeScript
│   │   └── index.ts                           # Interfaces e tipos
│   │
│   ├── 📂 utils/                              # ✨ Utilitários
│   │   └── validation.ts                      # Validação de entrada
│   │
│   └── server.ts                              # ✨ Servidor principal
│
├── 📄 .env                                     # ✨ Variáveis de ambiente (não versionar)
├── 📄 .env.example                            # ✨ Template de variáveis
├── 📄 .gitignore                              # ✨ Arquivos ignorados
│
├── 📖 README.md                               # ✨ Documentação principal
├── 📖 QUICKSTART.md                           # ✨ Guia de início rápido
├── 📖 EXAMPLES.md                             # ✨ Exemplos de uso
├── 📖 SECURITY.md                             # ✨ Guia de segurança
├── 📖 CHANGELOG.md                            # ✨ Histórico de mudanças
│
├── 📦 package.json                            # Dependências
├── 📦 yarn.lock                               # Lock de dependências
└── ⚙️ tsconfig.json                           # Configuração TypeScript

✨ = Arquivo novo ou refatorado
```

## 🎯 Arquivos Principais

### 🔧 Configuração
- **`.env`** - Credenciais e configurações sensíveis
- **`src/config/env.ts`** - Centraliza acesso às variáveis

### 🗄️ Banco de Dados
- **`prisma/schema.prisma`** - 3 tabelas: Client, Transaction, Rifa
- **`prisma/seed.ts`** - Popula números iniciais da rifa

### 🚀 API
- **`src/server.ts`** - Servidor Fastify com CORS e rotas
- **`src/routes/payment.routes.ts`** - Criar e consultar pagamentos
- **`src/routes/webhook.routes.ts`** - Receber notificações EfiPay
- **`src/routes/rifa.routes.ts`** - Listar números disponíveis

### 💼 Serviços
- **`src/services/efiPay.service.ts`** - Integração com API EfiPay
- **`src/services/rifa.service.ts`** - Lógica de reserva e confirmação

### 🛡️ Segurança
- **`src/utils/validation.ts`** - Validação de entrada
- **`src/types/index.ts`** - Type safety com TypeScript

### 📚 Documentação
- **`README.md`** - Visão geral e documentação da API
- **`QUICKSTART.md`** - Como rodar em 5 minutos
- **`EXAMPLES.md`** - Exemplos de requisições
- **`SECURITY.md`** - Checklist de segurança e deploy
- **`CHANGELOG.md`** - O que mudou na refatoração

## 🔄 Fluxo de Dados

```
Cliente Frontend
    ↓
POST /payment (números escolhidos)
    ↓
validation.ts (valida entrada)
    ↓
rifa.service.ts (verifica disponibilidade)
    ↓
prisma (reserva números)
    ↓
efiPay.service.ts (gera PIX)
    ↓
← Retorna QR Code e Pix Copia e Cola
    ↓
Cliente paga PIX
    ↓
EfiPay → POST /webhook/efi
    ↓
rifa.service.ts (confirma pagamento)
    ↓
prisma (atualiza status para PAID)
```

## 📊 Tabelas do Banco

### clients
- id, fullName, cpf, phone, created_at

### transactions
- id (txid), client_id, amount, status, expires_at, pix_copy_paste, qr_code_image

### rifas
- id, number (único), client_id, transaction_id, status, reserved_at, paid_at

## 🎨 Padrões Utilizados

- ✅ **Clean Architecture** - Separação de camadas
- ✅ **Service Pattern** - Lógica isolada em services
- ✅ **Repository Pattern** - Prisma como camada de dados
- ✅ **Dependency Injection** - Serviços reutilizáveis
- ✅ **Error Handling** - Try/catch em todas as rotas
- ✅ **Type Safety** - TypeScript em todo código
- ✅ **Environment Variables** - Configuração externa
- ✅ **Single Responsibility** - Cada arquivo uma função

## 🔐 Segurança Implementada

- ✅ Credenciais em variáveis de ambiente
- ✅ Validação rigorosa de entrada
- ✅ Números únicos (constraint no banco)
- ✅ Reserva temporária com expiração
- ✅ Tratamento de erros sem expor detalhes
- ✅ TypeScript para prevenir bugs
- ✅ Logs sem dados sensíveis
- ✅ .gitignore protegendo arquivos críticos

## 📈 Próximas Melhorias

1. Rate limiting
2. Autenticação JWT para admin
3. Testes automatizados
4. CI/CD
5. Docker
6. Monitoramento
7. Cache Redis
8. Múltiplas rifas
