import prisma from '../../utils/prisma'
import { normalizeParentId, isValidParentId } from '../../utils/normalizeId'

const includeFamily = {
  parents: true,
  children: { orderBy: { firstName: 'asc' as const } },
}

const formatFamily = (family: any) => ({
  id: family.id,
  parentId: family.parentId,
  parents: family.parents.map((p: any) => ({
    id: p.id,
    firstName: p.firstName,
    lastName: p.lastName,
    documentId: p.documentId || null,
    phone: p.phone || null,
    address: p.address || null,
  })),
  children: family.children.map((child: any) => ({
    id: child.id,
    firstName: child.firstName,
    lastName: child.lastName,
    birthDate: child.birthDate.toISOString(),
  })),
})

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const parentId = query.id as string

    if (!parentId) {
      throw createError({ statusCode: 400, statusMessage: 'El documento de identidad es requerido' })
    }

    const normalizedId = normalizeParentId(parentId)

    if (!isValidParentId(normalizedId)) {
      throw createError({ statusCode: 400, statusMessage: 'El documento debe tener entre 6 y 15 caracteres alfanuméricos' })
    }

    // 1. Try the primary family lookup (original document used to create the family)
    let family = await prisma.family.findUnique({
      where: { parentId: normalizedId },
      include: includeFamily,
    })

    // 2. If not found, search by any parent's documentId
    if (!family) {
      const parent = await prisma.parent.findFirst({
        where: { documentId: normalizedId },
        include: { family: { include: includeFamily } },
      })
      if (parent) family = parent.family as any
    }

    if (!family) {
      return { found: false, family: null }
    }

    return { found: true, family: formatFamily(family) }
  } catch (error: any) {
    console.error('Family search error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to search family',
    })
  }
})
