import prisma from './prisma'

/**
 * Generate a unique 4-digit security code for check-in
 * Ensures uniqueness for today's check-ins
 */
export async function generateSecurityCode(): Promise<string> {
  const maxAttempts = 100
  let attempts = 0

  // Get today's date range
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date()
  endOfDay.setHours(23, 59, 59, 999)

  while (attempts < maxAttempts) {
    // Generate random 4-digit code
    const code = Math.floor(1000 + Math.random() * 9000).toString()

    // Check if code exists in today's check-ins
    const existing = await prisma.checkIn.findFirst({
      where: {
        checkInNumber: code,
        checkInTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    })

    if (!existing) {
      return code
    }

    attempts++
  }

  // Fallback: add timestamp if all codes exhausted (very unlikely)
  const timestamp = Date.now().toString().slice(-4)
  return timestamp
}
