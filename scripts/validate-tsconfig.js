#!/usr/bin/env node

/**
 * Validates tsconfig.base.json configuration
 * Tests strict mode, ES2022 target, and bundler module resolution
 */

const fs = require('fs');
const path = require('path');

const TSCONFIG_PATH = path.join(__dirname, '..', 'tsconfig.base.json');

function loadConfig() {
  const content = fs.readFileSync(TSCONFIG_PATH, 'utf-8');
  return JSON.parse(content);
}

function validateFileExists() {
  if (!fs.existsSync(TSCONFIG_PATH)) {
    throw new Error('tsconfig.base.json does not exist');
  }
}

function validateJsonStructure(config) {
  if (!config.compilerOptions || typeof config.compilerOptions !== 'object') {
    throw new Error('Missing or invalid compilerOptions field');
  }
}

function validateTarget(config) {
  const { target } = config.compilerOptions;
  if (target !== 'ES2022') {
    throw new Error(`Expected target "ES2022", got "${target}"`);
  }
}

function validateModuleResolution(config) {
  const { moduleResolution } = config.compilerOptions;
  if (moduleResolution !== 'bundler') {
    throw new Error(`Expected moduleResolution "bundler", got "${moduleResolution}"`);
  }
}

function validateStrictMode(config) {
  const { strict } = config.compilerOptions;
  if (strict !== true) {
    throw new Error('strict mode should be enabled (true)');
  }
}

function validateStrictOptions(config) {
  const opts = config.compilerOptions;
  const strictOptions = [
    'strictNullChecks',
    'strictFunctionTypes',
    'strictBindCallApply',
    'strictPropertyInitialization',
    'noImplicitAny',
    'noImplicitThis',
    'alwaysStrict',
  ];

  for (const option of strictOptions) {
    if (opts[option] !== true) {
      throw new Error(`${option} should be enabled (true)`);
    }
  }
}

function validateCodeQualityOptions(config) {
  const opts = config.compilerOptions;
  const qualityOptions = [
    'noUnusedLocals',
    'noUnusedParameters',
    'noImplicitReturns',
    'noFallthroughCasesInSwitch',
  ];

  for (const option of qualityOptions) {
    if (opts[option] !== true) {
      throw new Error(`${option} should be enabled for code quality`);
    }
  }
}

function validateModuleSettings(config) {
  const opts = config.compilerOptions;

  if (!opts.module) {
    throw new Error('module should be specified');
  }

  if (opts.isolatedModules !== true) {
    throw new Error('isolatedModules should be enabled for bundler compatibility');
  }

  if (opts.esModuleInterop !== true) {
    throw new Error('esModuleInterop should be enabled');
  }
}

function validateOutputSettings(config) {
  const opts = config.compilerOptions;

  if (opts.skipLibCheck !== true) {
    throw new Error('skipLibCheck should be enabled for faster builds');
  }

  if (opts.forceConsistentCasingInFileNames !== true) {
    throw new Error('forceConsistentCasingInFileNames should be enabled');
  }
}

function runTests() {
  const tests = [
    { name: 'File exists', fn: validateFileExists },
    { name: 'Valid JSON structure', fn: () => validateJsonStructure(loadConfig()) },
    { name: 'Target is ES2022', fn: () => validateTarget(loadConfig()) },
    { name: 'Module resolution is bundler', fn: () => validateModuleResolution(loadConfig()) },
    { name: 'Strict mode enabled', fn: () => validateStrictMode(loadConfig()) },
    { name: 'Strict sub-options enabled', fn: () => validateStrictOptions(loadConfig()) },
    { name: 'Code quality options enabled', fn: () => validateCodeQualityOptions(loadConfig()) },
    { name: 'Module settings correct', fn: () => validateModuleSettings(loadConfig()) },
    { name: 'Output settings correct', fn: () => validateOutputSettings(loadConfig()) },
  ];

  let passed = 0;
  let failed = 0;

  console.log('Running tsconfig.base.json validation tests...\n');

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
