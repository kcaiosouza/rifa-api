import { FastifyInstance } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import { efiPayService } from '../services/efiPay.service';
import { rifaService, prisma } from '../services/rifa.service';
import { validateCreatePayment, ValidationError } from '../utils/validation';
import { config } from '../config/env';
import { CreatePaymentRequest } from '../types';

export async function paymentRoutes(app: FastifyInstance) {
  // Criar pagamento
  app.post('/payment', async (request, reply) => {
    try {
      // Validar entrada
      const data: CreatePaymentRequest = validateCreatePayment(request.body);

      // Verificar disponibilidade dos números
      const availability = await rifaService.checkNumbersAvailability(data.numbers);
      if (!availability.available) {
        return reply.status(400).send({
          error: 'Números indisponíveis',
          unavailable: availability.unavailable,
        });
      }

      // Calcular valor total
      const amount = data.numbers.length * config.rifa.price;

      // Criar ou buscar cliente
      let client = await prisma.client.findUnique({
        where: { cpf: data.cpf },
      });

      if (!client) {
        client = await prisma.client.create({
          data: {
            fullName: data.fullName,
            cpf: data.cpf,
            phone: data.phone,
          },
        });
      }

      // Gerar txid único
      const txid = uuidv4().replace(/-/g, '').substring(0, 32);
      const expiresAt = new Date(Date.now() + config.rifa.pixExpirationSeconds * 1000);

      // Criar transação no banco
      const transaction = await prisma.transaction.create({
        data: {
          id: txid,
          client_id: client.id,
          amount,
          status: 'PENDING',
          expires_at: expiresAt,
        },
      });

      // Reservar números
      await rifaService.reserveNumbers(data.numbers, client.id, transaction.id);

      // Criar cobrança PIX na EfiPay
      const pixCharge = await efiPayService.createPixCharge(
        data.cpf,
        data.fullName,
        amount,
        txid
      );

      // Buscar QR Code
      const qrCodeImage = await efiPayService.getQRCode(pixCharge.loc.id);

      // Atualizar transação com dados do PIX
      await prisma.transaction.update({
        where: { id: txid },
        data: {
          txid: pixCharge.txid,
          pix_copy_paste: pixCharge.pixCopiaECola,
          qr_code_image: qrCodeImage,
        },
      });

      return reply.status(201).send({
        transaction_id: txid,
        amount,
        numbers: data.numbers,
        qr_code: qrCodeImage,
        pix_copy_paste: pixCharge.pixCopiaECola,
        expires_at: expiresAt,
      });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        return reply.status(400).send({ error: error.message });
      }

      console.error('Erro ao criar pagamento:', error.message);
      return reply.status(500).send({ error: 'Erro ao processar pagamento' });
    }
  });

  // Consultar status do pagamento
  app.get('/payment/:txid', async (request, reply) => {
    try {
      const { txid } = request.params as { txid: string };

      const transaction = await prisma.transaction.findUnique({
        where: { id: txid },
        include: {
          client: true,
          rifas: true,
        },
      });

      if (!transaction) {
        return reply.status(404).send({ error: 'Transação não encontrada' });
      }

      // Consultar status na EfiPay
      const pixCharge = await efiPayService.getPixCharge(txid);

      // Atualizar status no banco
      if (pixCharge.status !== transaction.status) {
        await prisma.transaction.update({
          where: { id: txid },
          data: { status: pixCharge.status },
        });

        // Se pago, confirmar números
        if (pixCharge.status === 'CONCLUIDA') {
          await rifaService.confirmPayment(txid);
        }
      }

      return reply.send({
        transaction_id: txid,
        status: pixCharge.status,
        amount: transaction.amount,
        numbers: transaction.rifas.map(r => r.number),
        client: {
          name: transaction.client.fullName,
          cpf: transaction.client.cpf,
        },
        created_at: transaction.created_at,
        expires_at: transaction.expires_at,
      });
    } catch (error: any) {
      console.error('Erro ao consultar pagamento:', error.message);
      return reply.status(500).send({ error: 'Erro ao consultar pagamento' });
    }
  });
}
