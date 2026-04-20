#!/usr/bin/env node
/**
 * Quick Setup Checker for Kudi Chat Navigator
 * Verifies that the environment migration was successful
 */

const fs = require('fs');
const path = require('path');

// ANSI colors for better output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(color, symbol, message) {
  console.log(`${color}${symbol}${colors.reset} ${message}`);
}

function checkFileExists(filePath, description) {
  try {
    fs.accessSync(filePath);
    log(colors.green, '✅', `${description}: Found`);
    return true;
  } catch {
    log(colors.red, '❌', `${description}: Missing`);
    return false;
  }
}

function checkFileContains(filePath, searchString, description) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(searchString)) {
      log(colors.green, '✅', `${description}: OK`);
      return true;
    } else {
      log(colors.yellow, '⚠️', `${description}: Not found`);
      return false;
    }
  } catch {
    log(colors.red, '❌', `${description}: File error`);
    return false;
  }
}

console.log(`${colors.bold}${colors.cyan}`);
console.log('🚀 Kudi Chat Navigator - Environment Migration Check');
console.log('==================================================');
console.log(colors.reset);

let totalChecks = 0;
let passedChecks = 0;

// Configuration files
console.log(`${colors.bold}📁 Configuration Files:${colors.reset}`);
if (checkFileExists('.env.example', '.env.example template')) passedChecks++;
totalChecks++;

if (checkFileExists('ENV_DOCS.md', 'Environment documentation')) passedChecks++;
totalChecks++;

if (checkFileExists('src/lib/config.ts', 'Configuration manager')) passedChecks++;
totalChecks++;

if (checkFileExists('scripts/validate-env.cjs', 'Environment validator')) passedChecks++;
totalChecks++;

console.log('');

// Core components updated
console.log(`${colors.bold}🔧 Updated Components:${colors.reset}`);
if (checkFileContains('src/components/DocumentsUseful.tsx', "from '@/lib/config", 'DocumentsUseful uses config')) passedChecks++;
totalChecks++;

if (checkFileContains('src/components/Layout.tsx', "from '@/lib/config", 'Layout uses config')) passedChecks++;
totalChecks++;

if (checkFileContains('src/components/FAQs.tsx', "from '@/lib/config", 'FAQs uses config')) passedChecks++;
totalChecks++;

if (checkFileContains('src/components/KudiChat.tsx', "from '@/lib/config", 'KudiChat uses config')) passedChecks++;
totalChecks++;

console.log('');

// Package.json scripts
console.log(`${colors.bold}📦 Package.json Scripts:${colors.reset}`);
if (checkFileContains('package.json', 'validate-env', 'Validation script added')) passedChecks++;
totalChecks++;

if (checkFileContains('package.json', 'check-config', 'Config check script added')) passedChecks++;
totalChecks++;

console.log('');

// Security checks
console.log(`${colors.bold}🛡️ Security Verification:${colors.reset}`);
if (checkFileContains('.gitignore', '.env', '.env in .gitignore')) passedChecks++;
totalChecks++;

// Check for hardcoded URLs (should not exist)
const hasHardcodedUrls = checkFileContains('src/components/Layout.tsx', 'http://localhost', 'Checking for hardcoded localhost URLs');
if (!hasHardcodedUrls) {
  log(colors.green, '✅', 'No hardcoded localhost URLs: Clean');
  passedChecks++;
}
totalChecks++;

console.log('');

// Final score
const percentage = Math.round((passedChecks / totalChecks) * 100);
console.log(`${colors.bold}📊 Final Score: ${passedChecks}/${totalChecks} (${percentage}%)${colors.reset}`);

if (percentage === 100) {
  console.log(`${colors.green}${colors.bold}`);
  console.log('🎉 Perfect! Environment migration completed successfully!');
  console.log('');
  console.log('Next steps:');
  console.log('1. cp .env.example .env');
  console.log('2. npm run validate-env');
  console.log('3. npm run dev');
  console.log(colors.reset);
} else if (percentage >= 80) {
  console.log(`${colors.yellow}${colors.bold}`);
  console.log('⚠️  Almost there! Check the missing items above.');
  console.log('Run this script again after fixes.');
  console.log(colors.reset);
} else {
  console.log(`${colors.red}${colors.bold}`);
  console.log('❌ Environment migration incomplete.');
  console.log('Please review the failed checks above.');
  console.log(colors.reset);
}

console.log('');
console.log(`${colors.cyan}📚 Documentation: ENV_DOCS.md${colors.reset}`);
console.log(`${colors.cyan}🔧 Complete guide: ENVIRONMENT_MIGRATION.md${colors.reset}`);