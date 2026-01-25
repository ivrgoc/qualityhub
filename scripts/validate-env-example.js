#!/usr/bin/env node

/**
 * Validates .env.example configuration
 * Tests that all required environment variables are documented
 */

const fs = require('fs');
const path = require('path');

const ENV_EXAMPLE_PATH = path.join(__dirname, '..', '.env.example');

// Required environment variables that must be documented
const REQUIRED_VARS = ['DATABASE_URL', 'REDIS_URL', 'JWT_SECRET', 'OPENAI_API_KEY'];

// Additional expected variables based on docker-compose and app configuration
const EXPECTED_VARS = [
  'DATABASE_URL',
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
  'POSTGRES_DB',
  'POSTGRES_PORT',
  'REDIS_URL',
  'REDIS_PORT',
  'JWT_SECRET',
  'OPENAI_API_KEY',
  'ANTHROPIC_API_KEY',
  'NODE_ENV',
];

function loadEnvExample() {
  if (!fs.existsSync(ENV_EXAMPLE_PATH)) {
    throw new Error('.env.example file not found');
  }
  return fs.readFileSync(ENV_EXAMPLE_PATH, 'utf-8');
}

function parseEnvFile(content) {
  const vars = {};
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    // Skip comments and empty lines
    if (trimmed.startsWith('#') || trimmed === '') {
      continue;
    }
    // Parse KEY=value format
    const match = trimmed.match(/^([A-Z_][A-Z0-9_]*)=/);
    if (match) {
      vars[match[1]] = true;
    }
  }

  return vars;
}

function validateFileExists() {
  if (!fs.existsSync(ENV_EXAMPLE_PATH)) {
    throw new Error('.env.example file not found at project root');
  }
}

function validateRequiredVars(parsedVars) {
  const missing = REQUIRED_VARS.filter((v) => !parsedVars[v]);
  if (missing.length > 0) {
    throw new Error(`Missing required variables: ${missing.join(', ')}`);
  }
}

function validateDatabaseUrl(parsedVars) {
  if (!parsedVars.DATABASE_URL) {
    throw new Error('DATABASE_URL must be documented');
  }
}

function validateRedisUrl(parsedVars) {
  if (!parsedVars.REDIS_URL) {
    throw new Error('REDIS_URL must be documented');
  }
}

function validateJwtSecret(parsedVars) {
  if (!parsedVars.JWT_SECRET) {
    throw new Error('JWT_SECRET must be documented');
  }
}

function validateOpenaiApiKey(parsedVars) {
  if (!parsedVars.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY must be documented');
  }
}

function validateExpectedVars(parsedVars) {
  const missing = EXPECTED_VARS.filter((v) => !parsedVars[v]);
  if (missing.length > 0) {
    throw new Error(`Missing expected variables: ${missing.join(', ')}`);
  }
}

function validateHasComments() {
  const content = loadEnvExample();
  if (!content.includes('#')) {
    throw new Error('.env.example should include descriptive comments');
  }
}

function validateHasSections() {
  const content = loadEnvExample();
  // Check for section headers (lines with multiple = signs typically used as separators)
  if (!content.includes('===') && !content.includes('DATABASE') && !content.includes('REDIS')) {
    throw new Error('.env.example should have organized sections');
  }
}

function validateNonEmptyDefaults() {
  const content = loadEnvExample();
  const lines = content.split('\n');
  const varsWithDefaults = [];

  for (const line of lines) {
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.+)$/);
    if (match && match[2].trim() !== '') {
      varsWithDefaults.push(match[1]);
    }
  }

  // DATABASE_URL, REDIS_URL should have example values
  if (!varsWithDefaults.includes('DATABASE_URL')) {
    throw new Error('DATABASE_URL should have an example value');
  }
  if (!varsWithDefaults.includes('REDIS_URL')) {
    throw new Error('REDIS_URL should have an example value');
  }
}

function runTests() {
  let parsedVars = {};

  const tests = [
    { name: 'File exists', fn: validateFileExists },
    { name: 'Can load .env.example', fn: loadEnvExample },
    {
      name: 'Parse environment variables',
      fn: () => {
        parsedVars = parseEnvFile(loadEnvExample());
        if (Object.keys(parsedVars).length === 0) {
          throw new Error('No environment variables found');
        }
      },
    },
    {
      name: 'Contains DATABASE_URL',
      fn: () => validateDatabaseUrl(parseEnvFile(loadEnvExample())),
    },
    { name: 'Contains REDIS_URL', fn: () => validateRedisUrl(parseEnvFile(loadEnvExample())) },
    { name: 'Contains JWT_SECRET', fn: () => validateJwtSecret(parseEnvFile(loadEnvExample())) },
    {
      name: 'Contains OPENAI_API_KEY',
      fn: () => validateOpenaiApiKey(parseEnvFile(loadEnvExample())),
    },
    {
      name: 'Contains all required variables',
      fn: () => validateRequiredVars(parseEnvFile(loadEnvExample())),
    },
    {
      name: 'Contains all expected variables',
      fn: () => validateExpectedVars(parseEnvFile(loadEnvExample())),
    },
    { name: 'Has descriptive comments', fn: validateHasComments },
    { name: 'Has organized sections', fn: validateHasSections },
    { name: 'Has example values for connection URLs', fn: validateNonEmptyDefaults },
  ];

  let passed = 0;
  let failed = 0;

  console.log('Running .env.example validation tests...\n');

  for (const test of tests) {
    try {
      test.fn();
      console.log(`  [PASS] ${test.name}`);
      passed++;
    } catch (error) {
      console.log(`  [FAIL] ${test.name}: ${error.message}`);
      failed++;
    }
  }

  console.log(`\n${passed} passed, ${failed} failed`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
