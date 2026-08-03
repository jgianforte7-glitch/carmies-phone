const https = require('https');

exports.handler = async (event, context) => {
  try {
    const body = JSON.parse(event.body);
    const { filename, content, token } = body;

    if (!filename || !content || !token) {
      return { 
        statusCode: 400, 
        body: JSON.stringify({ error: 'Missing fields' }) 
      };
    }

    const path = `photos/${encodeURIComponent(filename)}`;
    const owner = 'jgianforte7-glitch';
    const repo = 'carmies-phone';

    return new Promise((resolve) => {
      const postData = JSON.stringify({
        message: `Add photo: ${filename}`,
        content: content,
        branch: 'main'
      });

      const options = {
        hostname: 'api.github.com',
        path: `/repos/${owner}/${repo}/contents/${path}`,
        method: 'PUT',
        headers: {
          'Authorization': `token ${token}`,
          'User-Agent': 'node.js',
          'Content-Type': 'application/json',
          'Content-Length': postData.length
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            body: JSON.stringify({ 
              success: res.statusCode === 201, 
              message: res.statusCode === 201 ? 'Uploaded' : 'Failed' 
            })
          });
        });
      });

      req.on('error', (e) => {
        resolve({
          statusCode: 500,
          body: JSON.stringify({ error: e.message })
        });
      });

      req.write(postData);
      req.end();
    });
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
