/* eslint-disable prefer-destructuring */
/* eslint-disable @typescript-eslint/no-use-before-define */
const { cohere } = require('../config/aiConfig');

// Simplified data extraction with minimal processing
async function extractCNICData(ocrResult) {
  const { fullText } = ocrResult;

  const prompt = `
You are an expert Pakistani CNIC data extractor. Extract information exactly as it appears in the document.

CRITICAL RULES:
1. Extract text EXACTLY as written - no corrections or modifications
2. For addresses, preserve the EXACT text order and format
3. Do NOT rearrange, correct, or modify any text
4. CNIC format: XXXXX-XXXXXXX-X (13 digits total)
5. If text is unclear, leave field empty rather than guessing

OCR TEXT TO ANALYZE:
${fullText}

EXTRACT ONLY THIS JSON FORMAT:
{
  "name": "Full name exactly as written",
  "father_name": "Father's name exactly as written", 
  "cnic": "XXXXX-XXXXXXX-X format only",
  "dob": "Date as written (DD/MM/YYYY preferred)",
  "gender": "Male/Female/مرد/عورت",
  "address": "Complete address EXACTLY as it appears - NO changes",
  "confidence_score": 85
}

Return ONLY the JSON object.
`;

  try {
    const response = await cohere.generate({
      model: 'command-r-plus',
      prompt,
      maxTokens: 600,
      temperature: 0.1,
    });

    const output = response.generations[0].text.trim();
    console.log('🤖 Cohere AI Response:', output);

    // Extract JSON
    let jsonStr = output;
    const jsonMatch = output.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    const parsed = JSON.parse(jsonStr);

    // Only do minimal essential processing
    const cleaned = cleanExtractedData(parsed);
    return cleaned;
  } catch (error) {
    console.error('❌ Error with Cohere API:', error.message);
    return fallbackExtraction(ocrResult);
  }
}

// Domicile data extraction function
async function extractDomicileData(ocrResult) {
  const { fullText } = ocrResult;

  const prompt = `
You are an expert Pakistani Domicile Certificate data extractor. Extract information exactly as it appears in the document.

CRITICAL RULES:
1. Extract text EXACTLY as written - no corrections or modifications
2. For addresses, preserve the EXACT text order and format
3. Do NOT rearrange, correct, or modify any text
4. If text is unclear, leave field empty rather than guessing
5. Look for official form fields and their values

OCR TEXT TO ANALYZE:
${fullText}

EXTRACT ONLY THIS JSON FORMAT:
{
  "full_name": "Full name exactly as written",
  "father_name": "Father's/D/O name exactly as written",
  "address_in_pakistan": "Complete address EXACTLY as it appears",
  "place_of_domicile": "Place of domicile as written",
  "domicile_tehsil": "Tehsil name",
  "district": "District name",
  "province": "Province/Admin unit",
  "date_of_arrival": "Date as written",
  "marital_status": "Single/Married/Widow/Widower",
  "occupation": "Trade or occupation",
  "identification_mark": "Mark of identification",
  "certificate_date": "Certificate issue date",
  "certificate_number": "Certificate number if visible",
  "issuing_officer": "District Coordination Officer or issuing authority",
  "confidence_score": 85
}

Return ONLY the JSON object.
`;

  try {
    const response = await cohere.generate({
      model: 'command-r-plus',
      prompt,
      maxTokens: 800,
      temperature: 0.1,
    });

    const output = response.generations[0].text.trim();
    console.log('🤖 Cohere AI Response (Domicile):', output);

    // Extract JSON
    let jsonStr = output;
    const jsonMatch = output.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    const parsed = JSON.parse(jsonStr);

    // Clean extracted domicile data
    const cleaned = cleanDomicileData(parsed);
    return cleaned;
  } catch (error) {
    console.error('❌ Error with Cohere API (Domicile):', error.message);
    return fallbackDomicileExtraction(ocrResult);
  }
}

