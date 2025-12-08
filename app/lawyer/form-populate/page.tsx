'use client'

import { useState } from 'react'
import { ArrowLeft, Download, FileText, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { FloridaFinancialAffidavit, autoPopulateFromDocuments, floridaFormFields } from '@/lib/floridaFormFields'
import { FormField } from '@/lib/types'
import DocumentViewer from '@/components/DocumentViewer'

export default function FormPopulatePage() {
  const [formData, setFormData] = useState<FloridaFinancialAffidavit>(floridaFormFields)
  const [isPopulated, setIsPopulated] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['personalInfo']))
  const [viewingDocument, setViewingDocument] = useState<{
    name: string
    page?: number
    extracted: string
  } | null>(null)

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

  const handleAutoPopulate = () => {
    setIsPopulated(true)
    setTimeout(() => {
      const populatedData = autoPopulateFromDocuments()
      setFormData(populatedData)
      setExpandedSections(new Set(['personalInfo', 'income', 'deductions', 'expenses', 'assets', 'liabilities']))
    }, 500)
  }

  const handleFieldChange = (section: keyof typeof formData.sections, fieldId: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        [section]: prev.sections[section].map((field) =>
          field.id === fieldId ? { ...field, value } : field
        ),
      },
    }))
  }

  const handleViewSource = (source: { document: string; page?: number; extracted: string }) => {
    setViewingDocument({
      name: source.document,
      page: source.page,
      extracted: source.extracted,
    })
  }

  const renderField = (field: FormField, section: keyof typeof formData.sections) => {
    const isTotal = field.label.toUpperCase().includes('TOTAL') || field.label.toUpperCase().includes('NET WORTH')

    return (
      <div key={field.id} className={`${isTotal ? 'bg-blue-50 border-2 border-blue-300 p-4 rounded-lg' : 'mb-4'}`}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {field.label}
          {isTotal && <span className="ml-2 text-blue-600 font-bold">★</span>}
        </label>
        <div className="flex gap-2">
          <input
            type={field.type}
            value={field.value}
            onChange={(e) => handleFieldChange(section, field.id, e.target.value)}
            className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              isTotal ? 'font-bold text-lg bg-white border-blue-400' : 'border-gray-300'
            }`}
            placeholder={field.type === 'number' ? '0.00' : ''}
          />
          {field.source && (
            <button
              onClick={() => handleViewSource(field.source!)}
              className="flex items-center gap-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
              title={`Source: ${field.source.document}`}
            >
              <ExternalLink className="w-4 h-4" />
              <span className="text-xs">View</span>
            </button>
          )}
        </div>
        {field.source && (
          <div className="mt-2 text-xs text-green-700 bg-green-50 p-2 rounded">
            <strong>Source:</strong> {field.source.document}
            {field.source.page && ` (Page ${field.source.page})`}
            <br />
            <strong>Extracted:</strong> {field.source.extracted}
          </div>
        )}
      </div>
    )
  }

  const sections = [
    { key: 'personalInfo', title: 'Personal Information', icon: '👤' },
    { key: 'income', title: 'Monthly Income', icon: '💵' },
    { key: 'deductions', title: 'Deductions', icon: '📊' },
    { key: 'expenses', title: 'Monthly Expenses', icon: '🏠' },
    { key: 'assets', title: 'Assets', icon: '💎' },
    { key: 'liabilities', title: 'Liabilities & Debts', icon: '💳' },
  ]

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <header className="bg-white shadow-sm border-b z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/lawyer" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Florida Financial Affidavit</h1>
                <p className="text-sm text-gray-600">Case #FL-2024-001 - John Smith</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleAutoPopulate}
                disabled={isPopulated}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <FileText className="w-5 h-5" />
                <span>{isPopulated ? 'Form Populated' : 'Auto-Populate from Documents'}</span>
              </button>
              <button className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
                <Download className="w-5 h-5" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/2 overflow-y-auto bg-white border-r">
          <div className="p-6">
            <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <h2 className="font-semibold text-blue-900 mb-1">Interactive Form Editor</h2>
              <p className="text-sm text-blue-800">
                Fill in the form fields below. Fields with sources are auto-populated from uploaded documents.
                Click "View" to see source documents. Changes here will update the PDF preview on the right.
              </p>
            </div>

            {sections.map((section) => {
              const isExpanded = expandedSections.has(section.key)
              const sectionFields = formData.sections[section.key as keyof typeof formData.sections]
              const populatedCount = sectionFields.filter((f) => f.value).length

              return (
                <div key={section.key} className="mb-4 border rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection(section.key)}
                    className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{section.icon}</span>
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-900">{section.title}</h3>
                        <p className="text-xs text-gray-600">
                          {populatedCount} of {sectionFields.length} fields completed
                        </p>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    )}
                  </button>

                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="p-4 bg-white"
                    >
                      {sectionFields.map((field) =>
                        renderField(field, section.key as keyof typeof formData.sections)
                      )}
                    </motion.div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="w-1/2 overflow-y-auto bg-gray-200 p-6">
          {viewingDocument ? (
            <DocumentViewer
              documentName={viewingDocument.name}
              page={viewingDocument.page}
              extractedText={viewingDocument.extracted}
              onReturn={() => setViewingDocument(null)}
            />
          ) : (
            <div className="bg-white shadow-lg rounded-lg p-8 max-w-2xl mx-auto">
              <div className="border-b-2 border-gray-800 pb-4 mb-6">
                <h1 className="text-center text-xl font-bold text-gray-900 mb-2">
                  FAMILY LAW FINANCIAL AFFIDAVIT
                </h1>
                <p className="text-center text-sm text-gray-600">
                  Florida Family Law Rules of Procedure Form 12.902(b) or (c)
                </p>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-bold bg-gray-800 text-white px-3 py-2 mb-3">
                  I. PERSONAL INFORMATION
                </h2>
                <div className="space-y-2 text-sm">
                  {formData.sections.personalInfo.map((field) => (
                    <div key={field.id} className="flex">
                      <span className="w-48 text-gray-600">{field.label}:</span>
                      <span className="flex-1 font-medium border-b border-dotted border-gray-400">
                        {field.value || '_____________________'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-bold bg-gray-800 text-white px-3 py-2 mb-3">
                  II. GROSS MONTHLY INCOME
                </h2>
                <div className="space-y-1 text-sm">
                  {formData.sections.income.map((field) => (
                    <div key={field.id} className="flex items-center justify-between py-1">
                      <span className={`flex-1 ${field.label.includes('TOTAL') ? 'font-bold' : ''}`}>
                        {field.label}
                      </span>
                      <span className={`w-32 text-right ${field.label.includes('TOTAL') ? 'font-bold text-lg border-t-2 border-b-2 border-gray-800' : 'border-b border-dotted border-gray-400'}`}>
                        {field.value ? `$${parseFloat(field.value).toFixed(2)}` : '$_____'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-bold bg-gray-800 text-white px-3 py-2 mb-3">
                  III. DEDUCTIONS FROM GROSS INCOME
                </h2>
                <div className="space-y-1 text-sm">
                  {formData.sections.deductions.map((field) => (
                    <div key={field.id} className="flex items-center justify-between py-1">
                      <span className={`flex-1 ${field.label.includes('TOTAL') || field.label.includes('NET') ? 'font-bold' : ''}`}>
                        {field.label}
                      </span>
                      <span className={`w-32 text-right ${field.label.includes('TOTAL') || field.label.includes('NET') ? 'font-bold text-lg border-t-2 border-b-2 border-gray-800' : 'border-b border-dotted border-gray-400'}`}>
                        {field.value ? `$${parseFloat(field.value).toFixed(2)}` : '$_____'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-bold bg-gray-800 text-white px-3 py-2 mb-3">
                  IV. MONTHLY EXPENSES
                </h2>
                <div className="space-y-1 text-sm">
                  {formData.sections.expenses.map((field) => (
                    <div key={field.id} className="flex items-center justify-between py-1">
                      <span className={`flex-1 ${field.label.includes('TOTAL') ? 'font-bold' : ''}`}>
                        {field.label}
                      </span>
                      <span className={`w-32 text-right ${field.label.includes('TOTAL') ? 'font-bold text-lg border-t-2 border-b-2 border-gray-800' : 'border-b border-dotted border-gray-400'}`}>
                        {field.value ? `$${parseFloat(field.value).toFixed(2)}` : '$_____'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-bold bg-gray-800 text-white px-3 py-2 mb-3">
                  V. ASSETS
                </h2>
                <div className="space-y-1 text-sm">
                  {formData.sections.assets.map((field) => (
                    <div key={field.id} className="flex items-center justify-between py-1">
                      <span className={`flex-1 ${field.label.includes('TOTAL') ? 'font-bold' : ''}`}>
                        {field.label}
                      </span>
                      <span className={`w-32 text-right ${field.label.includes('TOTAL') ? 'font-bold text-lg border-t-2 border-b-2 border-gray-800' : 'border-b border-dotted border-gray-400'}`}>
                        {field.value ? `$${parseFloat(field.value).toFixed(2)}` : '$_____'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-bold bg-gray-800 text-white px-3 py-2 mb-3">
                  VI. LIABILITIES
                </h2>
                <div className="space-y-1 text-sm">
                  {formData.sections.liabilities.map((field) => (
                    <div key={field.id} className="flex items-center justify-between py-1">
                      <span className={`flex-1 ${field.label.includes('TOTAL') || field.label.includes('NET WORTH') ? 'font-bold' : ''}`}>
                        {field.label}
                      </span>
                      <span className={`w-32 text-right ${field.label.includes('TOTAL') || field.label.includes('NET WORTH') ? 'font-bold text-lg border-t-2 border-b-2 border-gray-800' : 'border-b border-dotted border-gray-400'}`}>
                        {field.value ? `$${parseFloat(field.value).toFixed(2)}` : '$_____'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t-2 border-gray-800">
                <div className="mb-4">
                  <p className="text-xs text-gray-600 mb-4">
                    I certify that a copy of this document was [check one only]: ( ) e-mailed ( ) mailed ( ) faxed ( ) hand-delivered to the person(s) listed below on {'{'}date{'}'}.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-end gap-4">
                    <div className="flex-1">
                      <div className="border-b border-gray-800 h-8"></div>
                      <p className="text-xs text-gray-600 mt-1">Signature</p>
                    </div>
                    <div className="w-32">
                      <div className="border-b border-gray-800 h-8"></div>
                      <p className="text-xs text-gray-600 mt-1">Date</p>
                    </div>
                  </div>
                  <div>
                    <div className="border-b border-gray-800 h-8"></div>
                    <p className="text-xs text-gray-600 mt-1">Printed Name</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
