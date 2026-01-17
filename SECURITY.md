# 🔒 Guia de Segurança e Deploy

## ✅ Checklist de Segurança para Produção

### 1. Variáveis de Ambiente
- [ ] Todas as credenciais estão em `.env`
- [ ] `.env` está no `.gitignore`
- [ ] Certificado `.p12` não está versionado
- [ ] Variáveis configuradas no servidor de produção

### 2. CORS
```typescript
// ❌ DESENVOLVIMENTO (atual)
origin: '*'

// ✅ PRODUÇÃO
origin: 'https://seu-dominio.com'
// ou múltiplos domínios:
origin: ['https://seu-dominio.com', 'https://www.seu-dominio.com']
```

### 3. HTTPS
- [ ] Certificado SSL configurado
- [ ] Redirecionar HTTP para HTTPS
- [ ] HSTS habilitado

### 4. Rate Limiting
Instalar e configurar:
```bash
yarn add @fastify/rate-limit
```

```typescript
import rateLimit from '@fastify/rate-limit';

app.register(rateLimit, {
  max: 10, // 10 requisições
  timeWindow: '1 minute' // por minuto
});
```

### 5. Validação de Webhook
A EfiPay envia um header `x-efipay-signature` para validar a origem.

```typescript
// Adicionar em webhook.routes.ts
const signature = request.headers['x-efipay-signature'];
// Validar assinatura antes de processar
```

### 6. Logs
- [ ] Remover `console.log` de dados sensíveis
- [ ] Implementar logger profissional (Winston, Pino)
- [ ] Não logar CPF, tokens, senhas

### 7. Banco de Dados
- [ ] Usar connection pool
- [ ] Backup automático configurado
- [ ] Índices otimizados
- [ ] SSL/TLS habilitado na conexão

### 8. Monitoramento
- [ ] Health check configurado
- [ ] Alertas de erro
- [ ] Métricas de performance
- [ ] Logs centralizados

## 🚀 Deploy

### Opção 1: VPS (DigitalOcean, AWS EC2, etc)

1. **Instalar dependências no servidor:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs postgresql
```

2. **Clonar repositório:**
```bash
git clone seu-repositorio.git
cd rifa-api
yarn install
```

3. **Configurar .env:**
```bash
nano .env
# Adicionar todas as variáveis
```

4. **Executar migrations:**
```bash
yarn prisma migrate deploy
yarn prisma-seed
```

5. **Usar PM2 para manter rodando:**
```bash
npm install -g pm2
pm2 start dist/server.js --name rifa-api
pm2 startup
pm2 save
```

### Opção 2: Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN yarn install --production

COPY . .
RUN yarn prisma generate

EXPOSE 3333

CMD ["yarn", "dev"]
```

### Opção 3: Plataformas (Heroku, Railway, Render)

1. Conectar repositório
2. Configurar variáveis de ambiente
3. Deploy automático

## 🔐 Melhorias de Segurança Adicionais

### 1. Helmet (Headers de Segurança)
```bash
yarn add @fastify/helmet
```

```typescript
import helmet from '@fastify/helmet';
app.register(helmet);
```

### 2. Validação de CPF Real
```bash
yarn add cpf-cnpj-validator
```

```typescript
import { cpf } from 'cpf-cnpj-validator';

if (!cpf.isValid(data.cpf)) {
  throw new ValidationError('CPF inválido');
}
```

### 3. Sanitização de Entrada
```bash
yarn add validator
```

```typescript
import validator from 'validator';

fullName: validator.escape(body.fullName.trim())
```

### 4. Autenticação Admin
Para rotas administrativas (listar todas as vendas, etc):
```bash
yarn add @fastify/jwt
```

### 5. Limite de Números por Compra
```typescript
// Em validation.ts
if (numbers.length > 50) {
  throw new ValidationError('Máximo de 50 números por compra');
}
```

## 📊 Monitoramento Recomendado

- **Uptime**: UptimeRobot, Pingdom
- **Logs**: Papertrail, Loggly
- **Erros**: Sentry
- **Performance**: New Relic, DataDog

## 🔄 Backup

### Banco de Dados (PostgreSQL)
```bash
# Backup diário automático
0 2 * * * pg_dump -U user rifa_db > /backups/rifa_$(date +\%Y\%m\%d).sql
```

### Certificado EfiPay
- Manter backup seguro do `.p12`
- Renovar antes do vencimento
- Testar em homologação primeiro

## 🧪 Testes Antes do Deploy

1. [ ] Criar pagamento funciona
2. [ ] Webhook recebe notificação
3. [ ] Números são reservados corretamente
4. [ ] Expiração libera números
5. [ ] Números não duplicam
6. [ ] Validações funcionam
7. [ ] Erros são tratados adequadamente

## 📞 Suporte EfiPay

- Documentação: https://dev.efipay.com.br/
- Suporte: suporte@efipay.com.br
- Configurar webhook no painel: https://app.efipay.com.br/
