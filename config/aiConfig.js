const vision = require('@google-cloud/vision');
const { CohereClient } = require('cohere-ai');

// Initialize services
const cohere = new CohereClient({
  token: 'e8G35W5jjk5Cobh5tyubOW5dbG4e2M6woSDfF0TL',
});

const visionClient = new vision.ImageAnnotatorClient({
  keyFilename: 'ethereal-anvil-397323-e9d014420c2d.json',
});

module.exports = {
  cohere,
  visionClient,
};
