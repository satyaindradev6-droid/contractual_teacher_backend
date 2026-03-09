/**
 * Test script for document upload API
 * 
 * Usage:
 * node test-upload.js <application_id>
 * 
 * Example:
 * node test-upload.js 1
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const http = require('http');

// Configuration
const API_URL = 'http://localhost:8000/api/upload-documents';
const APPLICATION_ID = process.argv[2] || '1';

// Create test files if they don't exist
function createTestFiles() {
  const testDir = path.join(__dirname, 'test-files');
  
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  // Create a small test PDF (just a simple text file with .pdf extension for testing)
  const pdfContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/Resources <<\n/Font <<\n/F1 4 0 R\n>>\n>>\n/MediaBox [0 0 612 792]\n/Contents 5 0 R\n>>\nendobj\n4 0 obj\n<<\n/Type /Font\n/Subtype /Type1\n/BaseFont /Helvetica\n>>\nendobj\n5 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n100 700 Td\n(Test Document) Tj\nET\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\n0000000262 00000 n\n0000000341 00000 n\ntrailer\n<<\n/Size 6\n/Root 1 0 R\n>>\nstartxref\n437\n%%EOF';
  
  // Create test files
  fs.writeFileSync(path.join(testDir, 'test-photo.jpg'), Buffer.from('FFD8FFE000104A46494600010101006000600000', 'hex'));
  fs.writeFileSync(path.join(testDir, 'test-pan.jpg'), Buffer.from('FFD8FFE000104A46494600010101006000600000', 'hex'));
  fs.writeFileSync(path.join(testDir, 'test-aadhar.pdf'), pdfContent);
  fs.writeFileSync(path.join(testDir, 'test-marksheet.pdf'), pdfContent);
  
  console.log('✓ Test files created in test-files/ directory');
  return testDir;
}

// Upload documents
async function uploadDocuments() {
  try {
    const testDir = createTestFiles();
    
    const form = new FormData();
    form.append('application_id', APPLICATION_ID);
    
    // Add test files
    form.append('photo', fs.createReadStream(path.join(testDir, 'test-photo.jpg')), 'photo.jpg');
    form.append('pan_card', fs.createReadStream(path.join(testDir, 'test-pan.jpg')), 'pan_card.jpg');
    form.append('aadhar_card', fs.createReadStream(path.join(testDir, 'test-aadhar.pdf')), 'aadhar_card.pdf');
    form.append('marksheet1', fs.createReadStream(path.join(testDir, 'test-marksheet.pdf')), 'marksheet1.pdf');
    
    console.log(`\n📤 Uploading documents for application_id: ${APPLICATION_ID}`);
    console.log('Files to upload:');
    console.log('  - photo.jpg');
    console.log('  - pan_card.jpg');
    console.log('  - aadhar_card.pdf');
    console.log('  - marksheet1.pdf');
    console.log('\nSending request...\n');

    const url = new URL(API_URL);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 8000,
      path: url.pathname,
      method: 'POST',
      headers: form.getHeaders()
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('Response Status:', res.statusCode);
        console.log('Response Body:', data);
        
        try {
          const jsonData = JSON.parse(data);
          if (jsonData.status) {
            console.log('\n✅ Upload successful!');
            console.log(`Files stored in: contractual_upload/1-1000/${APPLICATION_ID}/`);
          } else {
            console.log('\n❌ Upload failed:', jsonData.message);
          }
        } catch (e) {
          console.log('\n❌ Error parsing response');
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request error:', error.message);
      console.log('\nMake sure the server is running on http://localhost:8000');
    });

    form.pipe(req);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the upload
uploadDocuments();
