'use client';

import React, { useState, useEffect } from 'react';

interface RequestItem {
    id: number;
    text: string;
    response: string;
    documentsProduced: string;
    toggles: {
        overlyBroad: boolean;
        undulyBurdensome: boolean;
        notProportional: boolean;
        vague: boolean;
        outsideControl: boolean;
        irrelevant: boolean;
        confidentiality: boolean;
    };
}

const OBJECTIONS = {
    overlyBroad: "Respondent objects that this request is overly broad in time and scope.",
    undulyBurdensome: "Respondent objects that this request is unduly burdensome.",
    notProportional: "Respondent objects that this request is not proportional to the needs of the case.",
    vague: "Respondent objects that this request is vague or ambiguous.",
    outsideControl: "Respondent objects that this request seeks documents not in Respondent’s possession, custody, or control.",
    irrelevant: "Respondent objects that this request seeks information that is not relevant to the issues in this matter.",
    confidentiality: "Respondent objects on grounds of confidentiality and privacy."
};

const STANDARD_RESPONSE = "Respondent will produce non-privileged documents in Respondent’s possession, custody, or control that are responsive to this request.";

export default function ResponseGeneratorPage() {
    const [requests, setRequests] = useState<RequestItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadPdf() {
            try {
                // Dynamically import react-pdf to avoid SSR issues with DOMMatrix
                const { pdfjs } = await import('react-pdf');
                pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

                const loadingTask = pdfjs.getDocument('/rfp.pdf');
                const pdf = await loadingTask.promise;
                let fullText = '';

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map((item: any) => item.str).join(' ');
                    fullText += pageText + ' ';
                }

                // Parse requests
                // Regex to find "REQUEST NO. X" or "REQUEST FOR PRODUCTION NO. X"
                // and capture the text until the next request or end of file
                const requestRegex = /(REQUEST (?:FOR PRODUCTION )?NO\. \d+)([\s\S]*?)(?=REQUEST (?:FOR PRODUCTION )?NO\. \d+|$)/gi;

                const parsedRequests: RequestItem[] = [];
                let match;
                let idCounter = 1;

                while ((match = requestRegex.exec(fullText)) !== null) {
                    const title = match[1].trim();
                    const body = match[2].trim();

                    // Heuristic for documents produced
                    let docPrefix = 'document';
                    const lowerBody = body.toLowerCase();
                    if (lowerBody.includes('bank')) docPrefix = 'bank_statement';
                    else if (lowerBody.includes('tax')) docPrefix = 'tax_return';
                    else if (lowerBody.includes('pay') || lowerBody.includes('income')) docPrefix = 'paystub';
                    else if (lowerBody.includes('credit card')) docPrefix = 'cc_statement';
                    else if (lowerBody.includes('investment') || lowerBody.includes('brokerage')) docPrefix = 'investment_stmt';
                    else if (lowerBody.includes('mortgage')) docPrefix = 'mortgage_stmt';
                    else if (lowerBody.includes('insurance')) docPrefix = 'insurance_policy';
                    else if (lowerBody.includes('medical')) docPrefix = 'medical_record';
                    else if (lowerBody.includes('communication') || lowerBody.includes('email') || lowerBody.includes('text')) docPrefix = 'communication';

                    parsedRequests.push({
                        id: idCounter,
                        text: `${title}\n${body}`,
                        response: STANDARD_RESPONSE,
                        documentsProduced: `${docPrefix}_001.pdf`,
                        toggles: {
                            overlyBroad: false,
                            undulyBurdensome: false,
                            notProportional: false,
                            vague: false,
                            outsideControl: false,
                            irrelevant: false,
                            confidentiality: false
                        }
                    });
                    idCounter++;
                }

                setRequests(parsedRequests);
                setLoading(false);
            } catch (error) {
                console.error("Error loading PDF:", error);
                setLoading(false);
            }
        }

        loadPdf();
    }, []);

    const updateResponse = (id: number, newToggles: RequestItem['toggles']) => {
        setRequests(prev => prev.map(req => {
            if (req.id !== id) return req;

            const activeObjections = [];
            if (newToggles.overlyBroad) activeObjections.push(OBJECTIONS.overlyBroad);
            if (newToggles.undulyBurdensome) activeObjections.push(OBJECTIONS.undulyBurdensome);
            if (newToggles.notProportional) activeObjections.push(OBJECTIONS.notProportional);
            if (newToggles.vague) activeObjections.push(OBJECTIONS.vague);
            if (newToggles.outsideControl) activeObjections.push(OBJECTIONS.outsideControl);
            if (newToggles.irrelevant) activeObjections.push(OBJECTIONS.irrelevant);
            if (newToggles.confidentiality) activeObjections.push(OBJECTIONS.confidentiality);

            let newResponse = "";
            if (activeObjections.length > 0) {
                newResponse = activeObjections.join(" ") + " Subject to and without waiving this objection, " + STANDARD_RESPONSE;
            } else {
                newResponse = STANDARD_RESPONSE;
            }

            return { ...req, toggles: newToggles, response: newResponse };
        }));
    };

    const handleToggle = (id: number, key: keyof RequestItem['toggles']) => {
        const req = requests.find(r => r.id === id);
        if (!req) return;
        const newToggles = { ...req.toggles, [key]: !req.toggles[key] };
        updateResponse(id, newToggles);
    };

    const handleTextChange = (id: number, field: 'response' | 'documentsProduced', value: string) => {
        setRequests(prev => prev.map(req => req.id === id ? { ...req, [field]: value } : req));
    };

    if (loading) return <div className="p-8 text-center">Loading RFP...</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-8 font-sans">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">RFP Response Generator</h1>
                <p className="text-gray-600">Co-pilot for drafting responses</p>
            </header>

            <div className="space-y-6 max-w-5xl mx-auto">
                {requests.map((req) => (
                    <div key={req.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                            <h3 className="font-semibold text-gray-800 whitespace-pre-wrap">{req.text}</h3>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Toggles */}
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(OBJECTIONS).map(([key, label]) => {
                                    const isActive = req.toggles[key as keyof typeof OBJECTIONS];
                                    const displayLabel = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

                                    return (
                                        <button
                                            key={key}
                                            onClick={() => handleToggle(req.id, key as keyof typeof OBJECTIONS)}
                                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${isActive
                                                ? 'bg-blue-100 text-blue-800 border-blue-200'
                                                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            {displayLabel}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Response Editor */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">RESPONSE:</label>
                                <textarea
                                    value={req.response}
                                    onChange={(e) => handleTextChange(req.id, 'response', e.target.value)}
                                    className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                                />
                            </div>

                            {/* Documents Produced */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">DOCUMENTS PRODUCED:</label>
                                <input
                                    type="text"
                                    value={req.documentsProduced}
                                    onChange={(e) => handleTextChange(req.id, 'documentsProduced', e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 font-mono text-sm"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
