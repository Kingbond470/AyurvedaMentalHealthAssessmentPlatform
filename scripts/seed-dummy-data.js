#!/usr/bin/env node

const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('Error: DATABASE_URL environment variable not set');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });

async function seedDummyData() {
  const client = await pool.connect();
  try {
    console.log('Creating dummy data for 4 customers...\n');

    // Sample data
    const customers = [
      {
        name: 'Raj Kumar',
        age: 35,
        gender: 'MALE',
        education: 'Graduate',
        occupation: 'Software Engineer',
        phone: '9876543210',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        language: 'EN',
        practitioner: 'Dr. Sharma',
        prakriti: 'BRAMHA',
        secondary: 'PRETA',
        category: 'SATTVIKA',
        mppi: { BRAMHA: 68, PRETA: 20, ARSHA: 12 },
        gad7: { total: 5, severity: 'MINIMAL', impairment: 'Not difficult at all' },
      },
      {
        name: 'Priya Sharma',
        age: 28,
        gender: 'FEMALE',
        education: 'Postgraduate',
        occupation: 'Doctor',
        phone: '9876543211',
        city: 'Delhi',
        state: 'Delhi',
        country: 'India',
        language: 'HI',
        practitioner: 'Dr. Patel',
        prakriti: 'YAAMYA',
        secondary: 'KAUBERA',
        category: 'RAJASIKA',
        mppi: { YAAMYA: 75, KAUBERA: 18, GANDHARA: 7 },
        gad7: { total: 10, severity: 'MILD', impairment: 'Somewhat difficult' },
      },
      {
        name: 'Anil Desai',
        age: 45,
        gender: 'MALE',
        education: 'Secondary',
        occupation: 'Farmer',
        phone: '9876543212',
        city: 'Nashik',
        state: 'Maharashtra',
        country: 'India',
        language: 'MR',
        practitioner: 'Dr. Joshi',
        prakriti: 'MRITYU',
        secondary: 'PISHACHA',
        category: 'TAMASIKA',
        mppi: { MRITYU: 68, PISHACHA: 22, RAKSHAS: 10 },
        gad7: { total: 15, severity: 'MODERATE', impairment: 'Very difficult' },
      },
      {
        name: 'Meera Gupta',
        age: 32,
        gender: 'FEMALE',
        education: 'Graduate',
        occupation: 'Teacher',
        phone: '9876543213',
        city: 'Bangalore',
        state: 'Karnataka',
        country: 'India',
        language: 'EN',
        practitioner: 'Dr. Rao',
        prakriti: 'GANDHARVA',
        secondary: 'BRAMHA',
        category: 'SATTVIKA',
        mppi: { GANDHARVA: 65, BRAMHA: 30, KAUBERA: 5 },
        gad7: { total: 13, severity: 'MODERATE', impairment: 'Very difficult' },
      },
      {
        name: 'Arjun Singh',
        age: 38,
        gender: 'MALE',
        education: 'Graduate',
        occupation: 'Business Owner',
        phone: '9876543214',
        city: 'Pune',
        state: 'Maharashtra',
        country: 'India',
        language: 'EN',
        practitioner: 'Dr. Kulkarni',
        prakriti: 'KAUBERA',
        secondary: 'YAAMYA',
        category: 'RAJASIKA',
        mppi: { KAUBERA: 60, YAAMYA: 30, ARSHA: 10 },
        gad7: { total: 18, severity: 'SEVERE', impairment: 'Extremely difficult' },
      },
    ];

    // Helper to generate random MPPI item scores
    function getRandomScore() {
      return Math.floor(Math.random() * 13); // 0-12 (3 probes, each 0-4)
    }

    for (const customer of customers) {
      try {
        // 1. Create respondent
        const respondentId = `${Math.random().toString(36).substr(2, 9)}`;
        const respondentCode = `RESP-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

        await client.query(
          `INSERT INTO respondent (id, respondent_code, age, gender, education, occupation, name, phone, city, state, country, language)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [
            respondentId,
            respondentCode,
            customer.age,
            customer.gender,
            customer.education,
            customer.occupation,
            customer.name,
            customer.phone,
            customer.city,
            customer.state,
            customer.country,
            customer.language,
          ]
        );

        console.log(`✓ Created respondent: ${customer.name} (${respondentCode})`);

        // 2. Create session
        const sessionId = `${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date();

        await client.query(
          `INSERT INTO session (id, respondent_id, practitioner_name, status, phase, started_at, completed_at, last_activity_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [sessionId, respondentId, customer.practitioner, 'COMPLETED', 'RESULTS', now, now, now]
        );

        console.log(`  ├─ Created session`);

        // 3. Create 3 sample MPPI item responses (for demonstration)
        for (let i = 1; i <= 3; i++) {
          const itemTotal = getRandomScore();
          await client.query(
            `INSERT INTO item_response (id, session_id, item_number, probe1_score, probe2_score, probe3_score, item_total)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              `${Math.random().toString(36).substr(2, 9)}`,
              sessionId,
              i,
              Math.floor(Math.random() * 5),
              Math.floor(Math.random() * 5),
              Math.floor(Math.random() * 5),
              itemTotal,
            ]
          );
        }

        console.log(`  ├─ Created 3 sample MPPI item responses`);

        // 4. Create GAD-7 response
        await client.query(
          `INSERT INTO gad7_response (id, session_id, item1_score, item2_score, item3_score, item4_score, item5_score, item6_score, item7_score, impairment_score, total_score, severity)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [
            `${Math.random().toString(36).substr(2, 9)}`,
            sessionId,
            Math.floor(customer.gad7.total / 7),
            Math.floor(customer.gad7.total / 7),
            Math.floor(customer.gad7.total / 7),
            Math.floor(customer.gad7.total / 7),
            Math.floor(customer.gad7.total / 7),
            Math.floor(customer.gad7.total / 7),
            customer.gad7.total % 7,
            1,
            customer.gad7.total,
            customer.gad7.severity,
          ]
        );

        console.log(`  ├─ Created GAD-7 response`);

        // 5. Create session result
        const subtypePercentages = {};
        subtypePercentages[customer.prakriti] = 65;
        subtypePercentages[customer.secondary] = 25;
        subtypePercentages['ARSHA'] = 10;

        await client.query(
          `INSERT INTO session_result (id, session_id, subtype_percentages, predominant_prakriti, secondary_prakriti, primary_category, gad7_total, gad7_severity, gad7_impairment)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            `${Math.random().toString(36).substr(2, 9)}`,
            sessionId,
            JSON.stringify(subtypePercentages),
            customer.prakriti,
            customer.secondary,
            customer.category,
            customer.gad7.total,
            customer.gad7.severity,
            customer.gad7.impairment,
          ]
        );

        console.log(`  └─ Created session result\n`);
      } catch (error) {
        console.error(`Error creating data for ${customer.name}:`, error.message);
      }
    }

    console.log('✅ Dummy data created successfully!');
    console.log('\nCreated 5 sample customers:');
    customers.forEach((c) => {
      console.log(`  - ${c.name} (${c.city}, ${c.state}) - ${c.prakriti} / GAD-7: ${c.gad7.severity}`);
    });
  } finally {
    await client.release();
    await pool.end();
  }
}

seedDummyData().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
