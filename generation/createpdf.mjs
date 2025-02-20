import puppeteer from "puppeteer";

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.goto("http://localhost:3000", {
  waitUntil: 'networkidle2',
});


// Saves the PDF to hn.pdf.
await page.pdf({
  path: 'output/resume.pdf',
  scale: .7,
  margin: {
    top: 50
  }
});

await browser.close();