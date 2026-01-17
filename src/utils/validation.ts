import { CreatePaymentRequest } from '../types';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateCreatePayment(body: any): CreatePaymentRequest {
  // Nome completo
  if (
    !body.fullName ||
    typeof body.fullName !== 'string' ||
    body.fullName.trim().length < 3
  ) {
    throw new ValidationError('Nome completo inválido');
  }

  // CPF
  if (
    !body.cpf ||
    typeof body.cpf !== 'string' ||
    !/^\d{11}$/.test(body.cpf.replace(/\D/g, ''))
  ) {
    throw new ValidationError('CPF inválido');
  }

  // Telefone
  if (
    !body.phone ||
    typeof body.phone !== 'string' ||
    body.phone.trim().length < 10
  ) {
    throw new ValidationError('Telefone inválido');
  }

  // Números da rifa
  if (!Array.isArray(body.numbers) || body.numbers.length === 0) {
    throw new ValidationError('Números da rifa são obrigatórios');
  }

  // Força conversão e tipo (EVITA unknown[])
  const numbers: number[] = body.numbers
    .map(Number)
    .filter((n: number) => Number.isInteger(n) && n > 0);

  if (numbers.length !== body.numbers.length) {
    throw new ValidationError('Números da rifa devem ser inteiros positivos');
  }

  // Remove duplicados mantendo tipo
  const uniqueNumbers: number[] = Array.from(new Set(numbers));

  if (uniqueNumbers.length !== numbers.length) {
    throw new ValidationError('Números duplicados não são permitidos');
  }

  return {
    fullName: body.fullName.trim(),
    cpf: body.cpf.replace(/\D/g, ''),
    phone: body.phone.trim(),
    numbers: uniqueNumbers,
  };
}
