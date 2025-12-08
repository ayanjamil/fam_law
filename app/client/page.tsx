'use client'

import { useState, useEffect } from 'react'
import { Upload, CheckCircle2, Circle, HelpCircle, MessageSquare, ArrowLeft, ClipboardList, FileCheck, FolderPlus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Chatbot from '@/components/Chatbot'
import { requiredDocuments } from '@/lib/documentRequirements'
import { Document, DocumentType } from '@/lib/types'

type TabType = 'intake' | 'mandatory' | 'additional'

export default function ClientPortal() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [selectedDocType, setSelectedDocType] = useState<DocumentType | undefined>()
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('mandatory')

  useEffect(() => {
    const initialDocs: Document[] = requiredDocuments.map((doc, idx) => ({
      ...doc,
      id: `doc-${idx}`,
      uploaded: false,
    }))
    setDocuments(initialDocs)
  }, [])

  const handleFileUpload = (documentId: string, files: FileList | null) => {
    if (!files || files.length === 0) return

    setUploadingId(documentId)

    setTimeout(() => {
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === documentId
            ? {
                ...doc,
                uploaded: true,
                file: files[0],
                uploadedAt: new Date(),
              }
            : doc
        )
      )
      setUploadingId(null)
    }, 1000)
  }

  const openChatForDocument = (docType: DocumentType) => {
    setSelectedDocType(docType)
    setIsChatOpen(true)
  }

  const uploadedCount = documents.filter((d) => d.uploaded).length
  const totalCount = documents.length
  const progress = (uploadedCount / totalCount) * 100

  const tabs = [
    { id: 'intake' as TabType, label: 'Intake', icon: ClipboardList },
    { id: 'mandatory' as TabType, label: 'Mandatory Disclosures', icon: FileCheck },
    { id: 'additional' as TabType, label: 'Additional Documents', icon: FolderPlus },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex">
      <aside className="w-64 bg-white border-r shadow-sm flex flex-col">
        <div className="p-4 border-b">
          <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Back to Home</span>
          </Link>
          <h2 className="text-xl font-bold text-gray-900">Client Portal</h2>
          <p className="text-xs text-gray-600 mt-1">Case #FL-2024-001</p>
        </div>

        <nav className="flex-1 p-4">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium text-sm">{tab.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={() => {
              setSelectedDocType(undefined)
              setIsChatOpen(true)
            }}
            className="w-full flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors justify-center"
          >
            <MessageSquare className="w-5 h-5" />
            <span>Chat Assistant</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 py-8">
          {activeTab === 'mandatory' && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Document Upload Progress</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {uploadedCount} of {totalCount} documents uploaded
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">{Math.round(progress)}%</div>
                  <div className="text-xs text-gray-500">Complete</div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full"
                />
              </div>
            </div>
          )}

          {activeTab === 'intake' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Intake Information</h2>
              <p className="text-gray-600 mb-4">
                Welcome! Please complete your intake information to get started with your case.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-sm text-blue-800">
                  This section will contain your personal information, case details, and initial questionnaire.
                  Coming soon!
                </p>
              </div>
            </div>
          )}

          {activeTab === 'mandatory' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Mandatory Disclosure Documents</h2>
              <div className="space-y-4">
                {documents.map((doc, index) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`border rounded-lg p-4 transition-all ${
                      doc.uploaded
                        ? 'bg-green-50 border-green-200'
                        : 'bg-white border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {doc.uploaded ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          >
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                          </motion.div>
                        ) : (
                          <Circle className="w-6 h-6 text-gray-400" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-medium text-gray-900">{doc.name}</h3>
                          <button
                            onClick={() => openChatForDocument(doc.type)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full p-1 transition-colors"
                            title="Learn more about this document"
                          >
                            <HelpCircle className="w-5 h-5" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{doc.description}</p>

                        {doc.uploaded && doc.uploadedAt && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-sm text-green-700 mb-2"
                          >
                            ✓ Uploaded {doc.uploadedAt.toLocaleDateString()} at{' '}
                            {doc.uploadedAt.toLocaleTimeString()}
                            {doc.file && ` • ${doc.file.name}`}
                          </motion.div>
                        )}

                        {!doc.uploaded && (
                          <label
                            htmlFor={`upload-${doc.id}`}
                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer transition-colors text-sm"
                          >
                            {uploadingId === doc.id ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Uploading...</span>
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4" />
                                <span>Upload Document</span>
                              </>
                            )}
                          </label>
                        )}
                        {doc.uploaded && (
                          <label
                            htmlFor={`upload-${doc.id}`}
                            className="inline-flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors text-sm"
                          >
                            <Upload className="w-4 h-4" />
                            <span>Replace Document</span>
                          </label>
                        )}
                        <input
                          id={`upload-${doc.id}`}
                          type="file"
                          onChange={(e) => handleFileUpload(doc.id, e.target.files)}
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          disabled={uploadingId === doc.id}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {uploadedCount < totalCount && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">⚠️</div>
                    <div>
                      <h3 className="font-semibold text-yellow-900 mb-1">Pending Documents</h3>
                      <p className="text-sm text-yellow-800">
                        You still have {totalCount - uploadedCount} document(s) to upload. Please
                        complete your document submission as soon as possible to avoid delays in
                        processing your case.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {uploadedCount === totalCount && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">🎉</div>
                    <div>
                      <h3 className="font-semibold text-green-900 mb-1">All Documents Uploaded!</h3>
                      <p className="text-sm text-green-800">
                        Great job! You've uploaded all required documents. Your attorney will review
                        them and contact you if any additional information is needed.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {activeTab === 'additional' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Documents</h2>
              <p className="text-gray-600 mb-4">
                Upload any additional documents that may be relevant to your case.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-sm text-blue-800">
                  This section allows you to upload supplementary documents not in the mandatory list.
                  Coming soon!
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      <Chatbot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} documentType={selectedDocType} />
    </div>
  )
}
