const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

const SUBTYPE_CONFIG = {
  BRAMHA: { total_items: 15, max_score: 180, category: 'SATTVIKA' },
  ARSHA: { total_items: 7, max_score: 84, category: 'SATTVIKA' },
  AINDRA: { total_items: 15, max_score: 180, category: 'SATTVIKA' },
  YAAMYA: { total_items: 12, max_score: 144, category: 'SATTVIKA' },
  VARUNA: { total_items: 14, max_score: 168, category: 'SATTVIKA' },
  KAUBERA: { total_items: 11, max_score: 132, category: 'SATTVIKA' },
  GANDHARVA: { total_items: 7, max_score: 84, category: 'SATTVIKA' },
  ASURA: { total_items: 11, max_score: 132, category: 'RAJASIKA' },
  RAKSHAS: { total_items: 16, max_score: 192, category: 'RAJASIKA' },
  PAISHACH: { total_items: 12, max_score: 144, category: 'RAJASIKA' },
  SARPA: { total_items: 11, max_score: 132, category: 'RAJASIKA' },
  PRETA: { total_items: 13, max_score: 156, category: 'RAJASIKA' },
  SHAKUNA: { total_items: 11, max_score: 132, category: 'RAJASIKA' },
  PASHAVA: { total_items: 7, max_score: 84, category: 'TAMASIKA' },
  MATSYA: { total_items: 12, max_score: 144, category: 'TAMASIKA' },
  VANASPATYA: { total_items: 7, max_score: 84, category: 'TAMASIKA' },
}

async function seed() {
  try {
    console.log('Seeding database...')

    // Create subtype configs
    for (const [code, config] of Object.entries(SUBTYPE_CONFIG)) {
      await prisma.subtypeConfig.upsert({
        where: { subtypeCode: code },
        update: {},
        create: {
          subtypeCode: code,
          fullName: code,
          category: config.category,
          totalItems: config.total_items,
          maxScore: config.max_score,
        },
      })
    }
    console.log('✓ Subtype configs created')

    // Create demo practitioner user
    const salt = bcrypt.genSaltSync(10)
    const hashedPassword = bcrypt.hashSync('demo1234', salt)

    await prisma.user.upsert({
      where: { email: 'demo@example.com' },
      update: {},
      create: {
        email: 'demo@example.com',
        name: 'Demo Practitioner',
        passwordHash: hashedPassword,
        role: 'PRACTITIONER',
      },
    })
    console.log('✓ Demo user created (email: demo@example.com, password: demo1234)')

    // Create demo admin user
    await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        name: 'Admin',
        passwordHash: hashedPassword,
        role: 'ADMIN',
      },
    })
    console.log('✓ Admin user created (email: admin@example.com, password: demo1234)')

    // Create placeholder items (empty content to be filled by admin)
    for (let i = 1; i <= 118; i++) {
      const section = Object.entries({
        1: [1, 8],
        2: [9, 18],
        3: [19, 29],
        4: [30, 38],
        5: [39, 41],
        6: [42, 46],
        7: [47, 52],
        8: [53, 57],
        9: [58, 64],
        10: [65, 68],
        11: [69, 74],
        12: [75, 89],
        13: [90, 100],
        14: [101, 104],
        15: [105, 109],
        16: [110, 118],
      }).find(([, range]) => i >= range[0] && i <= range[1])?.[0] || '1'

      const sectionNames = {
        1: 'Lifestyle & Sensory Preferences',
        2: 'Social Harmony & Compassion',
        3: 'Cognitive Strengths, Learning & Intellectual Functioning',
        4: 'Leadership, Courage & Resilience',
        5: 'Prosperity & Material Orientation',
        6: 'Spirituality, Dharma & Values',
        7: 'Morality, Ethics & Self-Discipline',
        8: 'Emotional Regulation & Personality Balance',
        9: 'Fearfulness & Emotional Vulnerability',
        10: 'Reduced Adaptive Cognitive Functioning',
        11: 'Social Withdrawal & Rigidity',
        12: 'Aggression, Hostility & Antisocial Reactivity',
        13: 'Lifestyle Dysregulation & Lethargy',
        14: 'Sexuality & Intimacy',
        15: 'Moral/Spiritual Deviation',
        16: 'Observer-Rated Traits',
      }

      await prisma.item.upsert({
        where: { itemNumber: i },
        update: {},
        create: {
          itemNumber: i,
          section: parseInt(section),
          sectionName: sectionNames[section],
          predictorSanskrit: `Item ${i} - Placeholder`,
          predictorDevanagari: `Item ${i} - Placeholder`,
          interpretation: 'Add interpretation via admin panel',
          isObserverRated: parseInt(section) === 16,
          mappedSubtypes: [],
        },
      })
    }
    console.log('✓ 118 MPPI placeholder items created')

    // Create placeholder GAD-7 items
    const gad7Questions = [
      'Feeling nervous, anxious, or on edge',
      'Not being able to stop or control worrying',
      'Worrying too much about different things',
      'Trouble relaxing',
      'Being so restless that it is hard to sit still',
      'Becoming easily annoyed or irritable',
      'Feeling afraid as if something awful might happen',
    ]

    for (let i = 0; i < 7; i++) {
      await prisma.gAD7Item.upsert({
        where: { itemNumber: i + 1 },
        update: {},
        create: {
          itemNumber: i + 1,
          questionEn: gad7Questions[i],
          questionHi: gad7Questions[i],
          questionMr: gad7Questions[i],
          option0En: 'Not at all',
          option0Hi: 'Not at all',
          option0Mr: 'Not at all',
          option1En: 'Several days',
          option1Hi: 'Several days',
          option1Mr: 'Several days',
          option2En: 'More than half the days',
          option2Hi: 'More than half the days',
          option2Mr: 'More than half the days',
          option3En: 'Nearly every day',
          option3Hi: 'Nearly every day',
          option3Mr: 'Nearly every day',
        },
      })
    }
    console.log('✓ GAD-7 items created')

    console.log('\n✅ Seed complete!')
    console.log('\nDemo Credentials:')
    console.log('  Practitioner: demo@example.com / demo1234')
    console.log('  Admin: admin@example.com / demo1234')
  } catch (error) {
    console.error('Seed error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

seed()
