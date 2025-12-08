'use client'

import { useState, useEffect } from 'react'
import {
  ArrowLeft,
  BarChart3,
  FileText,
  MessagesSquare,
  FolderOpen,
  Bell,
  Users,
  TrendingUp,
  ShieldCheck,
  ScrollText
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useStore } from '@/lib/store'
import { Document, VerificationResult } from '@/lib/types'
import { requiredDocuments } from '@/lib/documentRequirements'
import OrganizeVisualization from '@/components/OrganizeVisualization'
import LawyerChatbot from '@/components/LawyerChatbot'
import OppositionVerification from '@/components/OppositionVerification'
import LegalDocumentsGenerator from '@/components/LegalDocumentsGenerator'
import FinancialSnapshot from '@/components/FinancialSnapshot'
import { OrganizedFolder } from '@/lib/types'
import { floridaFormFields, getOppositionFormData } from '@/lib/floridaFormFields'

type SectionType = 'snapshot' | 'documents' | 'forms' | 'rfp' | 'opposition' | 'financial-snapshot' | 'chatbot'

export default function LawyerPortal() {
  const {
    cases,
    currentCaseId,
    setCurrentCase,
    setPartyDesignation,
    verificationResults,
    setVerificationResults
  } = useStore()
  const [activeSection, setActiveSection] = useState<SectionType>('snapshot')
  const [clientDocuments, setClientDocuments] = useState<Document[]>([])
  const [isOrganizing, setIsOrganizing] = useState(false)
  const [organizedStructure, setOrganizedStructure] = useState<OrganizedFolder | null>(null)
  const [showReminder, setShowReminder] = useState(false)
  const [showPartySelector, setShowPartySelector] = useState(true)
  const [showLegalDocs, setShowLegalDocs] = useState(false)

  const currentCase = cases.find((c) => c.id === currentCaseId)

  useEffect(() => {
    const initialDocs: Document[] = requiredDocuments.map((doc, idx) => ({
      ...doc,
      id: `doc-${idx}`,
      uploaded: idx < 7,
      uploadedAt: idx < 7 ? new Date(Date.now() - Math.random() * 10000000000) : undefined,
    }))
    setClientDocuments(initialDocs)
  }, [currentCaseId])

  useEffect(() => {
    if (currentCase?.partyDesignation) {
      setShowPartySelector(false)
    } else {
      setShowPartySelector(true)
    }
  }, [currentCase])

  const uploadedDocuments = clientDocuments.filter((d) => d.uploaded)
  const pendingDocuments = clientDocuments.filter((d) => !d.uploaded)

  const uploadedFiles = [
    { name: 'IMG_4721.jpg', type: 'image' },
    { name: 'Scan_47.pdf', type: 'pdf' },
    { name: 'Bank_doc.pdf', type: 'pdf' },
    { name: 'Statement_001.pdf', type: 'pdf' },
    { name: 'Pay_stub_march.jpg', type: 'image' },
    { name: 'Tax_2023.pdf', type: 'pdf' },
    { name: 'Chase_Statement_Jan.pdf', type: 'pdf' },
    { name: 'Chase_Statement_Feb.pdf', type: 'pdf' },
    { name: 'HSBC_Jan_2024.pdf', type: 'pdf' },
    { name: 'Paystub_April.pdf', type: 'pdf' },
    { name: 'Credit_Card_Bill.jpg', type: 'image' },
    { name: 'Miami_House_Deed.pdf', type: 'pdf' },
    { name: 'Car_Title.pdf', type: 'pdf' },
  ]

  const handleOrganize = () => {
    setIsOrganizing(true)

    setTimeout(() => {
      const organized: OrganizedFolder = {
        name: 'Root',
        type: 'folder',
        children: [
          {
            name: 'Bank Statements',
            type: 'folder',
            children: [
              {
                name: 'Chase',
                type: 'folder',
                children: [
                  {
                    name: 'Chase_January_2024.pdf',
                    type: 'file',
                    originalName: 'Chase_Statement_Jan.pdf',
                    documentType: 'bank_statements',
                    date: new Date(2024, 0, 1),
                  },
                  {
                    name: 'Chase_February_2024.pdf',
                    type: 'file',
                    originalName: 'Chase_Statement_Feb.pdf',
                    documentType: 'bank_statements',
                    date: new Date(2024, 1, 1),
                  },
                ],
              },
              {
                name: 'HSBC',
                type: 'folder',
                children: [
                  {
                    name: 'HSBC_January_2024.pdf',
                    type: 'file',
                    originalName: 'HSBC_Jan_2024.pdf',
                    documentType: 'bank_statements',
                    date: new Date(2024, 0, 1),
                  },
                ],
              },
            ],
          },
          {
            name: 'Pay Stubs',
            type: 'folder',
            children: [
              {
                name: '2024',
                type: 'folder',
                children: [
                  {
                    name: 'Pay_Stub_March_2024.pdf',
                    type: 'file',
                    originalName: 'Pay_stub_march.jpg',
                    documentType: 'pay_stubs',
                    date: new Date(2024, 2, 1),
                  },
                  {
                    name: 'Pay_Stub_April_2024.pdf',
                    type: 'file',
                    originalName: 'Paystub_April.pdf',
                    documentType: 'pay_stubs',
                    date: new Date(2024, 3, 1),
                  },
                ],
              },
            ],
          },
          {
            name: 'Tax Returns',
            type: 'folder',
            children: [
              {
                name: 'Tax_Return_2023.pdf',
                type: 'file',
                originalName: 'Tax_2023.pdf',
                documentType: 'tax_returns',
                date: new Date(2023, 0, 1),
              },
            ],
          },
          {
            name: 'Credit Card Bills',
            type: 'folder',
            children: [
              {
                name: 'Credit_Card_Statement.pdf',
                type: 'file',
                originalName: 'Credit_Card_Bill.jpg',
                documentType: 'credit_card_bills',
              },
            ],
          },
          {
            name: 'Assets',
            type: 'folder',
            children: [
              {
                name: 'Real Estate',
                type: 'folder',
                children: [
                  {
                    name: 'Miami_House_Property_Deed.pdf',
                    type: 'file',
                    originalName: 'Miami_House_Deed.pdf',
                    documentType: 'property_deeds',
                  },
                ],
              },
              {
                name: 'Vehicles',
                type: 'folder',
                children: [
                  {
                    name: 'Car_Title_Certificate.pdf',
                    type: 'file',
                    originalName: 'Car_Title.pdf',
                    documentType: 'vehicle_titles',
                  },
                ],
              },
            ],
          },
        ],
      }
      setOrganizedStructure(organized)
      setIsOrganizing(false)
    }, 3000)
  }

  const handleSendReminder = () => {
    setShowReminder(true)
    setTimeout(() => setShowReminder(false), 3000)
  }

  const handleSetPartyDesignation = (designation: 'petitioner' | 'respondent') => {
    if (currentCaseId) {
      const oppositionName = designation === 'petitioner' ? 'Jane Smith' : 'Robert Williams'
      setPartyDesignation(currentCaseId, designation, oppositionName)
      setShowPartySelector(false)
    }
  }

  const handleGenerateDocuments = (results: VerificationResult[]) => {
    setVerificationResults(results)
    setShowLegalDocs(true)
  }

  const sections = [
    { id: 'snapshot' as SectionType, label: 'Snapshot', icon: BarChart3 },
    { id: 'documents' as SectionType, label: 'Documents', icon: FolderOpen },
    { id: 'forms' as SectionType, label: 'Forms', icon: FileText },
    { id: 'rfp' as SectionType, label: 'RFP', icon: ScrollText },
    { id: 'opposition' as SectionType, label: 'Opposition', icon: ShieldCheck },
    { id: 'financial-snapshot' as SectionType, label: 'Financial Snapshot', icon: TrendingUp },
    { id: 'chatbot' as SectionType, label: 'AI Assistant', icon: MessagesSquare },
  ]

  const totalCount = clientDocuments.length
  const uploadedCount = uploadedDocuments.length
  const pendingCount = pendingDocuments.length

  const oppositionName = currentCase?.oppositionName || 'Opposition Party'

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Party Designation Modal */}
      {showPartySelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full"
          >
            <div className="text-center mb-6">
              <Users className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Case Setup: {currentCase?.clientName}
              </h2>
              <p className="text-gray-600">
                Please specify which party you represent in this case
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleSetPartyDesignation('petitioner')}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
              >
                <div className="font-semibold text-gray-900 mb-1">Petitioner</div>
                <div className="text-sm text-gray-600">
                  {currentCase?.clientName} is the petitioner (party who filed)
                </div>
              </button>

              <button
                onClick={() => handleSetPartyDesignation('respondent')}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
              >
                <div className="font-semibold text-gray-900 mb-1">Respondent</div>
                <div className="text-sm text-gray-600">
                  {currentCase?.clientName} is the respondent (other party)
                </div>
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Legal Documents Generator Modal */}
      {showLegalDocs && (
        <LegalDocumentsGenerator
          verificationResults={verificationResults}
          oppositionName={oppositionName}
          onClose={() => setShowLegalDocs(false)}
        />
      )}

      {/* Sidebar */}
      <aside className="w-72 bg-white border-r shadow-sm flex flex-col">
        <div className="p-4 border-b">
          <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Back to Home</span>
          </Link>
          <h2 className="text-xl font-bold text-gray-900">Cases</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {cases.map((caseItem) => (
            <button
              key={caseItem.id}
              onClick={() => setCurrentCase(caseItem.id)}
              className={`w-full text-left p-4 border-b hover:bg-blue-50 transition-colors ${currentCaseId === caseItem.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{caseItem.clientName}</h3>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${caseItem.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : caseItem.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-700'
                    }`}
                >
                  {caseItem.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">{caseItem.caseNumber}</p>
              {caseItem.partyDesignation && (
                <p className="text-xs text-blue-600 mb-1">
                  {caseItem.partyDesignation.charAt(0).toUpperCase() + caseItem.partyDesignation.slice(1)}
                </p>
              )}
              <p className="text-xs text-gray-400">
                Updated {caseItem.lastUpdated.toLocaleDateString()}
              </p>
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b shadow-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {currentCase?.clientName} - {currentCase?.caseNumber}
                </h1>
                {currentCase?.partyDesignation && (
                  <p className="text-sm text-gray-600 mt-1">
                    Representing: {currentCase.partyDesignation.charAt(0).toUpperCase() + currentCase.partyDesignation.slice(1)} •
                    Opposition: {currentCase.oppositionName}
                  </p>
                )}
              </div>
              {currentCase?.partyDesignation && (
                <button
                  onClick={() => setShowPartySelector(true)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Change Party Designation
                </button>
              )}
            </div>
            <nav className="flex gap-2 flex-wrap">
              {sections.map((section) => {
                const Icon = section.icon
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeSection === section.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{section.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </header>

        <main className="flex-1 overflow-hidden">
          {activeSection === 'snapshot' && (
            <div className="p-8 h-full overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Document Collection Snapshot</h2>

              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{totalCount}</div>
                  <div className="text-sm text-gray-600">Total Required</div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="text-3xl font-bold text-green-600 mb-2">{uploadedCount}</div>
                  <div className="text-sm text-gray-600">Uploaded</div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="text-3xl font-bold text-orange-600 mb-2">{pendingCount}</div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Collection Progress</h3>
                <div className="flex items-center justify-center gap-12">
                  <div className="relative w-64 h-64">
                    <svg viewBox="0 0 100 100" className="transform -rotate-90">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#f3f4f6"
                        strokeWidth="20"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="20"
                        strokeDasharray={`${(uploadedCount / totalCount) * 251.2} 251.2`}
                        className="transition-all duration-1000"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="20"
                        strokeDasharray={`${(pendingCount / totalCount) * 251.2} 251.2`}
                        strokeDashoffset={`-${(uploadedCount / totalCount) * 251.2}`}
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <div className="text-4xl font-bold text-gray-900">
                        {Math.round((uploadedCount / totalCount) * 100)}%
                      </div>
                      <div className="text-sm text-gray-600">Complete</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <div>
                        <div className="font-semibold text-gray-900">Uploaded</div>
                        <div className="text-sm text-gray-600">
                          {uploadedCount} documents ({Math.round((uploadedCount / totalCount) * 100)}%)
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-orange-500 rounded"></div>
                      <div>
                        <div className="font-semibold text-gray-900">Pending</div>
                        <div className="text-sm text-gray-600">
                          {pendingCount} documents ({Math.round((pendingCount / totalCount) * 100)}%)
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {pendingCount > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Pending Documents</h3>
                    <button
                      onClick={handleSendReminder}
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Bell className="w-4 h-4" />
                      <span>Send Reminder to Client</span>
                    </button>
                  </div>

                  {showReminder && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800"
                    >
                      ✓ Reminder sent successfully to {currentCase?.clientName}
                    </motion.div>
                  )}

                  <div className="space-y-2">
                    {pendingDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{doc.name}</p>
                          <p className="text-sm text-gray-600">{doc.description}</p>
                        </div>
                        <span className="text-xs text-orange-600 font-medium">Awaiting Upload</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSection === 'documents' && (
            <div className="p-8 h-full overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Document Management</h2>

              <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">All Uploaded Documents</h3>
                <div className="grid grid-cols-2 gap-4">
                  {uploadedDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-4 bg-green-50 rounded-lg border border-green-200"
                    >
                      <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{doc.name}</p>
                          <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            Uploaded: {doc.uploadedAt?.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Organize Documents</h3>
                <OrganizeVisualization
                  files={uploadedFiles}
                  onOrganize={handleOrganize}
                  isOrganizing={isOrganizing}
                  organizedStructure={organizedStructure}
                />
              </div>
            </div>
          )}

          {activeSection === 'forms' && (
            <div className="p-8 h-full overflow-y-auto">
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <FileText className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Financial Affidavit Forms</h2>
                <p className="text-gray-600 mb-6">
                  Auto-populate and manage Florida financial disclosure forms for {currentCase?.clientName}
                </p>
                <Link
                  href="/lawyer/form-populate"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <FileText className="w-5 h-5" />
                  <span>Open Form Editor</span>
                </Link>
              </div>
            </div>
          )}

          {activeSection === 'rfp' && (
            <div className="p-8 h-full overflow-y-auto">
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <ScrollText className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Request for Production (RFP)</h2>
                <p className="text-gray-600 mb-6">
                  View the RFP document and generate responses using the AI Co-Pilot.
                </p>
                <Link
                  href="/rfp"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <ScrollText className="w-5 h-5" />
                  <span>Open RFP Viewer</span>
                </Link>
              </div>
            </div>
          )}

          {activeSection === 'opposition' && (
            <div className="h-full">
              {currentCase?.partyDesignation ? (
                <OppositionVerification
                  oppositionName={oppositionName}
                  oppositionForm={getOppositionFormData(oppositionName)}
                  onGenerateDocuments={handleGenerateDocuments}
                />
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <ShieldCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      Party Designation Required
                    </h3>
                    <p className="text-gray-500">
                      Please specify party designation to access opposition verification
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSection === 'financial-snapshot' && (
            <div className="h-full">
              {currentCase?.partyDesignation ? (
                <FinancialSnapshot
                  clientName={currentCase.clientName}
                  oppositionName={oppositionName}
                />
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      Party Designation Required
                    </h3>
                    <p className="text-gray-500">
                      Please specify party designation to access financial snapshot
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSection === 'chatbot' && (
            <div className="h-full">
              <LawyerChatbot />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
