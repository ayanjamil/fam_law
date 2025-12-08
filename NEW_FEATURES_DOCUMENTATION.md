# New Features Documentation

## Overview

Three major features have been added to the FamLaw Portal to enhance the lawyer's ability to verify opposition financial disclosures, generate legal documents, and compare financial data between parties.

---

## Feature 1: Opposition Party Verification

### Purpose
Verify the accuracy of the opposing party's financial affidavit by comparing their claimed values against source documents.

### How to Use

1. **Set Party Designation**
   - When opening a case for the first time, you'll see a modal
   - Select whether your client is the **Petitioner** or **Respondent**
   - This sets up the opposition party automatically

2. **Access Opposition Tab**
   - Click the "Opposition" tab in the lawyer portal
   - You'll see a dual-pane interface

3. **Run Verification**
   - Click "Verify Financial Affidavit" button
   - The system automatically compares opposition's claimed values with documents
   - Results appear in real-time

4. **Review Results**
   - **Left Pane**: Checklist-style verification interface
     - ✅ Green highlights = Accurate fields
     - ❌ Red highlights = Discrepancies found
     - Detailed discrepancy analysis provided
     - Click "View Source" to see the source document
   - **Right Pane**: Opposition's financial affidavit PDF

5. **View Source Documents**
   - Click "View Source" on any field
   - Document opens in right pane at exact location
   - Click "Return to Form" to go back

### What Gets Verified

The system checks:
- Monthly income (salary, bonuses, other income)
- Cash in bank accounts
- Real estate values
- Monthly expenses (mortgage, utilities, etc.)
- Liabilities (credit card debt, loans)
- Asset values (vehicles, investments, etc.)

### Discrepancy Analysis

When inaccuracies are found, the system provides:
- Exact claimed vs. actual amounts
- Percentage difference
- Source of the actual data
- Detailed explanation of the discrepancy
- Legal implications (e.g., "undervaluation of assets")
- What additional documentation is needed

---

## Feature 2: Legal Documents Generation

### Purpose
Automatically generate professional legal documents (Interrogatories and Requests for Production) based on discrepancies found during verification.

### How to Use

1. **After Verification**
   - Complete the opposition verification first
   - If discrepancies are found, click "Generate Legal Documents"

2. **Document Types Available**
   - **Interrogatories**: Written questions the opposition must answer under oath
   - **Request for Production**: Formal requests for specific documents

3. **Review Documents**
   - Switch between tabs to view each document type
   - Documents are professionally formatted per Florida law
   - Each question/request is numbered and specific to the discrepancies

4. **Export Documents**
   - **Copy to Clipboard**: Quick copy for pasting into your word processor
   - **Download**: Save as .txt file with proper naming

### What's Generated

**Interrogatories Include:**
- Specific questions about each discrepancy
- Requests for explanation of claimed values
- Demands for supporting documentation
- Follow-up questions about unreported accounts/assets
- Florida Family Law Rule 12.340 formatting

**Request for Production Include:**
- Specific document requests tied to discrepancies
- Bank statements for all accounts
- Property appraisals and tax assessments
- Pay stubs and employment records
- Credit reports and loan documents
- Florida Family Law Rule 12.350 formatting

### Example Discrepancy → Generated Documents

**Discrepancy Found:**
- Client claims: $50,000 in cash accounts
- Documents show: $45,000 in cash accounts
- Difference: $5,000

**Generated Interrogatory:**
> "Your Financial Affidavit lists cash accounts with a value of $50,000.00, but financial records indicate the actual value is $45,000.00. Please:
> a. Identify all bank accounts you currently hold or have held in the past 12 months;
> b. Explain the discrepancy between your stated value and the documented value;
> c. Identify any accounts that have been closed in the past 12 months..."

**Generated Request for Production:**
> "Complete account statements for all checking, savings, money market, and certificate of deposit accounts for the past 12 months, including accounts that have been closed during this period."

---

## Feature 3: Financial Snapshot

### Purpose
Create a customizable comparative financial analysis between your client (Petitioner) and the opposition (Respondent).

### How to Use

1. **Access Financial Snapshot Tab**
   - Click "Financial Snapshot" in the lawyer portal
   - You'll see a table comparing both parties

2. **Add Parameters**
   - Click "Add Parameter" button
   - Enter a **Parameter Name** (e.g., "Monthly Income", "Total Assets")
   - Enter a **Search Prompt** describing what to extract:
     - "average monthly salary from last 3 months"
     - "total balance across all bank accounts"
     - "current value of primary residence"
     - "total credit card debt"

3. **Auto-Extraction**
   - Click "Extract & Add"
   - System automatically finds and populates:
     - Petitioner's value
     - Respondent's value
     - Source documents for each value

4. **Review & Compare**
   - View side-by-side comparison in table format
   - Each row shows:
     - Parameter name and description
     - Petitioner's value with source citation
     - Respondent's value with source citation

5. **Export Data**
   - Click "Export CSV" to download the comparison table
   - Perfect for spreadsheet analysis or court exhibits

### Example Use Cases

**Income Comparison:**
- Parameter: "Monthly Income"
- Prompt: "monthly salary or wages"
- Result: Extracts average monthly income from pay stubs for both parties

**Asset Comparison:**
- Parameter: "Real Estate Value"
- Prompt: "value of primary residence or real estate property"
- Result: Extracts property values from deeds and tax assessments

**Debt Comparison:**
- Parameter: "Credit Card Debt"
- Prompt: "total outstanding credit card balances"
- Result: Sums all credit card debt from statements

