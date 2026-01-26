import { FastifyInstance } from 'fastify';
import { rifaService, prisma } from '../services/rifa.service';
import { WebhookPayload } from '../types';

export async function webhookRoutes(app: FastifyInstance) {
  app.post('/webhook/efi*', async (request, reply) => {
    try {
      // 1. Log ABSOLUTO da entrada (O "X-9")
      // Quero ver exatamente o que a Efí está mandando
      const payload = request.body as any;
      console.log('📢 [WEBHOOK] Recebido:', JSON.stringify(payload, null, 2));

      // 2. Validação de Conexão da Efí
      // Se vier sem 'pix', é só o teste de validação.
      if (!payload || !payload.pix) {
        console.log('✅ [WEBHOOK] Validação de rota recebida. Respondendo 200.');
        return reply.status(200).send({ success: true });
      }

      // 3. Processamento
      for (const pix of payload.pix) {
        const { txid } = pix;

        if (!txid) {
            console.log('⚠️ [WEBHOOK] Item sem txid ignorado.');
            continue;
        }

        console.log(`🔍 [WEBHOOK] Buscando no banco TXID: ${txid}`);

        // Busca exata (Como seu banco é sem hífen e o payload tb, deve bater)
        const transaction = await prisma.transaction.findUnique({
          where: { id: txid },
        });

        if (!transaction) {
            console.log(`❌ [WEBHOOK] Transação NÃO encontrada no banco: ${txid}`);
            // Dica: Se isso aparecer no log, significa que o ID existe na Efí mas não no seu banco
            continue;
        }

        console.log(`✅ [WEBHOOK] Transação encontrada! Status atual: ${transaction.status}`);

        if (transaction.status !== 'CONCLUIDA') {
          await rifaService.confirmPayment(txid);
          console.log(`🚀 [WEBHOOK] Pagamento CONFIRMADO: ${txid}`);
        } else {
          console.log(`ℹ️ [WEBHOOK] Pagamento já estava concluído.`);
        }
      }

      return reply.status(200).send({ success: true });
    } catch (error: any) {
      console.error('🔥 [WEBHOOK] Erro fatal:', error.message);
      // Importante: Responder 200 mesmo com erro interno para a Efí não ficar tentando reenviar infinitamente se for erro de lógica
      return reply.status(200).send({ error: 'Erro processado' });
    }
  });
}
