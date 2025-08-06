/* eslint-disable consistent-return */
/* eslint-disable camelcase */
const express = require('express');

const router = express.Router();
const { upload } = require('../config/multerConfig');
const { detectText } = require('../services/ocrService');
const { validatePMDC } = require('../services/validationService');
const { extractPMDCData } = require('../services/extractionService');
const { saveBase64Image, cleanupFile } = require('../utils/imageUtils');

// Extract PMDC data from uploaded image
router.post('/extract-pmdc', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file uploaded',
      });
    }

    console.log(`📁 Processing PMDC file: ${req.file.filename}`);

    // Simple OCR extraction
    const ocrResult = await detectText(req.file.path);

    if (!ocrResult.hasText) {
      cleanupFile(req.file.path);
      return res.status(400).json({
        success: false,
        error: 'No text detected in the image',
      });
    }

    console.log('📄 OCR completed');

    // Basic PMDC validation
    const validation = validatePMDC(ocrResult);

    if (!validation.isPMDC) {
      cleanupFile(req.file.path);
      return res.status(400).json({
        success: false,
        error: 'This does not appear to be a Pakistan Medical and Dental Council Certificate',
        validation_details: validation,
      });
    }

    console.log('✅ PMDC Validation passed');

    // Extract data
    const extractedData = await extractPMDCData(ocrResult);

    cleanupFile(req.file.path);

    res.json({
      success: true,
      data: {
        extracted_fields: extractedData,
        raw_ocr_text: ocrResult.fullText,
        validation_info: {
          document_type: 'Pakistan Medical and Dental Council Certificate',
          confidence: validation.confidence,
        },
        processing_info: {
          filename: req.file.originalname,
          file_size: req.file.size,
          processed_at: new Date().toISOString(),
          version: '5.0.0',
        },
      },
    });
  } catch (error) {
    console.error('❌ PMDC API Error:', error.message);

    if (req.file) {
      cleanupFile(req.file.path);
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

// Extract PMDC from base64 image
router.post('/extract-pmdc-base64', async (req, res) => {
  let tempPath = null;

  try {
    const { image_base64, filename = 'uploaded_pmdc.jpg' } = req.body;

    if (!image_base64) {
      return res.status(400).json({
        success: false,
        error: 'No base64 image data provided',
      });
    }

    tempPath = saveBase64Image(image_base64, filename, 'pmdc');
    console.log(`📁 Processing base64 PMDC image: ${filename}`);

    const ocrResult = await detectText(tempPath);

    if (!ocrResult.hasText) {
      cleanupFile(tempPath);
      return res.status(400).json({
        success: false,
        error: 'No text detected in the image',
      });
    }

    const validation = validatePMDC(ocrResult);

    if (!validation.isPMDC) {
      cleanupFile(tempPath);
      return res.status(400).json({
        success: false,
        error: 'Not a valid PMDC Certificate',
        validation_details: validation,
      });
    }

    const extractedData = await extractPMDCData(ocrResult);

    cleanupFile(tempPath);

    res.json({
      success: true,
      data: {
        extracted_fields: extractedData,
        raw_ocr_text: ocrResult.fullText,
        validation_info: validation,
        processing_info: {
          filename,
          processed_at: new Date().toISOString(),
          version: '5.0.0',
        },
      },
    });
  } catch (error) {
    console.error('❌ Base64 PMDC API Error:', error.message);

    if (tempPath) {
      cleanupFile(tempPath);
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

module.exports = router;
