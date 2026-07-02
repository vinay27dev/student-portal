import { prisma } from './src/lib/prisma'

async function main() {
  console.log("Seeding dummy data...")

  // Seed 1: Alice has an original submission and an update
  await prisma.submission.create({
    data: {
      studentPhone: '5551112222',
      parentPhone: '5559998888',
      studentName: 'Alice Smith',
      otherFields: JSON.stringify({ schoolName: 'Springfield High', grade: '10' }),
      signatureUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      version: 0,
      createdAt: new Date(Date.now() - 100000000)
    }
  })

  await prisma.submission.create({
    data: {
      studentPhone: '5551112222',
      parentPhone: '5559998888',
      studentName: 'Alice Smith',
      otherFields: JSON.stringify({ schoolName: 'Springfield High', grade: '11' }),
      signatureUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      version: 1,
      createdAt: new Date(Date.now() - 50000000)
    }
  })

  // Seed 2: Bob has just one submission
  await prisma.submission.create({
    data: {
      studentPhone: '4443332222',
      parentPhone: '4445556666',
      studentName: 'Bob Jones',
      otherFields: JSON.stringify({ schoolName: 'Shelbyville High', grade: '12' }),
      signatureUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      version: 0,
      createdAt: new Date(Date.now() - 80000000)
    }
  })

  // Seed 3: Charlie
  await prisma.submission.create({
    data: {
      studentPhone: '1112223333',
      parentPhone: '9998887777',
      studentName: 'Charlie Brown',
      otherFields: JSON.stringify({ schoolName: 'Peanuts Academy', grade: '5' }),
      signatureUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      version: 0,
      createdAt: new Date(Date.now() - 10000000)
    }
  })

  console.log("Seeding complete!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
