const { OpenAI } = require('openai');

const mockText = `
| REQUEST FOR PRODUCTION NO. 1 |
|-|
| Produce all federal and state tax returns filed by you for the past five (5) years, including all<br />schedules, W-2s, 1099s, and attachments. |
| REQUEST NO. 2 |
| Produce all pay stubs or income statements you received in the past twelve (12) months. |
`;

const fs = require('fs');
const path = require('path');

function getEnv() {
    try {
        const envPath = path.resolve(process.cwd(), '.env');
        const envFile = fs.readFileSync(envPath, 'utf8');
        const env = {};
        envFile.split('\n').forEach(line => {
            const [key, ...obj] = line.split('=');
            if (key && obj) {
                env[key.trim()] = obj.join('=').trim().replace(/^["']|["']$/g, '');
            }
        });
        return env;
    } catch (e) {
        return process.env;
    }
}

async function testOpenAI() {
    const env = getEnv();
    const apiKey = env.OPENAI_API_KEY;
    if (!apiKey) {
        console.error('No API Key');
        return;
    }

    console.log('Testing OpenAI with key starting with:', apiKey.substring(0, 10));

    const openai = new OpenAI({ apiKey });

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are a high-precision text processing assistant. Your ONLY job is to clean formatting artifacts from the provided text while PRESERVING the exact wording, punctuation, and VISUAL STRUCTURE(newlines/ paragraphs) of the content.

CRITICAL RULES:
        1. ** NO HALLUCINATIONS **: Do not invent, summarize, or rephrase any text.Keep the original wording exactly as is.
2. ** PRESERVE STRUCTURE **: Maintain the original line breaks, blank lines between paragraphs, and document layout.Do NOT merge separate paragraphs or requests into a single block of text.
3. ** REMOVE ARTIFACTS ONLY **: Remove markdown tables(pipes '|'), header / footer noise, page numbers, and odd line breaks that break sentences in the middle.
4. ** EXTRACT REQUESTS **: Identify distinct "Request for Production" items.
5. ** STRICT JSON OUTPUT **: Return valid JSON:
        {
            "requests": [{ "id": number, "text": "exact clean text of the request" }],
                "cleaned_full_text": "The entire document text, but with the table artifacts (pipes) removed. MUST PRESERVE NEWLINES between requests and paragraphs."
        }
        6. ** numbering **: If requests are numbered in the text, use those numbers.If not, auto - increment from 1.
        7. ** FORMAT **: The "text" field must be a single string with normal spacing and punctuation.`
                },
                {
                    role: "user",
                    content: `Here is the raw text from the document: \n\n${mockText} `
                }
            ],
            response_format: { type: "json_object" }
        });

        console.log('Result:', completion.choices[0].message.content);
    } catch (e) {
        console.error('Error:', e);
    }
}

testOpenAI();
