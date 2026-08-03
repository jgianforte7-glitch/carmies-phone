const https = require('https');

exports.handler = async (event, context) => {
  try {
    const { fileName, base64Data, token } = JSON.parse(event.body);
    
    if (!fileName || !base64Data || !token) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // Decode base64 to binary
    const binaryData = Buffer.from(base64Data, 'base64');
    
    // GitHub API call to upload file
    const githubPath = `photos/${fileName}`;
    const sha = await getFileSha(token, githubPath);
    
    const response = await githubCommit(token, githubPath, binaryData, sha);
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, message: 'Photo uploaded!' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

function getFileSha(token, path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/jgianforte7-glitch/carmies-phone/contents/${path}`,
      method: 'GET',
      headers: {
        'Authorization': `token ${token}`,
        'User-Agent': 'carmies-phone-uploader'
      }
    };

    https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 404) {
          resolve(null);
        } else if (res.statusCode === 200) {
          resolve(JSON.parse(data).sha);
        } else {
          reject(new Error(`GitHub error: ${res.statusCode}`));
        }
      });
    }).on('error', reject).end();
  });
}

function githubCommit(token, path, data, sha) {
  return new Promise((resolve, reject) => {
    const message = `Upload photo: ${path}`;
    const content = data.toString('base64');
    
    const body = JSON.stringify({
      message: message,
      content: content,
      sha: sha,
      branch: 'main'
    });

    const options = {
      hostname: 'api.github.com',
      path: `/repos/jgianforte7-glitch/carmies-phone/contents/${path}`,
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'User-Agent': 'carmies-phone-uploader',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };

    https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 201 || res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Upload failed: ${res.statusCode}`));
        }
      });
    }).on('error', reject).write(body);
  });
}