// PHC data extraction function
async function extractPHCData(ocrResult) {
  const { fullText } = ocrResult;

  const prompt = `
You are an expert Pakistani PHC (Punjab Healthcare Commission) Registration Certificate data extractor. Extract information exactly as it appears in the document.

CRITICAL RULES:
1. Extract text EXACTLY as written - no corrections or modifications
2. For addresses, preserve the EXACT text order and format
3. Do NOT rearrange, correct, or modify any text
4. If text is unclear, leave field empty rather than guessing
5. Look for registration details, organization info, and official signatures

OCR TEXT TO ANALYZE:
${fullText}

EXTRACT ONLY THIS JSON FORMAT:
{
  "registration_number": "Registration number (e.g., REG. NO-R-17633)",
  "organization_name": "Healthcare establishment name exactly as written",
  "establishment_type": "Type of healthcare establishment",
  "address": "Complete address EXACTLY as it appears",
  "registration_date": "Date of registration as written",
  "validity_period": "Registration validity period if mentioned",
  "issuing_authority": "Punjab Healthcare Commission or specific authority",
  "director_name": "Director name if visible",
  "license_category": "License/registration category",
  "services_authorized": "Authorized services if mentioned",
  "certificate_date": "Certificate issue date",
  "act_reference": "Healthcare Commission ACT reference",
  "section_reference": "Section reference (e.g., Section 13)",
  "confidence_score": 85
}

Return ONLY the JSON object.
`;

  try {
    const response = await cohere.generate({
      model: 'command-r-plus',
      prompt,
      maxTokens: 800,
      temperature: 0.1,
    });

    const output = response.generations[0].text.trim();
    console.log('🤖 Cohere AI Response (PHC):', output);

    // Extract JSON
    let jsonStr = output;
    const jsonMatch = output.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    const parsed = JSON.parse(jsonStr);

    // Clean extracted PHC data
    const cleaned = cleanPHCData(parsed);
    return cleaned;
  } catch (error) {
    console.error('❌ Error with Cohere API (PHC):', error.message);
    return fallbackPHCExtraction(ocrResult);
  }
}

async function extractPMDCData(ocrResult) {
  const { fullText } = ocrResult;

  const prompt = `
You are an expert Pakistani PMDC (Pakistan Medical and Dental Council) Certificate data extractor. Extract information exactly as it appears in the document.

CRITICAL RULES:
1. Extract text EXACTLY as written - no corrections or modifications
2. For addresses, preserve the EXACT text order and format
3. Do NOT rearrange, correct, or modify any text
4. If text is unclear, leave field empty rather than guessing
5. Look for registration details, personal info, and qualification details

OCR TEXT TO ANALYZE:
${fullText}

EXTRACT ONLY THIS JSON FORMAT:
{
  "registration_number": "Registration number exactly as written",
  "cnic_passport": "CNIC/Passport number exactly as written",
  "name": "Full name exactly as written",
  "father_name": "Father's name exactly as written",
  "present_address": "Present address EXACTLY as it appears",
  "contact_number": "Contact/phone number if visible",
  "permanent_address": "Permanent address if different from present",
  "registration_date": "Registration date as written",
  "valid_upto": "Validity date as written",
  "qualification": "Medical qualification/degree",
  "institute_university": "Institute/University name",
  "year": "Year of qualification",
  "certificate_type": "Certificate type (e.g., Certificate of Permanent Medical Registration)",
  "issuing_authority": "Pakistan Medical and Dental Council or specific authority",
  "registrar_signature": "Registrar name if visible",
  "confidence_score": 85
}

Return ONLY the JSON object.
`;

  try {
    const response = await cohere.generate({
      model: 'command-r-plus',
      prompt,
      maxTokens: 800,
      temperature: 0.1,
    });

    const output = response.generations[0].text.trim();
    console.log('🤖 Cohere AI Response (PMDC):', output);

    // Extract JSON
    let jsonStr = output;
    const jsonMatch = output.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    const parsed = JSON.parse(jsonStr);

    // Clean extracted PMDC data
    const cleaned = cleanPMDCData(parsed);
    return cleaned;
  } catch (error) {
    console.error('❌ Error with Cohere API (PMDC):', error.message);
    return fallbackPMDCExtraction(ocrResult);
  }
}

// Data cleaning functions
function cleanExtractedData(extractedData) {
  // 1. CNIC number - only ensure proper format
  if (extractedData.cnic) {
    const cnicDigits = extractedData.cnic.replace(/[^\d]/g, '');
    if (cnicDigits.length === 13) {
      extractedData.cnic = `${cnicDigits.substr(0, 5)}-${cnicDigits.substr(5, 7)}-${cnicDigits.substr(12, 1)}`;
    }
  }

  // 2. Gender normalization only
  if (extractedData.gender) {
    const gender = extractedData.gender.toLowerCase();
    if (gender.includes('male') || gender.includes('مرد')) {
      extractedData.gender = 'Male';
    } else if (gender.includes('female') || gender.includes('عورت')) {
      extractedData.gender = 'Female';
    }
  }

  // 3. Simple text cleanup - only remove excessive whitespace
  ['name', 'father_name', 'address'].forEach((field) => {
    if (extractedData[field]) {
      extractedData[field] = extractedData[field]
        .replace(/\s+/g, ' ')
        .trim();
    }
  });

  return extractedData;
}

