import prisma from '../../../utils/prisma'
import { isAdminRequest } from '../../../utils/admin'

export default defineEventHandler(async (event) => {
  if (!isAdminRequest(event)) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const query = getQuery(event)
  const term = (query.term as string || '').trim()

  if (!term) return { parents: [] }

  const normalized = term.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()

  const parents = await prisma.parent.findMany({
    where: {
      OR: [
        { documentId: { contains: normalized } },
        { firstName: { contains: term } },
        { lastName: { contains: term } },
      ],
    },
    include: {
      family: {
        include: { children: true },
      },
    },
    take: 10,
  })

  return {
    parents: (parents as any[]).map((p) => ({
      id: p.id,
      firstName: p.firstName,
      lastName: p.lastName,
      documentId: p.documentId || null,
      phone: p.phone || null,
      familyId: p.familyId,
      children: p.family.children.map((c: any) => ({
        id: c.id,
        firstName: c.firstName,
        lastName: c.lastName,
      })),
    })),
  }
})
