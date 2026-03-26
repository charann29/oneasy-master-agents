import React from 'react';
import {
    Building2, PieChart, BarChart3,
    Briefcase, FileText, FileSignature, Receipt,
    BookOpen, FolderKanban, Landmark
} from 'lucide-react';

export const agentsData = [
    {
        id: 'incorporation',
        title: 'Startup Incorporation',
        badge: 'Live Now',
        icon: <Building2 className="w-8 h-8 text-red-500" />,
        description: 'Your AI-based legal entity incorporation partner. Choose your legal entity in less than 60 seconds with CA-level accuracy. We also help with trade names, domain suggestions, and logos.',
        features: [
            'Legal Entity selection in < 60s',
            'Business Name & Domain suggestions',
            'Logo Creation AI',
            'End-to-End Incorporation Processing'
        ],
        link: 'https://startup.oneasy.ai/',
        example: `User: I want to start a tech company.
AI: Great! Are you planning to raise funding?
User: Yes, from VCs.
AI: Then a Private Limited Company is ideal.
User: Can you also help with a name?
AI: Sure! Here are 5 trade name suggestions with available domains.`
    },
    {
        id: 'business-financial-model',
        title: 'Business & Financial Model',
        badge: 'Live Now',
        icon: <PieChart className="w-8 h-8 text-red-500" />,
        description: 'Generate comprehensive business models, financial models, and pitch decks without the jargon. From idea validation to knowing how much your company is valued.',
        features: [
            'Idea Validation & Competitor Analysis',
            'Know how to price your product',
            'Build the PL for your business',
            'Unit Economics & Financial Projections',
            'Estimated Company Valuation',
            'Pitch Deck Generation'
        ],
        link: '/idea-validation',
        example: `User: I have a SaaS idea.
AI: Let's validate it! Who's your target customer?
User: Small business owners.
AI: Got it. Here's your competitor landscape.
User: Now help me price it.
AI: Based on unit economics, ₹999/mo is your sweet spot.`
    },
    {
        id: 'business-scaler',
        title: 'Business Scaler',
        badge: 'Growth',
        icon: <Briefcase className="w-8 h-8 text-red-500" />,
        description: 'Your AI coach to take your SMB to structured heights. We help with goal setting, operations, identifying key business functions, and automating tasks without the headache.',
        features: [
            'Business Structuring',
            'Goal Setting Frameworks',
            'Operations Automation',
            'Functions Identification'
        ],
        link: '#',
        example: `User: My agency has no structure.
AI: Let's fix that. How many employees?
User: 12 people.
AI: I see 3 core functions: Sales, Delivery, Admin.
User: What should I automate first?
AI: Client onboarding. It'll save you 8 hours/week.`
    },
    {
        id: 'proposal-builder',
        title: 'Proposal Builder',
        badge: 'Sales',
        icon: <FileText className="w-8 h-8 text-red-500" />,
        description: 'Close deals faster. Upload your website URL, tell us a bit about the product, select a template, and generate client-ready proposals in under 2 minutes.',
        features: [
            'Proposals in < 2 mins',
            'Website-to-Proposal AI',
            'Customizable Templates',
            'One-click Send to Client'
        ],
        link: '#',
        example: `User: I need a proposal for Acme Corp.
AI: What service are you pitching?
User: SEO services.
AI: Scanning your website now...
AI: Draft ready! Use "Modern" or "Executive" template?
User: Modern. Send it!`
    },
    {
        id: 'document-writer',
        title: 'Document Writer',
        badge: 'Legal',
        icon: <FileSignature className="w-8 h-8 text-red-500" />,
        description: 'Draft legal documents securely. Need an offer letter, partnership deed, or rental agreement? Generate fully vetted documents starting at just ₹9.',
        features: [
            'Only ₹9 per document',
            'Offer Letters & Partnership Deeds',
            'Rental & Vendor Agreements',
            'Legally Vetted Templates'
        ],
        link: '#',
        example: `User: I need an offer letter.
AI: Sure! Employee name?
User: Priya Sharma, Product Manager.
AI: CTC?
User: ₹18 LPA.
AI: Done! Download your legally vetted offer letter for ₹9.`
    },
    {
        id: 'invoice-generator',
        title: 'Invoice Generator',
        badge: 'Billing',
        icon: <Receipt className="w-8 h-8 text-red-500" />,
        description: 'Talk to your AI like your accountant. Generate and send professional invoices directly to your clients with a single click.',
        features: [
            'Conversational Invoicing',
            'Beautiful Templates',
            'One-click Send',
            'Automated Follow-ups'
        ],
        link: '#',
        example: `User: Invoice DesignCrafters for ₹1.5L.
AI: Service description?
User: Logo redesign project.
AI: Invoice #INV-204 created!
User: Send it to them.
AI: Emailed to priya@designcrafters.com ✅`
    },
    {
        id: 'document-summary',
        title: 'Document Summary',
        badge: 'Analysis',
        icon: <BookOpen className="w-8 h-8 text-red-500" />,
        description: 'Upload lengthy documents and get instant summaries, key insights, and potential red flags. Similar to Notebook LLM but built for finance and business data.',
        features: [
            'Instant Summarization',
            'Key Insights Extraction',
            'Issue & Risk Identification',
            'Multi-document Support'
        ],
        link: '#',
        example: `User: Summarize this vendor contract.
AI: Uploading... 50 pages detected.
AI: Summary ready!
AI: ⚠️ Alert: Auto-renews annually.
AI: Payment terms: Net-60.
AI: Risk: Full liability clause in Section 4.2.`
    },
    {
        id: 'finance-professionals',
        title: 'CA Article Assistant',
        badge: 'Professional',
        icon: <FolderKanban className="w-8 h-8 text-red-500" />,
        description: 'Built for finance professionals. Automate routine CA Article tasks such as document sorting, identifying missing documents, and data extraction.',
        features: [
            'Automated Document Sorting',
            'Missing Document Checklists',
            'Data Extraction',
            'Workflow Automation'
        ],
        link: '#',
        example: `User: Sort these 50 client files.
AI: Processing...
AI: Categorized: 20 Bank Statements, 18 Invoices, 12 Receipts.
AI: ⚠️ Missing: March 2024 bank statement.
User: Draft a request to the client.
AI: Email drafted and ready to send!`
    },
    {
        id: 'tax-filing',
        title: 'Income Tax Filing',
        badge: 'Tax',
        icon: <Landmark className="w-8 h-8 text-red-500" />,
        description: 'Filing taxes made simple for business owners and pros. Upload your bank statement, let AI analyze credits/debits, and seamlessly file your returns.',
        features: [
            'Bank Statement Analysis',
            'Credit/Debit Categorization',
            'Deduction Identification',
            'Seamless ITR Filing'
        ],
        link: '#',
        example: `User: I want to file my ITR.
AI: Upload your bank statement.
User: Done!
AI: Found ₹42L credits, ₹28L debits.
AI: Identified 3 eligible deductions: 80C, 80D, HRA.
User: File it.
AI: Draft ready for review before submission!`
    }
];