function cleanDomicileData(extractedData) {
  // Simple text cleanup - only remove excessive whitespace
  const textFields = [
    'full_name', 'father_name', 'address_in_pakistan', 'place_of_domicile',
    'domicile_tehsil', 'district', 'province', 'occupation', 'identification_mark',
    'issuing_officer',
  ];

  textFields.forEach((field) => {
    if (extractedData[field]) {
      extractedData[field] = extractedData[field]
        .replace(/\s+/g, ' ')
        .trim();
    }
  });

  return extractedData;
}

function cleanPHCData(extractedData) {
  // Simple text cleanup - only remove excessive whitespace
  const textFields = [
    'organization_name', 'establishment_type', 'address', 'issuing_authority',
    'director_name', 'license_category', 'services_authorized', 'act_reference',
    'section_reference',
  ];

  textFields.forEach((field) => {
    if (extractedData[field]) {
      extractedData[field] = extractedData[field]
        .replace(/\s+/g, ' ')
        .trim();
    }
  });

  return extractedData;
}

function cleanPMDCData(extractedData) {
  // Simple text cleanup - only remove excessive whitespace
  const textFields = [
    'name', 'father_name', 'present_address', 'permanent_address',
    'qualification', 'institute_university', 'certificate_type',
    'issuing_authority', 'registrar_signature',
  ];

  textFields.forEach((field) => {
    if (extractedData[field]) {
      extractedData[field] = extractedData[field]
        .replace(/\s+/g, ' ')
        .trim();
    }
  });

  return extractedData;
}

// Fallback extraction functions
function fallbackExtraction(ocrResult) {
  const { fullText } = ocrResult;
  const text = fullText.toLowerCase();

  // Extract CNIC number
  const cnicMatch = text.match(/\b\d{5}[-\s]?\d{7}[-\s]?\d{1}\b/);
  const cnic = cnicMatch ? cnicMatch[0].replace(/[^\d]/g, '') : '';

  return {
    name: '',
    father_name: '',
    cnic: cnic.length === 13 ? `${cnic.substr(0, 5)}-${cnic.substr(5, 7)}-${cnic.substr(12, 1)}` : '',
    dob: '',
    gender: '',
    address: '',
    confidence_score: 30,
  };
}

function fallbackDomicileExtraction(ocrResult) {
  return {
    full_name: '',
    father_name: '',
    address_in_pakistan: '',
    place_of_domicile: '',
    domicile_tehsil: '',
    district: '',
    province: '',
    date_of_arrival: '',
    marital_status: '',
    occupation: '',
    identification_mark: '',
    certificate_date: '',
    certificate_number: '',
    issuing_officer: '',
    confidence_score: 30,
  };
}

function fallbackPHCExtraction(ocrResult) {
  const { fullText } = ocrResult;
  const text = fullText.toLowerCase();

  // Extract registration number
  const regMatch = text.match(/reg\.?\s*no\.?[-:\s]*([a-z]?[-]?\d+)/i);
  const registrationNumber = regMatch ? regMatch[0] : '';

  return {
    registration_number: registrationNumber,
    organization_name: '',
    establishment_type: '',
    address: '',
    registration_date: '',
    validity_period: '',
    issuing_authority: '',
    director_name: '',
    license_category: '',
    services_authorized: '',
    certificate_date: '',
    act_reference: '',
    section_reference: '',
    confidence_score: 30,
  };
}

function fallbackPMDCExtraction(ocrResult) {
  const { fullText } = ocrResult;
  const text = fullText.toLowerCase();

  // Extract registration number
  const regMatch = text.match(/registration\s+number\s*:?\s*(\d+)/i);
  const registrationNumber = regMatch ? regMatch[1] : '';

  return {
    registration_number: registrationNumber,
    cnic_passport: '',
    name: '',
    father_name: '',
    present_address: '',
    contact_number: '',
    permanent_address: '',
    registration_date: '',
    valid_upto: '',
    qualification: '',
    institute_university: '',
    year: '',
    certificate_type: '',
    issuing_authority: '',
    registrar_signature: '',
    confidence_score: 30,
  };
}

module.exports = {
  extractCNICData,
  extractDomicileData,
  extractPHCData,
  extractPMDCData,
};
