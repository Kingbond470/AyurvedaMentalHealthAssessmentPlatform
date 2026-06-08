const fs = require('fs')
const path = require('path')
const pdfjs = require('pdfjs-dist')

pdfjs.GlobalWorkerOptions.workerSrc = `${path.dirname(require.resolve('pdfjs-dist'))}/build/pdf.worker.min.js`

async function extractPDF(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath)
    const pdf = await pdfjs.getDocument({ data: dataBuffer }).promise
    let text = ''

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      text += content.items.map((item) => item.str).join(' ') + '\n'
    }

    console.log(`\n📄 File: ${path.basename(filePath)}\n`)
    console.log(`${'='.repeat(80)}\n`)
    console.log(text.substring(0, 5000)) // First 5000 chars
    console.log(`\n... (total length: ${text.length} chars)\n`)
    console.log(`${'='.repeat(80)}\n`)
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message)
  }
}

// Extract both PDFs
const files = ['Questionnaire.pdf', 'Scoring Format.pdf', 'GAD-7_Anxiety-updated_0.pdf']

;(async () => {
  for (const file of files) {
    const filePath = path.join(__dirname, '..', file)
    if (fs.existsSync(filePath)) {
      await extractPDF(filePath)
    } else {
      console.log(`⚠️  ${file} not found`)
    }
  }
})()
