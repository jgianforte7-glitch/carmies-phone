const https = require('https');

exports.handler = (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const body = JSON.parse(event.body);
    const { filename, content, token } = body;

    if (!filename || !content || !token) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing data' }) };
    }

    const postData = JSON.stringify({
      message: `Add photo: ${filename}`,
      content: content,
      branch: 'main'
    });

    const options = {
      hostname: 'api.github.com',
      path: `/repos/jgianforte7-glitch/carmies-phone/contents/photos/${filename}`,
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'User-Agent': 'netlify-function',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    return new Promise((resolve) => {
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            body: JSON.stringify({ success: res.statusCode === 201 })
          });
        });
      });

      req.on('error', (err) => {
        resolve({ statusCode: 500, body: JSON.stringify({ error: err.message }) });
      });

      req.write(postData);
      req.end();
    });
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
