import prisma from '../../utils/prisma'
import { isAdminRequest } from '../../utils/admin'

export default defineEventHandler(async (event) => {
  if (!isAdminRequest(event)) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readBody(event)
  const { keepFamilyId, removeFamilyId, keepChildId, removeChildId } = body

  if (!keepFamilyId || !removeFamilyId) {
    throw createError({ statusCode: 400, statusMessage: 'Se requieren dos familias para unir' })
  }

  // Same family — just merge the two duplicate children within it
  if (keepFamilyId === removeFamilyId) {
    if (!keepChildId || !removeChildId) {
      throw createError({ statusCode: 400, statusMessage: 'Se requieren IDs de niños para unir duplicados en la misma familia' })
    }
    await prisma.checkIn.updateMany({
      where: { childId: removeChildId },
      data: { childId: keepChildId },
    })
    await prisma.child.delete({ where: { id: removeChildId } })
    return { success: true }
  }

  const [keepFamily, removeFamily] = await Promise.all([
    prisma.family.findUnique({ where: { id: keepFamilyId }, include: { parents: true, children: true } }),
    prisma.family.findUnique({ where: { id: removeFamilyId }, include: { parents: true, children: true } }),
  ])

  if (!keepFamily || !removeFamily) {
    throw createError({ statusCode: 404, statusMessage: 'Una o ambas familias no fueron encontradas' })
  }

  // Move parents from removeFamily to keepFamily
  await prisma.parent.updateMany({
    where: { familyId: removeFamilyId },
    data: { familyId: keepFamilyId },
  })

  // For each child in removeFamily: if same name+birthday already exists in keepFamily, merge check-ins
  // Otherwise move the child
  for (const removeChild of removeFamily.children) {
    const matchingChild = keepFamily.children.find(kc =>
      kc.firstName.toLowerCase() === removeChild.firstName.toLowerCase() &&
      kc.lastName.toLowerCase() === removeChild.lastName.toLowerCase() &&
      kc.birthDate.toISOString().split('T')[0] === removeChild.birthDate.toISOString().split('T')[0]
    )

    if (matchingChild) {
      // Move check-ins from duplicate child to the kept child, then delete duplicate
      await prisma.checkIn.updateMany({
        where: { childId: removeChild.id },
        data: { childId: matchingChild.id, familyId: keepFamilyId },
      })
      await prisma.child.delete({ where: { id: removeChild.id } })
    } else {
      // Different child — just move them to the kept family
      await prisma.child.update({
        where: { id: removeChild.id },
        data: { familyId: keepFamilyId },
      })
      // Move their check-ins too
      await prisma.checkIn.updateMany({
        where: { childId: removeChild.id },
        data: { familyId: keepFamilyId },
      })
    }
  }

  // Delete the now-empty family
  await prisma.family.delete({ where: { id: removeFamilyId } })

  return { success: true }
})
