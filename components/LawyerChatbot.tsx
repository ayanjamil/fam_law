'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Send, Bot, User, FileText, ExternalLink, ArrowLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import DocumentViewer from './DocumentViewer'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
  citation?: {
    text: string
    documentName: string
    page?: number
    extracted: string
  }
}

export default function LawyerChatbot() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [viewingDocument, setViewingDocument] = useState<{
    name: string
    page?: number
    extracted: string
  } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Welcome message
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      text: "Hello! I'm your legal AI assistant. I can help you find information across all your client's documents, meetings, and case files. Try asking me specific questions about financial information, document contents, or case details.",
      sender: 'bot',
      timestamp: new Date(),
    }
    setMessages([welcomeMessage])
  }, [])

  const handleSend = () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')

    // Simulate bot response with AI-like delay
    setTimeout(() => {
      const botResponse = generateLawyerBotResponse(input)
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse.text,
        sender: 'bot',
        timestamp: new Date(),
        citation: botResponse.citation,
      }
      setMessages((prev) => [...prev, botMessage])
    }, 800)
  }

  const generateLawyerBotResponse = (userInput: string): { text: string; citation?: { text: string; documentName: string; page?: number; extracted: string } } => {
    const lowerInput = userInput.toLowerCase()

    // Balance queries
    if (lowerInput.includes('balance') || lowerInput.includes('account')) {
      if (lowerInput.includes('chase')) {
        if (lowerInput.includes('september') || lowerInput.includes('sept')) {
          return {
            text: "The client's Chase checking account balance in September 2024 was $3,487.52.",
            citation: {
              text: "Chase Bank Statement - September 2024",
              documentName: "Chase Bank Statement - September 2024",
              page: 1,
              extracted: "Ending Balance: $3,487.52 as of September 30, 2024",
            },
          }
        }
        return {
          text: "The client has a Chase checking account. The most recent balance (February 2024) shows $3,200.00. Would you like information about a specific month?",
          citation: {
            text: "Chase Bank Statement - February 2024",
            documentName: "Chase Bank Statement - February 2024",
            page: 1,
            extracted: "Current Balance: $3,200.00 as of February 28, 2024",
          },
        }
      }
      if (lowerInput.includes('hsbc')) {
        return {
          text: "The client's HSBC savings account shows a balance of $12,500.00 as of January 2024.",
          citation: {
            text: "HSBC Savings Statement - January 2024",
            documentName: "HSBC Savings Statement - January 2024",
            page: 1,
            extracted: "Account Balance: $12,500.00 as of January 31, 2024",
          },
        }
      }
      return {
        text: "The client has two main accounts:\n\n1. Chase Checking: $3,200.00 (Feb 2024)\n2. HSBC Savings: $12,500.00 (Jan 2024)\n\nTotal liquid assets: $15,700.00",
        citation: {
          text: "Bank Statements - Chase & HSBC",
          documentName: "Bank Statements Summary",
          extracted: "Chase: $3,200.00 (Feb 2024), HSBC: $12,500.00 (Jan 2024), Total: $15,700.00",
        },
      }
    }

    // Income queries
    if (lowerInput.includes('income') || lowerInput.includes('salary') || lowerInput.includes('pay')) {
      return {
        text: "The client's gross monthly income is $8,500.00 from employment at Tech Solutions Inc. as a Software Engineer. Additional income includes approximately $500 in overtime and $125 in investment interest, bringing total monthly gross income to $9,125.00.",
        citation: {
          text: "Pay Stubs - March & April 2024",
          documentName: "Pay Stub - March 2024",
          page: 1,
          extracted: "Gross Pay: $8,500.00 per month. Overtime: ~$500/month. Tech Solutions Inc.",
        },
      }
    }

    // Employment queries
    if (lowerInput.includes('employer') || lowerInput.includes('work') || lowerInput.includes('job')) {
      return {
        text: "The client is employed as a Software Engineer at Tech Solutions Inc. Current gross monthly salary is $8,500.00.",
        citation: {
          text: "Employment Verification Letter",
          documentName: "Employment Verification - Tech Solutions Inc",
          page: 1,
          extracted: "Employee: John Smith, Position: Software Engineer, Salary: $8,500/month",
        },
      }
    }

    // Expenses queries
    if (lowerInput.includes('expense') || lowerInput.includes('spending')) {
      return {
        text: "The client's total monthly expenses are $5,840.00, broken down as follows:\n\n• Housing: $2,825 (mortgage, taxes, insurance, HOA)\n• Utilities: $490\n• Groceries: $600\n• Transportation: $875 (payment, insurance, gas)\n• Other: $1,050\n\nNet monthly cash flow: $410.00 (Income - Expenses)",
        citation: {
          text: "Bank & Credit Card Statements",
          documentName: "Expense Analysis Report",
          extracted: "3-month average: Housing $2,825, Utilities $490, Groceries $600, Transportation $875, Other $1,050. Total: $5,840",
        },
      }
    }

    // Asset queries
    if (lowerInput.includes('asset') || lowerInput.includes('property') || lowerInput.includes('house') || lowerInput.includes('car')) {
      return {
        text: "The client's total assets are valued at $528,700.00:\n\n• Real Estate (Miami House): $425,000\n• Retirement Accounts (401k): $45,000\n• Bank Accounts: $15,700\n• Automobile: $22,000\n• Furniture & Personal Property: $18,000\n• Life Insurance Cash Value: $2,500\n• Other: $500",
        citation: {
          text: "Property Deed - Miami House",
          documentName: "Property Deed - 123 Ocean Drive",
          page: 1,
          extracted: "Property Value: $425,000. Total Assets including retirement, vehicles, and personal property: $528,700",
        },
      }
    }

    // Debt/liability queries
    if (lowerInput.includes('debt') || lowerInput.includes('owe') || lowerInput.includes('liabilit')) {
      return {
        text: "The client's total liabilities are $307,700.00:\n\n• Mortgage: $285,000\n• Auto Loan: $18,500\n• Credit Card Debt: $4,200\n\nNet Worth: $221,000 (Assets - Liabilities)",
        citation: {
          text: "Mortgage Statement",
          documentName: "Mortgage Statement - Bank of America",
          page: 1,
          extracted: "Principal Balance: $285,000. Auto Loan: $18,500. Credit Cards: $4,200. Total Liabilities: $307,700",
        },
      }
    }

    // Document queries
    if (lowerInput.includes('document') || lowerInput.includes('upload') || lowerInput.includes('file')) {
      return {
        text: "The client has uploaded 7 out of 11 required documents:\n\n✓ Uploaded: Pay Stubs, Bank Statements, Credit Card Bills, Tax Returns, Employment Verification, Property Deeds, Vehicle Titles\n\n⏳ Pending: Asset Documentation, Investment Statements, Loan Documents, Insurance Policies",
        citation: {
          text: "Document Management System",
          documentName: "Document Status Report",
          extracted: "7 of 11 documents uploaded. Last update: Today.",
        },
      }
    }

    // Tax queries
    if (lowerInput.includes('tax')) {
      return {
        text: "The client's 2023 tax return shows:\n\n• Gross Income: $102,000\n• Adjusted Gross Income: $95,000\n• Taxable Income: $78,000\n• Federal Tax Paid: $17,400\n• Effective Tax Rate: 17.1%",
        citation: {
          text: "Federal Tax Return 2023",
          documentName: "Form 1040 - Tax Year 2023",
          page: 1,
          extracted: "Gross Income: $102,000, AGI: $95,000, Tax Paid: $17,400, Effective Rate: 17.1%",
        },
      }
    }

    // Net worth queries
    if (lowerInput.includes('net worth') || lowerInput.includes('financial position')) {
      return {
        text: "The client's current net worth is $221,000.00.\n\nAssets: $528,700\nLiabilities: $307,700\nNet Worth: $221,000\n\nThis represents a strong financial position with significant equity in real estate ($140,000) and retirement savings ($45,000).",
        citation: {
          text: "Financial Affidavit - Complete",
          documentName: "Florida Financial Affidavit",
          extracted: "Net Worth Calculation: Total Assets $528,700 - Total Liabilities $307,700 = $221,000",
        },
      }
    }

    // Meeting/timeline queries
    if (lowerInput.includes('meeting') || lowerInput.includes('appointment') || lowerInput.includes('when')) {
      return {
        text: "Based on case notes:\n\n• Initial Consultation: January 15, 2024\n• Document Collection Started: January 22, 2024\n• Last Document Upload: March 8, 2024\n• Next Scheduled: Financial Affidavit Review (pending completion)\n\nCase Status: Active - Document Collection Phase",
        citation: {
          text: "Case Management System",
          documentName: "Case Timeline & Notes",
          extracted: "Initial: 1/15/24, Doc Collection: 1/22/24, Last Upload: 3/8/24, Status: Active",
        },
      }
    }

    // Default response with helpful examples
    return {
      text: "I can help you find information from the client's documents and case files. Try asking me:\n\n• \"What is the September 2024 balance of the client's Chase account?\"\n• \"What is the client's monthly income?\"\n• \"What assets does the client have?\"\n• \"What documents are still pending?\"\n• \"What is the client's net worth?\"\n• \"Show me the mortgage balance\"\n\nWhat would you like to know?",
      citation: undefined,
    }
  }

  if (viewingDocument) {
    return (
      <div className="h-full flex flex-col bg-gray-50">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
          <button
            onClick={() => setViewingDocument(null)}
            className="flex items-center gap-2 text-white hover:text-blue-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Chat</span>
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <DocumentViewer
            documentName={viewingDocument.name}
            page={viewingDocument.page}
            extractedText={viewingDocument.extracted}
            onReturn={() => setViewingDocument(null)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
        <div className="flex items-center gap-3">
          <Bot className="w-8 h-8" />
          <div>
            <h3 className="text-xl font-semibold">Legal AI Assistant</h3>
            <p className="text-sm text-blue-100">Query client documents and case information</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.sender === 'bot' && (
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <Bot className="w-6 h-6 text-white" />
              </div>
            )}
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
              }`}
            >
              <p className="text-sm whitespace-pre-line">{message.text}</p>
              {message.citation && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <button
                    onClick={() =>
                      setViewingDocument({
                        name: message.citation!.documentName,
                        page: message.citation!.page,
                        extracted: message.citation!.extracted,
                      })
                    }
                    className="flex items-start gap-2 text-left w-full hover:bg-blue-50 p-2 rounded transition-colors group"
                  >
                    <FileText className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-600 italic group-hover:text-blue-700">
                        Source: {message.citation.text}
                        {message.citation.page && ` (Page ${message.citation.page})`}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <ExternalLink className="w-3 h-3 text-blue-500" />
                        <span className="text-xs text-blue-600 group-hover:underline">
                          Click to view document
                        </span>
                      </div>
                    </div>
                  </button>
                </div>
              )}
              <p
                className={`text-xs mt-2 ${
                  message.sender === 'user' ? 'text-blue-100' : 'text-gray-400'
                }`}
              >
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            {message.sender === 'user' && (
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-gray-600" />
              </div>
            )}
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 bg-white border-t">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about client information, documents, or case details..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Try: "What is the September 2024 balance of the client's Chase account?"
        </p>
      </div>
    </div>
  )
}

