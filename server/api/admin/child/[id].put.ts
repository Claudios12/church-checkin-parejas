import prisma from '../../../utils/prisma'
import { isAdminRequest } from '../../../utils/admin'

export default defineEventHandler(async (event) => {
  if (!isAdminRequest(event)) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { firstName, lastName, birthDate } = body

  if (!id || !firstName || !lastName || !birthDate) {
    throw createError({ statusCode: 400, statusMessage: 'Nombre y fecha de nacimiento requeridos' })
  }

  const child = await prisma.child.update({
    where: { id },
    data: {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      birthDate: new Date(birthDate),
    },
  })

  return { success: true, child }
})
