const { visionClient } = require('../config/aiConfig');

// Simplified OCR with basic text detection
async function detectText(imagePath) {
  try {
    const [documentResult] = await visionClient.documentTextDetection(imagePath);
    const [textResult] = await visionClient.textDetection(imagePath);

    let extractedText = '';

    // Get full text from document detection
    if (documentResult.fullTextAnnotation) {
      extractedText = documentResult.fullTextAnnotation.text;
    } else if (textResult.textAnnotations && textResult.textAnnotations.length > 0) {
      extractedText = textResult.textAnnotations[0].description;
    }

    console.log('📝 OCR Results:');
    console.log('- Document text length:', extractedText.length);

    return {
      fullText: extractedText,
      hasText: extractedText.trim().length > 0,
    };
  } catch (error) {
    console.error('❌ Error detecting text:', error.message);
    throw new Error(`OCR failed: ${error.message}`);
  }
}

module.exports = {
  detectText,
};