**Net Worth Calculation:**
- Parameter: "Net Worth"
- Prompt: "net worth or total assets minus total liabilities"
- Result: Calculates from financial affidavit

### Supported Data Points

The system can extract:
- Income (salary, bonuses, commissions)
- Bank account balances (checking, savings, total cash)
- Real estate values
- Vehicle values
- Retirement account balances (401k, IRA)
- Debt (credit cards, loans, mortgages)
- Monthly expenses
- Net worth calculations

---

## Technical Implementation

### New Files Created

1. **`lib/verificationService.ts`**
   - `verifyFormAgainstDocuments()`: Compares form data with documents
   - `generateInterrogatories()`: Creates interrogatories from discrepancies
   - `generateProductionRequest()`: Creates document production requests

2. **`components/OppositionVerification.tsx`**
   - Dual-pane verification interface
   - Checklist with green/red highlighting
   - Document viewer integration

3. **`components/LegalDocumentsGenerator.tsx`**
   - Modal for viewing generated documents
   - Tab interface for interrogatories vs. production requests
   - Copy and download functionality

4. **`components/FinancialSnapshot.tsx`**
   - Dynamic row management
   - Auto-extraction logic
   - CSV export functionality

### New Types Added

```typescript
interface VerificationResult {
  fieldId: string
  fieldLabel: string
  claimedValue: string
  actualValue: string
  isAccurate: boolean
  discrepancyReason?: string
  source: { document: string; page?: number; extracted: string }
}

interface FinancialSnapshotRow {
  id: string
  parameter: string
  prompt: string
  petitionerValue: string
  respondentValue: string
  petitionerSource?: string
  respondentSource?: string
}

interface Interrogatory {
  id: string
  number: number
  question: string
  basedOnField: string
  discrepancy: string
}

interface ProductionRequest {
  id: string
  number: number
  description: string
  basedOnField: string
  reason: string
}
```

### Store Updates

New state management:
- `partyDesignation`: Track if client is petitioner or respondent
- `oppositionName`: Name of opposing party
- `verificationResults`: Store verification outcomes
- `snapshotRows`: Store financial snapshot parameters

---

## User Interface Flow

### 1. First Time Opening a Case

```
Open Case → Party Designation Modal Appears
           ↓
Select "Petitioner" or "Respondent"
           ↓
Portal Opens with New Tabs Available
```

### 2. Verifying Opposition

```
Opposition Tab → Click "Verify Financial Affidavit"
                ↓
         System Analyzes Documents
                ↓
         Results Display (Green/Red)
                ↓
         Click "Generate Legal Documents"
                ↓
         Review Interrogatories & Production Requests
                ↓
         Copy or Download
```

### 3. Creating Financial Snapshot

```
Financial Snapshot Tab → Click "Add Parameter"
                        ↓
                 Enter Name & Prompt
                        ↓
                 Click "Extract & Add"
                        ↓
                 System Auto-Populates Both Parties
                        ↓
                 Repeat for More Parameters
                        ↓
                 Click "Export CSV" When Done
```

---

## Best Practices

### For Verification

1. **Review All Discrepancies**: Don't skip over small differences; they may indicate larger issues
2. **Check Sources**: Always view source documents to confirm accuracy
3. **Document Everything**: Use the generated legal documents as a starting point
4. **Update Regularly**: Re-verify if new documents are submitted

### For Financial Snapshot

1. **Be Specific**: Use detailed prompts for better extraction accuracy
2. **Start Broad**: Begin with major categories (income, assets, debts)
3. **Then Go Granular**: Add specific rows for important details
4. **Export Often**: Keep CSV backups of your snapshots
5. **Use in Court**: The comparative table is excellent for visual presentation

### For Legal Documents

1. **Customize**: The generated documents are templates; review and modify as needed
2. **Add Context**: Consider adding case-specific questions
3. **Coordinate with Discovery**: Align with your overall discovery strategy
4. **Follow Local Rules**: Ensure compliance with local court rules
5. **Track Responses**: Monitor opposition's responses to your interrogatories

---

## Limitations & Future Enhancements

### Current Limitations

1. **Verification Logic**: Currently uses mock data extraction; will need AI/ML integration for real document parsing
2. **Document Types**: Currently supports common document types; may need expansion
3. **Legal Templates**: Generated documents follow standard Florida format; may need customization for specific jurisdictions

### Potential Future Enhancements

1. AI-powered document analysis
2. Automatic calculation of support obligations
3. Asset distribution recommendations
4. Integration with court filing systems
5. Timeline visualization of financial changes
6. Red flag detection (e.g., suspicious transfers)

---

## Troubleshooting

### Party Designation Modal Won't Close
- Make sure you clicked one of the two buttons
- Refresh the page if needed
- Check that case has `partyDesignation` set in store

### Verification Shows No Results
- Ensure opposition documents are uploaded
- Check that form fields have values
- Verify document types are recognized

### Financial Snapshot Not Extracting Data
- Make prompts more specific
- Use keywords that match document content
- Check that documents are properly categorized

### Legal Documents Not Generating
- Ensure verification found discrepancies
- Check that verificationResults array has inaccurate items
- Try re-running verification

---

## Support

For issues or questions:
1. Check the console for error messages
2. Verify all required documents are uploaded
3. Ensure party designation is set
4. Review the UPDATES.md file for recent changes

---

## Summary

These three features work together to provide a comprehensive opposition analysis workflow:

1. **Verify** their financial affidavit against documents
2. **Generate** legal documents to address discrepancies  
3. **Compare** financial data side-by-side for court presentation

This streamlines the discovery process and helps ensure complete financial disclosure in family law cases.

