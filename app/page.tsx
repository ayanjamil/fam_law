'use client'

import Link from 'next/link'
import { UserCircle, Briefcase } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          FamLaw Portal
        </h1>
        <p className="text-xl text-gray-600 mb-12">
          Family Law Document Management System
        </p>
        
        <div className="flex gap-8 justify-center">
          <Link href="/client" className="group">
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border-2 border-transparent hover:border-blue-500">
              <UserCircle className="w-20 h-20 text-blue-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Client Portal
              </h2>
              <p className="text-gray-600">
                Upload documents and track your case
              </p>
            </div>
          </Link>

          <Link href="/lawyer" className="group">
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border-2 border-transparent hover:border-blue-500">
              <Briefcase className="w-20 h-20 text-blue-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Lawyer Portal
              </h2>
              <p className="text-gray-600">
                Manage cases and organize documents
              </p>
            </div>
          </Link>
        </div>
      </div>
    </main>
  )
}

