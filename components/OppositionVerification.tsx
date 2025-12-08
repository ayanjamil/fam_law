'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, ExternalLink, FileText, Download } from 'lucide-react'
import { motion } from 'framer-motion'
import { VerificationResult } from '@/lib/types'
import { FloridaFinancialAffidavit, floridaFormFields } from '@/lib/floridaFormFields'
import { verifyFormAgainstDocuments } from '@/lib/verificationService'
import DocumentViewer from './DocumentViewer'

interface OppositionVerificationProps {
  oppositionName: string
  oppositionForm: FloridaFinancialAffidavit
  onGenerateDocuments: (results: VerificationResult[]) => void
}

export default function OppositionVerification({
  oppositionName,
  oppositionForm,
  onGenerateDocuments,
}: OppositionVerificationProps) {
  const [verificationResults, setVerificationResults] = useState<VerificationResult[]>([])
  const [isVerified, setIsVerified] = useState(false)
  const [viewingDocument, setViewingDocument] = useState<{
    name: string
    page?: number
    extracted: string
  } | null>(null)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  const handleVerify = () => {
    const results = verifyFormAgainstDocuments(oppositionForm, oppositionName)
    setVerificationResults(results)
    setIsVerified(true)
    // Expand all sections
    setExpandedSections(new Set(['personalInfo', 'income', 'deductions', 'expenses', 'assets', 'liabilities']))
  }

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(section)) {
        next.delete(section)
      } else {
        next.add(section)
      }
      return next
    })
  }

  const inaccurateCount = verificationResults.filter((r) => !r.isAccurate).length
  const accurateCount = verificationResults.filter((r) => r.isAccurate).length

  const sections = [
    { key: 'personalInfo', title: 'Personal Information', icon: '👤' },
    { key: 'income', title: 'Monthly Income', icon: '💵' },
    { key: 'deductions', title: 'Deductions', icon: '📊' },
    { key: 'expenses', title: 'Monthly Expenses', icon: '🏠' },
    { key: 'assets', title: 'Assets', icon: '💎' },
    { key: 'liabilities', title: 'Liabilities & Debts', icon: '💳' },
  ]

  return (
    <div className="h-full flex">
      {/* Left Pane - Verification Checklist */}
      <div className="w-1/2 overflow-y-auto bg-white border-r p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Opposition Financial Affidavit Verification
          </h2>
          <p className="text-gray-600 mb-4">
            Verifying financial disclosure for: <strong>{oppositionName}</strong>
          </p>

          {!isVerified ? (
            <button
              onClick={handleVerify}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold"
            >
              <FileText className="w-6 h-6" />
              <span>Verify Financial Affidavit</span>
            </button>
          ) : (
            <div className="space-y-3">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-900">Accurate Fields</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600">{accurateCount}</span>
                </div>
                <p className="text-sm text-green-700">Fields match supporting documentation</p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span className="font-semibold text-red-900">Discrepancies Found</span>
                  </div>
                  <span className="text-2xl font-bold text-red-600">{inaccurateCount}</span>
                </div>
                <p className="text-sm text-red-700">Fields do not match documentation</p>
              </div>

              {inaccurateCount > 0 && (
                <button
                  onClick={() => onGenerateDocuments(verificationResults)}
                  className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                >
                  <Download className="w-5 h-5" />
                  <span>Generate Legal Documents</span>
                </button>
              )}
            </div>
          )}
        </div>

        {isVerified && (
          <div className="space-y-4">
            {sections.map((section) => {
              const isExpanded = expandedSections.has(section.key)
              const sectionFields = oppositionForm.sections[section.key as keyof typeof oppositionForm.sections]
              const sectionResults = verificationResults.filter((r) =>
                sectionFields.some((f) => f.id === r.fieldId)
              )

              if (sectionResults.length === 0) return null

              return (
                <div key={section.key} className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection(section.key)}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{section.icon}</span>
                      <h3 className="font-semibold text-gray-900">{section.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        {sectionResults.filter((r) => !r.isAccurate).length} issues
                      </span>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="p-4 bg-white space-y-4">
                      {sectionResults.map((result) => (
                        <motion.div
                          key={result.fieldId}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`border-l-4 ${
                            result.isAccurate ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                          } p-4 rounded-r-lg`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {result.isAccurate ? (
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                              )}
                              <h4 className="font-semibold text-gray-900">{result.fieldLabel}</h4>
                            </div>
                            <button
                              onClick={() =>
                                setViewingDocument({
                                  name: result.source.document,
                                  page: result.source.page,
                                  extracted: result.source.extracted,
                                })
                              }
                              className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm"
                            >
                              <ExternalLink className="w-4 h-4" />
                              <span>View Source</span>
                            </button>
                          </div>

                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">Claimed: </span>
                              <span className={result.isAccurate ? 'text-gray-900' : 'text-red-700 font-semibold'}>
                                ${parseFloat(result.claimedValue).toFixed(2)}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Actual (from documents): </span>
                              <span className={result.isAccurate ? 'text-green-700' : 'text-red-700 font-semibold'}>
                                ${parseFloat(result.actualValue).toFixed(2)}
                              </span>
                            </div>

                            {!result.isAccurate && result.discrepancyReason && (
                              <div className="mt-3 pt-3 border-t border-red-200">
                                <span className="font-medium text-red-900 block mb-1">Discrepancy Analysis:</span>
                                <p className="text-red-800 leading-relaxed">{result.discrepancyReason}</p>
                              </div>
                            )}

                            <div className="mt-2 pt-2 border-t">
                              <span className="font-medium text-gray-700 block mb-1">Source:</span>
                              <p className="text-gray-600">
                                {result.source.document}
                                {result.source.page && ` (Page ${result.source.page})`}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Right Pane - PDF Viewer or Document Viewer */}
      <div className="w-1/2 overflow-y-auto bg-gray-100 p-6">
        {viewingDocument ? (
          <DocumentViewer
            documentName={viewingDocument.name}
            page={viewingDocument.page}
            extractedText={viewingDocument.extracted}
            onReturn={() => setViewingDocument(null)}
          />
        ) : (
          <div className="bg-white shadow-lg rounded-lg p-8">
            <div className="border-b-2 border-gray-800 pb-4 mb-6">
              <h1 className="text-center text-xl font-bold text-gray-900 mb-2">
                FAMILY LAW FINANCIAL AFFIDAVIT
              </h1>
              <p className="text-center text-sm text-gray-600">
                {oppositionName} - Opposition Party
              </p>
            </div>

            {!isVerified ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  Click "Verify Financial Affidavit" to begin verification process
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {sections.map((section) => {
                  const sectionFields = oppositionForm.sections[section.key as keyof typeof oppositionForm.sections]
                  return (
                    <div key={section.key} className="mb-6">
                      <h2 className="text-lg font-bold bg-gray-800 text-white px-3 py-2 mb-3">
                        {section.title.toUpperCase()}
                      </h2>
                      <div className="space-y-1 text-sm">
                        {sectionFields.map((field) => {
                          const result = verificationResults.find((r) => r.fieldId === field.id)
                          return (
                            <div
                              key={field.id}
                              className={`flex items-center justify-between py-1 ${
                                result && !result.isAccurate ? 'bg-red-100 px-2 rounded' : ''
                              }`}
                            >
                              <span className="flex-1">{field.label}</span>
                              <span className="w-32 text-right border-b border-dotted border-gray-400">
                                {field.value || '_____'}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

