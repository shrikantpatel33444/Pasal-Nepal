// IRD Nepal Tax & Compliance System
// VAT: 13% on taxable goods/services per Nepal government rules
// PAN: Permanent Account Number (9 digits for individuals, 10 for businesses)
// VAT Number: 9-digit + 'VAT' prefix format

export interface TaxBreakdown {
  taxableAmount: number;
  vatRate: number;
  vatAmount: number;
  totalWithVat: number;
  isTaxable: boolean;
}

// Categories exempt from VAT in Nepal (basic necessities)
export const VAT_EXEMPT_CATEGORIES = [
  'Fresh Vegetables',
  'Fresh Fruits',
  'Rice (unbranded)',
  'Salt',
  'Sugar (unbranded)',
  'Education Materials',
  'Medical Supplies',
];

export const VAT_RATE = 0.13; // 13%

export function isVatExempt(category: string): boolean {
  return VAT_EXEMPT_CATEGORIES.some(c => category.toLowerCase().includes(c.toLowerCase()));
}

export function calculateVat(amount: number, category?: string, vatEnabled = true): TaxBreakdown {
  const exempt = category ? isVatExempt(category) : false;
  const isTaxable = vatEnabled && !exempt && amount > 0;

  if (!isTaxable) {
    return {
      taxableAmount: amount,
      vatRate: 0,
      vatAmount: 0,
      totalWithVat: amount,
      isTaxable: false,
    };
  }

  // In Nepal, prices are typically VAT-inclusive.
  // Taxable amount = price / (1 + VAT rate)
  // VAT amount = price - taxable amount
  const taxableAmount = amount / (1 + VAT_RATE);
  const vatAmount = amount - taxableAmount;

  return {
    taxableAmount: Math.round(taxableAmount * 100) / 100,
    vatRate: VAT_RATE,
    vatAmount: Math.round(vatAmount * 100) / 100,
    totalWithVat: amount,
    isTaxable: true,
  };
}

// PAN validation: Nepal PAN is 9 digits (individuals) or starts with 'V' + 9 digits (VAT registered)
export function validatePAN(pan: string): { valid: boolean; type: 'individual' | 'vat' | 'invalid'; message: string } {
  const cleaned = pan.replace(/\s/g, '').toUpperCase();

  // VAT registered business: format like 123456789 or V123456789
  if (/^\d{9}$/.test(cleaned)) {
    return { valid: true, type: 'individual', message: 'Individual PAN (9 digits)' };
  }
  if (/^V\d{9}$/.test(cleaned)) {
    return { valid: true, type: 'vat', message: 'VAT Registered Business PAN' };
  }
  // Some business PANs are 10 digits
  if (/^\d{10}$/.test(cleaned)) {
    return { valid: true, type: 'vat', message: 'Business PAN (10 digits)' };
  }

  return { valid: false, type: 'invalid', message: 'PAN must be 9 digits (individual) or 10 digits (business/VAT)' };
}

// Invoice serial number format: IRD Nepal requires sequential numbering
// Format: STORE_CODE-YYYY-FISCAL_YEAR-SEQUENCE (e.g., HMT-01-2081-00001)
export function generateInvoiceNumber(storeCode: string, sequence: number, fiscalYear?: string): string {
  const fy = fiscalYear || getCurrentFiscalYear();
  const seq = String(sequence).padStart(5, '0');
  return `${storeCode.toUpperCase()}-${fy}-${seq}`;
}

// Nepal fiscal year: Shrawan 1 to Ashad end (mid-July to mid-July)
// Example: FY 2081-82 runs from Shrawan 1, 2081 to Ashad end, 2082
export function getCurrentFiscalYear(): string {
  const now = new Date();
  const nepaliYear = getNepaliYear(now);
  // Fiscal year starts in Shrawan (mid-July). If before Shrawan, we're in previous FY.
  const month = now.getMonth(); // 0 = January
  // Approximate: Shrawan starts around July 16 (month index 6)
  if (month < 6 || (month === 6 && now.getDate() < 16)) {
    // Before Shrawan - still in previous fiscal year
    return `${nepaliYear - 1}-${String(nepaliYear).slice(-2)}`;
  }
  return `${nepaliYear}-${String(nepaliYear + 1).slice(-2)}`;
}

// Approximate Nepali year (Bikram Sambat)
// AD 2024 ≈ BS 2081
export function getNepaliYear(date: Date): number {
  return date.getFullYear() + 57;
}

// Format date in Nepali format (BS)
export function formatNepaliDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'Asia/Kathmandu',
  });
}

// IRD compliance checklist for merchants
export const COMPLIANCE_CHECKLIST = [
  { id: 'pan_registered', label: 'PAN Registration', description: 'Business PAN registered with IRD Nepal', required: true },
  { id: 'vat_registered', label: 'VAT Registration', description: 'VAT registration (if turnover > Rs. 5,000,000)', required: false },
  { id: 'company_certificate', label: 'Company Registration', description: 'OCR (Office of Company Registrar) certificate uploaded', required: false },
  { id: 'invoice_configured', label: 'Invoice Configuration', description: 'IRD-compliant invoice serial number configured', required: true },
  { id: 'return_policy', label: 'Return & Refund Policy', description: 'Consumer protection return policy published', required: true },
  { id: 'tax_enabled', label: 'VAT Calculation', description: '13% VAT calculation enabled on taxable items', required: false },
];

export interface ComplianceStatus {
  pan_registered: boolean;
  vat_registered: boolean;
  company_certificate: boolean;
  invoice_configured: boolean;
  return_policy: boolean;
  tax_enabled: boolean;
}

export function getComplianceScore(status: ComplianceStatus): { score: number; total: number; percentage: number } {
  const required = COMPLIANCE_CHECKLIST.filter(c => c.required);
  const total = required.length;
  const completed = required.filter(c => status[c.id as keyof ComplianceStatus]).length;
  return { score: completed, total, percentage: Math.round((completed / total) * 100) };
}

export const formatNPR = (amount: number) =>
  `रू ${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
