import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database with test data...')

  // Create a test family with contact info
  const family = await prisma.family.create({
    data: {
      parentId: 'SEED001',
    },
  })
  console.log(`✓ Created family: ${family.id}`)

  // Create parent with phone and address
  const parent = await prisma.parent.create({
    data: {
      firstName: 'María',
      lastName: 'García',
      phone: '3001234567',
      address: 'Carrera 5 #12-34, Bogotá',
      familyId: family.id,
    },
  })
  console.log(`✓ Created parent: ${parent.id}`)
  console.log(`  - Name: ${parent.firstName} ${parent.lastName}`)
  console.log(`  - Phone: ${parent.phone}`)
  console.log(`  - Address: ${parent.address}`)

  // Create test children
  const child1 = await prisma.child.create({
    data: {
      firstName: 'Lucas',
      lastName: 'García',
      birthDate: new Date('2018-03-15'),
      familyId: family.id,
    },
  })
  console.log(`✓ Created child: ${child1.id} (${child1.firstName} ${child1.lastName})`)

  const child2 = await prisma.child.create({
    data: {
      firstName: 'Sofia',
      lastName: 'García',
      birthDate: new Date('2020-07-22'),
      familyId: family.id,
    },
  })
  console.log(`✓ Created child: ${child2.id} (${child2.firstName} ${child2.lastName})`)

  console.log('\n✅ Seed complete!')
  console.log(`\nTest data created:`)
  console.log(`- Family ID: ${family.id}`)
  console.log(`- Parent ID: ${parent.id}`)
  console.log(`- Child 1 ID: ${child1.id}`)
  console.log(`- Child 2 ID: ${child2.id}`)
  console.log(`\nTo test the admin panel:`)
  console.log(`1. Open http://localhost:3000/admin`)
  console.log(`2. Log in with password: admin`)
  console.log(`3. Search for "García" or "Lucas"`)
  console.log(`4. Click on a result to see parent contact info`)
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
