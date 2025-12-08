
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
    try {
        const { requestText, currentResponse, objectionType, context } = await req.json()

        if (!requestText) {
            return NextResponse.json({ error: 'Request text is required' }, { status: 400 })
        }

        let systemPrompt = `You are a senior family law attorney and discovery expert. 
    Your role is to draft precise, protective, and legally sound responses to Requests for Production.

    ### CRITICAL INSTRUCTIONS:
    1. **Format**: Output ONLY the final legal response text. No "Here is the response:", no "Dear Counsel:", no headers. 
       - Keep it to 1-2 crisp sentences.
    
    2. **Intent Translation**: You must intelligently translate user instructions into legal objections:
       - User says: "Too much work", "Tedious", "Hard" -> IMPROVE to: "Unduly Burdensome".
       - User says: "Don't have it", "Lost it" -> IMPROVE to: "Not in possession, custody, or control".
       - User says: "Too long", "5 years is crazy" -> IMPROVE to: "Overly broad in temporal scope".
       - User says: "Not relevant", "Private" -> IMPROVE to: "Irrelevant" or "Invasion of privacy".
       - User says: "ok", "yes", "produce", "fine" -> TRANSLATE to: "Will produce documents".

    3. **Strategy**: 
       - **Affirmative Input**: If the user implies agreement (e.g. "ok", "produce it"), draft a clean response stating Respondent **will produce** the specific items requested.
         - **CRITICAL**: You MUST mirror the language of the request. 
           - Bad: "Respondent will produce responsive documents."
           - Good: "Respondent will produce all federal and state tax returns filed for the past five (5) years..."
         - Do NOT object.
       - **Limiting Scope**: If the user limits scope (e.g. "Only 1 year"), you MUST object to the original request first (as overbroad/burdensome), and THEN state what will be produced "subject to and without waiving said objection".
       - Never just accept a smaller scope without preserving the objection.

    4. **Tone**: Definitive, professional, standard legal boilerplate.
    `

        let userPrompt = ''

        if (objectionType) {
            userPrompt = `
      The opposing party has made the following request: "${requestText}"
      
      I need to object to this request on the grounds of: "${objectionType}".
      
      Draft a single, crisp legal sentence stating the objection.
      Example: "Respondent objects to this request as ${objectionType.toLowerCase()} and..."
      Do NOT start with "Objection: [Type]". Make it a grammatically complete sentence.
      `
        } else if (currentResponse) {
            userPrompt = `
      The opposing party has made the following request: "${requestText}"
      
      The user provided the following input (which may be a rough draft OR an instruction like "limit to 12 months" or "object to this"): "${currentResponse}"
      
      Refine this into a single crisp legal sentence or two. 
      - If the user input limits the scope (e.g. "5 years is too much, do 1 year"), you MUST first object to the original scope using the *specific reason* implied by the user.
        - "Tedious"/"Too much work" -> "Unduly Burdensome"
        - "Don't have it" -> "Not in possession, custody, or control"
        - "Too long"/"Too many years" -> "Overly broad temporal scope"
      - Example: If user says "24 months is tedious, do 12", output: "Respondent objects to the request as unduly burdensome; however, Respondent will produce responsive documents for the past twelve (12) months."
      - Ensure it sounds definitive and professional.
      - Do not add commentary or conversational filler.
      `
        } else {
            // Fallback
            userPrompt = `
        The opposing party has made the following request: "${requestText}"
        
        Draft a standard, short response stating that the responding party will produce all non-privileged responsive documents in their possession, custody, or control.
        `
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
            ],
            temperature: 0.2,
        })

        const refinedText = completion.choices[0].message.content

        return NextResponse.json({
            success: true,
            text: refinedText
        })

    } catch (error) {
        console.error('Error generating AI response:', error)
        return NextResponse.json(
            { error: 'Failed to generate response', details: String(error) },
            { status: 500 }
        )
    }
}
