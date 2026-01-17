import { PrismaClient } from '@prisma/client';
import { config } from '../config/env';

const prisma = new PrismaClient();

class RifaService {
  async checkNumbersAvailability(numbers: number[]): Promise<{ available: boolean; unavailable: number[] }> {
    const rifas = await prisma.rifa.findMany({
      where: {
        number: { in: numbers },
        status: { in: ['RESERVED', 'PAID'] },
      },
      select: { number: true },
    });

    const unavailable = rifas.map(r => r.number);
    return {
      available: unavailable.length === 0,
      unavailable,
    };
  }

  async reserveNumbers(numbers: number[], clientId: string, transactionId: string): Promise<void> {
    const expiresAt = new Date(Date.now() + config.rifa.pixExpirationSeconds * 1000);

    await prisma.$transaction(
      numbers.map(number =>
        prisma.rifa.upsert({
          where: { number },
          create: {
            number,
            client_id: clientId,
            transaction_id: transactionId,
            status: 'RESERVED',
            reserved_at: new Date(),
          },
          update: {
            client_id: clientId,
            transaction_id: transactionId,
            status: 'RESERVED',
            reserved_at: new Date(),
          },
        })
      )
    );
  }

  async confirmPayment(transactionId: string): Promise<void> {
    await prisma.$transaction([
      prisma.rifa.updateMany({
        where: { transaction_id: transactionId },
        data: {
          status: 'PAID',
          paid_at: new Date(),
        },
      }),
      prisma.transaction.update({
        where: { id: transactionId },
        data: { status: 'CONCLUIDA' },
      }),
    ]);
  }

  async releaseExpiredReservations(): Promise<void> {
    const expiredTransactions = await prisma.transaction.findMany({
      where: {
        status: 'PENDING',
        expires_at: { lt: new Date() },
      },
      select: { id: true },
    });

    if (expiredTransactions.length > 0) {
      await prisma.$transaction([
        prisma.rifa.updateMany({
          where: {
            transaction_id: { in: expiredTransactions.map(t => t.id) },
            status: 'RESERVED',
          },
          data: {
            status: 'AVAILABLE',
            client_id: null,
            transaction_id: null,
            reserved_at: null,
          },
        }),
        prisma.transaction.updateMany({
          where: { id: { in: expiredTransactions.map(t => t.id) } },
          data: { status: 'EXPIRED' },
        }),
      ]);
    }
  }

  async getAvailableNumbers(): Promise<number[]> {
    const rifas = await prisma.rifa.findMany({
      where: { status: 'AVAILABLE' },
      select: { number: true },
      orderBy: { number: 'asc' },
    });

    return rifas.map(r => r.number);
  }

  async getUnavailableNumbers(): Promise<number[]> {
    const rifas = await prisma.rifa.findMany({
      where: { status: { in: ['RESERVED', 'PAID'] } },
      select: { number: true },
      orderBy: { number: 'asc' },
    });

    return rifas.map(r => r.number);
  }

  async getPaidNumbers(): Promise<Array<{ number: number; client: { name: string; cpf: string; phone: string } }>> {
    const rifas = await prisma.rifa.findMany({
      where: { status: 'PAID' },
      select: {
        number: true,
        client: {
          select: {
            fullName: true,
            cpf: true,
            phone: true,
          },
        },
      },
      orderBy: { number: 'asc' },
    });

    return rifas.map(r => ({
      number: r.number,
      client: {
        name: r.client!.fullName,
        cpf: r.client!.cpf,
        phone: r.client!.phone,
      },
    }));
  }

  async getRecentBuyers(): Promise<Array<{ name: string; numbers: number[]; created_at: Date }>> {
    const transactions = await prisma.transaction.findMany({
      where: { status: 'CONCLUIDA' },
      include: {
        client: true,
        rifas: { select: { number: true } },
      },
      orderBy: { created_at: 'desc' },
      take: 5,
    });

    return transactions.map(t => ({
      name: t.client.fullName,
      numbers: t.rifas.map(r => r.number).sort((a, b) => a - b),
      created_at: t.created_at,
    }));
  }
}

export const rifaService = new RifaService();
export { prisma };
