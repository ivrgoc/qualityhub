import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// Setup MSW service worker for browser environment (development)
export const worker = setupWorker(...handlers);

// Export for use in development
export { handlers };
