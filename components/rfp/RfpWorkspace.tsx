'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Bot,
    Sparkles,
    FileText,
    Search,
    Maximize2,
    Send,
    ArrowLeft
} from 'lucide-react'
import { jsPDF } from 'jspdf'
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx'
import { saveAs } from 'file-saver'

interface RfpRequest {
    id: string | number
    text: string
}

interface RfpWorkspaceProps {
    documentText: string
    requests: RfpRequest[]
    fileName?: string
    onBack?: () => void
}

const AI_OBJECTIONS = [
    { label: "Overly Broad", text: "Objection. This request is overly broad and lacks reasonable limitation in time and scope." },
    { label: "Unduly Burdensome", text: "Objection. This request is unduly burdensome and oppressive, seeking documents that are not readily available." },
    { label: "Not Proportional", text: "Objection. This request is not proportional to the needs of the case." },
    { label: "Vague", text: "Objection. This request is vague, ambiguous, and fails to identify the documents with reasonable particularity." },
    { label: "Outside Control", text: "Objection. This request seeks documents that are not in the responding party's possession, custody, or control." },
    { label: "Irrelevant", text: "Objection. This request seeks information that is not relevant to the subject matter of this action." },
    { label: "Confidentiality", text: "Objection. This request seeks confidential and proprietary information." }
]

