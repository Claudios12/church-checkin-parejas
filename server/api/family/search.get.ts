import prisma from '../../utils/prisma'
import { normalizeParentId, isValidParentId } from '../../utils/normalizeId'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const parentId = query.id as string

    if (!parentId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'El documento de identidad es requerido',
      })
    }

    // Normalize the parent ID (remove spaces, dots, hyphens, etc.)
    const normalizedId = normalizeParentId(parentId)

    // Validate normalized ID format
    if (!isValidParentId(normalizedId)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'El documento de identidad debe tener entre 6 y 15 caracteres alfanuméricos',
      })
    }

    // Search for family by normalized parent ID
    const family = await prisma.family.findUnique({
      where: {
        parentId: normalizedId,
      },
      include: {
        parents: true,
        children: {
          orderBy: {
            firstName: 'asc',
          },
        },
      },
    })

    if (!family) {
      return {
        found: false,
        family: null,
      }
    }

    return {
      found: true,
      family: {
        id: family.id,
        parentId: family.parentId,
        parents: family.parents.map((parent) => ({
          id: parent.id,
          firstName: parent.firstName,
          lastName: parent.lastName,
          phone: (parent as any).phone || null,
          address: (parent as any).address || null,
        })),
        children: family.children.map((child) => ({
          id: child.id,
          firstName: child.firstName,
          lastName: child.lastName,
          birthDate: child.birthDate.toISOString(),
        })),
      },
    }
  } catch (error: any) {
    console.error('Family search error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to search family',
    })
  }
})
