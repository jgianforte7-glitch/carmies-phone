exports.handler = async (event, context) => {
  try {
    const fetch = require('node-fetch');
    
    // Parse multipart form data
    const boundary = event.headers['content-type'].split('boundary=')[1];
    const parts = event.body.split(`--${boundary}`);
    
    let fileBase64 = null;
    let fileName = null;
    let token = null;

    for (const part of parts) {
      if (part.includes('name="file"')) {
        // Extract filename and file content
        const nameMatch = part.match(/filename="([^"]+)"/);
        if (nameMatch) fileName = nameMatch[1];
        
        // Find the actual file data (after headers)
        const headerEnd = part.indexOf('\r\n\r\n');
        if (headerEnd !== -1) {
          const footerStart = part.lastIndexOf('\r\n');
          const fileData = part.substring(headerEnd + 4, footerStart);
          fileBase64 = Buffer.from(fileData, 'binary').toString('base64');
        }
      } else if (part.includes('name="token"')) {
        const tokenMatch = part.match(/\r\n\r\n([\s\S]+?)\r\n/);
        if (tokenMatch) token = tokenMatch[1].trim();
      }
    }

    if (!fileBase64 || !fileName || !token) {
      return { 
        statusCode: 400, 
        body: JSON.stringify({ error: 'Missing file or token' }) 
      };
    }

    // Upload to GitHub
    const response = await fetch(
      'https://api.github.com/repos/jgianforte7-glitch/carmies-phone/contents/photos/' + encodeURIComponent(fileName),
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Add photo: ${fileName}`,
          content: fileBase64,
          branch: 'main'
        })
      }
    );

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: 'GitHub upload failed' })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
