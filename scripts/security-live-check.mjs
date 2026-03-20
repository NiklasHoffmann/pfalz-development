import https from 'node:https';

const baseUrl =
  process.env.SECURITY_CHECK_BASE_URL || 'https://pfalz-development.de';
const urls = [baseUrl, `${baseUrl}/en`];

const requiredHeaders = [
  'strict-transport-security',
  'content-security-policy',
  'referrer-policy',
  'permissions-policy',
  'x-frame-options',
  'x-content-type-options',
  'cross-origin-opener-policy',
  'cross-origin-resource-policy',
];

function getHeaders(url) {
  return new Promise((resolve, reject) => {
    const request = https.request(url, { method: 'HEAD' }, (response) => {
      resolve(response.headers);
    });

    request.on('error', reject);
    request.end();
  });
}

let hasError = false;

for (const url of urls) {
  console.log(`\nChecking ${url}`);
  const headers = await getHeaders(url);

  for (const header of requiredHeaders) {
    if (!headers[header]) {
      hasError = true;
      console.error(`[FAIL] Missing header: ${header}`);
      continue;
    }

    console.log(`[ OK ] ${header} -> ${headers[header]}`);
  }
}

if (hasError) {
  console.error('\nSecurity header check failed.');
  process.exit(1);
}

console.log('\nSecurity header check passed.');
