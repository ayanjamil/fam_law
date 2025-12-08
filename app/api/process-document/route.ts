import { NextRequest, NextResponse } from 'next/server'
import pdf from 'pdf-parse'
import mammoth from 'mammoth'

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
        }

        const buffer = Buffer.from(await file.arrayBuffer())
        let text = ''

        // Extract text based on file type
        if (file.type === 'application/pdf') {
            const data = await pdf(buffer)
            text = data.text
        } else if (
            file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            file.name.endsWith('.docx')
        ) {
            const result = await mammoth.extractRawText({ buffer })
            text = result.value
        } else {
            // Fallback for text files
            text = await file.text()
        }

        // Parse extracted text into requests
        // Strategy: Look for "REQUEST NO. X" or similar patterns start of lines
        // This regex looks for "REQUEST" followed by "NO" (optional) and a number
        const requests: { id: number; text: string }[] = []

        // Normalize newlines
        const normalizedText = text.replace(/\r\n/g, '\n')

        // Split by common request headers check
        // We try to match the pattern: (REQUEST NO. \d+)(content...)
        // Enhanced to support "REQUEST FOR PRODUCTION NO."
        const requestRegex = /(?:REQUEST\s+(?:FOR\s+PRODUCTION\s+)?(?:NO\.|NUMBER)?\s*(\d+)|REQUEST\s+(\d+))/gi

        let match
        let lastIndex = 0
        let lastId = 0

        // Clone the regex for execution
        const loopRegex = new RegExp(requestRegex)

        // Find all start indices
        const matches = []
        while ((match = loopRegex.exec(normalizedText)) !== null) {
            matches.push({
                index: match.index,
                id: parseInt(match[1] || match[2]),
                fullMatch: match[0]
            })
        }

        if (matches.length > 0) {
            for (let i = 0; i < matches.length; i++) {
                const current = matches[i]
                const next = matches[i + 1]

                // Content starts after the header (e.g. "REQUEST NO. 1")
                const contentStart = current.index + current.fullMatch.length
                const contentEnd = next ? next.index : normalizedText.length

                let content = normalizedText.slice(contentStart, contentEnd).trim()

                // Clean up content (remove leading newlines/periods if any)
                content = content.replace(/^[\.:\-\s]+/, '').trim()

                requests.push({
                    id: current.id,
                    text: content || `[Empty Request Content for Request ${current.id}]`
                })
            }
        } else {
            // Fallback: If regex fails, split by double newlines or just return whole text as one item if small
            // For now, let's just return raw lines filter empty
            const lines = normalizedText.split('\n').filter(line => line.trim().length > 0)
            // If no explicit structure, treat paragraphs as requests if meaningful?
            // Let's stick to returning an empty list or a single "Unparsed" item
            if (lines.length > 0 && lines.length < 50) { // arbitrary heuristic
                requests.push({ id: 1, text: "Could not automatically detect 'REQUEST NO.' format. Full text provided in document view." })
            }
        }

        // Deduplicate requests by ID (keep first occurrence)
        const uniqueRequests = requests.filter((req, index, self) =>
            index === self.findIndex((r) => r.id === req.id)
        )

        return NextResponse.json({
            success: true,
            text: normalizedText, // Send full text for the left panel
            requests: uniqueRequests.length > 0 ? uniqueRequests : []
        })

    } catch (error) {
        console.error('Error processing document:', error)
        return NextResponse.json(
            { error: 'Failed to process document', details: String(error) },
            { status: 500 }
        )
    }
}
