/**
 * @qualityhub/eslint-config
 *
 * Shared ESLint configurations for QualityHub projects
 *
 * Available configurations:
 * - base: Base TypeScript configuration
 * - react: React + TypeScript configuration
 * - nestjs: NestJS + TypeScript configuration
 */

export { createBaseConfig, default as base } from './base.js';
export { createReactConfig, default as react } from './react.js';
export { createNestJSConfig, default as nestjs } from './nestjs.js';
