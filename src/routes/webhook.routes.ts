import { FastifyInstance } from 'fastify';
import { rifaService, prisma } from '../services/rifa.service';
import { WebhookPayload } from '../types';

export async function webhookRoutes(app: FastifyInstance) {
  // Webhook da EfiPay
  app.post('/webhook/efi', async (request, reply) => {
    try {
      const payload = request.body as WebhookPayload;

      if (!payload.pix || !Array.isArray(payload.pix)) {
        return reply.status(400).send({ error: 'Payload inválido' });
      }

      for (const pix of payload.pix) {
        const { txid } = pix;

        if (!txid) continue;

        const transaction = await prisma.transaction.findUnique({
          where: { id: txid },
        });

        if (!transaction) continue;

        // Confirmar pagamento
        if (transaction.status !== 'CONCLUIDA') {
          await rifaService.confirmPayment(txid);
          console.log(`Pagamento confirmado via webhook: ${txid}`);
        }
      }

      return reply.status(200).send({ success: true });
    } catch (error: any) {
      console.error('Erro no webhook:', error.message);
      return reply.status(500).send({ error: 'Erro ao processar webhook' });
    }
  });
}
