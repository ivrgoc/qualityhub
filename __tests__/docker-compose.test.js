/**
 * Root Docker Compose Configuration Tests
 * Validates the structure and content of the root docker-compose.yml
 * which provides development services (PostgreSQL, Redis, Mailhog)
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const composePath = path.join(ROOT_DIR, 'docker-compose.yml');

describe('Root docker-compose.yml', () => {
  let content;

  beforeAll(() => {
    content = fs.readFileSync(composePath, 'utf8');
  });

  test('file exists', () => {
    expect(fs.existsSync(composePath)).toBe(true);
  });

  describe('PostgreSQL service', () => {
    test('defines postgres service', () => {
      expect(content).toMatch(/^\s{2}postgres:/m);
    });

    test('uses postgres:16 image', () => {
      expect(content).toMatch(/image:\s*postgres:16-alpine/);
    });

    test('defines container name', () => {
      expect(content).toMatch(/container_name:\s*qualityhub-postgres/);
    });

    test('defines environment variables', () => {
      expect(content).toMatch(/POSTGRES_USER/);
      expect(content).toMatch(/POSTGRES_PASSWORD/);
      expect(content).toMatch(/POSTGRES_DB/);
    });

    test('defines volume for data persistence', () => {
      expect(content).toMatch(/postgres_data:\/var\/lib\/postgresql\/data/);
    });

    test('exposes port 5432', () => {
      expect(content).toMatch(/["']?\$\{POSTGRES_PORT:-5432\}:5432["']?|["']?5432:5432["']?/);
    });

    test('includes healthcheck', () => {
      expect(content).toMatch(/postgres:[\s\S]*?healthcheck:[\s\S]*?pg_isready/);
    });

    test('defines restart policy', () => {
      expect(content).toMatch(/postgres:[\s\S]*?restart:\s*unless-stopped/);
    });
  });

  describe('Redis service', () => {
    test('defines redis service', () => {
      expect(content).toMatch(/^\s{2}redis:/m);
    });

    test('uses redis:7 image', () => {
      expect(content).toMatch(/image:\s*redis:7-alpine/);
    });

    test('defines container name', () => {
      expect(content).toMatch(/container_name:\s*qualityhub-redis/);
    });

    test('enables append-only persistence', () => {
      expect(content).toMatch(/redis-server --appendonly yes/);
    });

    test('defines volume for data persistence', () => {
      expect(content).toMatch(/redis_data:\/data/);
    });

    test('exposes port 6379', () => {
      expect(content).toMatch(/["']?\$\{REDIS_PORT:-6379\}:6379["']?|["']?6379:6379["']?/);
    });

    test('includes healthcheck', () => {
      expect(content).toMatch(/redis:[\s\S]*?healthcheck:[\s\S]*?redis-cli.*ping/);
    });

    test('defines restart policy', () => {
      expect(content).toMatch(/redis:[\s\S]*?restart:\s*unless-stopped/);
    });
  });

  describe('Mailhog service', () => {
    test('defines mailhog service', () => {
      expect(content).toMatch(/^\s{2}mailhog:/m);
    });

    test('uses mailhog image', () => {
      expect(content).toMatch(/image:\s*mailhog\/mailhog/);
    });

    test('defines container name', () => {
      expect(content).toMatch(/container_name:\s*qualityhub-mailhog/);
    });

    test('exposes SMTP port 1025', () => {
      expect(content).toMatch(/["']?\$\{MAILHOG_SMTP_PORT:-1025\}:1025["']?|["']?1025:1025["']?/);
    });

    test('exposes web UI port 8025', () => {
      expect(content).toMatch(/["']?\$\{MAILHOG_UI_PORT:-8025\}:8025["']?|["']?8025:8025["']?/);
    });

    test('includes healthcheck', () => {
      expect(content).toMatch(/mailhog:[\s\S]*?healthcheck:/);
    });

    test('defines restart policy', () => {
      expect(content).toMatch(/mailhog:[\s\S]*?restart:\s*unless-stopped/);
    });
  });

  describe('Volumes', () => {
    test('defines postgres_data volume', () => {
      expect(content).toMatch(/^volumes:[\s\S]*postgres_data:/m);
    });

    test('defines redis_data volume', () => {
      expect(content).toMatch(/^volumes:[\s\S]*redis_data:/m);
    });
  });

  describe('Network', () => {
    test('defines qualityhub-network', () => {
      expect(content).toMatch(/qualityhub-network/);
    });
  });

  describe('Health checks configuration', () => {
    test('all services have healthchecks', () => {
      const healthcheckCount = (content.match(/healthcheck:/g) || []).length;
      expect(healthcheckCount).toBe(3);
    });

    test('healthchecks define interval', () => {
      const intervalCount = (content.match(/interval:/g) || []).length;
      expect(intervalCount).toBe(3);
    });

    test('healthchecks define timeout', () => {
      const timeoutCount = (content.match(/timeout:/g) || []).length;
      expect(timeoutCount).toBe(3);
    });

    test('healthchecks define retries', () => {
      const retriesCount = (content.match(/retries:/g) || []).length;
      expect(retriesCount).toBe(3);
    });
  });
});
