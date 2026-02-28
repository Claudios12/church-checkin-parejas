import prisma from '../utils/prisma'
import { generateSecurityCode } from '../utils/securityCode'
import { normalizeParentId, isValidParentId } from '../utils/normalizeId'

interface ParentInput {
  firstName: string
  lastName: string
  documentId?: string
  phone?: string
  address?: string
}

interface ChildInput {
  id?: string // Optional: existing child ID
  firstName: string
  lastName: string
  birthDate: string
}

interface CheckInRequest {
  parentId: string
  parents: ParentInput[]
  children: ChildInput[]
}

export default defineEventHandler(async (event) => {
  try {
    const body: CheckInRequest = await readBody(event)

    // Validación
    if (!body.parentId || !body.parents?.length || !body.children?.length) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Faltan campos requeridos: documento de identidad, padres o niños',
      })
    }

    // Normalize the parent ID
    const normalizedId = normalizeParentId(body.parentId)

    // Validate normalized ID format
    if (!isValidParentId(normalizedId)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'El documento de identidad debe tener entre 6 y 15 caracteres alfanuméricos',
      })
    }

    // Step 1: Find or create family
    // First try by primary family ID
    let family = await prisma.family.findUnique({
      where: { parentId: normalizedId },
      include: { parents: true, children: true },
    })

    // If not found, the user might be a secondary parent — search by parent documentId
    if (!family) {
      const parent = await prisma.parent.findFirst({
        where: { documentId: normalizedId },
        include: { family: { include: { parents: true, children: true } } },
      })
      if (parent) family = parent.family as any
    }

    if (!family) {
      // Truly new family — create it using the submitted ID as primary
      family = await prisma.family.create({
        data: { parentId: normalizedId },
        include: { parents: true, children: true },
      })
    }

    // Step 2: Update or create parents
    // Delete existing parents and recreate (simpler than updating)
    await prisma.parent.deleteMany({
      where: { familyId: family.id },
    })

    const parentPromises = body.parents.map((parent, index) =>
      prisma.parent.create({
        data: {
          firstName: parent.firstName,
          lastName: parent.lastName,
          // Primary parent always gets the family document as their documentId
          // Secondary parents use whatever documentId was submitted
          documentId: index === 0 ? normalizedId : (parent.documentId || null),
          phone: parent.phone || null,
          address: parent.address || null,
          familyId: family.id,
        },
      })
    )

    await Promise.all(parentPromises)

    // Step 3: Process children and create check-ins
    const checkIns = []

    for (const childData of body.children) {
      let child

      if (childData.id) {
        // Existing child - update if it still exists, otherwise create fresh
        const existing = await prisma.child.findUnique({ where: { id: childData.id } })
        if (existing) {
          child = await prisma.child.update({
            where: { id: childData.id },
            data: {
              firstName: childData.firstName,
              lastName: childData.lastName,
              birthDate: new Date(childData.birthDate),
            },
          })
        } else {
          child = await prisma.child.create({
            data: {
              firstName: childData.firstName,
              lastName: childData.lastName,
              birthDate: new Date(childData.birthDate),
              familyId: family.id,
            },
          })
        }
      } else {
        // New child - create
        child = await prisma.child.create({
          data: {
            firstName: childData.firstName,
            lastName: childData.lastName,
            birthDate: new Date(childData.birthDate),
            familyId: family.id,
          },
        })
      }

      // Generate unique security code
      const securityCode = await generateSecurityCode()

      // Create check-in record
      const checkIn = await prisma.checkIn.create({
        data: {
          checkInNumber: securityCode,
          familyId: family.id,
          childId: child.id,
        },
        include: {
          child: true,
          family: {
            include: {
              parents: true,
            },
          },
        },
      })

      checkIns.push(checkIn)
    }

    // Return check-ins with formatted data
    return {
      success: true,
      checkIns: checkIns.map((checkIn) => ({
        id: checkIn.id,
        checkInNumber: checkIn.checkInNumber,
        checkInTime: checkIn.checkInTime,
        child: {
          id: checkIn.child.id,
          firstName: checkIn.child.firstName,
          lastName: checkIn.child.lastName,
          birthDate: checkIn.child.birthDate.toISOString(),
        },
        family: {
          id: checkIn.family.id,
          lastName: checkIn.family.parents[0]?.lastName || '',
          parentId: checkIn.family.parentId,
        },
      })),
    }
  } catch (error: any) {
    console.error('Error de registro:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || error.message || 'Error al crear el registro',
    })
  }
})
