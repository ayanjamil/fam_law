import { FormField, VerificationResult } from './types'
import { FloridaFinancialAffidavit } from './floridaFormFields'

// Mock function to verify form data against documents
// In a real application, this would use AI/ML to extract and compare data
export function verifyFormAgainstDocuments(
  formData: FloridaFinancialAffidavit,
  oppositionName: string
): VerificationResult[] {
  const results: VerificationResult[] = []

  // Helper function to add verification result
  const addResult = (
    field: FormField,
    actualValue: string,
    isAccurate: boolean,
    discrepancyReason?: string
  ) => {
    results.push({
      fieldId: field.id,
      fieldLabel: field.label,
      claimedValue: field.value,
      actualValue,
      isAccurate,
      discrepancyReason,
      source: field.source || {
        document: 'Bank Statement - Chase Checking',
        page: 1,
        extracted: actualValue,
      },
    })
  }

  // Verify Personal Information
  const fullNameField = formData.sections.personalInfo.find((f) => f.id === 'full_name')
  if (fullNameField) {
    addResult(fullNameField, fullNameField.value, true)
  }

  // Verify Income Fields - Simulate some discrepancies
  const salaryField = formData.sections.income.find((f) => f.id === 'monthly_salary')
  if (salaryField && salaryField.value) {
    const claimedAmount = parseFloat(salaryField.value)
    const actualAmount = 7200 // From pay stubs
    const isAccurate = Math.abs(claimedAmount - actualAmount) < 100

    addResult(
      salaryField,
      actualAmount.toString(),
      isAccurate,
      isAccurate
        ? undefined
        : `Claimed amount of $${claimedAmount.toFixed(
            2
          )} does not match the average monthly salary of $${actualAmount.toFixed(
            2
          )} calculated from the last 3 months of pay stubs. The pay stubs show gross monthly earnings of $7,200 (June: $7,150, July: $7,250, August: $7,200), while the affidavit claims $${claimedAmount.toFixed(
            2
          )}. This discrepancy of $${Math.abs(claimedAmount - actualAmount).toFixed(
            2
          )} requires clarification and additional documentation.`
    )
  }

  const bonusField = formData.sections.income.find((f) => f.id === 'bonuses')
  if (bonusField && bonusField.value) {
    const claimedBonus = parseFloat(bonusField.value)
    const actualBonus = 0
    addResult(
      bonusField,
      actualBonus.toString(),
      false,
      `The affidavit claims monthly bonuses of $${claimedBonus.toFixed(
        2
      )}, however, no bonus payments are reflected in the pay stubs provided for the last three months. If bonuses were received, supporting documentation such as bonus payment receipts, W-2 forms showing bonus income, or employer statements are required. The absence of such documentation suggests this figure may be overstated or incorrectly reported.`
    )
  }

  // Verify Asset Values
  const cashField = formData.sections.assets.find((f) => f.id === 'cash_accounts')
  if (cashField && cashField.value) {
    const claimedCash = parseFloat(cashField.value)
    const actualCash = 45000
    const isAccurate = Math.abs(claimedCash - actualCash) < 1000

    addResult(
      cashField,
      actualCash.toString(),
      isAccurate,
      isAccurate
        ? undefined
        : `Bank statements show total cash holdings of $${actualCash.toFixed(
            2
          )} across all accounts as of the most recent statement date (Chase Checking: $15,000, Chase Savings: $22,000, HSBC Checking: $8,000). The affidavit claims $${claimedCash.toFixed(
            2
          )}, representing a discrepancy of $${Math.abs(claimedCash - actualCash).toFixed(
            2
          )}. This variance may indicate unreported accounts, recent transfers, or intentional misrepresentation. Updated statements for all financial institutions are needed to reconcile this difference.`
    )
  }

  const realEstateField = formData.sections.assets.find((f) => f.id === 'real_estate')
  if (realEstateField && realEstateField.value) {
    const claimedValue = parseFloat(realEstateField.value)
    const actualValue = 450000
    const isAccurate = Math.abs(claimedValue - actualValue) < 10000

    addResult(
      realEstateField,
      actualValue.toString(),
      isAccurate,
      isAccurate
        ? undefined
        : `The property deed and recent tax assessment for 123 Ocean Drive, Miami Beach, FL indicate a fair market value of $${actualValue.toFixed(
            2
          )}. The affidavit lists this property at $${claimedValue.toFixed(
            2
          )}, which is ${
            claimedValue < actualValue ? 'significantly undervalued' : 'overvalued'
          } by $${Math.abs(claimedValue - actualValue).toFixed(
            2
          )}. ${
            claimedValue < actualValue
              ? 'This undervaluation may be an attempt to reduce the marital estate value. A current professional appraisal is required.'
              : 'An updated appraisal should be obtained to determine accurate current market value.'
          }`
    )
  }

  // Verify Expenses
  const mortgageField = formData.sections.expenses.find((f) => f.id === 'mortgage_rent')
  if (mortgageField && mortgageField.value) {
    const claimedMortgage = parseFloat(mortgageField.value)
    const actualMortgage = 2500
    const isAccurate = Math.abs(claimedMortgage - actualMortgage) < 50

    addResult(
      mortgageField,
      actualMortgage.toString(),
      isAccurate,
      isAccurate
        ? undefined
        : `The mortgage statement from Bank of America shows a monthly payment of $${actualMortgage.toFixed(
            2
          )}, while the affidavit claims $${claimedMortgage.toFixed(
            2
          )}. This discrepancy of $${Math.abs(claimedMortgage - actualMortgage).toFixed(
            2
          )} needs clarification. ${
            claimedMortgage > actualMortgage
              ? 'Inflating monthly expenses reduces apparent disposable income and may affect support calculations.'
              : 'The lower reported amount may indicate additional undisclosed payments or refinancing.'
          } Current mortgage statements and amortization schedules are needed.`
    )
  }

  // Verify Liabilities
  const creditCardDebtField = formData.sections.liabilities.find((f) => f.id === 'credit_card_debt')
  if (creditCardDebtField && creditCardDebtField.value) {
    const claimedDebt = parseFloat(creditCardDebtField.value)
    const actualDebt = 12000
    const isAccurate = Math.abs(claimedDebt - actualDebt) < 500

    addResult(
      creditCardDebtField,
      actualDebt.toString(),
      isAccurate,
      isAccurate
        ? undefined
        : `Credit card statements reveal outstanding balances totaling $${actualDebt.toFixed(
            2
          )} (Chase Visa: $7,500, AmEx: $4,500), while the affidavit reports $${claimedDebt.toFixed(
            2
          )}. This ${claimedDebt > actualDebt ? 'overstatement' : 'understatement'} of $${Math.abs(
            claimedDebt - actualDebt
          ).toFixed(2)} ${
            claimedDebt > actualDebt
              ? 'may be an attempt to inflate liabilities to reduce net worth'
              : 'suggests unreported credit card accounts or recent debt payoffs that should be disclosed'
          }. Complete statements for all credit cards are required.`
    )
  }

  return results
}

