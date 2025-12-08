'use client'

import { useState } from 'react'
import { Plus, Trash2, Search, Download } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/lib/store'
import { FinancialSnapshotRow } from '@/lib/types'

interface FinancialSnapshotProps {
  clientName: string
  oppositionName: string
}

// Mock function to extract data from documents/forms
function extractFinancialData(prompt: string, party: 'client' | 'opposition'): {
  value: string
  source: string
} {
  const lowerPrompt = prompt.toLowerCase()

  // Simulate extraction based on keywords in the prompt
  if (lowerPrompt.includes('income') || lowerPrompt.includes('salary')) {
    return {
      value: party === 'client' ? '$8,500' : '$7,200',
      source: 'Pay Stubs (3-month average)',
    }
  }

  if (lowerPrompt.includes('cash') || lowerPrompt.includes('account balance')) {
    return {
      value: party === 'client' ? '$45,000' : '$32,000',
      source: 'Bank Statements (all accounts)',
    }
  }

  if (lowerPrompt.includes('real estate') || lowerPrompt.includes('property value')) {
    return {
      value: party === 'client' ? '$450,000' : '$320,000',
      source: 'Property Deed & Tax Assessment',
    }
  }

  if (lowerPrompt.includes('mortgage') || lowerPrompt.includes('housing payment')) {
    return {
      value: party === 'client' ? '$2,500' : '$1,800',
      source: 'Mortgage Statement',
    }
  }

  if (lowerPrompt.includes('credit card') || lowerPrompt.includes('debt')) {
    return {
      value: party === 'client' ? '$12,000' : '$8,500',
      source: 'Credit Card Statements',
    }
  }

  if (lowerPrompt.includes('vehicle') || lowerPrompt.includes('car')) {
    return {
      value: party === 'client' ? '$35,000' : '$22,000',
      source: 'Vehicle Title & KBB Valuation',
    }
  }

  if (lowerPrompt.includes('retirement') || lowerPrompt.includes('401k') || lowerPrompt.includes('ira')) {
    return {
      value: party === 'client' ? '$125,000' : '$85,000',
      source: '401(k) Account Statement',
    }
  }

  if (lowerPrompt.includes('net worth')) {
    return {
      value: party === 'client' ? '$643,000' : '$430,500',
      source: 'Calculated from Financial Affidavit',
    }
  }

  if (lowerPrompt.includes('expense') || lowerPrompt.includes('monthly expenses')) {
    return {
      value: party === 'client' ? '$5,200' : '$4,100',
      source: 'Financial Affidavit - Expenses Section',
    }
  }

  // Default if no match
  return {
    value: 'N/A',
    source: 'Not found in documents',
  }
}

export default function FinancialSnapshot({ clientName, oppositionName }: FinancialSnapshotProps) {
  const { snapshotRows, addSnapshotRow, updateSnapshotRow, deleteSnapshotRow } = useStore()
  const [newParameter, setNewParameter] = useState('')
  const [newPrompt, setNewPrompt] = useState('')
  const [isAddingRow, setIsAddingRow] = useState(false)

  const handleAddRow = () => {
    if (!newParameter.trim() || !newPrompt.trim()) return

    // Extract data for both parties
    const clientData = extractFinancialData(newPrompt, 'client')
    const oppositionData = extractFinancialData(newPrompt, 'opposition')

    const newRow: FinancialSnapshotRow = {
      id: Date.now().toString(),
      parameter: newParameter,
      prompt: newPrompt,
      petitionerValue: clientData.value,
      respondentValue: oppositionData.value,
      petitionerSource: clientData.source,
      respondentSource: oppositionData.source,
    }

    addSnapshotRow(newRow)
    setNewParameter('')
    setNewPrompt('')
    setIsAddingRow(false)
  }

  const handleDeleteRow = (rowId: string) => {
    deleteSnapshotRow(rowId)
  }

  const handleExportCSV = () => {
    const headers = ['Parameter', 'Petitioner Value', 'Petitioner Source', 'Respondent Value', 'Respondent Source']
    const rows = snapshotRows.map((row) => [
      row.parameter,
      row.petitionerValue,
      row.petitionerSource || '',
      row.respondentValue,
      row.respondentSource || '',
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Financial_Snapshot_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="bg-white border-b p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Financial Snapshot</h2>
            <p className="text-gray-600">
              Comparative financial analysis between {clientName} and {oppositionName}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportCSV}
              disabled={snapshotRows.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="w-5 h-5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => setIsAddingRow(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add Parameter</span>
            </button>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-1">How it works</h3>
          <p className="text-sm text-blue-800">
            Add financial parameters you want to compare. Enter a descriptive prompt (e.g., "monthly salary", "total
            cash in bank accounts", "real estate value"), and the system will automatically extract and populate
            data from both parties' financial documents and affidavits.
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <AnimatePresence>
          {isAddingRow && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-lg shadow-md border-2 border-blue-500 p-6 mb-4"
            >
              <h3 className="font-semibold text-gray-900 mb-4">Add New Parameter</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parameter Name
                  </label>
                  <input
                    type="text"
                    value={newParameter}
                    onChange={(e) => setNewParameter(e.target.value)}
                    placeholder="e.g., Monthly Income, Total Assets, Cash on Hand"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Prompt (What to extract)
                  </label>
                  <textarea
                    value={newPrompt}
                    onChange={(e) => setNewPrompt(e.target.value)}
                    placeholder="Describe what financial information you want to extract. e.g., 'average monthly salary from last 3 months', 'total balance across all bank accounts', 'current value of primary residence'"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleAddRow}
                    disabled={!newParameter.trim() || !newPrompt.trim()}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <Search className="w-5 h-5" />
                    <span>Extract & Add</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingRow(false)
                      setNewParameter('')
                      setNewPrompt('')
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {snapshotRows.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Parameters Added Yet</h3>
            <p className="text-gray-500 mb-6">
              Start by adding financial parameters you want to compare between both parties
            </p>
            <button
              onClick={() => setIsAddingRow(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add Your First Parameter</span>
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Parameter</th>
                  <th className="px-6 py-4 text-left font-semibold">
                    {clientName}
                    <br />
                    <span className="text-xs font-normal text-gray-300">(Petitioner)</span>
                  </th>
                  <th className="px-6 py-4 text-left font-semibold">
                    {oppositionName}
                    <br />
                    <span className="text-xs font-normal text-gray-300">(Respondent)</span>
                  </th>
                  <th className="px-6 py-4 text-center font-semibold w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {snapshotRows.map((row, index) => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={`border-b hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold text-gray-900">{row.parameter}</div>
                          <div className="text-xs text-gray-500 mt-1">{row.prompt}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-lg font-semibold text-blue-600">{row.petitionerValue}</div>
                          {row.petitionerSource && (
                            <div className="text-xs text-gray-500 mt-1">
                              Source: {row.petitionerSource}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-lg font-semibold text-purple-600">{row.respondentValue}</div>
                          {row.respondentSource && (
                            <div className="text-xs text-gray-500 mt-1">
                              Source: {row.respondentSource}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleDeleteRow(row.id)}
                          className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          title="Delete parameter"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

