# FamLaw Portal - Family Law Document Management System

A comprehensive portal system for family lawyers and their clients to manage legal documents, organize files, and auto-populate Florida financial disclosure forms.

## Features

### Client Portal
- Document checklist with visual progress tracking
- Smart upload system with automatic status tracking
- AI Chatbot with Florida law citations
- Three tabs: Intake, Mandatory Disclosures, Additional Documents

### Lawyer Portal
- **Snapshot**: Pie chart visualization, document statistics, auto-reminder system
- **Documents**: View uploaded files, visual organization with folder animations
- **Forms**: Auto-populate Florida Financial Affidavit with source citations
- **AI Assistant**: Query client financial information with citations

### Form Population
- Dual-pane interface (editable fields left, PDF preview right)
- 78 form fields across 6 sections
- Auto-population from uploaded documents
- Source citation for each populated field
- Real PDF rendering with actual Florida form
- Download filled PDF

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- Zustand
- pdf-lib & react-pdf

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Structure

- `/app` - Next.js pages and routes
- `/components` - Reusable React components
- `/lib` - Data, types, utilities, PDF generation
- `/public` - Static assets including PDF form

## Key Features

✅ Client document upload with progress tracking  
✅ Lawyer case management with 4 main sections  
✅ Visual document organization with animations  
✅ Florida Financial Affidavit auto-population  
✅ Real PDF form integration  
✅ AI chatbots for both client and lawyer  
✅ Source citations for all populated data  

## Documentation

- `QUICKSTART.md` - Setup and demo guide
- `FEATURES_CHECKLIST.md` - Complete feature list
- `PROJECT_SUMMARY.md` - Technical overview
- `UPDATES.md` - Recent changes and improvements
- `PDF_INTEGRATION.md` - PDF implementation details

Enjoy FamLaw Portal! 🎉

