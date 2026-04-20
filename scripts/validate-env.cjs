#!/usr/bin/env node

/**
 * Environment Validation Script for Kudi Chat Navigator
 * 
 * This script validates and displays the current environment configuration.
 * Run with: node scripts/validate-env.js
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

// Required environment variables
const requiredVars = [
  'VITE_API_BASE_URL',
  'VITE_API_PROD_URL',
  'VITE_WHATSAPP_NUMBER'
];

// Optional but recommended variables
const recommendedVars = [
  'VITE_SUPPORT_EMAIL',
  'VITE_DEBUG_API',
  'VITE_ENABLE_WHATSAPP',
  'VITE_ENABLE_DOCUMENTS',
  'VITE_BRAND_PRIMARY_COLOR'
];

// All possible variables
const allVars = [
  ...requiredVars,
  ...recommendedVars,
  'VITE_API_TIMEOUT',
  'VITE_API_RETRY_COUNT',
  'VITE_API_CACHE_TIME',
  'VITE_WHATSAPP_MESSAGE',
  'VITE_COMPANY_WEBSITE',
  'VITE_DEV_MODE',
  'VITE_ENABLE_MAP',
  'VITE_ENABLE_ANIMATIONS',
  'VITE_DEFAULT_LANGUAGE',
  'VITE_DEFAULT_THEME',
  'VITE_WHATSAPP_COLOR',
  'VITE_MAX_FILE_SIZE',
  'VITE_ALLOWED_FILE_TYPES',
  'VITE_DOCS_PER_PAGE',
  'VITE_GOOGLE_MAPS_API_KEY',
  'VITE_ANALYTICS_ID',
  'VITE_API_RATE_LIMIT',
  'VITE_FORCE_HTTPS',
  'VITE_SHOW_ERROR_DETAILS',
  'VITE_ENABLE_DEVTOOLS',
  'VITE_MOCK_API'
];

function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  const env = {};
  
  if (!fs.existsSync(envPath)) {
    log('⚠️  .env file not found. Using system environment only.', 'yellow');
    return process.env;
  }
  
  const content = fs.readFileSync(envPath, 'utf8');
  const lines = content.split('\n');
  
  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        let value = valueParts.join('=');
        // Remove quotes if present
        value = value.replace(/^['"`]|['"`]$/g, '');
        env[key.trim()] = value;
      }
    }
  });
  
  // Merge with system env (system env takes precedence)
  return { ...env, ...process.env };
}

function validateUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function validatePhone(phone) {
  return /^\d{9,15}$/.test(phone);
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateColor(color) {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

function validateVar(key, value) {
  if (!value) return { valid: false, message: 'Not set' };
  
  switch (key) {
    case 'VITE_API_BASE_URL':
    case 'VITE_API_PROD_URL':
    case 'VITE_COMPANY_WEBSITE':
      return validateUrl(value) 
        ? { valid: true, message: 'Valid URL' }
        : { valid: false, message: 'Invalid URL format' };
        
    case 'VITE_WHATSAPP_NUMBER':
      return validatePhone(value)
        ? { valid: true, message: 'Valid phone number' }
        : { valid: false, message: 'Invalid phone format (digits only, 9-15 chars)' };
        
    case 'VITE_SUPPORT_EMAIL':
      return validateEmail(value)
        ? { valid: true, message: 'Valid email' }
        : { valid: false, message: 'Invalid email format' };
        
    case 'VITE_BRAND_PRIMARY_COLOR':
    case 'VITE_WHATSAPP_COLOR':
      return validateColor(value)
        ? { valid: true, message: 'Valid color' }
        : { valid: false, message: 'Invalid color format (use #RRGGBB)' };
        
    case 'VITE_DEFAULT_LANGUAGE':
      return ['pt', 'en'].includes(value)
        ? { valid: true, message: 'Valid language' }
        : { valid: false, message: 'Must be "pt" or "en"' };
        
    case 'VITE_DEFAULT_THEME':
      return ['light', 'dark'].includes(value)
        ? { valid: true, message: 'Valid theme' }
        : { valid: false, message: 'Must be "light" or "dark"' };
        
    default:
      return { valid: true, message: 'Set' };
  }
}

function main() {
  log('\n' + '='.repeat(60), 'blue');
  log('🔧 KUDI CHAT NAVIGATOR - Environment Validation', 'blue');
  log('='.repeat(60), 'blue');
  
  const env = loadEnvFile();
  
  // Check for .env.example
  const examplePath = path.join(process.cwd(), '.env.example');
  if (fs.existsSync(examplePath)) {
    log('✅ .env.example file found', 'green');
  } else {
    log('⚠️  .env.example file missing', 'yellow');
  }
  
  log('\n📋 ENVIRONMENT CONFIGURATION STATUS\n', 'cyan');
  
  let hasErrors = false;
  let hasWarnings = false;
  
  // Check required variables
  log('🔴 REQUIRED VARIABLES:', 'red');
  requiredVars.forEach(key => {
    const value = env[key];
    const validation = validateVar(key, value);
    
    if (!value) {
      log(`  ❌ ${key}: NOT SET`, 'red');
      hasErrors = true;
    } else if (!validation.valid) {
      log(`  ❌ ${key}: ${validation.message}`, 'red');
      hasErrors = true;
    } else {
      log(`  ✅ ${key}: ${validation.message}`, 'green');
    }
  });
  
  // Check recommended variables
  log('\n🟡 RECOMMENDED VARIABLES:', 'yellow');
  recommendedVars.forEach(key => {
    const value = env[key];
    const validation = validateVar(key, value);
    
    if (!value) {
      log(`  ⚠️  ${key}: Not set (using default)`, 'yellow');
      hasWarnings = true;
    } else if (!validation.valid) {
      log(`  ⚠️  ${key}: ${validation.message}`, 'yellow');
      hasWarnings = true;
    } else {
      log(`  ✅ ${key}: ${validation.message}`, 'green');
    }
  });
  
  // Show all configured variables
  log('\n🔵 ALL CONFIGURED VITE VARIABLES:', 'blue');
  const viteVars = Object.keys(env)
    .filter(key => key.startsWith('VITE_'))
    .sort();
    
  if (viteVars.length === 0) {
    log('  No VITE_ variables found', 'yellow');
  } else {
    viteVars.forEach(key => {
      const value = env[key];
      const isKnown = allVars.includes(key);
      const truncated = value && value.length > 50 ? value.substring(0, 47) + '...' : value;
      
      if (!isKnown) {
        log(`  🔸 ${key}: ${truncated} (unknown variable)`, 'cyan');
      } else {
        log(`  📌 ${key}: ${truncated}`, 'blue');
      }
    });
  }
  
  // Summary
  log('\n' + '='.repeat(60), 'blue');
  
  if (hasErrors) {
    log('❌ VALIDATION FAILED', 'red');
    log('   Required variables are missing or invalid.', 'red');
    log('   Please check your .env file configuration.', 'red');
  } else if (hasWarnings) {
    log('⚠️  VALIDATION PASSED WITH WARNINGS', 'yellow');
    log('   All required variables are set, but some recommended ones are missing.', 'yellow');
    log('   The app will use default values for missing variables.', 'yellow');
  } else {
    log('✅ VALIDATION PASSED', 'green');
    log('   All variables are properly configured!', 'green');
  }
  
  log('\n📖 For more information, see ENV_DOCS.md', 'cyan');
  log('🔧 To update configuration, edit your .env file\n', 'cyan');
  
  process.exit(hasErrors ? 1 : 0);
}

if (require.main === module) {
  main();
}

module.exports = { validateVar, loadEnvFile };