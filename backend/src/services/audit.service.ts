import prisma from '../models/prisma';

interface AuditLogInput {
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  oldValue?: unknown;
  newValue?: unknown;
}

export async function createAuditLog(input: AuditLogInput) {
  return prisma.auditLog.create({
    data: {
      user_id: input.userId,
      action: input.action,
      entity: input.entity,
      entity_id: input.entityId,
      old_value: input.oldValue ? JSON.parse(JSON.stringify(input.oldValue)) : null,
      new_value: input.newValue ? JSON.parse(JSON.stringify(input.newValue)) : null,
    },
  });
}

export async function getAuditLogs(entity?: string, entityId?: string) {
  const where: Record<string, unknown> = {};
  if (entity) where.entity = entity;
  if (entityId) where.entity_id = entityId;

  return prisma.auditLog.findMany({
    where,
    include: { user: { select: { username: true, role: true } } },
    orderBy: { created_at: 'desc' },
    take: 100,
  });
}
