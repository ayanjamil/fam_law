'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Folder, File, FolderOpen } from 'lucide-react'
import { OrganizedFolder, OrganizedFile } from '@/lib/types'

interface OrganizeVisualizationProps {
  files: { name: string; type: string }[]
  onOrganize: () => void
  isOrganizing: boolean
  organizedStructure: OrganizedFolder | null
}

export default function OrganizeVisualization({
  files,
  onOrganize,
  isOrganizing,
  organizedStructure,
}: OrganizeVisualizationProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())

  const toggleFolder = (folderName: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev)
      if (next.has(folderName)) {
        next.delete(folderName)
      } else {
        next.add(folderName)
      }
      return next
    })
  }

  const renderOrganizedStructure = (
    node: OrganizedFolder | OrganizedFile,
    depth: number = 0,
    parentPath: string = ''
  ): JSX.Element => {
    const path = `${parentPath}/${node.name}`

    if (node.type === 'file') {
      const fileNode = node as OrganizedFile
      return (
        <motion.div
          key={path}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: depth * 0.1 }}
          className="flex items-center gap-2 py-2 px-4 hover:bg-gray-50 rounded-lg"
          style={{ marginLeft: `${depth * 24}px` }}
        >
          <File className="w-4 h-4 text-blue-500 flex-shrink-0" />
          <span className="text-sm text-gray-700">{fileNode.name}</span>
          <span className="text-xs text-gray-400 ml-auto">
            {fileNode.date?.toLocaleDateString()}
          </span>
        </motion.div>
      )
    }

    const folderNode = node as OrganizedFolder
    const isExpanded = expandedFolders.has(path)

    return (
      <div key={path}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: depth * 0.1 }}
          className="flex items-center gap-2 py-2 px-4 hover:bg-blue-50 rounded-lg cursor-pointer"
          style={{ marginLeft: `${depth * 24}px` }}
          onClick={() => toggleFolder(path)}
        >
          {isExpanded ? (
            <FolderOpen className="w-5 h-5 text-yellow-500 flex-shrink-0" />
          ) : (
            <Folder className="w-5 h-5 text-yellow-500 flex-shrink-0" />
          )}
          <span className="text-sm font-medium text-gray-900">{folderNode.name}</span>
          <span className="text-xs text-gray-400 ml-2">
            ({folderNode.children.length} items)
          </span>
        </motion.div>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {folderNode.children.map((child) =>
                renderOrganizedStructure(child, depth + 1, path)
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Unorganized Files */}
      {!organizedStructure && (
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Files</h3>
          <div className="space-y-2 mb-6">
            {files.map((file, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center gap-3 p-3 bg-white rounded-lg border ${
                  isOrganizing ? 'animate-pulse' : ''
                }`}
              >
                <File className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-700 flex-1">{file.name}</span>
                <span className="text-xs text-gray-400">{file.type}</span>
              </motion.div>
            ))}
          </div>
          <button
            onClick={onOrganize}
            disabled={isOrganizing}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isOrganizing ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Organizing Files...
              </span>
            ) : (
              'Organize Files'
            )}
          </button>
        </div>
      )}

      {/* Organized Structure - Show folders directly without wrapper */}
      {organizedStructure && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl border-2 border-green-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Organized Documents</h3>
            <span className="text-sm text-green-600 font-medium">✓ Organization Complete</span>
          </div>
          <div className="space-y-1">
            {/* Render children directly instead of the wrapper folder */}
            {organizedStructure.children.map((child) =>
              renderOrganizedStructure(child, 0, '')
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}

