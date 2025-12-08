export interface Document {
  id: string
  name: string
  type: DocumentType
  uploaded: boolean
  file?: File
  uploadedAt?: Date
  description: string
}

export type DocumentType =
  | 'pay_stubs'
  | 'bank_statements'
  | 'credit_card_bills'
  | 'tax_returns'
  | 'employment_verification'
  | 'asset_documentation'
  | 'property_deeds'
  | 'vehicle_titles'
  | 'investment_statements'
  | 'loan_documents'
  | 'insurance_policies'
  | 'other'

export interface Case {
  id: string
  clientName: string
  caseNumber: string
  status: 'active' | 'pending' | 'closed'
  documents: Document[]
  lastUpdated: Date
  partyDesignation?: 'petitioner' | 'respondent'
  oppositionName?: string
  oppositionDocuments?: Document[]
}

export interface OrganizedFolder {
  name: string
  type: 'folder'
  children: (OrganizedFolder | OrganizedFile)[]
}

export interface OrganizedFile {
  name: string
  type: 'file'
  originalName: string
  documentType: DocumentType
  date?: Date
}

export interface FormField {
  id: string
  label: string
  value: string
  type: 'text' | 'number' | 'date' | 'checkbox' | 'textarea'
  source?: {
    document: string
    page?: number
    extracted: string
  }
}

export interface FloridaFinancialForm {
  sections: {
    personalInfo: FormField[]
    income: FormField[]
    expenses: FormField[]
    assets: FormField[]
    liabilities: FormField[]
  }
}

export interface VerificationResult {
  fieldId: string
  fieldLabel: string
  claimedValue: string
  actualValue: string
  isAccurate: boolean
  discrepancyReason?: string
  source: {
    document: string
    page?: number
    extracted: string
  }
}

export interface FinancialSnapshotRow {
  id: string
  parameter: string
  prompt: string
  petitionerValue: string
  respondentValue: string
  petitionerSource?: string
  respondentSource?: string
}

export interface Interrogatory {
  id: string
  number: number
  question: string
  basedOnField: string
  discrepancy: string
}

export interface ProductionRequest {
  id: string
  number: number
  description: string
  basedOnField: string
  reason: string
}

