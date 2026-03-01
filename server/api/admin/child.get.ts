import prisma from '../../utils/prisma'
import { isAdminRequest } from '../../utils/admin'

export default defineEventHandler(async (event) => {
  if (!isAdminRequest(event)) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const query = getQuery(event)
  const id = query.id as string
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing child id' })
  }

  const child = await prisma.child.findUnique({
    where: { id },
    include: {
      family: {
        include: { parents: true },
      },
      checkIns: {
        orderBy: { checkInTime: 'desc' },
      },
    },
  })

  if (!child) {
    return { found: false }
  }

  return {
    found: true,
    child: {
      id: child.id,
      firstName: child.firstName,
      lastName: child.lastName,
      birthDate: child.birthDate.toISOString(),
      family: {
        id: child.family.id,
        parentId: child.family.parentId,
        isVisitor: (child.family as any).isVisitor ?? false,
        parents: (child.family.parents as any[]).map((p) => ({
          id: p.id,
          firstName: p.firstName,
          lastName: p.lastName,
          phone: p.phone || null,
          address: p.address || null,
          documentId: p.documentId || null,
        })),
      },
      checkIns: (child.checkIns as any[]).map((ci) => ({
        id: ci.id,
        checkInNumber: ci.checkInNumber,
        checkInTime: ci.checkInTime.toISOString(),
        checkOutTime: ci.checkOutTime ? ci.checkOutTime.toISOString() : null,
        notes: ci.notes,
      })),
    },
  }
})