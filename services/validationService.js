// Basic CNIC validation - only check for essential patterns
function validateCNIC(ocrResult) {
  const text = ocrResult.fullText.toLowerCase();

  // Basic exclusion patterns for obvious non-CNIC documents
  const excludePatterns = [
    'medical council', 'pmdc', 'medical registration', 'license',
    'university', 'degree', 'diploma', 'certificate', 'domicile',
    'healthcare commission', 'registration certificate', 'phc',
  ];

  const hasExclusionPatterns = excludePatterns.some((pattern) => text.includes(pattern));

  if (hasExclusionPatterns) {
    return {
      isCNIC: false,
      confidence: 0,
      reasons: { excludedBecause: 'Contains non-CNIC indicators' },
    };
  }

  // Check for CNIC number pattern - this is the main requirement
  const cnicPatterns = [
    /\b\d{5}[-\s]?\d{7}[-\s]?\d{1}\b/, // Standard format
    /\b\d{13}\b/, // Continuous 13 digits
  ];

  const hasCNICNumber = cnicPatterns.some((pattern) => pattern.test(text));

  if (!hasCNICNumber) {
    return { isCNIC: false, confidence: 0, reasons: { noCNICNumber: true } };
  }

  // Basic confidence scoring
  let confidence = 60; // Base confidence for having CNIC number

  // CNIC indicators
  const cnicIndicators = [
    'computerized national identity card', 'national identity card',
    'شناختی کارڈ', 'قومی شناختی کارڈ', 'cnic',
  ];

  if (cnicIndicators.some((indicator) => text.includes(indicator))) {
    confidence += 30;
  }

  // NADRA or Pakistan context
  if (text.includes('nadra') || text.includes('نادرا')
    || text.includes('pakistan') || text.includes('پاکستان')) {
    confidence += 10;
  }

  const isCNIC = confidence >= 60;

  return {
    isCNIC,
    confidence,
    reasons: { hasCNICNumber, confidence },
  };
}

// Domicile validation function
function validateDomicile(ocrResult) {
  const text = ocrResult.fullText.toLowerCase();

  // Basic exclusion patterns for obvious non-domicile documents
  const excludePatterns = [
    'medical council', 'pmdc', 'medical registration', 'license',
    'university', 'degree', 'diploma', 'computerized national identity card', 'cnic',
    'healthcare commission', 'registration certificate', 'phc',
  ];

  const hasExclusionPatterns = excludePatterns.some((pattern) => text.includes(pattern));

  if (hasExclusionPatterns) {
    return {
      isDomicile: false,
      confidence: 0,
      reasons: { excludedBecause: 'Contains non-domicile indicators' },
    };
  }

  // Check for domicile indicators
  const domicileIndicators = [
    'certificate of domicile', 'domicile', 'citizenship act', 'appendix',
    'form p-i', 'district coordination officer', 'place of domicile',
  ];

  const hasDomicileIndicators = domicileIndicators.some((indicator) => text.includes(indicator));

  if (!hasDomicileIndicators) {
    return { isDomicile: false, confidence: 0, reasons: { noDomicileIndicators: true } };
  }

  // Basic confidence scoring
  let confidence = 70; // Base confidence for having domicile indicators

  // Pakistan context
  if (text.includes('pakistan') || text.includes('پاکستان')) {
    confidence += 15;
  }

  // District officer signature
  if (text.includes('district coordination officer') || text.includes('district officer')) {
    confidence += 15;
  }

  const isDomicile = confidence >= 60;

  return {
    isDomicile,
    confidence,
    reasons: { hasDomicileIndicators, confidence },
  };
}

// PHC validation function
function validatePHC(ocrResult) {
  const text = ocrResult.fullText.toLowerCase();

  // Basic exclusion patterns for obvious non-PHC documents
  const excludePatterns = [
    'computerized national identity card', 'cnic', 'certificate of domicile',
    'university', 'degree', 'diploma',
  ];

  const hasExclusionPatterns = excludePatterns.some((pattern) => text.includes(pattern));

  if (hasExclusionPatterns) {
    return {
      isPHC: false,
      confidence: 0,
      reasons: { excludedBecause: 'Contains non-PHC indicators' },
    };
  }

  // Check for PHC indicators
  const phcIndicators = [
    'punjab healthcare commission', 'healthcare commission', 'registration certificate',
    'private healthcare establishment', 'healthcare establishment',
    'reg. no', 'registration no', 'phc',
  ];

  const hasPHCIndicators = phcIndicators.some((indicator) => text.includes(indicator));

  if (!hasPHCIndicators) {
    return { isPHC: false, confidence: 0, reasons: { noPHCIndicators: true } };
  }

  // Basic confidence scoring
  let confidence = 70; // Base confidence for having PHC indicators

  // Check for registration number pattern
  const hasRegNumber = /reg\.?\s*no\.?[-:\s]*[a-z]?[-]?\d+/i.test(text);
  if (hasRegNumber) {
    confidence += 20;
  }

  // Director/Authority signature
  if (text.includes('director') || text.includes('licensing') || text.includes('accreditation')) {
    confidence += 10;
  }

  const isPHC = confidence >= 60;

  return {
    isPHC,
    confidence,
    reasons: { hasPHCIndicators, hasRegNumber, confidence },
  };
}

function validatePMDC(ocrResult) {
  const text = ocrResult.fullText.toLowerCase();

  // Basic exclusion patterns for obvious non-PMDC documents
  const excludePatterns = [
    'computerized national identity card', 'cnic', 'certificate of domicile',
    'healthcare commission', 'phc', 'registration certificate',
  ];

  const hasExclusionPatterns = excludePatterns.some((pattern) => text.includes(pattern));

  if (hasExclusionPatterns) {
    return {
      isPMDC: false,
      confidence: 0,
      reasons: { excludedBecause: 'Contains non-PMDC indicators' },
    };
  }

  // Check for PMDC indicators
  const pmdcIndicators = [
    'pakistan medical and dental council', 'medical and dental council', 'pmdc',
    'certificate of permanent medical registration', 'permanent medical registration',
    'medical registration', 'registration number',
  ];

  const hasPMDCIndicators = pmdcIndicators.some((indicator) => text.includes(indicator));

  if (!hasPMDCIndicators) {
    return { isPMDC: false, confidence: 0, reasons: { noPMDCIndicators: true } };
  }

  // Basic confidence scoring
  let confidence = 70; // Base confidence for having PMDC indicators

  // Check for registration number pattern (typically numeric)
  const hasRegNumber = /registration\s+number\s*:?\s*\d+/i.test(text) || /\d{5,}/g.test(text);
  if (hasRegNumber) {
    confidence += 20;
  }

  // Check for CNIC/Passport pattern
  if (text.includes('cnic/passport') || /\d{5}[-\s]?\d{7}[-\s]?\d{1}/.test(text)) {
    confidence += 10;
  }

  const isPMDC = confidence >= 60;

  return {
    isPMDC,
    confidence,
    reasons: { hasPMDCIndicators, hasRegNumber, confidence },
  };
}

module.exports = {
  validateCNIC,
  validateDomicile,
  validatePHC,
  validatePMDC,
};
