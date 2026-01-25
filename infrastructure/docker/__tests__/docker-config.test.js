/**
 * Docker Configuration Tests
 * Validates the structure and content of Dockerfiles and docker-compose.yml
 */

const fs = require('fs');
const path = require('path');

const DOCKER_DIR = path.join(__dirname, '..');

describe('Docker Configuration', () => {
  describe('Dockerfile.web', () => {
    const dockerfilePath = path.join(DOCKER_DIR, 'Dockerfile.web');
    let content;

    beforeAll(() => {
      content = fs.readFileSync(dockerfilePath, 'utf8');
    });

    test('file exists', () => {
      expect(fs.existsSync(dockerfilePath)).toBe(true);
    });

    test('uses multi-stage build', () => {
      expect(content).toMatch(/FROM.*AS builder/i);
      expect(content).toMatch(/FROM.*AS production/i);
    });

    test('uses Node.js base image for builder', () => {
      expect(content).toMatch(/FROM node:\d+-alpine AS builder/i);
    });

    test('uses nginx for production', () => {
      expect(content).toMatch(/FROM nginx:alpine AS production/i);
    });

    test('includes pnpm setup', () => {
      expect(content).toMatch(/corepack enable/);
      expect(content).toMatch(/pnpm/);
    });

    test('exposes port 80', () => {
      expect(content).toMatch(/EXPOSE 80/);
    });

    test('includes health check', () => {
      expect(content).toMatch(/HEALTHCHECK/);
    });

    test('builds web application', () => {
      expect(content).toMatch(/pnpm.*build/);
    });
  });

  describe('Dockerfile.api', () => {
    const dockerfilePath = path.join(DOCKER_DIR, 'Dockerfile.api');
    let content;

    beforeAll(() => {
      content = fs.readFileSync(dockerfilePath, 'utf8');
    });

    test('file exists', () => {
      expect(fs.existsSync(dockerfilePath)).toBe(true);
    });

    test('uses multi-stage build', () => {
      expect(content).toMatch(/FROM.*AS builder/i);
      expect(content).toMatch(/FROM.*AS production/i);
    });

    test('uses Node.js base image', () => {
      expect(content).toMatch(/FROM node:\d+-alpine/i);
    });

    test('creates non-root user', () => {
      expect(content).toMatch(/adduser.*nestjs/i);
      expect(content).toMatch(/USER nestjs/i);
    });

    test('sets production environment', () => {
      expect(content).toMatch(/NODE_ENV=production/);
    });

    test('exposes port 3000', () => {
      expect(content).toMatch(/EXPOSE 3000/);
    });

    test('includes health check', () => {
      expect(content).toMatch(/HEALTHCHECK/);
    });

    test('installs production dependencies only', () => {
      expect(content).toMatch(/pnpm install.*--prod/);
    });
  });

  describe('Dockerfile.ai-service', () => {
    const dockerfilePath = path.join(DOCKER_DIR, 'Dockerfile.ai-service');
    let content;

    beforeAll(() => {
      content = fs.readFileSync(dockerfilePath, 'utf8');
    });

    test('file exists', () => {
      expect(fs.existsSync(dockerfilePath)).toBe(true);
    });

    test('uses multi-stage build', () => {
      expect(content).toMatch(/FROM.*AS builder/i);
      expect(content).toMatch(/FROM.*AS production/i);
    });

    test('uses Python 3.11 base image', () => {
      expect(content).toMatch(/FROM python:3\.11-slim/i);
    });

    test('creates virtual environment', () => {
      expect(content).toMatch(/python -m venv/);
    });

    test('creates non-root user', () => {
      expect(content).toMatch(/useradd.*fastapi/i);
      expect(content).toMatch(/USER fastapi/i);
    });

    test('sets Python environment variables', () => {
      expect(content).toMatch(/PYTHONDONTWRITEBYTECODE=1/);
      expect(content).toMatch(/PYTHONUNBUFFERED=1/);
    });

    test('exposes port 8000', () => {
      expect(content).toMatch(/EXPOSE 8000/);
    });

    test('includes health check', () => {
      expect(content).toMatch(/HEALTHCHECK/);
    });

    test('starts with uvicorn', () => {
      expect(content).toMatch(/uvicorn/);
    });
  });

  describe('docker-compose.yml', () => {
    const composePath = path.join(DOCKER_DIR, 'docker-compose.yml');
    let content;

    beforeAll(() => {
      content = fs.readFileSync(composePath, 'utf8');
    });

    test('file exists', () => {
      expect(fs.existsSync(composePath)).toBe(true);
    });

    test('defines postgres service', () => {
      expect(content).toMatch(/postgres:/);
      expect(content).toMatch(/postgres:16-alpine/);
    });

    test('defines redis service', () => {
      expect(content).toMatch(/redis:/);
      expect(content).toMatch(/redis:7-alpine/);
    });

    test('defines api service', () => {
      expect(content).toMatch(/api:/);
      expect(content).toMatch(/Dockerfile\.api/);
    });

    test('defines ai-service', () => {
      expect(content).toMatch(/ai-service:/);
      expect(content).toMatch(/Dockerfile\.ai-service/);
    });

    test('defines web service', () => {
      expect(content).toMatch(/web:/);
      expect(content).toMatch(/Dockerfile\.web/);
    });

    test('defines volumes for data persistence', () => {
      expect(content).toMatch(/postgres_data:/);
      expect(content).toMatch(/redis_data:/);
    });

    test('defines network', () => {
      expect(content).toMatch(/qualityhub-network/);
    });

    test('includes health checks for services', () => {
      const healthcheckCount = (content.match(/healthcheck:/g) || []).length;
      expect(healthcheckCount).toBeGreaterThanOrEqual(4);
    });

    test('api depends on postgres and redis', () => {
      expect(content).toMatch(/api:[\s\S]*?depends_on:[\s\S]*?postgres:/);
      expect(content).toMatch(/api:[\s\S]*?depends_on:[\s\S]*?redis:/);
    });

    test('web depends on api', () => {
      expect(content).toMatch(/web:[\s\S]*?depends_on:[\s\S]*?api:/);
    });
  });

  describe('nginx.conf', () => {
    const nginxPath = path.join(DOCKER_DIR, 'nginx.conf');
    let content;

    beforeAll(() => {
      content = fs.readFileSync(nginxPath, 'utf8');
    });

    test('file exists', () => {
      expect(fs.existsSync(nginxPath)).toBe(true);
    });

    test('includes gzip compression', () => {
      expect(content).toMatch(/gzip on/);
    });

    test('includes API proxy configuration', () => {
      expect(content).toMatch(/location \/api\//);
      expect(content).toMatch(/proxy_pass/);
    });

    test('includes SPA fallback', () => {
      expect(content).toMatch(/try_files.*\/index\.html/);
    });

    test('includes security headers', () => {
      expect(content).toMatch(/X-Frame-Options/);
      expect(content).toMatch(/X-Content-Type-Options/);
      expect(content).toMatch(/X-XSS-Protection/);
    });

    test('includes health check endpoint', () => {
      expect(content).toMatch(/location \/health/);
    });

    test('includes static asset caching', () => {
      expect(content).toMatch(/expires 1y/);
      expect(content).toMatch(/Cache-Control/);
    });
  });

  describe('.env.example', () => {
    const envPath = path.join(DOCKER_DIR, '.env.example');
    let content;

    beforeAll(() => {
      content = fs.readFileSync(envPath, 'utf8');
    });

    test('file exists', () => {
      expect(fs.existsSync(envPath)).toBe(true);
    });

    test('includes PostgreSQL configuration', () => {
      expect(content).toMatch(/POSTGRES_USER/);
      expect(content).toMatch(/POSTGRES_PASSWORD/);
      expect(content).toMatch(/POSTGRES_DB/);
    });

    test('includes JWT secret', () => {
      expect(content).toMatch(/JWT_SECRET/);
    });

    test('includes AI API keys placeholders', () => {
      expect(content).toMatch(/OPENAI_API_KEY/);
      expect(content).toMatch(/ANTHROPIC_API_KEY/);
    });
  });

  describe('.dockerignore', () => {
    const dockerignorePath = path.join(DOCKER_DIR, '.dockerignore');
    let content;

    beforeAll(() => {
      content = fs.readFileSync(dockerignorePath, 'utf8');
    });

    test('file exists', () => {
      expect(fs.existsSync(dockerignorePath)).toBe(true);
    });

    test('ignores node_modules', () => {
      expect(content).toMatch(/node_modules/);
    });

    test('ignores .git directory', () => {
      expect(content).toMatch(/\.git/);
    });

    test('ignores environment files', () => {
      expect(content).toMatch(/\.env/);
    });

    test('ignores build outputs', () => {
      expect(content).toMatch(/dist/);
      expect(content).toMatch(/build/);
    });

    test('ignores Python cache', () => {
      expect(content).toMatch(/__pycache__/);
      expect(content).toMatch(/\.pyc/);
    });
  });
});
