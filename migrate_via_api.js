const fs = require('fs');
const path = require('path');
const https = require('https');
const querystring = require('querystring');

const tokenFilePath = 'C:\\Users\\hudav\\.gemini\\antigravity\\mcp_oauth_tokens.json';

// Helper to make https request
function makeRequest(url, options, bodyData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', (err) => { reject(err); });

    if (bodyData) {
      req.write(bodyData);
    }
    req.end();
  });
}

async function run() {
  console.log("Loading OAuth tokens...");
  if (!fs.existsSync(tokenFilePath)) {
    console.error(`Token file not found: ${tokenFilePath}`);
    process.exit(1);
  }

  const tokenData = JSON.parse(fs.readFileSync(tokenFilePath, 'utf-8'));
  const configKey = 'https://mcp.supabase.com/mcp';
  const mcpConfig = tokenData[configKey];

  if (!mcpConfig) {
    console.error(`Config for ${configKey} not found in token file.`);
    process.exit(1);
  }

  const { client_id, client_secret, token, token_url } = mcpConfig;
  const refreshToken = token.refresh_token;

  console.log("Refreshing token...");
  const postData = querystring.stringify({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: client_id,
    client_secret: client_secret
  });

  const refreshOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  let refreshResult;
  try {
    refreshResult = await makeRequest(token_url, refreshOptions, postData);
  } catch (e) {
    console.error("Failed to make refresh request:", e.message);
    process.exit(1);
  }

  if (refreshResult.statusCode !== 200) {
    console.error(`Refresh failed with status ${refreshResult.statusCode}:`, refreshResult.body);
    process.exit(1);
  }

  const newTokens = JSON.parse(refreshResult.body);
  console.log("Token refreshed successfully.");

  // Save new tokens back
  token.access_token = newTokens.access_token;
  token.refresh_token = newTokens.refresh_token;
  // Calculate new expiry (e.g. now + expires_in seconds)
  const expiryDate = new Date(Date.now() + (newTokens.expires_in || 3600) * 1000);
  token.expiry = expiryDate.toISOString();

  fs.writeFileSync(tokenFilePath, JSON.stringify(tokenData, null, 2), 'utf-8');
  console.log("Saved new tokens to file.");

  // Load schema.sql
  const schemaSql = fs.readFileSync('schema.sql', 'utf-8');
  console.log("Executing SQL schema...");

  const queryUrl = `https://api.supabase.com/v1/projects/fheddjuiedseynqxhsfb/database/query`;
  const queryBody = JSON.stringify({
    query: schemaSql
  });

  const queryOptions = {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${newTokens.access_token}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(queryBody)
    }
  };

  let queryResult;
  try {
    queryResult = await makeRequest(queryUrl, queryOptions, queryBody);
  } catch (e) {
    console.error("Failed to execute SQL query:", e.message);
    process.exit(1);
  }

  console.log(`Query execution status code: ${queryResult.statusCode}`);
  console.log("Response body:");
  console.log(queryResult.body);

  if (queryResult.statusCode !== 200 && queryResult.statusCode !== 201) {
    console.log("Attempting alternate query endpoint (/sql)...");
    const sqlUrl = `https://api.supabase.com/v1/projects/fheddjuiedseynqxhsfb/sql`;
    let sqlResult;
    try {
      sqlResult = await makeRequest(sqlUrl, queryOptions, queryBody);
      console.log(`Alternate SQL status: ${sqlResult.statusCode}`);
      console.log(sqlResult.body);
    } catch (e2) {
      console.error("Failed alternate SQL request:", e2.message);
    }
  }
}

run();
