import prisma from '../../../../utils/prisma'
import { isAdminRequest } from '../../../../utils/admin'

export default defineEventHandler(async (event) => {
  if (!isAdminRequest(event)) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const childId = getRouterParam(event, 'id') as string
  const body = await readBody(event)
  const targetFamilyId = body.familyId as string

  if (!childId || !targetFamilyId) {
    throw createError({ statusCode: 400, statusMessage: 'Faltan parámetros' })
  }

  const child = await prisma.child.findUnique({ where: { id: childId } })
  if (!child) {
    throw createError({ statusCode: 404, statusMessage: 'Niño no encontrado' })
  }

  if (child.familyId === targetFamilyId) {
    throw createError({ statusCode: 400, statusMessage: 'El niño ya pertenece a esa familia' })
  }

  const targetFamily = await prisma.family.findUnique({ where: { id: targetFamilyId } })
  if (!targetFamily) {
    throw createError({ statusCode: 404, statusMessage: 'Familia destino no encontrada' })
  }

  // Move child and all their check-ins to the target family
  await prisma.$transaction([
    prisma.checkIn.updateMany({
      where: { childId },
      data: { familyId: targetFamilyId },
    }),
    prisma.child.update({
      where: { id: childId },
      data: { familyId: targetFamilyId },
    }),
  ])

  return { success: true }
})
