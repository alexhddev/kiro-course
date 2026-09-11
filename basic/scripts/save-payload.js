#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the payloads file
const PAYLOADS_FILE = path.join(__dirname, 'payloads.json');

// Read stdin
let inputData = '';

process.stdin.setEncoding('utf8');

process.stdin.on('data', (chunk) => {
  inputData += chunk;
});

process.stdin.on('end', () => {
  try {
    // Parse the incoming payload
    const newPayload = JSON.parse(inputData);
    
    // Read existing payloads or initialize empty array
    let payloads = [];
    if (fs.existsSync(PAYLOADS_FILE)) {
      const fileContent = fs.readFileSync(PAYLOADS_FILE, 'utf8');
      if (fileContent.trim()) {
        payloads = JSON.parse(fileContent);
      }
    }
    
    // Ensure payloads is an array
    if (!Array.isArray(payloads)) {
      payloads = [];
    }
    
    // Add timestamp to the payload
    newPayload.timestamp = new Date().toISOString();
    
    // Append new payload
    payloads.push(newPayload);
    
    // Write back to file with pretty formatting
    fs.writeFileSync(PAYLOADS_FILE, JSON.stringify(payloads, null, 2), 'utf8');
    
    console.log('Payload saved successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error saving payload:', error.message);
    process.exit(1);
  }
});

// Handle case where stdin is empty
process.stdin.on('error', (error) => {
  console.error('Error reading stdin:', error.message);
  process.exit(1);
});
