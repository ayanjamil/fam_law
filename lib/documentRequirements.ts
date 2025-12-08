import { Document, DocumentType } from './types'

export const requiredDocuments: Omit<Document, 'id' | 'uploaded' | 'file' | 'uploadedAt'>[] = [
  {
    name: 'Pay Stubs',
    type: 'pay_stubs',
    description: 'Last 3 months of pay stubs from all sources of employment',
  },
  {
    name: 'Bank Statements',
    type: 'bank_statements',
    description: 'Last 3 months of statements from all checking and savings accounts',
  },
  {
    name: 'Credit Card Statements',
    type: 'credit_card_bills',
    description: 'Last 3 months of credit card statements for all accounts',
  },
  {
    name: 'Tax Returns',
    type: 'tax_returns',
    description: 'Last 2 years of complete federal and state tax returns with all schedules',
  },
  {
    name: 'Employment Verification',
    type: 'employment_verification',
    description: 'Letter from employer verifying employment status and income',
  },
  {
    name: 'Asset Documentation',
    type: 'asset_documentation',
    description: 'Documentation of all assets including real estate, vehicles, investments, etc.',
  },
  {
    name: 'Property Deeds',
    type: 'property_deeds',
    description: 'Deeds and titles for all real property owned',
  },
  {
    name: 'Vehicle Titles',
    type: 'vehicle_titles',
    description: 'Titles and registration for all vehicles owned',
  },
  {
    name: 'Investment Statements',
    type: 'investment_statements',
    description: 'Statements for all investment accounts, retirement accounts, stocks, bonds, etc.',
  },
  {
    name: 'Loan Documents',
    type: 'loan_documents',
    description: 'Documentation for all outstanding loans including mortgages, car loans, personal loans',
  },
  {
    name: 'Insurance Policies',
    type: 'insurance_policies',
    description: 'Current insurance policies including life, health, auto, and property insurance',
  },
]

export const documentExplanations: Record<DocumentType, { short: string; detailed: string; floridaLaw: string }> = {
  pay_stubs: {
    short: 'Pay stubs show your regular income from employment',
    detailed: 'We need your last 3 months of pay stubs to verify your current income. These should show your gross pay, deductions, and net pay. If you have multiple jobs, please provide pay stubs from all sources.',
    floridaLaw: 'Under Florida Family Law Rule 12.285, pay stubs for the past 3 months are mandatory for financial disclosure to establish current income levels for child support, alimony, and equitable distribution calculations.',
  },
  bank_statements: {
    short: 'Bank statements show your account balances and transactions',
    detailed: 'Please provide the last 3 months of statements from all your checking and savings accounts. These help establish your financial position and track income and expenses.',
    floridaLaw: 'Under Florida Statute 61.075, bank statements are mandatory for financial disclosure to verify assets, income deposits, and establish spending patterns for support calculations.',
  },
  credit_card_bills: {
    short: 'Credit card statements show your debts and spending',
    detailed: 'We need statements from all credit cards for the past 3 months. This helps establish your liabilities and monthly expenses.',
    floridaLaw: 'Under Florida law, credit card statements are required as part of mandatory financial disclosure under Rule 12.285 to establish marital debts and monthly expense obligations.',
  },
  tax_returns: {
    short: 'Tax returns provide comprehensive income information',
    detailed: 'Please provide complete federal and state tax returns for the past 2 years, including all schedules and W-2s. These provide the most comprehensive view of your income.',
    floridaLaw: 'Under Florida Family Law Rule 12.285(c), tax returns for the past 2 years are mandatory disclosure documents required to verify income for support and equitable distribution purposes.',
  },
  employment_verification: {
    short: 'Verification letter confirms your current employment',
    detailed: 'A letter from your employer on company letterhead confirming your position, employment dates, and salary helps verify current employment status.',
    floridaLaw: 'Under Florida law, employment verification is required as part of mandatory financial disclosure to confirm current income sources and employment stability for support calculations.',
  },
  asset_documentation: {
    short: 'Documents proving ownership of valuable assets',
    detailed: 'Please provide documentation for all significant assets including appraisals, account statements, and ownership documents.',
    floridaLaw: 'Under Florida Statute 61.075, documentation of all marital and non-marital assets is mandatory for equitable distribution. This includes real estate, vehicles, investments, and personal property valued over $500.',
  },
  property_deeds: {
    short: 'Legal documents showing property ownership',
    detailed: 'Provide deeds for all real estate you own or have an interest in, including primary residence, investment properties, and vacant land.',
    floridaLaw: 'Under Florida law, property deeds are mandatory disclosure documents required to identify all real property interests for equitable distribution of marital assets per Statute 61.075.',
  },
  vehicle_titles: {
    short: 'Documents showing vehicle ownership',
    detailed: 'Please provide titles and current registration for all vehicles you own including cars, motorcycles, boats, and RVs.',
    floridaLaw: 'Under Florida Family Law Rule 12.285, vehicle titles are required disclosure to identify and value all marital assets subject to equitable distribution.',
  },
  investment_statements: {
    short: 'Statements from investment and retirement accounts',
    detailed: 'Provide current statements for all investment accounts, 401(k)s, IRAs, stocks, bonds, and other securities.',
    floridaLaw: 'Under Florida Statute 61.075, investment and retirement account statements are mandatory for financial disclosure to identify and value all marital assets subject to equitable distribution and QDRO preparation.',
  },
  loan_documents: {
    short: 'Documents for all outstanding loans and debts',
    detailed: 'Please provide documentation for all loans including mortgages, car loans, student loans, and personal loans showing current balances and payment terms.',
    floridaLaw: 'Under Florida law, loan documentation is required as part of mandatory financial disclosure to identify all marital liabilities for equitable distribution per Statute 61.075.',
  },
  insurance_policies: {
    short: 'Current insurance policy documents',
    detailed: 'Provide current policies for life, health, auto, and property insurance showing coverage amounts and beneficiaries.',
    floridaLaw: 'Under Florida Family Law Rule 12.285, insurance policies are required disclosure documents, particularly life insurance which may be required for support obligations and beneficiary designations.',
  },
  other: {
    short: 'Additional supporting documentation',
    detailed: 'Any other documents relevant to your financial situation.',
    floridaLaw: 'Additional documentation may be required under Florida discovery rules to fully comply with mandatory financial disclosure requirements.',
  },
}
