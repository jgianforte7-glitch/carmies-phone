exports.handler = async (event, context) => {
  try {
    // On Netlify, deployed files are at the root
    // We'll try to fetch the photos by checking their URLs
    // Since we can't read server files directly, list them manually or use a workaround
    
    // For now, return empty - we'll use a different approach
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([
        { file: '126.jpg', type: 'image', name: '126' },
        { file: '176.jpg', type: 'image', name: '176' },
        { file: 'Profile Pic.jpg', type: 'image', name: 'Profile Pic' },
        { file: '60382498036_0E58985F-C698-4B17-A3D9-75A7FCF35381.JPG', type: 'image', name: 'Photo' }
      ])
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
