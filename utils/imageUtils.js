const fs = require('fs');

// Convert base64 to image file
function saveBase64Image(base64Data, filename, documentType) {
  const base64Clean = base64Data.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Clean, 'base64');
  const tempPath = `./uploads/temp-${documentType}-${Date.now()}.jpg`;

  if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads', { recursive: true });
  }

  fs.writeFileSync(tempPath, buffer);
  return tempPath;
}

// Clean up temporary files
function cleanupFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️  Cleaned up file: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error cleaning up file ${filePath}:`, error.message);
  }
}

module.exports = {
  saveBase64Image,
  cleanupFile,
};
