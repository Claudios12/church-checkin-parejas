import prisma from '../utils/prisma'
import { generateSecurityCode } from '../utils/securityCode'

interface ParentInput {
  firstName: string
  lastName: string
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
        statusMessage: 'Faltan campos requeridos: cédula, padres o niños',
      })
    }

    // Validate parentId is exactly 10 digits
    if (!/^\d{10}$/.test(body.parentId)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'La cédula debe tener exactamente 10 dígitos',
      })
    }

    // Step 1: Find or create family
    let family = await prisma.family.findUnique({
      where: { parentId: body.parentId },
      include: {
        parents: true,
        children: true,
      },
    })

    if (!family) {
      // Create new family
      family = await prisma.family.create({
        data: {
          parentId: body.parentId,
        },
        include: {
          parents: true,
          children: true,
        },
      })
    }

    // Step 2: Update or create parents
    // Delete existing parents and recreate (simpler than updating)
    await prisma.parent.deleteMany({
      where: { familyId: family.id },
    })

    const parentPromises = body.parents.map((parent) =>
      prisma.parent.create({
        data: {
          firstName: parent.firstName,
          lastName: parent.lastName,
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
        // Existing child - update if needed
        child = await prisma.child.update({
          where: { id: childData.id },
          data: {
            firstName: childData.firstName,
            lastName: childData.lastName,
            birthDate: new Date(childData.birthDate),
          },
        })
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
      statusMessage: error.statusMessage || 'Error al crear el registro',
    })
  }
})
