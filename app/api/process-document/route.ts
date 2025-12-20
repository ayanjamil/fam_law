import { NextRequest, NextResponse } from 'next/server'
import pdf from 'pdf-parse'
import mammoth from 'mammoth'

// Helper to clean up text
function cleanText(text: string): string {
    return text.replace(/\r\n/g, '\n').trim()
}

// Helper to extract requests from text (Regex Fallback)
function extractRequestsFromText(text: string): { id: string | number; text: string }[] {
    const requests: { id: string | number; text: string }[] = []
    const normalizedText = cleanText(text)

    // Regex to find "REQUEST NO. X" or "REQUEST FOR PRODUCTION NO. X"
    const requestRegex = /(?:REQUEST\s+(?:FOR\s+PRODUCTION\s+)?(?:NO\.|NUMBER)?\s*(\d+(?:\([a-z]\))?)|REQUEST\s+(\d+(?:\([a-z]\))?))/gi

    // We want to capture the content *between* these headers.
    // A broader regex to iterate through the text might be better for capturing content.
    // Let's use a similar approach to the original code: find all headers, then slice.

    const loopRegex = new RegExp(requestRegex)
    let match
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
            const contentStart = current.index + current.fullMatch.length
            const contentEnd = next ? next.index : normalizedText.length

            let content = normalizedText.slice(contentStart, contentEnd).trim()
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
        if (lines.length > 0 && lines.length < 50) {
            requests.push({ id: 1, text: "Could not automatically detect 'REQUEST NO.' format. Full text provided in document view." })
        }
    }

    // Deduplicate
    return requests.filter((req, index, self) =>
        index === self.findIndex((r) => r.id === req.id)
    )
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
        }

        const buffer = Buffer.from(await file.arrayBuffer())
        const apiKey = process.env.REDUCTO_API_KEY

        let requests: { id: string | number; text: string }[] = []
        let fullText = ''

        // Strategy: Try Reducto first if API Key exists and file is PDF or Word
        // Note: Reducto supports other formats too.
        const useReducto = !!apiKey && (
            file.type === 'application/pdf' ||
            file.name.endsWith('.pdf') ||
            file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            file.name.endsWith('.docx')
        )

        if (useReducto) {
            console.log('Attempting Reducto parsing...')
            try {
                // Step 1: Upload File
                const blob = new Blob([buffer], { type: file.type })
                const uploadFormData = new FormData()
                uploadFormData.append('file', blob, file.name)

                const uploadResponse = await fetch('https://platform.reducto.ai/upload', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`
                    },
                    body: uploadFormData
                })

                if (!uploadResponse.ok) {
                    throw new Error(`Reducto Upload failed: ${uploadResponse.status} ${await uploadResponse.text()}`)
                }

                const uploadResult = await uploadResponse.json()
                const fileId = uploadResult.file_id

                if (!fileId) {
                    throw new Error('Reducto Upload did not return a file_id')
                }

                console.log('Reducto upload success, file_id:', fileId)

                // Step 2: Parse File
                const parseResponse = await fetch('https://platform.reducto.ai/parse', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        input: fileId,
                        retrieval: {
                            chunking: {
                                chunk_mode: 'section' // Try section chunking for better structure, or 'disabled' for full text
                            }
                        }
                    })
                })

                if (!parseResponse.ok) {
                    throw new Error(`Reducto Parse failed: ${parseResponse.status} ${await parseResponse.text()}`)
                }

                const parseResult = await parseResponse.json()

                // Reducto Output Handling
                if (parseResult.result) {
                    if (typeof parseResult.result === 'string') {
                        fullText = parseResult.result
                    } else if (parseResult.result.type === 'full' && Array.isArray(parseResult.result.chunks)) {
                        // Combine chunks
                        fullText = parseResult.result.chunks.map((c: any) => c.content).join('\n\n')
                    } else {
                        fullText = JSON.stringify(parseResult.result)
                    }
                } else {
                    fullText = JSON.stringify(parseResult)
                }

                console.log('Reducto parsing successful. Text extracted.')

                // --- OpenAI Cleaning Step ---
                const openaiApiKey = process.env.OPENAI_API_KEY
                if (openaiApiKey) {
                    try {
                        console.log('Using OpenAI to clean and structure text...')
                        const { OpenAI } = await import('openai')
                        const openai = new OpenAI({ apiKey: openaiApiKey })

                        const completion = await openai.chat.completions.create({
                            model: "gpt-4o", // Use a capable model
                            messages: [
                                {
                                    role: "system",
                                    content: `You are a high-precision text processing assistant. Your ONLY job is to clean formatting artifacts from the provided text while PRESERVING the exact wording, punctuation, and VISUAL STRUCTURE (newlines/paragraphs) of the content.

CRITICAL RULES:
1. **NO HALLUCINATIONS**: Do not invent, summarize, or rephrase any text. Keep the original wording exactly as is.
2. **PRESERVE STRUCTURE**: Maintain the original line breaks, blank lines between paragraphs, and document layout. Do NOT merge separate paragraphs or requests into a single block of text.
3. **REMOVE ARTIFACTS ONLY**: Remove markdown tables (pipes '|'), header/footer noise, page numbers, and odd line breaks that break sentences in the middle.
4. **REMOVE PLACEHOLDERS**: Identify and remove any text that says "<empty>" or similar OCR artifacts. If a field is blank, represent it as such without the placeholder text.
5. **EXTRACT REQUESTS**: Identify distinct "Request for Production" items.
6. **HANDLE SUB-REQUESTS**: If a request has distinct sub-parts (e.g., "1(a)", "1(b)" or "4.a", "4.b"), TREAT THEM AS SEPARATE REQUESTS.
   - Example: If Request 4 has parts (a), (b), and (c), output three separate items in the "requests" array with ids "4(a)", "4(b)", "4(c)".
7. **STRICT JSON OUTPUT**: Return valid JSON: 
{ 
  "requests": [{ "id": "string or number", "text": "exact clean text of the request" }],
  "cleaned_full_text": "The entire document text, but with the table artifacts (pipes) and '<empty>' placeholders removed. MUST PRESERVE NEWLINES between requests and paragraphs."
}
8. **numbering**: Use the exact numbering/lettering found in the text for the "id" field.
9. **FORMAT**: The "text" field must be a single string with normal spacing and punctuation.`
                                },
                                {
                                    role: "user",
                                    content: `Here is the raw text from the document:\n\n${fullText.slice(0, 100000)}`
                                }
                            ],
                            response_format: { type: "json_object" }
                        })

                        const content = completion.choices[0].message.content
                        if (content) {
                            const parsed = JSON.parse(content)
                            if (parsed.requests && Array.isArray(parsed.requests)) {
                                requests = parsed.requests.map((r: any) => ({
                                    id: r.id,
                                    text: r.text
                                }))
                                console.log(`OpenAI successfully extracted ${requests.length} requests.`)
                            }
                            if (parsed.cleaned_full_text) {
                                fullText = parsed.cleaned_full_text
                                console.log('OpenAI successfully cleaned the full text with structure preserved.')
                            }
                        }
                    } catch (openaiError) {
                        console.error('OpenAI cleaning failed, falling back to regex:', openaiError)
                        requests = extractRequestsFromText(fullText)
                    }
                } else {
                    console.log('No OpenAI API Key found, using regex extraction.')
                    requests = extractRequestsFromText(fullText)
                }

                if (requests.length === 0) {
                    // Last resort fallback if OpenAI returned empty or failed silently
                    requests = extractRequestsFromText(fullText)
                }

            } catch (reductoError) {
                console.error('Reducto parsing failed, falling back to local:', reductoError)
                // Fallback to local
                const data = await pdf(buffer)
                fullText = data.text
                requests = extractRequestsFromText(fullText)
            }
        } else {
            console.log('Using local parsing (No Reducto Key or non-PDF)...')
            // Local fallback logic
            if (file.type === 'application/pdf') {
                const data = await pdf(buffer)
                fullText = data.text
            } else if (
                file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                file.name.endsWith('.docx')
            ) {
                const result = await mammoth.extractRawText({ buffer })
                fullText = result.value
            } else {
                fullText = await file.text()
            }
            requests = extractRequestsFromText(fullText)
        }

        return NextResponse.json({
            success: true,
            text: fullText,
            requests: requests.length > 0 ? requests : []
        })

    } catch (error) {
        console.error('Error processing document:', error)
        return NextResponse.json(
            { error: 'Failed to process document', details: String(error) },
            { status: 500 }
        )
    }
}