export default function RfpWorkspace({ documentText, requests, fileName = "Request For Production.pdf", onBack }: RfpWorkspaceProps) {
    const [activeRequest, setActiveRequest] = useState<string | number | null>(null)
    const [responses, setResponses] = useState<Record<string | number, string>>({})
    const [loadingRequest, setLoadingRequest] = useState<string | number | null>(null)
    const [leftPanelWidth, setLeftPanelWidth] = useState(50) // Percentage

    // Refs for scrolling
    const documentContainerRef = useRef<HTMLDivElement>(null)
    const requestRefs = useRef<Record<string | number, HTMLSpanElement | null>>({})

    // Auto-scroll effect
    useEffect(() => {
        if (activeRequest && requestRefs.current[activeRequest] && documentContainerRef.current) {
            const element = requestRefs.current[activeRequest]
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
        }
    }, [activeRequest])

    const handleResponseChange = (id: string | number, text: string) => {
        setResponses(prev => ({ ...prev, [id]: text }))
    }

    const [instructions, setInstructions] = useState<Record<string | number, string>>({})

    const handleInstructionChange = (id: string | number, text: string) => {
        setInstructions(prev => ({ ...prev, [id]: text }))
    }

    const generateAIResponse = async (id: string | number, type: 'objection' | 'refine', data: string, instruction?: string) => {
        setLoadingRequest(id)
        const currentReq = requests.find(r => r.id === id)
        if (!currentReq) {
            setLoadingRequest(null)
            return
        }

        try {
            const payload: any = {
                requestText: currentReq.text,
                currentResponse: responses[id] || "", // Always send active response context
            }

            if (type === 'objection') {
                payload.objectionType = data
            }

            if (instruction) {
                payload.instruction = instruction
            }

            const res = await fetch('/api/refine-response', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            const result = await res.json()
            if (result.success && result.text) {
                handleResponseChange(id, result.text)
            } else {
                console.error("Failed to generate:", result)
            }
        } catch (err) {
            console.error("API call failed:", err)
        } finally {
            setLoadingRequest(null)
        }
    }

    const applyObjection = (id: string | number, objectionLabel: string) => {
        generateAIResponse(id, 'objection', objectionLabel)
    }

    const sendInstruction = (id: string | number) => {
        const inst = instructions[id]
        if (!inst?.trim()) {
            // Allow refining without instruction (refine current text)
            generateAIResponse(id, 'refine', responses[id] || "")
            return
        }

        generateAIResponse(id, 'refine', responses[id] || "", inst)
        setInstructions(prev => ({ ...prev, [id]: '' }))
    }

    // Helper to highlight active request text and show response inline
    const renderDocumentText = () => {
        if (!requests.length) return (
            <div className="text-neutral-400 italic">
                Upload a file to see extracted requests here.
            </div>
        )

        return (
            <div className="space-y-8">
                {requests.map((req, idx) => (
                    <div
                        key={req.id}
                        ref={(el) => { requestRefs.current[req.id] = el }}
                        className={`transition-all duration-300 rounded-lg p-2 -m-2 ${activeRequest === req.id ? 'bg-yellow-50' : ''}`}
                    >
                        <div className="font-bold text-neutral-900 mb-2">
                            {req.id}.
                        </div>
                        <div className="mb-4 text-neutral-800">
                            {req.text}
                        </div>

                        {responses[req.id] && (
                            <div className="ml-4 pl-4 border-l-2 border-blue-500 bg-blue-50/50 p-4 rounded-r-lg">
                                <span className="block text-xs font-bold text-blue-600 mb-2 uppercase tracking-wider">Draft Response</span>
                                <span className="font-sans text-blue-900 whitespace-pre-wrap leading-relaxed">
                                    {responses[req.id]}
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        )
    }

    // Export responses to a PDF file
    const handleExport = () => {
        const doc = new jsPDF()
        let yPos = 20
        const margin = 20
        const pageWidth = doc.internal.pageSize.getWidth()
        const maxLineWidth = pageWidth - (margin * 2)

        // Title
        doc.setFont("helvetica", "bold")
        doc.setFontSize(16)
        doc.text("RESPONSES TO REQUEST FOR PRODUCTION", margin, yPos)
        yPos += 15

        requests.forEach((req) => {
            const response = responses[req.id] || "[No response provided]"

            if (yPos > 270) {
                doc.addPage()
                yPos = 20
            }

            doc.setFont("helvetica", "bold")
            doc.setFontSize(11)
            doc.text(`REQUEST NO. ${req.id}`, margin, yPos)
            yPos += 7

            doc.setFont("helvetica", "italic")
            doc.setFontSize(10)
            const splitReq = doc.splitTextToSize(req.text, maxLineWidth)
            doc.text(splitReq, margin, yPos)
            yPos += (splitReq.length * 5) + 5

            if (yPos > 270) {
                doc.addPage()
                yPos = 20
            }

            doc.setFont("helvetica", "bold")
            doc.setFontSize(10)
            doc.text("RESPONSE:", margin, yPos)
            yPos += 5

            doc.setFont("helvetica", "normal")
            const splitResp = doc.splitTextToSize(response, maxLineWidth)
            doc.text(splitResp, margin, yPos)
            yPos += (splitResp.length * 5) + 15
        })

        doc.save(`${fileName.replace(/\.[^/.]+$/, "")}_responses.pdf`)
    }

    const handleExportWord = async () => {
        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    new Paragraph({
                        text: "RESPONSES TO REQUEST FOR PRODUCTION",
                        heading: HeadingLevel.HEADING_1,
                        spacing: { after: 300 }
                    }),
                    ...requests.flatMap(req => [
                        new Paragraph({
                            text: `REQUEST NO. ${req.id}`,
                            heading: HeadingLevel.HEADING_3,
                            spacing: { before: 200, after: 100 }
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({ text: req.text, italics: true })
                            ],
                            spacing: { after: 200 }
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({ text: "RESPONSE:", bold: true }),
                            ],
                            spacing: { after: 100 }
                        }),
                        new Paragraph({
                            text: responses[req.id] || "[No response provided]",
                            spacing: { after: 400 }
                        })
                    ])
                ]
            }]
        })

        const blob = await Packer.toBlob(doc)
        saveAs(blob, `${fileName.replace(/\.[^/.]+$/, "")}_responses.docx`)
    }

    return (
        <div className="flex h-screen overflow-hidden bg-neutral-100">
            {/* LEFT PANEL: WORKSPACE (Swapped from Right) */}
            <div className="flex-1 flex flex-col bg-neutral-50/50 border-r border-neutral-200" style={{ width: `${leftPanelWidth}%` }}>
                <div className="p-4 border-b border-neutral-200 bg-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        {onBack && (
                            <button onClick={onBack} className="p-2 hover:bg-neutral-100 rounded-full transition-colors" title="Back to Upload">
                                <ArrowLeft className="w-5 h-5 text-neutral-600" />
                            </button>
                        )}
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                            <Bot className="w-5 h-5" />
                        </div>
                        <h2 className="font-semibold text-neutral-900">AI Workspace</h2>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {requests.map((req) => (
                        <motion.div
                            layout
                            key={req.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            onFocus={() => setActiveRequest(req.id)}
                            onBlur={() => setActiveRequest(null)} // Consider removing onBlur so selection stays
                            // Actually, onBlur causes flicker if we click outside. Let's keep it but maybe handle click explicitly.
                            // Better UX: Click to select, active stays until another is clicked.
                            onClick={() => setActiveRequest(req.id)}
                            className={`
                                group bg-white border rounded-xl shadow-sm transition-all duration-300
                                ${activeRequest === req.id
                                    ? 'border-blue-400 shadow-md ring-4 ring-blue-50/50'
                                    : 'border-neutral-200 hover:border-neutral-300'
                                }
                            `}
                        >
                            <div className="p-4 border-b border-neutral-50 flex items-start justify-between bg-neutral-50/30 rounded-t-xl">
                                <div className="flex gap-3">
                                    <div className="mt-1 w-6 h-6 rounded-full bg-neutral-200 text-neutral-600 flex items-center justify-center text-xs font-bold">
                                        {req.id}
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-neutral-900 line-clamp-1 group-focus-within:line-clamp-none transition-all">
                                            {req.text}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 space-y-4">
                                <div className="relative">
                                    <textarea
                                        value={responses[req.id] || ''}
                                        onChange={(e) => handleResponseChange(req.id, e.target.value)}
                                        placeholder="Type your response here..."
                                        className="w-full min-h-[100px] p-3 text-sm border-0 bg-neutral-50/50 rounded-lg focus:ring-0 focus:bg-white transition-colors resize-y placeholder:text-neutral-400"
                                    />
                                    {loadingRequest === req.id && (
                                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center rounded-lg z-10">
                                            <div className="flex items-center gap-2 text-blue-600 font-medium text-sm animate-pulse">
                                                <Sparkles className="w-4 h-4 animate-spin" />
                                                <span>Drafting with AI...</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-3 pt-3 border-t border-dashed border-neutral-100">
                                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 shrink-0">
                                            <Sparkles className="w-3.5 h-3.5" />
                                            <span>Smart Objections:</span>
                                        </div>
                                        {AI_OBJECTIONS.map((obj) => (
                                            <button
                                                key={obj.label}
                                                onClick={() => applyObjection(req.id, obj.label)}
                                                disabled={loadingRequest === req.id}
                                                className="px-2.5 py-1 text-xs font-medium text-neutral-600 bg-white border border-neutral-200 rounded-md hover:border-blue-300 hover:text-blue-600 hover:shadow-sm transition-all disabled:opacity-50 whitespace-nowrap shrink-0"
                                            >
                                                {obj.label}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex gap-2 w-full">
                                        <input
                                            type="text"
                                            value={instructions[req.id] || ''}
                                            onChange={(e) => handleInstructionChange(req.id, e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && sendInstruction(req.id)}
                                            placeholder="Add instructions (e.g. 'Make shorter')..."
                                            disabled={loadingRequest === req.id}
                                            className="flex-1 px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:border-blue-400 disabled:bg-neutral-50 placeholder:text-neutral-400 min-w-0"
                                        />
                                        <button
                                            onClick={() => sendInstruction(req.id)}
                                            disabled={loadingRequest === req.id}
                                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 disabled:opacity-70 disabled:cursor-not-allowed transition-all whitespace-nowrap shrink-0"
                                        >
                                            <Sparkles className={`w-4 h-4 ${loadingRequest === req.id ? 'animate-spin' : ''}`} />
                                            {loadingRequest === req.id ? 'Refining...' : 'Refine'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    {requests.length === 0 && (
                        <div className="text-center p-12 text-neutral-500">
                            <p>No requests detected in this document.</p>
                            <p className="text-sm">Try uploading a document that contains "REQUEST NO. 1", etc.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT PANEL: DETAILS/PREVIEW (Swapped from Left) */}
            <div
                className="flex flex-col bg-white"
                style={{ width: `${100 - leftPanelWidth}%` }}
            >
                <div className="flex items-center justify-between p-4 border-b border-neutral-100 bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-red-100 rounded text-red-600">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-neutral-900 line-clamp-1 max-w-[200px]">Live Preview: {fileName}</h2>
                            <p className="text-xs text-neutral-500">Auto-scrolling enabled</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleExport}
                            className="px-3 py-1.5 bg-neutral-900 text-white text-xs font-medium rounded-lg shadow-sm hover:bg-neutral-800"
                        >
                            Download PDF
                        </button>
                        <button
                            onClick={handleExportWord}
                            className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg shadow-sm hover:bg-blue-700"
                        >
                            Download Word
                        </button>
                    </div>
                </div>

                <div
                    className="flex-1 overflow-y-auto p-8 bg-neutral-50"
                    ref={documentContainerRef}
                >
                    <div className="bg-white shadow-sm ring-1 ring-neutral-200 min-h-[800px] p-12 max-w-[800px] mx-auto">


                        <div className="font-serif text-neutral-800 leading-relaxed whitespace-pre-wrap">
                            {renderDocumentText()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

