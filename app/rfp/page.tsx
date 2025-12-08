'use client';

import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const DynamicPdfViewer = dynamic(() => import('@/components/rfp/PdfViewer'), {
    ssr: false,
    loading: () => <div className="text-center p-4">Loading PDF Viewer...</div>
});

export default function RFPPage() {

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm z-10">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">RFP Viewer</h1>
                    <p className="text-sm text-gray-500">Review the Request for Production document</p>
                </div>
                <Link
                    href="/rfp-response-generator"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors shadow-sm flex items-center gap-2"
                >
                    <span>Open Response Generator</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                </Link>
            </div>

            <div className="flex-1 overflow-auto p-8 flex justify-center">
                <div className="bg-white shadow-lg p-4 rounded-lg min-h-[800px]">
                    <div className="flex-1 overflow-auto p-8 flex justify-center">
                        <div className="bg-white shadow-lg p-4 rounded-lg min-h-[800px]">
                            <DynamicPdfViewer url="/rfp.pdf" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
