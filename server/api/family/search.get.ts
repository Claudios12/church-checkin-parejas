import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const parentId = query.id as string

    if (!parentId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'La cédula es requerida',
      })
    }

    // Validate parentId is exactly 10 digits
    if (!/^\d{10}$/.test(parentId)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'La cédula debe tener exactamente 10 dígitos',
      })
    }

    // Search for family by parent ID
    const family = await prisma.family.findUnique({
      where: {
        parentId,
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
