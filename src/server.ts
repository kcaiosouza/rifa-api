import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from './config/env';
import { paymentRoutes } from './routes/payment.routes';
import { webhookRoutes } from './routes/webhook.routes';
import { rifaRoutes } from './routes/rifa.routes';
import { rifaService } from './services/rifa.service';

const app = Fastify({
  logger: config.server.nodeEnv === 'development',
});

// CORS
app.register(cors, {
  origin: '*', // Alterar antes do deploy
  methods: ['GET', 'POST'],
});

// Registrar rotas
app.register(paymentRoutes);
app.register(webhookRoutes);
app.register(rifaRoutes);

// Health check
app.get('/health', async (request, reply) => {
  return reply.send({ status: 'ok', timestamp: new Date().toISOString() });
});

// Limpar reservas expiradas a cada 1 minuto
setInterval(async () => {
  console.log("Iniciando limpeza de reservas expiradas...");
  try {
    await rifaService.releaseExpiredReservations();
    console.log("Limpeza de reservas expiradas concluida.");
  } catch (error: any) {
    console.error('Erro ao liberar reservas expiradas:', error.message);
  }
}, 1000 * 60 * 5); // 5 minutos -> Mesmo tempo de expiração do PIX

// Iniciar servidor
app
  .listen({ port: config.server.port, host: '0.0.0.0' })
  .then(() => {
    console.log(`🚀 Server running on http://localhost:${config.server.port}`);
  })
  .catch((err) => {
    console.error('Erro ao iniciar servidor:', err);
    process.exit(1);
  });
