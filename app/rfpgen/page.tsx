'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react'
import RfpWorkspace from '@/components/rfp/RfpWorkspace'

interface ProcessedData {
    text: string
    requests: { id: number; text: string }[]
}

export default function RfpGenPage() {
    const [hasUploaded, setHasUploaded] = useState(false)
    const [isDragOver, setIsDragOver] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [processedData, setProcessedData] = useState<ProcessedData | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [fileName, setFileName] = useState<string>("")

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)
        const file = e.dataTransfer.files[0]
        if (file) await processFile(file)
    }

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) await processFile(file)
    }

    const processFile = async (file: File) => {
        setUploading(true)
        setError(null)
        setFileName(file.name)

        const formData = new FormData()
        formData.append('file', file)

        try {
            const response = await fetch('/api/process-document', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                throw new Error('Failed to process document')
            }

            const data = await response.json()
            setProcessedData({
                text: data.text,
                requests: data.requests
            })
            setTimeout(() => setHasUploaded(true), 500) // slight delay for animation
        } catch (err) {
            setError('Error processing file. Please ensure it is a valid PDF or DOCX.')
            console.error(err)
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900">
            <AnimatePresence mode="wait">
                {!hasUploaded ? (
                    <motion.div
                        key="upload"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex flex-col items-center justify-center min-h-screen p-6"
                    >
                        <div className="max-w-xl w-full text-center space-y-8">
                            <div className="space-y-4">
                                <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-neutral-900 to-neutral-600 bg-clip-text text-transparent">
                                    RFP Response Generator
                                </h1>
                                <p className="text-lg text-neutral-600">
                                    Upload your Request for Production document to generate comprehensive, AI-assisted responses instantly.
                                </p>
                            </div>

                            <div
                                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
                                onDragLeave={() => setIsDragOver(false)}
                                onDrop={handleDrop}
                                onClick={() => document.getElementById('file-upload')?.click()}
                                className={`
                  group relative border-2 border-dashed rounded-3xl p-12 transition-all duration-300 cursor-pointer
                  ${isDragOver
                                        ? 'border-blue-500 bg-blue-50/50 scale-[1.02]'
                                        : 'border-neutral-200 hover:border-neutral-300 hover:bg-white bg-white/50'
                                    }
                `}
                            >
                                <input
                                    id="file-upload"
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,.docx,.doc,.txt"
                                    onChange={handleFileSelect}
                                />

                                <div className="flex flex-col items-center gap-6">
                                    <div className={`
                    w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-500
                    ${uploading ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600 group-hover:scale-110 group-hover:rotate-3'}
                  `}>
                                        {uploading ? (
                                            <CheckCircle2 className="w-10 h-10 animate-bounce" />
                                        ) : (
                                            <Upload className="w-10 h-10" />
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="text-xl font-semibold">
                                            {uploading ? 'Processing Document...' : 'Drop your file here'}
                                        </h3>
                                        <p className="text-sm text-neutral-500">
                                            Supports PDF, DOCX, and TXT formats
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg justify-center">
                                    <AlertCircle className="w-5 h-5" />
                                    <p className="text-sm">{error}</p>
                                </div>
                            )}

                            <div className="flex items-center justify-center gap-2 text-sm text-neutral-400">
                                <FileText className="w-4 h-4" />
                                <span>Secure • Encrypted • Private</span>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="workspace"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="h-screen flex flex-col"
                    >
                        <RfpWorkspace
                            documentText={processedData?.text || ''}
                            requests={processedData?.requests || []}
                            fileName={fileName}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
