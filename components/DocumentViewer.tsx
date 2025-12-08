'use client'

import { ArrowLeft, FileText } from 'lucide-react'
import { motion } from 'framer-motion'

interface DocumentViewerProps {
  documentName: string
  page?: number
  extractedText: string
  onReturn: () => void
}

export default function DocumentViewer({ documentName, page, extractedText, onReturn }: DocumentViewerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-full flex flex-col bg-gray-100"
    >
      {/* Header */}
      <div className="bg-white border-b p-4">
        <button
          onClick={onReturn}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-3 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Return to Form</span>
        </button>
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="font-semibold text-gray-900">{documentName}</h3>
            {page && <p className="text-sm text-gray-600">Page {page}</p>}
          </div>
        </div>
      </div>

      {/* Document Preview */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-white shadow-lg rounded-lg p-8 max-w-3xl mx-auto">
          {/* Simulated Document Content */}
          <div className="border-b-2 border-gray-800 pb-4 mb-6">
            <h2 className="text-xl font-bold text-gray-900">{documentName}</h2>
            {page && <p className="text-sm text-gray-600 mt-1">Page {page}</p>}
          </div>

          {/* Highlighted Section */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded mb-6">
            <div className="flex items-start gap-2 mb-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
              <p className="font-semibold text-gray-900">Extracted Information:</p>
            </div>
            <p className="text-gray-800 ml-4">{extractedText}</p>
          </div>

          {/* Simulated Document Content */}
          <div className="space-y-4 text-sm text-gray-700">
            {documentName.includes('Pay Stub') && (
              <>
                <div className="border-b pb-3">
                  <p className="font-semibold">TECH SOLUTIONS INC.</p>
                  <p>123 Tech Boulevard, Miami, FL 33139</p>
                  <p>Employee Pay Statement</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold">Employee Information:</p>
                    <p>Name: John Michael Smith</p>
                    <p>Position: Software Engineer</p>
                    <p>Employee ID: EMP-001234</p>
                  </div>
                  <div>
                    <p className="font-semibold">Pay Period:</p>
                    <p>March 1 - March 31, 2024</p>
                    <p>Pay Date: April 1, 2024</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded">
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold">Gross Pay:</span>
                    <span className="font-bold bg-yellow-100 px-2 py-1 rounded">${extractedText.includes('8,500') || extractedText.includes('8500') ? '8,500.00' : '8,000.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Regular Hours (160):</span>
                    <span>$8,000.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Overtime:</span>
                    <span>$500.00</span>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded">
                  <p className="font-semibold mb-2">Deductions:</p>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Federal Income Tax:</span>
                      <span>$1,450.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>FICA/Medicare:</span>
                      <span>$650.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>401(k) Contribution:</span>
                      <span>$425.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Health Insurance:</span>
                      <span>$350.00</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded">
                  <div className="flex justify-between text-lg">
                    <span className="font-bold">Net Pay:</span>
                    <span className="font-bold">$5,625.00</span>
                  </div>
                </div>
              </>
            )}

            {documentName.includes('Bank') && documentName.includes('Statement') && (
              <>
                <div className="border-b pb-3">
                  <p className="font-bold text-lg">{documentName.includes('Chase') ? 'CHASE BANK' : 'HSBC BANK'}</p>
                  <p>Monthly Statement</p>
                  <p className="text-xs">Statement Period: {documentName.includes('January') ? 'Jan 1 - Jan 31, 2024' : 'Feb 1 - Feb 29, 2024'}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded">
                  <p className="font-semibold mb-2">Account Summary:</p>
                  <div className="flex justify-between">
                    <span>Account Holder:</span>
                    <span>John Michael Smith</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Account Number:</span>
                    <span>****{documentName.includes('Chase') ? '7890' : '1234'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Account Type:</span>
                    <span>{documentName.includes('Chase') ? 'Checking' : 'Savings'}</span>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded">
                  <div className="flex justify-between mb-2">
                    <span>Beginning Balance:</span>
                    <span>{documentName.includes('Chase') ? '$2,850.00' : '$12,100.00'}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Deposits & Credits:</span>
                    <span className="text-green-600">+${documentName.includes('Chase') ? '8,500.00' : '450.00'}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Withdrawals & Debits:</span>
                    <span className="text-red-600">-${documentName.includes('Chase') ? '8,150.00' : '50.00'}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-blue-200">
                    <span className="bg-yellow-100 px-2 py-1 rounded">Ending Balance:</span>
                    <span className="bg-yellow-100 px-2 py-1 rounded">${extractedText.includes('3,200') ? '3,200.00' : '12,500.00'}</span>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded">
                  <p className="font-semibold mb-2">Recent Transactions:</p>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>03/01 - Direct Deposit - Tech Solutions Inc</span>
                      <span className="text-green-600">+$8,500.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>03/05 - Mortgage Payment</span>
                      <span className="text-red-600">-$2,200.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>03/10 - Groceries</span>
                      <span className="text-red-600">-$450.00</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {documentName.includes('Tax Return') && (
              <>
                <div className="border-b pb-3">
                  <p className="font-bold text-lg">U.S. INDIVIDUAL INCOME TAX RETURN</p>
                  <p>Form 1040 - Tax Year 2023</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="font-semibold mb-2">Taxpayer Information:</p>
                    <p>Name: John Michael Smith</p>
                    <p>SSN: XXX-XX-6789</p>
                    <p>Filing Status: Single</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="font-semibold mb-2">Address:</p>
                    <p>1234 Ocean Drive</p>
                    <p>Miami, FL 33139</p>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded">
                  <p className="font-semibold mb-3">Income:</p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Wages, Salaries, Tips (W-2):</span>
                      <span className="font-bold bg-yellow-100 px-2 py-1 rounded">$102,000.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Interest Income:</span>
                      <span>$1,500.00</span>
                    </div>
                    <div className="flex justify-between font-bold pt-2 border-t border-blue-200">
                      <span>Total Income:</span>
                      <span>$103,500.00</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {!documentName.includes('Pay Stub') && !documentName.includes('Bank') && !documentName.includes('Tax') && (
              <>
                <div className="border-b pb-3">
                  <p className="font-bold text-lg">DOCUMENT</p>
                  <p>{documentName}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-gray-700">
                    This document contains financial information that has been extracted and used to populate the financial affidavit.
                  </p>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                  <p className="font-semibold mb-2">Highlighted Information:</p>
                  <p>{extractedText}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

