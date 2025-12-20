// Financial Math Utilities for DocSentry

// XIRR Calculation using Newton-Raphson method
// equations: sum(flow / (1 + r)^((date - start_date) / 365)) = 0

type CashFlow = {
    amount: number; // Negative for outflow, Positive for inflow
    date: Date;
};

const XIRR_MAX_ITERATIONS = 100;
const XIRR_TOLERANCE = 1e-6;

export function calculateXIRR(cashFlows: CashFlow[], guess = 0.1): number | null {
    if (cashFlows.length < 2) return null;

    let x0 = guess;
    const startDate = cashFlows[0].date;

    for (let i = 0; i < XIRR_MAX_ITERATIONS; i++) {
        let fValue = 0;
        let fDerivative = 0;

        for (const flow of cashFlows) {
            const days = (flow.date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
            const years = days / 365;

            // Avoid division by zero if x0 is -1, though unlikely with investments
            const factor = Math.pow(1 + x0, years);
            fValue += flow.amount / factor;
            fDerivative -= (flow.amount * years) / (factor * (1 + x0));
        }

        if (Math.abs(fValue) < XIRR_TOLERANCE) {
            return x0;
        }

        if (Math.abs(fDerivative) < 1e-10) {
            return null; // Failed to converge (flat slope)
        }

        const x1 = x0 - fValue / fDerivative;
        if (!isFinite(x1)) return null;
        x0 = x1;
    }

    return null; // Failed to converge
}

// Format currency (INR)
export function formatINR(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
}

// Convert extracted extracted "1 Lakh" etc to numbers if needed, 
// though we expect Backend to do most, this is a fallback helper.
export function parseFinancialText(text: string): number {
    // Simple parser for standard numbers
    const clean = text.replace(/[^0-9.]/g, '');
    return parseFloat(clean) || 0;
}

// PMT Calculation (Monthly Payment)
// rate: Annual interest rate (decimal, e.g. 0.085 for 8.5%)
// nper: Number of periods (months)
// pv: Present Value (Loan Amount)
export function calculatePMT(annualRate: number, nper: number, pv: number): number {
    if (annualRate === 0) return pv / nper;
    const monthlyRate = annualRate / 12;
    const pmt = (pv * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -nper));
    return pmt;
}

// Effective APR Calculation
// Finds the rate that equates Net Disbursed Amount with the stream of EMIs
export function calculateAPR(loanAmount: number, processingFees: number, tenureMonths: number, quotedAnnualRate: number): number {
    const netDisbursed = loanAmount - processingFees;
    const emi = calculatePMT(quotedAnnualRate, tenureMonths, loanAmount);

    // We need to find 'r' such that:
    // NetDisbursed = EMI * ((1 - (1+r)^-n) / r)
    // Using Newton-Raphson for 'r' (monthly rate)

    let r = quotedAnnualRate / 12; // Initial guess
    const tolerance = 1e-7;
    const maxIter = 50;

    for (let i = 0; i < maxIter; i++) {
        // PV Annuity formula: P = (PMT/r) * (1 - (1+r)^-n)
        // f(r) = (PMT/r) * (1 - (1+r)^-n) - NetDisbursed

        const factor = Math.pow(1 + r, -tenureMonths);
        const fValue = (emi / r) * (1 - factor) - netDisbursed;

        // Derivative f'(r)
        // d/dr [(PMT/r) * (1 - (1+r)^-n)]
        // = -PMT/r^2 * (1 - (1+r)^-n) + (PMT/r) * (n * (1+r)^-(n+1))

        const fDerivative = (-emi / (r * r)) * (1 - factor) + (emi / r) * (tenureMonths * Math.pow(1 + r, -(tenureMonths + 1)));

        const nextR = r - fValue / fDerivative;

        if (Math.abs(nextR - r) < tolerance) {
            return nextR * 12; // Return Annual Rate
        }
        r = nextR;
    }

    return r * 12; // Return best estimate if not converged
}
