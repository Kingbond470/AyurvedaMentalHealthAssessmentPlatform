require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Import data format:
// {
//   itemNumber: 1,
//   section: 1,
//   predictorSanskrit: "Ojaswin (ओजस्विनं)",
//   predictorDevanagari: "ओजस्विनं",
//   interpretation: "...",
//   coreProbeEn: "Do you feel energetic...",
//   coreProbeHi: "क्या आप...",
//   coreProbeMr: "तुम्ही...",
//   probe1QuestionEn: "Do you usually have enough energy...",
//   probe1QuestionHi: "क्या आपके पास...",
//   probe1QuestionMr: "तुमच्या दैनंदिन...",
//   probe1Score0En: "Frequently lacks energy for daily tasks",
//   probe1Score1En: "Often feels tired or fatigued",
//   probe1Score2En: "Sometimes has adequate energy",
//   probe1Score3En: "Usually energetic in daily activities",
//   probe1Score4En: "Consistently energetic and vigorous",
//   probe2QuestionEn: "Do you feel lively...",
//   probe2QuestionHi: "क्या आप दिनभर...",
//   probe2QuestionMr: "तुम्ही दिवसभर...",
//   probe2Score0En: "Rarely feels lively or active",
//   probe2Score1En: "Often feels sluggish or inactive",
//   probe2Score2En: "Sometimes feels lively and active",
//   probe2Score3En: "Usually feels active and alert",
//   probe2Score4En: "Consistently lively, active, and enthusiastic",
//   probe3QuestionEn: "Do others perceive you...",
//   probe3QuestionHi: "क्या अन्य लोग...",
//   probe3QuestionMr: "इतर लोक...",
//   probe3Score0En: "Rarely perceived as energetic or vigorous",
//   probe3Score1En: "Often perceived as lacking vitality",
//   probe3Score2En: "Sometimes perceived as energetic",
//   probe3Score3En: "Usually perceived as lively and vigorous",
//   probe3Score4En: "Consistently perceived as bright, energetic, and full of vitality",
//   mappedSubtypes: ["BRAMHA", "ARSHA"], // array of subtype codes
// }

async function importItems(itemsData) {
  try {
    console.log(`\n📥 Importing ${itemsData.length} items...\n`)

    let successCount = 0
    let errorCount = 0

    for (const item of itemsData) {
      try {
        await prisma.item.upsert({
          where: { itemNumber: item.itemNumber },
          update: {
            section: item.section,
            sectionName: item.sectionName || `Section ${item.section}`,
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
          },
          create: {
            itemNumber: item.itemNumber,
            section: item.section,
            sectionName: item.sectionName || `Section ${item.section}`,
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
          },
        })
        console.log(`✅ Item ${item.itemNumber}: ${item.predictorSanskrit}`)
        successCount++
      } catch (err) {
        console.error(`❌ Item ${item.itemNumber} failed:`, err.message)
        errorCount++
      }
    }

    console.log(`\n📊 Results:`)
    console.log(`  ✅ Success: ${successCount}`)
    console.log(`  ❌ Errors: ${errorCount}`)
    console.log(`\nTotal items in DB: ${await prisma.item.count()}`)
  } catch (error) {
    console.error('Import error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Usage: Load items from JSON and import
// node scripts/import-mppi-items.js < items-batch-1.json

const readline = require('readline')
let jsonBuffer = ''

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
})

rl.on('line', (line) => {
  jsonBuffer += line
})

rl.on('close', async () => {
  try {
    const items = JSON.parse(jsonBuffer)
    await importItems(items)
  } catch (err) {
    console.error('JSON parse error:', err.message)
    process.exit(1)
  }
})
