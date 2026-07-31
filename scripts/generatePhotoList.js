const fs = require('fs');
const path = require('path');

const photosDir = path.join(__dirname, '../photos');
const photoList = [];

// Check if photos folder exists
if (fs.existsSync(photosDir)) {
  const files = fs.readdirSync(photosDir);
  
  files.forEach(file => {
    const ext = path.extname(file).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.gif', '.mp4', '.mov'].includes(ext)) {
      const isVideo = ['.mp4', '.mov'].includes(ext);
      photoList.push({
        file: file,
        type: isVideo ? 'video' : 'image',
        name: path.basename(file, path.extname(file))
      });
    }
  });
}

// Write to a JSON file that the function can read
fs.writeFileSync(
  path.join(__dirname, '../netlify/functions/photos-manifest.json'),
  JSON.stringify(photoList, null, 2)
);

console.log('✅ Generated photo manifest:', photoList.length, 'photos found');
