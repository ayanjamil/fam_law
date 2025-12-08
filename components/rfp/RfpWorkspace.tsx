'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Bot,
    Sparkles,
    FileText,
    Search,
    Maximize2
} from 'lucide-react'
import { jsPDF } from 'jspdf'

interface RfpRequest {
    id: number
    text: string
}

interface RfpWorkspaceProps {
    documentText: string
    requests: RfpRequest[]
    fileName?: string
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

export default function RfpWorkspace({ documentText, requests, fileName = "Request For Production.pdf" }: RfpWorkspaceProps) {
    const [activeRequest, setActiveRequest] = useState<number | null>(null)
    const [responses, setResponses] = useState<Record<number, string>>({})
    const [leftPanelWidth, setLeftPanelWidth] = useState(50) // Percentage

    const handleResponseChange = (id: number, text: string) => {
        setResponses(prev => ({ ...prev, [id]: text }))
    }

    const applyObjection = (id: number, objectionText: string) => {
        // Replace the content with the selected objection to prevent stacking
        handleResponseChange(id, objectionText)
    }

    const refineResponse = (id: number) => {
        const current = responses[id] || ""
        if (!current) return

        // Mock AI refinement
        const refined = `[AI Refined] ${current}\n\nAdditionally, the responding party reserves the right to amend this response upon discovery of further information.`
        handleResponseChange(id, refined)
    }

    // Helper to highlight active request text in the document
    const renderDocumentText = () => {
        if (!activeRequest) return documentText

        const activeReq = requests.find(r => r.id === activeRequest)
        if (!activeReq || !activeReq.text) return documentText

        // Simple split/join strategy for highlighting
        // Note: This assumes exact text match. For more robustness, fuzzy matching would be needed.
        const parts = documentText.split(activeReq.text)
        if (parts.length === 1) return documentText

        return parts.map((part, i) => (
            <span key={i}>
                {part}
                {i < parts.length - 1 && (
                    <span className="bg-yellow-200 transition-colors duration-300 rounded px-1 -mx-1">
                        {activeReq.text}
                    </span>
                )}
            </span>
        ))
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

            // Check for page break
            if (yPos > 270) {
                doc.addPage()
                yPos = 20
            }

            // Request Header
            doc.setFont("helvetica", "bold")
            doc.setFontSize(11)
            doc.text(`REQUEST NO. ${req.id}`, margin, yPos)
            yPos += 7

            // Request Text
            doc.setFont("helvetica", "italic")
            doc.setFontSize(10)
            const splitReq = doc.splitTextToSize(req.text, maxLineWidth)
            doc.text(splitReq, margin, yPos)
            yPos += (splitReq.length * 5) + 5

            // Check for page break before response
            if (yPos > 270) {
                doc.addPage()
                yPos = 20
            }

            // Response Header
            doc.setFont("helvetica", "bold")
            doc.setFontSize(10)
            doc.text("RESPONSE:", margin, yPos)
            yPos += 5

            // Response Body
            doc.setFont("helvetica", "normal")
            const splitResp = doc.splitTextToSize(response, maxLineWidth)
            doc.text(splitResp, margin, yPos)
            yPos += (splitResp.length * 5) + 15
        })

        doc.save(`${fileName.replace(/\.[^/.]+$/, "")}_responses.pdf`)
    }

    return (
        <div className="flex h-screen overflow-hidden bg-neutral-100">
            {/* Left Panel: Document Viewer */}
            <div
                className="flex flex-col border-r border-neutral-200 bg-white"
                style={{ width: `${leftPanelWidth}%` }}
            >
                <div className="flex items-center justify-between p-4 border-b border-neutral-100 bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-red-100 rounded text-red-600">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-neutral-900 line-clamp-1 max-w-[200px]">{fileName}</h2>
                            <p className="text-xs text-neutral-500">{requests.length} Requests found</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="p-2 hover:bg-neutral-50 rounded-full text-neutral-400">
                            <Search className="w-5 h-5" />
                        </button>
                        <button className="p-2 hover:bg-neutral-50 rounded-full text-neutral-400">
                            <Maximize2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 bg-neutral-50">
                    <div className="bg-white shadow-sm ring-1 ring-neutral-200 min-h-[800px] p-12 max-w-[800px] mx-auto">
                        <div className="text-center mb-12">
                            <h1 className="text-xl font-bold font-serif mb-2">DOCUMENT PREVIEW</h1>
                        </div>

                        <div className="font-serif text-neutral-800 leading-relaxed whitespace-pre-wrap">
                            {renderDocumentText()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel: Workspace */}
            <div className="flex-1 flex flex-col bg-neutral-50/50" style={{ width: `${100 - leftPanelWidth}%` }}>
                <div className="p-4 border-b border-neutral-200 bg-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                            <Bot className="w-5 h-5" />
                        </div>
                        <h2 className="font-semibold text-neutral-900">AI Workspace</h2>
                    </div>
                    <button
                        onClick={handleExport}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
                    >
                        Export All Responses
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {requests.map((req) => (
                        <motion.div
                            layout
                            key={req.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            onFocus={() => setActiveRequest(req.id)}
                            onBlur={() => setActiveRequest(null)}
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
                                <textarea
                                    value={responses[req.id] || ''}
                                    onChange={(e) => handleResponseChange(req.id, e.target.value)}
                                    placeholder="Type your response here..."
                                    className="w-full min-h-[100px] p-3 text-sm border-0 bg-neutral-50/50 rounded-lg focus:ring-0 focus:bg-white transition-colors resize-y placeholder:text-neutral-400"
                                />

                                <div className="flex justify-between items-center pt-2 border-t border-dashed border-neutral-100">
                                    <div className="flex flex-wrap gap-2">
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 mr-2">
                                            <Sparkles className="w-3.5 h-3.5" />
                                            <span>Smart Objections:</span>
                                        </div>
                                        {AI_OBJECTIONS.map((obj) => (
                                            <button
                                                key={obj.label}
                                                onClick={() => applyObjection(req.id, obj.text)}
                                                className="px-2.5 py-1 text-xs font-medium text-neutral-600 bg-white border border-neutral-200 rounded-md hover:border-blue-300 hover:text-blue-600 hover:shadow-sm transition-all"
                                            >
                                                {obj.label}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => refineResponse(req.id)}
                                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-all"
                                    >
                                        <Sparkles className="w-3 h-3" />
                                        Refine with AI
                                    </button>
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
        </div>
    )
}
