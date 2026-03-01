import prisma from '../../../utils/prisma'
import { isAdminRequest } from '../../../utils/admin'

export default defineEventHandler(async (event) => {
  if (!isAdminRequest(event)) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const query = getQuery(event)
  const name = (query.name as string) || ''

  // Normalize and split search input
  const searchTerm = name.trim().toLowerCase()
  
  if (!searchTerm) {
    const all = await prisma.child.findMany({
      select: { id: true, firstName: true, lastName: true, birthDate: true },
      orderBy: { firstName: 'asc' },
    })
    return { children: all }
  }

  // Split into parts: "mateo fajardo" -> ["mateo", "fajardo"]
  const nameParts = searchTerm.split(/\s+/).filter(Boolean)

  // Build dynamic OR conditions for each part
  const whereConditions = nameParts.map((part) => ({
    OR: [
      { firstName: { contains: part } },
      { lastName: { contains: part } },
    ],
  }))

  // Also match full name concatenation (e.g., "mateo fajardo" matches firstName="Mateo" + lastName="Fajardo")
  // Use raw SQL for concatenation
  const childrenFromParts = await prisma.child.findMany({
    where: {
      AND: whereConditions,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      birthDate: true,
    },
    orderBy: { firstName: 'asc' },
    take: 50,
  })

  // Also try matching as full name via raw query
  const childrenFromFullName = await prisma.$queryRaw<
    Array<{ id: string; firstName: string; lastName: string }>
  >`
    SELECT DISTINCT id, firstName, lastName FROM Child
    WHERE LOWER(firstName || ' ' || lastName) LIKE ${
      '%' + searchTerm + '%'
    }
    ORDER BY firstName ASC
    LIMIT 50
  `

  // Combine results and deduplicate by id
  const allChildren = [...childrenFromParts, ...childrenFromFullName]
  const uniqueMap = new Map<string, { id: string; firstName: string; lastName: string }>()
  for (const child of allChildren) {
    if (!uniqueMap.has(child.id)) {
      uniqueMap.set(child.id, child)
    }
  }

  return { children: Array.from(uniqueMap.values()) }
})