/**
 * Generate self-signed SSL certificates for local HTTPS testing
 * This allows camera access on mobile browsers during development
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const certsDir = path.join(__dirname, 'certs');

// Create certs directory if it doesn't exist
if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir, { recursive: true });
  console.log('✅ Created certs directory');
}

const keyPath = path.join(certsDir, 'key.pem');
const certPath = path.join(certsDir, 'cert.pem');

// Check if OpenSSL is available
try {
  execSync('openssl version', { stdio: 'pipe' });
} catch (error) {
  console.error('❌ OpenSSL is not installed or not in PATH');
  console.log('\nPlease install OpenSSL:');
  console.log('  - Windows: Download from https://slproweb.com/products/Win32OpenSSL.html');
  console.log('  - Mac: brew install openssl');
  console.log('  - Linux: sudo apt-get install openssl');
  console.log('\nAlternatively, use ngrok for mobile testing:');
  console.log('  npx ngrok http 3000');
  process.exit(1);
}

// Generate self-signed certificate
console.log('🔐 Generating self-signed SSL certificate...\n');

const opensslCmd = `openssl req -x509 -newkey rsa:2048 -keyout "${keyPath}" -out "${certPath}" -days 365 -nodes -subj "/CN=localhost"`;

try {
  execSync(opensslCmd, { stdio: 'inherit' });
  console.log('\n✅ SSL certificates generated successfully!');
  console.log(`   Key:  ${keyPath}`);
  console.log(`   Cert: ${certPath}`);
  console.log('\n🚀 Now run: npm start');
  console.log('   HTTPS will be available at: https://localhost:3443');
  console.log('\n⚠️  Note: Browser will show security warning for self-signed cert.');
  console.log('   Click "Advanced" → "Proceed to localhost" to continue.');
} catch (error) {
  console.error('❌ Failed to generate certificates:', error.message);
  process.exit(1);
}
