#!/usr/bin/env node

const http = require('http');

const API_URL = 'http://localhost:3000/api';

function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data),
            headers: res.headers,
          });
        } catch (e) {
          resolve({ status: res.statusCode, data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function testFlow() {
  console.log('🚀 Testing Full Assessment Flow\n');

  try {
    // Step 1: Create Respondent
    console.log('Step 1: Creating Respondent...');
    const respondentRes = await makeRequest('/respondents', 'POST', {
      name: 'Test User',
      age: 35,
      gender: 'MALE',
      education: 'Bachelor',
      occupation: 'Software Engineer',
      phone: '9876543210',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      language: 'EN',
    });

    if (respondentRes.status !== 201) {
      throw new Error(`Failed to create respondent: ${respondentRes.status} - ${JSON.stringify(respondentRes.data)}`);
    }

    const respondentId = respondentRes.data.id;
    console.log(`✓ Respondent created: ${respondentId}\n`);

    // Step 2: Create Session
    console.log('Step 2: Creating Session...');
    const sessionRes = await makeRequest('/sessions', 'POST', {
      respondent_id: respondentId,
      practitioner_name: 'Dr. Sharma',
    });

    if (sessionRes.status !== 201) {
      throw new Error(`Failed to create session: ${sessionRes.status} - ${JSON.stringify(sessionRes.data)}`);
    }

    const sessionId = sessionRes.data.id;
    console.log(`✓ Session created: ${sessionId}\n`);

    // Step 3: Save 3 MPPI item responses
    console.log('Step 3: Saving MPPI Item Responses...');
    for (let i = 1; i <= 3; i++) {
      const itemRes = await makeRequest(`/sessions/${sessionId}/items/${i}`, 'PUT', {
        probe1Score: Math.floor(Math.random() * 5),
        probe2Score: Math.floor(Math.random() * 5),
        probe3Score: Math.floor(Math.random() * 5),
      });

      if (itemRes.status !== 200) {
        throw new Error(`Failed to save item ${i}: ${itemRes.status}`);
      }
      console.log(`  ✓ Item ${i} saved`);
    }
    console.log('');

    // Step 4: Get Session Progress
    console.log('Step 4: Checking Session Progress...');
    const sessionCheckRes = await makeRequest(`/sessions/${sessionId}`, 'GET');

    if (sessionCheckRes.status !== 200) {
      throw new Error(`Failed to get session: ${sessionCheckRes.status}`);
    }

    console.log(`✓ Session Status: ${sessionCheckRes.data.status}`);
    console.log(`✓ Current Item: ${sessionCheckRes.data.current_item}`);
    console.log(`✓ Phase: ${sessionCheckRes.data.phase}\n`);

    // Step 5: Save GAD-7 Response (items 1-7)
    console.log('Step 5: Saving GAD-7 Response...');
    const gad7Res = await makeRequest(`/sessions/${sessionId}/gad7`, 'PUT', {
      item1Score: 0,
      item2Score: 1,
      item3Score: 2,
      item4Score: 1,
      item5Score: 0,
      item6Score: 1,
      item7Score: 2,
    });

    if (gad7Res.status !== 200) {
      throw new Error(`Failed to save GAD-7: ${gad7Res.status} - ${JSON.stringify(gad7Res.data)}`);
    }
    console.log('✓ GAD-7 response saved\n');

    // Step 6: Save GAD-7 Impairment (triggers auto-scoring)
    console.log('Step 6: Saving GAD-7 Impairment Score (triggers auto-scoring)...');
    const impairmentRes = await makeRequest(`/sessions/${sessionId}/gad7`, 'PUT', {
      item1Score: 0,
      item2Score: 1,
      item3Score: 2,
      item4Score: 1,
      item5Score: 0,
      item6Score: 1,
      item7Score: 2,
      impairmentScore: 1,
    });

    if (impairmentRes.status !== 200) {
      throw new Error(`Failed to save impairment: ${impairmentRes.status} - ${JSON.stringify(impairmentRes.data)}`);
    }

    console.log('✓ Impairment score saved');
    console.log(`✓ Auto-scored: ${impairmentRes.data.autoScored}\n`);

    // Step 7: Check Final Session Status
    console.log('Step 7: Checking Final Session Status...');
    const finalSessionRes = await makeRequest(`/sessions/${sessionId}`, 'GET');

    if (finalSessionRes.status !== 200) {
      throw new Error(`Failed to get session: ${finalSessionRes.status}`);
    }

    console.log(`✓ Session Status: ${finalSessionRes.data.status}`);
    console.log(`✓ Phase: ${finalSessionRes.data.phase}`);
    console.log(`✓ Completed At: ${finalSessionRes.data.completed_at}\n`);

    console.log('✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testFlow();
