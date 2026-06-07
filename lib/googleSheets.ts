import { google } from 'googleapis'

interface SessionDataRow {
  respondentId: string
  respondentCode: string
  respondentName?: string
  age?: number
  gender?: string
  date: string
  practitioner: string
  status: string
  predominantPrakriti: string
  secondaryPrakriti: string
  primaryCategory: string
  gad7Total: number
  gad7Severity: string
  gad7Impairment: string
  [key: string]: unknown // Allow dynamic item columns
}

export async function getGoogleSheetsAuth() {
  const credentialsJson = process.env.GOOGLE_SHEETS_CREDENTIALS_JSON
  if (!credentialsJson) {
    throw new Error('Google Sheets credentials not configured')
  }

  const credentials = JSON.parse(credentialsJson)

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  return auth
}

export async function appendSessionToSheet(
  data: SessionDataRow,
  spreadsheetId?: string
): Promise<void> {
  const spreadsheet =
    spreadsheetId || process.env.GOOGLE_SHEETS_SPREADSHEET_ID
  if (!spreadsheet) {
    throw new Error('Spreadsheet ID not configured')
  }

  try {
    const auth = await getGoogleSheetsAuth()
    const sheets = google.sheets({ version: 'v4', auth })

    const sheetName = 'Sessions'

    // Check if sheet exists, if not create it
    const spreadsheetInfo = await sheets.spreadsheets.get({
      spreadsheetId: spreadsheet,
    })

    let sheetExists = spreadsheetInfo.data.sheets?.some(
      (sheet) => sheet.properties?.title === sheetName
    )

    if (!sheetExists) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: spreadsheet,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: sheetName,
                },
              },
            },
          ],
        },
      })
    }

    // Prepare row data
    const rowData = [
      data.respondentId,
      data.respondentCode,
      data.respondentName || '',
      data.age || '',
      data.gender || '',
      data.date,
      data.practitioner,
      data.status,
      data.predominantPrakriti,
      data.secondaryPrakriti,
      data.primaryCategory,
      data.gad7Total,
      data.gad7Severity,
      data.gad7Impairment,
    ]

    // Append to sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: spreadsheet,
      range: `${sheetName}!A1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [rowData],
      },
    })
  } catch (error) {
    console.error('Error appending to Google Sheets:', error)
    throw error
  }
}

export async function createSessionHeader(spreadsheetId?: string): Promise<void> {
  const spreadsheet =
    spreadsheetId || process.env.GOOGLE_SHEETS_SPREADSHEET_ID
  if (!spreadsheet) {
    throw new Error('Spreadsheet ID not configured')
  }

  try {
    const auth = await getGoogleSheetsAuth()
    const sheets = google.sheets({ version: 'v4', auth })

    const sheetName = 'Sessions'
    const headers = [
      'Respondent ID',
      'Respondent Code',
      'Respondent Name',
      'Age',
      'Gender',
      'Assessment Date',
      'Practitioner',
      'Status',
      'Predominant Prakriti',
      'Secondary Prakriti',
      'Primary Category',
      'GAD-7 Total Score',
      'GAD-7 Severity',
      'GAD-7 Impairment',
    ]

    const spreadsheetInfo = await sheets.spreadsheets.get({
      spreadsheetId: spreadsheet,
    })

    const sheetExists = spreadsheetInfo.data.sheets?.some(
      (sheet) => sheet.properties?.title === sheetName
    )

    if (sheetExists) {
      // Check if header already exists
      const headerRow = await sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheet,
        range: `${sheetName}!A1:N1`,
      })

      if (!headerRow.data.values?.[0]?.length) {
        // Add headers
        await sheets.spreadsheets.values.update({
          spreadsheetId: spreadsheet,
          range: `${sheetName}!A1`,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [headers],
          },
        })
      }
    }
  } catch (error) {
    console.error('Error creating sheet header:', error)
    throw error
  }
}
