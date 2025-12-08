'use client'

import { useState } from 'react'
import { FileText, Download, Copy, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { VerificationResult } from '@/lib/types'
import { generateInterrogatories, generateProductionRequest } from '@/lib/verificationService'

interface LegalDocumentsGeneratorProps {
  verificationResults: VerificationResult[]
  oppositionName: string
  onClose: () => void
}

export default function LegalDocumentsGenerator({
  verificationResults,
  oppositionName,
  onClose,
}: LegalDocumentsGeneratorProps) {
  const [activeTab, setActiveTab] = useState<'interrogatories' | 'production'>('interrogatories')
  const [copiedInterrogatories, setCopiedInterrogatories] = useState(false)
  const [copiedProduction, setCopiedProduction] = useState(false)

  const interrogatories = generateInterrogatories(verificationResults)
  const productionRequest = generateProductionRequest(verificationResults)

  const handleCopy = (text: string, type: 'interrogatories' | 'production') => {
    navigator.clipboard.writeText(text)
    if (type === 'interrogatories') {
      setCopiedInterrogatories(true)
      setTimeout(() => setCopiedInterrogatories(false), 2000)
    } else {
      setCopiedProduction(true)
      setTimeout(() => setCopiedProduction(false), 2000)
    }
  }

  const handleDownload = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const inaccurateCount = verificationResults.filter((r) => !r.isAccurate).length

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-t-xl">
          <h2 className="text-2xl font-bold mb-2">Generate Legal Documents</h2>
          <p className="text-purple-100">
            Based on {inaccurateCount} discrepancies found in {oppositionName}'s financial affidavit
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('interrogatories')}
            className={`flex-1 px-6 py-3 font-semibold transition-colors ${
              activeTab === 'interrogatories'
                ? 'bg-white text-purple-600 border-b-2 border-purple-600'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <FileText className="w-5 h-5" />
              <span>Interrogatories</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('production')}
            className={`flex-1 px-6 py-3 font-semibold transition-colors ${
              activeTab === 'production'
                ? 'bg-white text-purple-600 border-b-2 border-purple-600'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <FileText className="w-5 h-5" />
              <span>Request for Production</span>
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'interrogatories' ? (
            <div>
              <div className="mb-4 bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 mb-2">About Interrogatories</h3>
                <p className="text-sm text-purple-800">
                  Interrogatories are written questions that the opposing party must answer under oath within 30
                  days. These questions are tailored to address the specific discrepancies found in their
                  financial affidavit and require detailed explanations and supporting documentation.
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 leading-relaxed">
                  {interrogatories}
                </pre>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-4 bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 mb-2">About Request for Production</h3>
                <p className="text-sm text-purple-800">
                  A Request for Production of Documents requires the opposing party to provide specific documents
                  within 30 days. These requests are designed to obtain the documentation needed to verify the
                  information in their financial affidavit and investigate the discrepancies found.
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 leading-relaxed">
                  {productionRequest}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50 rounded-b-xl flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
          <div className="flex gap-3">
            <button
              onClick={() =>
                handleCopy(
                  activeTab === 'interrogatories' ? interrogatories : productionRequest,
                  activeTab
                )
              }
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {(activeTab === 'interrogatories' ? copiedInterrogatories : copiedProduction) ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  <span>Copy to Clipboard</span>
                </>
              )}
            </button>
            <button
              onClick={() =>
                handleDownload(
                  activeTab === 'interrogatories' ? interrogatories : productionRequest,
                  activeTab === 'interrogatories'
                    ? `Interrogatories_${oppositionName.replace(/\s+/g, '_')}.txt`
                    : `Request_for_Production_${oppositionName.replace(/\s+/g, '_')}.txt`
                )
              }
              className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              <span>Download</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

