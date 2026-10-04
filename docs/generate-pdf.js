const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function generatePDF() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  const htmlPath = path.join(__dirname, 'WORKFLOW_DIAGRAM.html');
  const pdfPath = path.join(__dirname, 'WORKFLOW_DIAGRAM.pdf');
  
  // Load the HTML file
  const fileUrl = 'file://' + htmlPath.replace(/\\/g, '/');
  await page.goto(fileUrl, { waitUntil: 'networkidle2' });
  
  // Generate PDF with landscape orientation for better diagram display
  await page.pdf({
    path: pdfPath,
    format: 'A3',
    landscape: true,
    margin: {
      top: '20mm',
      right: '20mm',
      bottom: '20mm',
      left: '20mm'
    }
  });
  
  console.log(`PDF generated successfully: ${pdfPath}`);
  await browser.close();
}

generatePDF().catch(console.error);
