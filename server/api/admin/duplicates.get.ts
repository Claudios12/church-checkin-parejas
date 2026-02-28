import prisma from '../../utils/prisma'
import { isAdminRequest } from '../../utils/admin'

export default defineEventHandler(async (event) => {
  if (!isAdminRequest(event)) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  // Find all children and group by firstName + lastName + birthDate
  const allChildren = await prisma.child.findMany({
    include: {
      family: { include: { parents: true } },
    },
  })

  // Group children by name + birthdate
  const groups = new Map<string, typeof allChildren>()
  for (const child of allChildren) {
    const key = `${child.firstName.toLowerCase().trim()}|${child.lastName.toLowerCase().trim()}|${child.birthDate.toISOString().split('T')[0]}`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(child)
  }

  // Return only groups with more than one entry (duplicates)
  const duplicates = Array.from(groups.values())
    .filter(group => group.length > 1)
    .map(group => ({
      firstName: group[0].firstName,
      lastName: group[0].lastName,
      birthDate: group[0].birthDate.toISOString(),
      families: group.map(child => ({
        childId: child.id,
        familyId: child.familyId,
        parents: child.family.parents.map(p => `${p.firstName} ${p.lastName}`),
      })),
    }))

  return { duplicates }
})
