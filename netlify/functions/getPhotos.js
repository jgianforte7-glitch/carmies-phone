const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  try {
    const photosDir = path.join(__dirname, '../../photos');
    
    // Check if photos folder exists
    if (!fs.existsSync(photosDir)) {
      return {
        statusCode: 200,
        body: JSON.stringify([])
      };
    }
    
    const files = fs.readdirSync(photosDir);
    const photoItems = files
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.gif', '.mp4', '.mov'].includes(ext);
      })
      .map(file => {
        const ext = path.extname(file).toLowerCase();
        const isVideo = ['.mp4', '.mov'].includes(ext);
        return {
          file: file,
          type: isVideo ? 'video' : 'image',
          name: path.basename(file, path.extname(file))
        };
      });
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(photoItems)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
