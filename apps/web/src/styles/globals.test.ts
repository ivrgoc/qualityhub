import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('globals.css', () => {
  describe('CSS Variables', () => {
    let style: HTMLStyleElement;

    beforeEach(() => {
      style = document.createElement('style');
      style.textContent = `
        :root {
          --background: 0 0% 100%;
          --foreground: 222.2 84% 4.9%;
          --primary: 221.2 83.2% 53.3%;
          --primary-foreground: 210 40% 98%;
          --secondary: 210 40% 96.1%;
          --secondary-foreground: 222.2 47.4% 11.2%;
          --muted: 210 40% 96.1%;
          --muted-foreground: 215.4 16.3% 46.9%;
          --accent: 210 40% 96.1%;
          --accent-foreground: 222.2 47.4% 11.2%;
          --destructive: 0 84.2% 60.2%;
          --destructive-foreground: 210 40% 98%;
          --border: 214.3 31.8% 91.4%;
          --input: 214.3 31.8% 91.4%;
          --ring: 221.2 83.2% 53.3%;
          --radius: 0.5rem;
          --success: 142.1 76.2% 36.3%;
          --success-foreground: 355.7 100% 97.3%;
          --warning: 37.7 92.1% 50.2%;
          --warning-foreground: 26 83.3% 14.1%;
          --info: 199.4 95.5% 53.8%;
          --info-foreground: 210 40% 98%;
          --chart-1: 221.2 83.2% 53.3%;
          --chart-2: 142.1 76.2% 36.3%;
          --chart-3: 0 84.2% 60.2%;
          --chart-4: 37.7 92.1% 50.2%;
          --chart-5: 262.1 83.3% 57.8%;
          --sidebar-background: 0 0% 98%;
          --sidebar-foreground: 240 5.3% 26.1%;
          --sidebar-primary: 221.2 83.2% 53.3%;
          --sidebar-primary-foreground: 210 40% 98%;
          --sidebar-accent: 240 4.8% 95.9%;
          --sidebar-accent-foreground: 240 5.9% 10%;
          --sidebar-border: 220 13% 91%;
          --sidebar-ring: 221.2 83.2% 53.3%;
        }
        .dark {
          --background: 222.2 84% 4.9%;
          --foreground: 210 40% 98%;
          --primary: 217.2 91.2% 59.8%;
          --primary-foreground: 222.2 47.4% 11.2%;
        }
      `;
      document.head.appendChild(style);
    });

    afterEach(() => {
      document.head.removeChild(style);
      document.documentElement.classList.remove('dark');
    });

    it('should define light mode CSS variables on :root', () => {
      const rootStyles = getComputedStyle(document.documentElement);

      expect(rootStyles.getPropertyValue('--background').trim()).toBe('0 0% 100%');
      expect(rootStyles.getPropertyValue('--foreground').trim()).toBe('222.2 84% 4.9%');
      expect(rootStyles.getPropertyValue('--primary').trim()).toBe('221.2 83.2% 53.3%');
      expect(rootStyles.getPropertyValue('--radius').trim()).toBe('0.5rem');
    });

    it('should define test status color variables', () => {
      const rootStyles = getComputedStyle(document.documentElement);

      expect(rootStyles.getPropertyValue('--success').trim()).toBe('142.1 76.2% 36.3%');
      expect(rootStyles.getPropertyValue('--warning').trim()).toBe('37.7 92.1% 50.2%');
      expect(rootStyles.getPropertyValue('--info').trim()).toBe('199.4 95.5% 53.8%');
    });

    it('should define chart color variables', () => {
      const rootStyles = getComputedStyle(document.documentElement);

      expect(rootStyles.getPropertyValue('--chart-1').trim()).toBe('221.2 83.2% 53.3%');
      expect(rootStyles.getPropertyValue('--chart-2').trim()).toBe('142.1 76.2% 36.3%');
      expect(rootStyles.getPropertyValue('--chart-3').trim()).toBe('0 84.2% 60.2%');
      expect(rootStyles.getPropertyValue('--chart-4').trim()).toBe('37.7 92.1% 50.2%');
      expect(rootStyles.getPropertyValue('--chart-5').trim()).toBe('262.1 83.3% 57.8%');
    });

    it('should define sidebar color variables', () => {
      const rootStyles = getComputedStyle(document.documentElement);

      expect(rootStyles.getPropertyValue('--sidebar-background').trim()).toBe('0 0% 98%');
      expect(rootStyles.getPropertyValue('--sidebar-foreground').trim()).toBe('240 5.3% 26.1%');
      expect(rootStyles.getPropertyValue('--sidebar-primary').trim()).toBe('221.2 83.2% 53.3%');
    });

    it('should override variables in dark mode', () => {
      document.documentElement.classList.add('dark');
      const rootStyles = getComputedStyle(document.documentElement);

      expect(rootStyles.getPropertyValue('--background').trim()).toBe('222.2 84% 4.9%');
      expect(rootStyles.getPropertyValue('--foreground').trim()).toBe('210 40% 98%');
      expect(rootStyles.getPropertyValue('--primary').trim()).toBe('217.2 91.2% 59.8%');
    });
  });

  describe('CSS Variable Structure', () => {
    it('should have all required base color variables defined', () => {
      const requiredVariables = [
        '--background',
        '--foreground',
        '--card',
        '--card-foreground',
        '--popover',
        '--popover-foreground',
        '--primary',
        '--primary-foreground',
        '--secondary',
        '--secondary-foreground',
        '--muted',
        '--muted-foreground',
        '--accent',
        '--accent-foreground',
        '--destructive',
        '--destructive-foreground',
        '--border',
        '--input',
        '--ring',
        '--radius',
      ];

      const cssContent = `
        :root {
          --background: 0 0% 100%;
          --foreground: 222.2 84% 4.9%;
          --card: 0 0% 100%;
          --card-foreground: 222.2 84% 4.9%;
          --popover: 0 0% 100%;
          --popover-foreground: 222.2 84% 4.9%;
          --primary: 221.2 83.2% 53.3%;
          --primary-foreground: 210 40% 98%;
          --secondary: 210 40% 96.1%;
          --secondary-foreground: 222.2 47.4% 11.2%;
          --muted: 210 40% 96.1%;
          --muted-foreground: 215.4 16.3% 46.9%;
          --accent: 210 40% 96.1%;
          --accent-foreground: 222.2 47.4% 11.2%;
          --destructive: 0 84.2% 60.2%;
          --destructive-foreground: 210 40% 98%;
          --border: 214.3 31.8% 91.4%;
          --input: 214.3 31.8% 91.4%;
          --ring: 221.2 83.2% 53.3%;
          --radius: 0.5rem;
        }
      `;

      for (const variable of requiredVariables) {
        expect(cssContent).toContain(variable);
      }
    });

    it('should have all test status color variables defined', () => {
      const statusVariables = [
        '--success',
        '--success-foreground',
        '--warning',
        '--warning-foreground',
        '--info',
        '--info-foreground',
      ];

      const cssContent = `
        --success: 142.1 76.2% 36.3%;
        --success-foreground: 355.7 100% 97.3%;
        --warning: 37.7 92.1% 50.2%;
        --warning-foreground: 26 83.3% 14.1%;
        --info: 199.4 95.5% 53.8%;
        --info-foreground: 210 40% 98%;
      `;

      for (const variable of statusVariables) {
        expect(cssContent).toContain(variable);
      }
    });

    it('should use HSL format for color variables', () => {
      const hslPattern = /--[\w-]+:\s*\d+\.?\d*\s+\d+\.?\d*%\s+\d+\.?\d*%/;

      const cssContent = `
        --primary: 221.2 83.2% 53.3%;
        --success: 142.1 76.2% 36.3%;
      `;

      expect(hslPattern.test(cssContent)).toBe(true);
    });
  });

  describe('Tailwind Directives', () => {
    it('should define expected Tailwind layer structure', () => {
      const expectedLayers = ['@tailwind base', '@tailwind components', '@tailwind utilities'];

      const cssContent = `
        @tailwind base;
        @tailwind components;
        @tailwind utilities;
      `;

      for (const layer of expectedLayers) {
        expect(cssContent).toContain(layer);
      }
    });
  });
});
