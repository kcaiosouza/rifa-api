# Exemplos de Requisições - API Rifa

## 1. Listar números disponíveis

```bash
curl http://localhost:3333/rifas/available
```

## 2. Criar pagamento (comprar números)

```bash
curl -X POST http://localhost:3333/payment \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "João Silva",
    "cpf": "12345678900",
    "phone": "11999999999",
    "numbers": [1, 5, 10, 25]
  }'
```

## 3. Consultar status do pagamento

```bash
curl http://localhost:3333/payment/SEU_TXID_AQUI
```

## 4. Health Check

```bash
curl http://localhost:3333/health
```

## Exemplos com JavaScript/Fetch

### Criar pagamento
```javascript
const response = await fetch('http://localhost:3333/payment', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    fullName: 'João Silva',
    cpf: '12345678900',
    phone: '11999999999',
    numbers: [1, 5, 10, 25]
  })
});

const data = await response.json();
console.log(data);
// {
//   transaction_id: "abc123...",
//   amount: 20.00,
//   numbers: [1, 5, 10, 25],
//   qr_code: "data:image/png;base64,...",
//   pix_copy_paste: "00020126...",
//   expires_at: "2024-01-01T12:05:00.000Z"
// }
```

### Consultar pagamento
```javascript
const txid = 'abc123...';
const response = await fetch(`http://localhost:3333/payment/${txid}`);
const data = await response.json();
console.log(data.status); // PENDING, CONCLUIDA, etc
```

### Listar números disponíveis
```javascript
const response = await fetch('http://localhost:3333/rifas/available');
const data = await response.json();
console.log(data.available); // [1, 2, 3, 4, 6, 7, ...]
```

## Possíveis Erros

### 400 - Números indisponíveis
```json
{
  "error": "Números indisponíveis",
  "unavailable": [1, 5]
}
```

### 400 - Validação
```json
{
  "error": "CPF inválido"
}
```

### 404 - Transação não encontrada
```json
{
  "error": "Transação não encontrada"
}
```
