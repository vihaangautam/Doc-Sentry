import React from 'react';
import { Mail, Sparkles } from 'lucide-react';

interface EmailGeneratorProps {
    category: string;
    companyName: string;
    tipContext: string;
    onDraft: (subject: string, body: string) => void;
}

const getTemplate = (category: string, company: string, context: string) => {
    const subjectPrefix = `Discussion regarding ${company} Offer`;
    const companyStr = company || "the company";

    switch (category.toLowerCase()) {
        case 'joining bonus':
        case 'joining bonus / sign-on':
            return {
                subject: `${subjectPrefix} - Signing Bonus`,
                body: `Dear Hiring Team,\n\nI am very excited about the opportunity to join ${companyStr}.\n\nRegarding the offer, I noticed there is no signing bonus involved. Given my immediate availability and the fact that I am foregoing a bonus at my current role, would it be possible to include a one-time signing bonus?\n\nLooking forward to your thoughts.\n\nBest regards,`
            };
        case 'relocation package':
            return {
                subject: `${subjectPrefix} - Relocation Assistance`,
                body: `Dear Hiring Team,\n\nI am excited to move forward with ${companyStr}.\n\nSince this role requires relocation, I would like to discuss if there is any support available for moving expenses. A relocation package would greatly assist with a smooth transition.\n\nBest regards,`
            };
        case 'base vs variable':
            return {
                subject: `${subjectPrefix} - Salary Structure`,
                body: `Dear Hiring Team,\n\nThank you for the detailed offer.\n\nI noticed a significant portion of the CTC is variable. Would it be possible to restructure a part of the variable pay into the fixed base salary to ensure more stability?\n\nBest regards,`
            };
        case 'equity / esops':
            return {
                subject: `${subjectPrefix} - Equity Component`,
                body: `Dear Hiring Team,\n\nI am excited about the long-term vision of ${companyStr}.\n\nI would love to be more invested in the company's success. Is there any flexibility to increase the ESOP/Equity component of the offer?\n\nBest regards,`
            };
        case 'notice period buyout':
            return {
                subject: `${subjectPrefix} - Notice Period Buyout`,
                body: `Dear Hiring Team,\n\nMy current notice period is quite long. However, my current employer is open to an early release if the notice period is bought out.\n\nWould ${companyStr} be open to covering the buyout amount to drastically reduce my joining time?\n\nBest regards,`
            };
        default:
            return {
                subject: `${subjectPrefix} - Salary Query`,
                body: `Dear Hiring Team,\n\nThank you for the offer to join ${companyStr}.\n\nI have a specific query regarding: "${context}".\n\nIs there flexibility to discuss this component of the compensation structure to better align with market standards?\n\nBest regards,`
            };
    }
}

export const EmailGenerator: React.FC<EmailGeneratorProps> = ({ category, companyName, tipContext, onDraft }) => {

    const handleDraft = (e: React.MouseEvent) => {
        e.stopPropagation();
        const template = getTemplate(category, companyName, tipContext);
        onDraft(template.subject, template.body);
    };

    return (
        <button
            onClick={handleDraft}
            className="mt-3 flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg border border-emerald-500/20 transition-all w-fit group"
        >
            <Mail size={14} />
            Draft Negotiation Email
            <Sparkles size={12} className="opacity-50 group-hover:opacity-100 transition-opacity" />
        </button>
    );
};
