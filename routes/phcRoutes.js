/* eslint-disable consistent-return */
/* eslint-disable camelcase */
const express = require('express');

const router = express.Router();
const { upload } = require('../config/multerConfig');
const { detectText } = require('../services/ocrService');
const { validatePHC } = require('../services/validationService');
const { extractPHCData } = require('../services/extractionService');
const { saveBase64Image, cleanupFile } = require('../utils/imageUtils');

// Extract PHC data from uploaded image
router.post('/extract-phc', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file uploaded',
      });
    }

    console.log(`📁 Processing PHC file: ${req.file.filename}`);

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

    // Basic PHC validation
    const validation = validatePHC(ocrResult);

    if (!validation.isPHC) {
      cleanupFile(req.file.path);
      return res.status(400).json({
        success: false,
        error: 'This does not appear to be a Punjab Healthcare Commission Registration Certificate',
        validation_details: validation,
      });
    }

    console.log('✅ PHC Validation passed');

    // Extract data
    const extractedData = await extractPHCData(ocrResult);

    cleanupFile(req.file.path);

    res.json({
      success: true,
      data: {
        extracted_fields: extractedData,
        raw_ocr_text: ocrResult.fullText,
        validation_info: {
          document_type: 'Punjab Healthcare Commission Registration Certificate',
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
    console.error('❌ PHC API Error:', error.message);

    if (req.file) {
      cleanupFile(req.file.path);
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

// Extract PHC from base64 image
router.post('/extract-phc-base64', async (req, res) => {
  let tempPath = null;

  try {
    const { image_base64, filename = 'uploaded_phc.jpg' } = req.body;

    if (!image_base64) {
      return res.status(400).json({
        success: false,
        error: 'No base64 image data provided',
      });
    }

    tempPath = saveBase64Image(image_base64, filename, 'phc');
    console.log(`📁 Processing base64 PHC image: ${filename}`);

    const ocrResult = await detectText(tempPath);

    if (!ocrResult.hasText) {
      cleanupFile(tempPath);
      return res.status(400).json({
        success: false,
        error: 'No text detected in the image',
      });
    }

    const validation = validatePHC(ocrResult);

    if (!validation.isPHC) {
      cleanupFile(tempPath);
      return res.status(400).json({
        success: false,
        error: 'Not a valid PHC Registration Certificate',
        validation_details: validation,
      });
    }

    const extractedData = await extractPHCData(ocrResult);

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
    console.error('❌ Base64 PHC API Error:', error.message);

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
