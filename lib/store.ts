import { create } from 'zustand'
import { Case, Document, OrganizedFolder, VerificationResult, FinancialSnapshotRow } from './types'

interface AppState {
  cases: Case[]
  currentCaseId: string | null
  setCurrentCase: (caseId: string) => void
  addDocument: (caseId: string, document: Document) => void
  updateDocument: (caseId: string, documentId: string, updates: Partial<Document>) => void
  organizedStructure: OrganizedFolder | null
  setOrganizedStructure: (structure: OrganizedFolder) => void
  setPartyDesignation: (caseId: string, designation: 'petitioner' | 'respondent', oppositionName: string) => void
  addOppositionDocument: (caseId: string, document: Document) => void
  verificationResults: VerificationResult[]
  setVerificationResults: (results: VerificationResult[]) => void
  snapshotRows: FinancialSnapshotRow[]
  addSnapshotRow: (row: FinancialSnapshotRow) => void
  updateSnapshotRow: (rowId: string, updates: Partial<FinancialSnapshotRow>) => void
  deleteSnapshotRow: (rowId: string) => void
}

export const useStore = create<AppState>((set) => ({
  cases: [
    {
      id: 'case-001',
      clientName: 'John Smith',
      caseNumber: 'FL-2024-001',
      status: 'active',
      lastUpdated: new Date(),
      documents: [],
    },
    {
      id: 'case-002',
      clientName: 'Sarah Johnson',
      caseNumber: 'FL-2024-002',
      status: 'active',
      lastUpdated: new Date(),
      documents: [],
    },
    {
      id: 'case-003',
      clientName: 'Michael Davis',
      caseNumber: 'FL-2024-003',
      status: 'pending',
      lastUpdated: new Date(),
      documents: [],
    },
  ],
  currentCaseId: 'case-001',
  setCurrentCase: (caseId) => set({ currentCaseId: caseId }),
  addDocument: (caseId, document) =>
    set((state) => ({
      cases: state.cases.map((c) =>
        c.id === caseId
          ? { ...c, documents: [...c.documents, document], lastUpdated: new Date() }
          : c
      ),
    })),
  updateDocument: (caseId, documentId, updates) =>
    set((state) => ({
      cases: state.cases.map((c) =>
        c.id === caseId
          ? {
              ...c,
              documents: c.documents.map((d) =>
                d.id === documentId ? { ...d, ...updates } : d
              ),
              lastUpdated: new Date(),
            }
          : c
      ),
    })),
  organizedStructure: null,
  setOrganizedStructure: (structure) => set({ organizedStructure: structure }),
  setPartyDesignation: (caseId, designation, oppositionName) =>
    set((state) => ({
      cases: state.cases.map((c) =>
        c.id === caseId
          ? { ...c, partyDesignation: designation, oppositionName, oppositionDocuments: [] }
          : c
      ),
    })),
  addOppositionDocument: (caseId, document) =>
    set((state) => ({
      cases: state.cases.map((c) =>
        c.id === caseId
          ? { 
              ...c, 
              oppositionDocuments: [...(c.oppositionDocuments || []), document],
              lastUpdated: new Date() 
            }
          : c
      ),
    })),
  verificationResults: [],
  setVerificationResults: (results) => set({ verificationResults: results }),
  snapshotRows: [],
  addSnapshotRow: (row) => set((state) => ({ snapshotRows: [...state.snapshotRows, row] })),
  updateSnapshotRow: (rowId, updates) =>
    set((state) => ({
      snapshotRows: state.snapshotRows.map((row) =>
        row.id === rowId ? { ...row, ...updates } : row
      ),
    })),
  deleteSnapshotRow: (rowId) =>
    set((state) => ({
      snapshotRows: state.snapshotRows.filter((row) => row.id !== rowId),
    })),
}))

