require('dotenv').config({ path: '.env.local' })

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function seedItems() {
  try {
    console.log('Seeding items from batch files...')

    // Load all batch files (section1-batch.json through section17-batch.json)
    for (let i = 1; i <= 17; i++) {
      const filePath = path.join(__dirname, `section${i}-batch.json`)

      if (!fs.existsSync(filePath)) {
        console.log(`⚠ File not found: ${filePath}`)
        continue
      }

      const fileContent = fs.readFileSync(filePath, 'utf-8')
      const items = JSON.parse(fileContent)

      console.log(`Processing section${i}-batch.json (${items.length} items)...`)

      for (const item of items) {
        await prisma.item.upsert({
          where: { itemNumber: item.itemNumber },
          update: {
            section: item.section,
            sectionName: item.sectionName,
            predictorSanskrit: item.predictorSanskrit,
            predictorDevanagari: item.predictorDevanagari,
            interpretation: item.interpretation,
            coreProbeEn: item.coreProbeEn,
            coreProbeHi: item.coreProbeHi,
            coreProbeMr: item.coreProbeMr,
            probe1QuestionEn: item.probe1QuestionEn,
            probe1QuestionHi: item.probe1QuestionHi,
            probe1QuestionMr: item.probe1QuestionMr,
            probe1Score0En: item.probe1Score0En,
            probe1Score1En: item.probe1Score1En,
            probe1Score2En: item.probe1Score2En,
            probe1Score3En: item.probe1Score3En,
            probe1Score4En: item.probe1Score4En,
            probe2QuestionEn: item.probe2QuestionEn,
            probe2QuestionHi: item.probe2QuestionHi,
            probe2QuestionMr: item.probe2QuestionMr,
            probe2Score0En: item.probe2Score0En,
            probe2Score1En: item.probe2Score1En,
            probe2Score2En: item.probe2Score2En,
            probe2Score3En: item.probe2Score3En,
            probe2Score4En: item.probe2Score4En,
            probe3QuestionEn: item.probe3QuestionEn,
            probe3QuestionHi: item.probe3QuestionHi,
            probe3QuestionMr: item.probe3QuestionMr,
            probe3Score0En: item.probe3Score0En,
            probe3Score1En: item.probe3Score1En,
            probe3Score2En: item.probe3Score2En,
            probe3Score3En: item.probe3Score3En,
            probe3Score4En: item.probe3Score4En,
            mappedSubtypes: item.mappedSubtypes || [],
            isObserverRated: item.isObserverRated || false,
            section14GenderVariant: item.section14GenderVariant || null,
          },
          create: {
            itemNumber: item.itemNumber,
            section: item.section,
            sectionName: item.sectionName,
            predictorSanskrit: item.predictorSanskrit,
            predictorDevanagari: item.predictorDevanagari,
            interpretation: item.interpretation,
            coreProbeEn: item.coreProbeEn,
            coreProbeHi: item.coreProbeHi,
            coreProbeMr: item.coreProbeMr,
            probe1QuestionEn: item.probe1QuestionEn,
            probe1QuestionHi: item.probe1QuestionHi,
            probe1QuestionMr: item.probe1QuestionMr,
            probe1Score0En: item.probe1Score0En,
            probe1Score1En: item.probe1Score1En,
            probe1Score2En: item.probe1Score2En,
            probe1Score3En: item.probe1Score3En,
            probe1Score4En: item.probe1Score4En,
            probe2QuestionEn: item.probe2QuestionEn,
            probe2QuestionHi: item.probe2QuestionHi,
            probe2QuestionMr: item.probe2QuestionMr,
            probe2Score0En: item.probe2Score0En,
            probe2Score1En: item.probe2Score1En,
            probe2Score2En: item.probe2Score2En,
            probe2Score3En: item.probe2Score3En,
            probe2Score4En: item.probe2Score4En,
            probe3QuestionEn: item.probe3QuestionEn,
            probe3QuestionHi: item.probe3QuestionHi,
            probe3QuestionMr: item.probe3QuestionMr,
            probe3Score0En: item.probe3Score0En,
            probe3Score1En: item.probe3Score1En,
            probe3Score2En: item.probe3Score2En,
            probe3Score3En: item.probe3Score3En,
            probe3Score4En: item.probe3Score4En,
            mappedSubtypes: item.mappedSubtypes || [],
            isObserverRated: item.isObserverRated || false,
            section14GenderVariant: item.section14GenderVariant || null,
          },
        })
      }

      console.log(`✓ Section ${i} imported (${items.length} items)`)
    }

    const totalItems = await prisma.item.count()
    console.log(`\n✓ Seed complete! Total items in database: ${totalItems}`)
  } catch (error) {
    console.error('Seed error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

seedItems()
