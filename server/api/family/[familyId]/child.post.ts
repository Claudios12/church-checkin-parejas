import prisma from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  const familyId = getRouterParam(event, 'familyId')
  const body = await readBody(event)
  const { firstName, lastName, birthDate } = body

  if (!firstName?.trim() || !lastName?.trim() || !birthDate) {
    throw createError({ statusCode: 400, statusMessage: 'Nombre, apellido y fecha de nacimiento son requeridos' })
  }

  const family = await prisma.family.findUnique({ where: { id: familyId } })
  if (!family) {
    throw createError({ statusCode: 404, statusMessage: 'Familia no encontrada' })
  }

  const child = await prisma.child.create({
    data: {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      birthDate: new Date(birthDate),
      familyId: familyId!,
    },
  })

  return {
    id: child.id,
    firstName: child.firstName,
    lastName: child.lastName,
    birthDate: child.birthDate.toISOString(),
  }
})
