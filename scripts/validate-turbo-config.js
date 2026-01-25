#!/usr/bin/env node

/**
 * Validates turbo.json configuration
 * Tests the build pipeline structure and task dependencies
 */

const fs = require('fs');
const path = require('path');

const TURBO_CONFIG_PATH = path.join(__dirname, '..', 'turbo.json');

function loadConfig() {
  const content = fs.readFileSync(TURBO_CONFIG_PATH, 'utf-8');
  return JSON.parse(content);
}

function validateSchema(config) {
  if (!config.$schema) {
    throw new Error('Missing $schema field');
  }
  if (!config.$schema.includes('turbo.build')) {
    throw new Error('Invalid schema URL');
  }
}

function validateTasks(config) {
  if (!config.tasks || typeof config.tasks !== 'object') {
    throw new Error('Missing or invalid tasks field');
  }
}

function validateDevTask(config) {
  const dev = config.tasks.dev;
  if (!dev) {
    throw new Error('Missing dev task');
  }
  if (dev.persistent !== true) {
    throw new Error('dev task should be persistent');
  }
  if (dev.cache !== false) {
    throw new Error('dev task should have cache disabled');
  }
}

function validateBuildTask(config) {
  const build = config.tasks.build;
  if (!build) {
    throw new Error('Missing build task');
  }
  if (!build.dependsOn || !build.dependsOn.includes('^build')) {
    throw new Error('build task should depend on ^build (workspace dependencies)');
  }
  if (!build.outputs || !Array.isArray(build.outputs)) {
    throw new Error('build task should specify outputs');
  }
}

function validateTestTask(config) {
  const test = config.tasks.test;
  if (!test) {
    throw new Error('Missing test task');
  }
  if (!test.dependsOn || !test.dependsOn.includes('build')) {
    throw new Error('test task should depend on build');
  }
}

function validateLintTask(config) {
  const lint = config.tasks.lint;
  if (!lint) {
    throw new Error('Missing lint task');
  }
  if (!lint.dependsOn || !lint.dependsOn.includes('build')) {
    throw new Error('lint task should depend on build');
  }
}

function validatePipeline(config) {
  // Verify the pipeline order: build -> test, build -> lint
  const test = config.tasks.test;
  const lint = config.tasks.lint;
  const build = config.tasks.build;

  // Check that test depends on build
  if (!test.dependsOn.includes('build')) {
    throw new Error('Pipeline error: test should depend on build');
  }

  // Check that lint depends on build
  if (!lint.dependsOn.includes('build')) {
    throw new Error('Pipeline error: lint should depend on build');
  }
}

function runTests() {
  const tests = [
    { name: 'Load config', fn: loadConfig },
    { name: 'Validate schema', fn: () => validateSchema(loadConfig()) },
    { name: 'Validate tasks', fn: () => validateTasks(loadConfig()) },
    { name: 'Validate dev task (persistent)', fn: () => validateDevTask(loadConfig()) },
    { name: 'Validate build task', fn: () => validateBuildTask(loadConfig()) },
    { name: 'Validate test task', fn: () => validateTestTask(loadConfig()) },
    { name: 'Validate lint task', fn: () => validateLintTask(loadConfig()) },
    { name: 'Validate pipeline (build -> test -> lint)', fn: () => validatePipeline(loadConfig()) },
  ];

  let passed = 0;
  let failed = 0;

  console.log('Running turbo.json validation tests...\n');

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
