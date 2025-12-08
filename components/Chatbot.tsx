'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Send, Bot, User, HelpCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { DocumentType } from '@/lib/types'
import { documentExplanations } from '@/lib/documentRequirements'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
}

interface ChatbotProps {
  isOpen: boolean
  onClose: () => void
  documentType?: DocumentType
}

export default function Chatbot({ isOpen, onClose, documentType }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && documentType) {
      const explanation = documentExplanations[documentType]
      const initialMessage: Message = {
        id: Date.now().toString(),
        text: `${explanation.detailed}\n\nIs there anything specific you'd like to know about this document?`,
        sender: 'bot',
        timestamp: new Date(),
      }
      setMessages([initialMessage])
    } else if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        text: "Hello! I'm here to help you understand the document requirements for your case. Feel free to ask me anything about the documents you need to upload.",
        sender: 'bot',
        timestamp: new Date(),
      }
      setMessages([welcomeMessage])
    }
  }, [isOpen, documentType])

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

    setTimeout(() => {
      const botResponse = generateBotResponse(input, documentType)
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMessage])
    }, 500)
  }

  const generateBotResponse = (userInput: string, docType?: DocumentType): string => {
    const lowerInput = userInput.toLowerCase()

    if (
      lowerInput.includes('necessary') ||
      lowerInput.includes('required') ||
      lowerInput.includes('mandatory') ||
      lowerInput.includes('have to') ||
      lowerInput.includes('must i')
    ) {
      if (docType && documentExplanations[docType]) {
        return documentExplanations[docType].floridaLaw
      }
      return 'Yes, under Florida Family Law Rule 12.285, comprehensive financial disclosure is mandatory in all family law cases involving financial issues such as child support, alimony, or equitable distribution. All parties must provide complete and accurate financial information.'
    }

    if (lowerInput.includes('why')) {
      if (docType && documentExplanations[docType]) {
        return `${documentExplanations[docType].detailed}\n\n${documentExplanations[docType].floridaLaw}`
      }
      return 'Financial disclosure is essential in family law cases to ensure fair and equitable outcomes. The court needs complete financial information to make informed decisions about support, property division, and other financial matters.'
    }

    if (
      lowerInput.includes('how many') ||
      lowerInput.includes('how much') ||
      lowerInput.includes('how long')
    ) {
      if (docType === 'pay_stubs' || docType === 'bank_statements' || docType === 'credit_card_bills') {
        return 'You need to provide the last 3 months of these documents. This gives the court a current picture of your financial situation.'
      }
      if (docType === 'tax_returns') {
        return 'You need to provide the last 2 years of complete tax returns, including all schedules and W-2 forms.'
      }
    }

    if (
      lowerInput.includes('format') ||
      lowerInput.includes('pdf') ||
      lowerInput.includes('scan') ||
      lowerInput.includes('photo')
    ) {
      return 'You can upload documents as PDF files, images (JPEG, PNG), or scanned documents. If you have paper documents, you can take clear photos with your phone and upload them. We\'ll organize everything for you.'
    }

    if (
      lowerInput.includes('secure') ||
      lowerInput.includes('safe') ||
      lowerInput.includes('privacy') ||
      lowerInput.includes('confidential')
    ) {
      return 'Your documents are completely secure and confidential. All uploads are encrypted, and only you and your attorney have access to your files. We comply with all legal privacy requirements.'
    }

    if (
      lowerInput.includes('deadline') ||
      lowerInput.includes('when') ||
      lowerInput.includes('due date')
    ) {
      return 'Please upload your documents as soon as possible. Your attorney will inform you of any court deadlines. The sooner we have all documents, the faster we can prepare your financial affidavit and move forward with your case.'
    }

    if (docType && documentExplanations[docType]) {
      return `${documentExplanations[docType].detailed}\n\nIs there a specific aspect you'd like to know more about?`
    }

    return 'I\'m here to help clarify any questions about your document requirements. Could you please be more specific about what you\'d like to know?'
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 100 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: 100 }}
            className="fixed right-4 top-4 bottom-4 w-96 max-h-[calc(100vh-2rem)] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-6 h-6" />
                <div>
                  <h3 className="font-semibold">Legal Assistant</h3>
                  <p className="text-xs text-blue-100">Always here to help</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:bg-blue-800 rounded-lg p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.sender === 'bot' && (
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">{message.text}</p>
                    <p
                      className={`text-xs mt-1 ${
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
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                  )}
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t bg-white rounded-b-2xl">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask me anything..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                <HelpCircle className="w-3 h-3" />
                <span>Try asking: "Is this necessary?" or "Why do you need this?"</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
