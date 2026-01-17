# API de Rifa Online

API segura para gerenciamento de rifas online com pagamento via PIX (EfiPay).

## 🔒 Segurança

- ✅ Credenciais em variáveis de ambiente
- ✅ Validação de entrada de dados
- ✅ Números únicos (não podem ser vendidos duas vezes)
- ✅ Reserva temporária com expiração automática
- ✅ Webhook para confirmação automática de pagamento
- ✅ TypeScript para type safety
- ✅ Tratamento de erros adequado

## 📋 Pré-requisitos

- Node.js 18+
- PostgreSQL
- Certificado EfiPay (.p12)

## 🚀 Instalação

1. Clone o repositório
2. Instale as dependências:
```bash
yarn install
```

3. Configure o `.env` (use `.env.example` como base):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/rifa_db"
EFI_CLIENT_ID="seu_client_id"
EFI_CLIENT_SECRET="seu_client_secret"
EFI_PIX_KEY="sua_chave_pix"
EFI_CERT_PATH="./cert/producao-xxx.p12"
```

4. Execute as migrations:
```bash
yarn prisma migrate dev
```

5. Inicie o servidor:
```bash
yarn dev
```

## 📡 Endpoints

### POST /payment
Cria um pagamento PIX para compra de números da rifa.

**Request:**
```json
{
  "fullName": "João Silva",
  "cpf": "12345678900",
  "phone": "11999999999",
  "numbers": [1, 5, 10, 25]
}
```

**Response:**
```json
{
  "transaction_id": "abc123...",
  "amount": 20.00,
  "numbers": [1, 5, 10, 25],
  "qr_code": "data:image/png;base64,...",
  "pix_copy_paste": "00020126...",
  "expires_at": "2024-01-01T12:05:00.000Z"
}
```

### GET /payment/:txid
Consulta o status de um pagamento.

**Response:**
```json
{
  "transaction_id": "abc123...",
  "status": "CONCLUIDA",
  "amount": 20.00,
  "numbers": [1, 5, 10, 25],
  "client": {
    "name": "João Silva",
    "cpf": "12345678900"
  },
  "created_at": "2024-01-01T12:00:00.000Z",
  "expires_at": "2024-01-01T12:05:00.000Z"
}
```

### GET /rifas/available
Lista todos os números disponíveis.

**Response:**
```json
{
  "available": [1, 2, 3, 4, 6, 7, 8, 9, 11, ...],
  "total": 95
}
```

### POST /webhook/efi
Webhook para receber notificações da EfiPay (configurar no painel da EfiPay).

## 🗄️ Banco de Dados

### Tabelas

- **clients**: Armazena dados dos compradores
- **transactions**: Registra todas as transações PIX
- **rifas**: Gerencia os números da rifa e seus status

### Status dos Números

- `AVAILABLE`: Disponível para compra
- `RESERVED`: Reservado (aguardando pagamento)
- `PAID`: Pago e confirmado

### Status das Transações

- `PENDING`: Aguardando pagamento
- `CONCLUIDA`: Pagamento confirmado
- `EXPIRED`: Expirado (não pago no prazo)

## ⚙️ Configurações

- **Valor por número**: R$ 5,00 (configurável em `.env`)
- **Tempo de expiração do PIX**: 5 minutos (300 segundos)
- **Limpeza automática**: Reservas expiradas são liberadas a cada 1 minuto

## 🔧 Webhook EfiPay

Configure no painel da EfiPay:
- URL: `https://seu-dominio.com/webhook/efi`
- Tipo: PIX

## 📝 Notas de Segurança

Antes do deploy em produção:

1. Altere `origin: '*'` no CORS para seu domínio específico
2. Configure HTTPS
3. Adicione rate limiting
4. Configure logs adequados
5. Implemente autenticação para rotas administrativas
6. Valide o webhook da EfiPay (verificar assinatura)
