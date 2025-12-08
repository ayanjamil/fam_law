const fs = require('fs');
const path = require('path');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

const rtfPath = path.join(__dirname, '../RFP File.rtf');
const pdfPath = path.join(__dirname, '../public/rfp.pdf');

async function createPdf() {
    const rtfContent = fs.readFileSync(rtfPath, 'utf8');

    // Simple regex parsing for this specific RTF format
    // We look for "REQUEST FOR PRODUCTION NO. X" or "REQUEST NO. X" and the following text
    // The RTF seems to have some formatting, but we can try to extract plain text first.
    // A robust RTF parser is complex, but for this specific file we can try to strip RTF tags.

    // Very basic RTF stripper
    let text = rtfContent.replace(/\\par/g, '\n').replace(/\\.[^ ]* /g, '').replace(/[{}]/g, '');
    // Clean up multiple newlines and spaces
    // text = text.replace(/\n\s*\n/g, '\n\n').trim();

    // Actually, let's try to parse based on the known structure "REQUEST ... NO. X"
    // The file content showed:
    // REQUEST FOR PRODUCTION NO. 1
    // Produce all federal...

    // Let's just manually extract the requests based on the pattern seen in view_file
    // The file has lines like: "REQUEST FOR PRODUCTION NO. 1\" (with backslash at end)
    // and then text.

    // Let's read the file line by line and try to reconstruct it.
    const lines = rtfContent.split('\n');
    const requests = [];
    let currentRequest = null;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();

        // Remove RTF control words roughly
        // This is hacky but might work for this specific file
        // We want to find lines that look like "REQUEST ..."

        // Let's look for the patterns in the raw content we saw
        // "REQUEST FOR PRODUCTION NO. 1"
        // "REQUEST NO. 2"

        // We can use a regex on the whole content to find blocks
        // But first let's try to clean the content a bit more intelligently for the PDF generation
        // We want the PDF to look decent.
    }

    // Alternative: Just create a PDF with the raw text stripped of RTF tags.
    // The goal is "read this file and generate a clean PDF".

    // Let's try to extract text more cleanly.
    // We can use a simple state machine or just regex to find the requests.

    const content = rtfContent
        .replace(/\\\n/g, '\n') // Handle escaped newlines
        .replace(/\\par/g, '\n') // Handle par
        .replace(/\\[a-z0-9]+/g, '') // Remove control words
        .replace(/[{}]/g, '') // Remove braces
        .replace(/;/g, '') // Remove semicolons
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0)
        .join('\n');

    // Now let's try to format it nicely for the PDF
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let y = height - 50;
    const fontSize = 12;
    const margin = 50;
    const maxWidth = width - 2 * margin;

    // Split by "REQUEST" to get blocks
    // We need to be careful not to split on the word request inside a sentence
    // The headers are usually "REQUEST FOR PRODUCTION NO." or "REQUEST NO."

    // Let's re-read the file content from the previous turn to see exactly what to match
    // "REQUEST FOR PRODUCTION NO. 1\"
    // "REQUEST NO. 2\"

    // We can match these headers.

    const rawText = fs.readFileSync(rtfPath, 'utf8');

    // Extract requests
    const requestRegex = /(REQUEST (?:FOR PRODUCTION )?NO\. \d+)([\s\S]*?)(?=REQUEST (?:FOR PRODUCTION )?NO\. \d+|$)/g;

    // We need a cleaner text version first.
    // Let's do a very specific cleanup for this file.
    let cleanText = rawText;

    // Remove header stuff
    cleanText = cleanText.replace(/\{\\rtf1[\s\S]*?\\pard[\s\S]*?\n/, '');
    cleanText = cleanText.replace(/\\par/g, '\n');
    cleanText = cleanText.replace(/\\\n/g, '\n');
    cleanText = cleanText.replace(/\\[a-z0-9]+\s?/g, ''); // Remove control words
    cleanText = cleanText.replace(/[{}]/g, ''); // Remove braces

    // Fix some common RTF artifacts
    cleanText = cleanText.replace(/\\/g, '');

    let match;
    const items = [];

    // We'll iterate manually to handle the "REQUEST" headers
    const headerRegex = /REQUEST (?:FOR PRODUCTION )?NO\. \d+/g;
    let matchHeader;
    let lastIndex = 0;

    const headers = [];
    while ((matchHeader = headerRegex.exec(cleanText)) !== null) {
        headers.push({
            text: matchHeader[0],
            index: matchHeader.index
        });
    }

    for (let i = 0; i < headers.length; i++) {
        const header = headers[i];
        const nextHeader = headers[i + 1];
        const start = header.index + header.text.length;
        const end = nextHeader ? nextHeader.index : cleanText.length;
        const body = cleanText.substring(start, end).trim();

        items.push({
            title: header.text,
            body: body
        });
    }

    // Draw to PDF
    // Limit to 8 requests as requested
    const limitedItems = items.slice(0, 8);

    for (const item of limitedItems) {
        if (y < 100) {
            page = pdfDoc.addPage();
            y = height - 50;
        }

        // Draw Title
        page.drawText(item.title, {
            x: margin,
            y: y,
            size: 14,
            font: boldFont,
            color: rgb(0, 0, 0),
        });
        y -= 20;

        // Draw Body (wrapped)
        const words = item.body.split(/\s+/);
        let line = '';
        for (const word of words) {
            const testLine = line + word + ' ';
            const width = font.widthOfTextAtSize(testLine, fontSize);
            if (width > maxWidth) {
                page.drawText(line, {
                    x: margin,
                    y: y,
                    size: fontSize,
                    font: font,
                    color: rgb(0, 0, 0),
                });
                line = word + ' ';
                y -= 16;

                if (y < 50) {
                    page = pdfDoc.addPage();
                    y = height - 50;
                }
            } else {
                line = testLine;
            }
        }
        // Draw last line
        if (line.length > 0) {
            page.drawText(line, {
                x: margin,
                y: y,
                size: fontSize,
                font: font,
                color: rgb(0, 0, 0),
            });
            y -= 30; // Extra space between requests
        }
    }

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(pdfPath, pdfBytes);
    console.log('PDF generated at ' + pdfPath);
}

createPdf().catch(err => console.error(err));
