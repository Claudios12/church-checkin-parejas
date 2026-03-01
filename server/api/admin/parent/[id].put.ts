import prisma from '../../../utils/prisma'
import { isAdminRequest } from '../../../utils/admin'

export default defineEventHandler(async (event) => {
  if (!isAdminRequest(event)) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { firstName, lastName, phone, address, documentId } = body

  if (!id || !firstName || !lastName) {
    throw createError({ statusCode: 400, statusMessage: 'Nombre requerido' })
  }

  const parent = await prisma.parent.update({
    where: { id },
    data: {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone?.trim() || null,
      address: address?.trim() || null,
      documentId: documentId?.trim().replace(/[^a-zA-Z0-9]/g, '').toUpperCase() || null,
    },
  })

  return { success: true, parent }
})
