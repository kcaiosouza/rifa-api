import { FastifyInstance } from 'fastify';
import { rifaService } from '../services/rifa.service';

export async function rifaRoutes(app: FastifyInstance) {
  // Listar números disponíveis
  app.get('/rifas/available', async (request, reply) => {
    try {
      const numbers = await rifaService.getAvailableNumbers();
      return reply.send({ available: numbers, total: numbers.length });
    } catch (error: any) {
      console.error('Erro ao buscar números:', error.message);
      return reply.status(500).send({ error: 'Erro ao buscar números disponíveis' });
    }
  });

  // Listar números não disponíveis
  app.get('/rifas/unavailable', async (request, reply) => {
    try {
      const numbers = await rifaService.getUnavailableNumbers();
      return reply.send({ unavailable: numbers, total: numbers.length });
    } catch (error: any) {
      console.error('Erro ao buscar números:', error.message);
      return reply.status(500).send({ error: 'Erro ao buscar números não disponíveis' });
    }
  });

  // Listar números comprados com dados dos usuários
  app.get('/rifas/sold', async (request, reply) => {
    try {
      const numbers = await rifaService.getPaidNumbers();
      return reply.send({ sold: numbers, total: numbers.length });
    } catch (error: any) {
      console.error('Erro ao buscar números:', error.message);
      return reply.status(500).send({ error: 'Erro ao buscar números vendidos' });
    }
  });

  // Listar últimos 5 compradores
  app.get('/rifas/recent-buyers', async (request, reply) => {
    try {
      const buyers = await rifaService.getRecentBuyers();
      return reply.send({ buyers });
    } catch (error: any) {
      console.error('Erro ao buscar compradores:', error.message);
      return reply.status(500).send({ error: 'Erro ao buscar compradores recentes' });
    }
  });
}