// Generate interrogatories based on discrepancies
export function generateInterrogatories(verificationResults: VerificationResult[]): string {
  const inaccurate = verificationResults.filter((r) => !r.isAccurate)

  if (inaccurate.length === 0) {
    return 'No interrogatories needed - all financial information appears accurate.'
  }

  let interrogatories = `INTERROGATORIES TO ${inaccurate[0]?.fieldLabel.includes('Petitioner') ? 'RESPONDENT' : 'PETITIONER'}\n\n`
  interrogatories += `Pursuant to Florida Family Law Rules of Procedure 12.340, you are required to answer the following interrogatories fully and under oath within 30 days from the date of service.\n\n`
  interrogatories += `DEFINITIONS:\n`
  interrogatories += `"You" or "Your" refers to the party to whom these interrogatories are directed.\n`
  interrogatories += `"Document" includes all writings, records, and electronically stored information.\n\n`
  interrogatories += `INTERROGATORIES:\n\n`

  inaccurate.forEach((result, index) => {
    const number = index + 1

    if (result.fieldLabel.toLowerCase().includes('salary') || result.fieldLabel.toLowerCase().includes('income')) {
      interrogatories += `${number}. Regarding your monthly ${result.fieldLabel.toLowerCase()}, you stated in your Financial Affidavit that this amount is $${parseFloat(
        result.claimedValue
      ).toFixed(2)}. However, documentation provided shows this amount to be $${parseFloat(
        result.actualValue
      ).toFixed(2)}. Please explain in detail:\n`
      interrogatories += `   a. The basis for the figure of $${parseFloat(result.claimedValue).toFixed(
        2
      )} stated in your affidavit;\n`
      interrogatories += `   b. Whether you have received any additional income not disclosed in your affidavit;\n`
      interrogatories += `   c. Provide copies of all pay stubs, W-2 forms, and 1099 forms for the past 12 months; and\n`
      interrogatories += `   d. If your income has changed, explain when and why it changed.\n\n`
    } else if (result.fieldLabel.toLowerCase().includes('cash') || result.fieldLabel.toLowerCase().includes('account')) {
      interrogatories += `${number}. Your Financial Affidavit lists ${result.fieldLabel.toLowerCase()} with a value of $${parseFloat(
        result.claimedValue
      ).toFixed(2)}, but financial records indicate the actual value is $${parseFloat(
        result.actualValue
      ).toFixed(2)}. Please:\n`
      interrogatories += `   a. Identify all bank accounts, including checking, savings, money market, and certificates of deposit, that you currently hold or have held in the past 12 months;\n`
      interrogatories += `   b. For each account identified, provide the financial institution name, account number, current balance, and average balance over the past 12 months;\n`
      interrogatories += `   c. Explain the discrepancy between your stated value and the documented value;\n`
      interrogatories += `   d. Identify any accounts that have been closed in the past 12 months and explain what happened to the funds; and\n`
      interrogatories += `   e. Provide complete account statements for all accounts for the past 12 months.\n\n`
    } else if (result.fieldLabel.toLowerCase().includes('real estate') || result.fieldLabel.toLowerCase().includes('property')) {
      interrogatories += `${number}. Regarding the real estate you listed in your Financial Affidavit with a value of $${parseFloat(
        result.claimedValue
      ).toFixed(2)}, whereas the actual documented value appears to be $${parseFloat(result.actualValue).toFixed(
        2
      )}:\n`
      interrogatories += `   a. Identify the method you used to determine the value stated in your affidavit;\n`
      interrogatories += `   b. State whether you obtained a professional appraisal and, if so, provide a copy;\n`
      interrogatories += `   c. If you did not obtain a professional appraisal, explain the basis for your valuation;\n`
      interrogatories += `   d. Identify all real property you own or have an interest in, including the address, percentage of ownership, date acquired, purchase price, current value, and outstanding mortgage balance;\n`
      interrogatories += `   e. Provide copies of all deeds, mortgages, and recent property tax assessments; and\n`
      interrogatories += `   f. Explain any discrepancy between your stated value and documented valuations.\n\n`
    } else if (result.fieldLabel.toLowerCase().includes('debt') || result.fieldLabel.toLowerCase().includes('liability')) {
      interrogatories += `${number}. Your Financial Affidavit states ${result.fieldLabel.toLowerCase()} in the amount of $${parseFloat(
        result.claimedValue
      ).toFixed(2)}, but documentation shows the amount is $${parseFloat(result.actualValue).toFixed(
        2
      )}. Please explain:\n`
      interrogatories += `   a. The basis for the amount stated in your affidavit;\n`
      interrogatories += `   b. Identify all credit cards, loans, and debts you currently owe, including the creditor name, account number, current balance, monthly payment, and purpose of the debt;\n`
      interrogatories += `   c. For each debt identified, state when it was incurred and for what purpose;\n`
      interrogatories += `   d. Explain the discrepancy between your stated amount and the documented amount;\n`
      interrogatories += `   e. Identify any debts that have been paid off in the past 12 months and explain the source of funds used to pay them; and\n`
      interrogatories += `   f. Provide complete statements for all credit cards and loans for the past 12 months.\n\n`
    } else if (result.fieldLabel.toLowerCase().includes('expense')) {
      interrogatories += `${number}. You claim monthly ${result.fieldLabel.toLowerCase()} of $${parseFloat(
        result.claimedValue
      ).toFixed(2)}, but documentation suggests the actual amount is $${parseFloat(result.actualValue).toFixed(
        2
      )}. Please:\n`
      interrogatories += `   a. Explain in detail how you calculated the amount stated in your affidavit;\n`
      interrogatories += `   b. Provide documentation supporting your claimed expense amount;\n`
      interrogatories += `   c. Explain any discrepancy between your stated amount and documented amounts;\n`
      interrogatories += `   d. State whether this expense has changed in the past 12 months and, if so, explain the change; and\n`
      interrogatories += `   e. Provide receipts, bills, or statements evidencing this expense for the past 6 months.\n\n`
    } else {
      interrogatories += `${number}. Regarding the discrepancy in ${result.fieldLabel} (claimed: $${parseFloat(
        result.claimedValue
      ).toFixed(2)}, actual: $${parseFloat(result.actualValue).toFixed(2)}), please:\n`
      interrogatories += `   a. Explain the basis for the value stated in your Financial Affidavit;\n`
      interrogatories += `   b. Explain the discrepancy between your stated value and the documented value;\n`
      interrogatories += `   c. Provide all documentation supporting your claimed value; and\n`
      interrogatories += `   d. If the discrepancy is due to a change in circumstances, explain when and why the change occurred.\n\n`
    }
  })

  interrogatories += `\nThese interrogatories are continuing in nature and require supplemental answers if you obtain additional information before trial.\n\n`
  interrogatories += `DATED this _____ day of _____________, 20____.\n\n`
  interrogatories += `_________________________________\n`
  interrogatories += `Attorney for ${inaccurate[0]?.fieldLabel.includes('Respondent') ? 'Petitioner' : 'Respondent'}\n`
  interrogatories += `Florida Bar No. ______________\n`

  return interrogatories
}

