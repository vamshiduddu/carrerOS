import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireAuth } from '../../middleware/auth';
import { prisma } from '../../config/database';

const avatarSchema = z.object({
  avatarUrl: z.string().url('Must be a valid URL')
});

export async function avatarRoutes(app: FastifyInstance) {
  app.post('/avatar', { preHandler: requireAuth }, async (request, reply) => {
    const userId = request.user!.id;

    let body: z.infer<typeof avatarSchema>;
    try {
      body = avatarSchema.parse(request.body);
    } catch {
      return reply.code(400).send({ error: 'Invalid request body. Expected { avatarUrl: string }' });
    }

    // UserSetting is the safe place to store avatarUrl since User model doesn't have that field
    await prisma.userSetting.upsert({
      where: { userId },
      create: { userId },
      update: {}
    });

    // Store avatarUrl via a notification-style record — but UserSetting has no extra fields.
    // Use FileUpload table to track the avatar URL reference instead.
    await prisma.fileUpload.create({
      data: {
        userId,
        storageKey: `avatar/${userId}`,
        storageBucket: 'avatars',
        originalName: 'avatar',
        mimeType: 'image/url',
        fileSize: 0,
        url: body.avatarUrl
      }
    });

    return reply.send({ avatarUrl: body.avatarUrl });
  });

  app.get('/avatar', { preHandler: requireAuth }, async (request, reply) => {
    const userId = request.user!.id;

    const latest = await prisma.fileUpload.findFirst({
      where: { userId, storageBucket: 'avatars' },
      orderBy: { createdAt: 'desc' }
    });

    if (!latest) {
      return reply.send({ avatarUrl: null });
    }

    return reply.send({ avatarUrl: latest.url });
  });
}