// Generate request for production of documents
export function generateProductionRequest(verificationResults: VerificationResult[]): string {
  const inaccurate = verificationResults.filter((r) => !r.isAccurate)

  if (inaccurate.length === 0) {
    return 'No additional document requests needed - all financial information appears accurate.'
  }

  let request = `REQUEST FOR PRODUCTION OF DOCUMENTS TO ${inaccurate[0]?.fieldLabel.includes('Petitioner') ? 'RESPONDENT' : 'PETITIONER'}\n\n`
  request += `Pursuant to Florida Family Law Rules of Procedure 12.350, you are required to produce the following documents within 30 days from the date of service. Documents should be produced as they are kept in the usual course of business or organized and labeled to correspond to the categories in this request.\n\n`
  request += `DEFINITIONS:\n`
  request += `"Document" means any written, recorded, or graphic matter, including electronically stored information.\n`
  request += `"You" or "Your" refers to the party to whom this request is directed.\n\n`
  request += `REQUESTS FOR PRODUCTION:\n\n`

  let requestNumber = 1

  inaccurate.forEach((result) => {
    if (result.fieldLabel.toLowerCase().includes('salary') || result.fieldLabel.toLowerCase().includes('income')) {
      request += `${requestNumber}. All pay stubs, wage statements, and earning records for the past 12 months.\n\n`
      requestNumber++
      request += `${requestNumber}. All W-2 forms, 1099 forms, and other tax documents showing income for the past three years.\n\n`
      requestNumber++
      request += `${requestNumber}. All employment contracts, offer letters, and documents showing your compensation, benefits, bonuses, stock options, or other forms of remuneration.\n\n`
      requestNumber++
    }

    if (result.fieldLabel.toLowerCase().includes('bonus')) {
      request += `${requestNumber}. All documents relating to bonuses, commissions, or other variable compensation received in the past three years, including bonus statements, commission schedules, and payment records.\n\n`
      requestNumber++
    }

    if (result.fieldLabel.toLowerCase().includes('cash') || result.fieldLabel.toLowerCase().includes('account')) {
      request += `${requestNumber}. Complete account statements for all checking, savings, money market, and certificate of deposit accounts for the past 12 months, including accounts that have been closed during this period.\n\n`
      requestNumber++
      request += `${requestNumber}. All documents showing wire transfers, electronic transfers, or checks exceeding $1,000 made or received in the past 12 months.\n\n`
      requestNumber++
      request += `${requestNumber}. All documents identifying any safe deposit boxes you maintain or have maintained in the past 12 months, including access logs and inventories of contents.\n\n`
      requestNumber++
    }

    if (result.fieldLabel.toLowerCase().includes('real estate') || result.fieldLabel.toLowerCase().includes('property')) {
      request += `${requestNumber}. All deeds, titles, and closing documents for any real property you own or have an interest in.\n\n`
      requestNumber++
      request += `${requestNumber}. All professional appraisals of real property obtained in the past three years.\n\n`
      requestNumber++
      request += `${requestNumber}. All property tax assessments and bills for the past three years.\n\n`
      requestNumber++
      request += `${requestNumber}. All mortgage statements, promissory notes, and loan documents for any real property.\n\n`
      requestNumber++
    }

    if (result.fieldLabel.toLowerCase().includes('debt') || result.fieldLabel.toLowerCase().includes('credit')) {
      request += `${requestNumber}. Complete credit card statements for all accounts for the past 12 months, including accounts that have been closed during this period.\n\n`
      requestNumber++
      request += `${requestNumber}. All loan documents, promissory notes, and account statements for any personal loans, student loans, or other debt obligations.\n\n`
      requestNumber++
      request += `${requestNumber}. All credit reports obtained within the past 12 months, and authorization to obtain a current credit report.\n\n`
      requestNumber++
    }

    if (result.fieldLabel.toLowerCase().includes('expense') || result.fieldLabel.toLowerCase().includes('mortgage')) {
      request += `${requestNumber}. All bills, receipts, and statements documenting monthly living expenses for the past six months.\n\n`
      requestNumber++
    }
  })

  // Add standard requests
  request += `${requestNumber}. All federal and state income tax returns, including all schedules and attachments, for the past three years.\n\n`
  requestNumber++
  request += `${requestNumber}. All documents relating to any business entities in which you have an ownership interest, including partnership agreements, corporate bylaws, operating agreements, and financial statements.\n\n`
  requestNumber++
  request += `${requestNumber}. All documents relating to retirement accounts, pension plans, 401(k) accounts, IRA accounts, or other retirement savings, including account statements for the past 12 months.\n\n`
  requestNumber++
  request += `${requestNumber}. All insurance policies, including life, health, disability, and property insurance, showing coverage amounts, beneficiaries, and cash values.\n\n`
  requestNumber++

  request += `\nPlease produce these documents by delivering copies to the undersigned at [address] or by making them available for inspection and copying at a mutually agreeable time and location.\n\n`
  request += `DATED this _____ day of _____________, 20____.\n\n`
  request += `_________________________________\n`
  request += `Attorney for ${inaccurate[0]?.fieldLabel.includes('Respondent') ? 'Petitioner' : 'Respondent'}\n`
  request += `Florida Bar No. ______________\n`

  return request
}

