import { describe, it, expect } from 'vitest';
import config from './tailwind.config.js';

describe('tailwind.config.js', () => {
  describe('content paths', () => {
    it('should include index.html', () => {
      expect(config.content).toContain('./index.html');
    });

    it('should include all source files with supported extensions', () => {
      expect(config.content).toContain('./src/**/*.{js,ts,jsx,tsx}');
    });
  });

  describe('dark mode', () => {
    it('should be configured for class-based dark mode', () => {
      expect(config.darkMode).toEqual(['class']);
    });
  });

  describe('theme colors', () => {
    const colors = config.theme.extend.colors;

    it('should define base semantic colors', () => {
      expect(colors.background).toBe('hsl(var(--background))');
      expect(colors.foreground).toBe('hsl(var(--foreground))');
      expect(colors.border).toBe('hsl(var(--border))');
      expect(colors.input).toBe('hsl(var(--input))');
      expect(colors.ring).toBe('hsl(var(--ring))');
    });

    it('should define primary color with foreground variant', () => {
      expect(colors.primary.DEFAULT).toBe('hsl(var(--primary))');
      expect(colors.primary.foreground).toBe('hsl(var(--primary-foreground))');
    });

    it('should define secondary color with foreground variant', () => {
      expect(colors.secondary.DEFAULT).toBe('hsl(var(--secondary))');
      expect(colors.secondary.foreground).toBe('hsl(var(--secondary-foreground))');
    });

    it('should define destructive color with foreground variant', () => {
      expect(colors.destructive.DEFAULT).toBe('hsl(var(--destructive))');
      expect(colors.destructive.foreground).toBe('hsl(var(--destructive-foreground))');
    });

    it('should define muted color with foreground variant', () => {
      expect(colors.muted.DEFAULT).toBe('hsl(var(--muted))');
      expect(colors.muted.foreground).toBe('hsl(var(--muted-foreground))');
    });

    it('should define accent color with foreground variant', () => {
      expect(colors.accent.DEFAULT).toBe('hsl(var(--accent))');
      expect(colors.accent.foreground).toBe('hsl(var(--accent-foreground))');
    });

    it('should define popover color with foreground variant', () => {
      expect(colors.popover.DEFAULT).toBe('hsl(var(--popover))');
      expect(colors.popover.foreground).toBe('hsl(var(--popover-foreground))');
    });

    it('should define card color with foreground variant', () => {
      expect(colors.card.DEFAULT).toBe('hsl(var(--card))');
      expect(colors.card.foreground).toBe('hsl(var(--card-foreground))');
    });

    describe('test status colors', () => {
      it('should define success color for passed tests', () => {
        expect(colors.success.DEFAULT).toBe('hsl(var(--success))');
        expect(colors.success.foreground).toBe('hsl(var(--success-foreground))');
      });

      it('should define warning color for blocked/retest tests', () => {
        expect(colors.warning.DEFAULT).toBe('hsl(var(--warning))');
        expect(colors.warning.foreground).toBe('hsl(var(--warning-foreground))');
      });

      it('should define info color for informational states', () => {
        expect(colors.info.DEFAULT).toBe('hsl(var(--info))');
        expect(colors.info.foreground).toBe('hsl(var(--info-foreground))');
      });
    });

    describe('chart colors', () => {
      it('should define 5 chart colors for reports', () => {
        expect(colors.chart['1']).toBe('hsl(var(--chart-1))');
        expect(colors.chart['2']).toBe('hsl(var(--chart-2))');
        expect(colors.chart['3']).toBe('hsl(var(--chart-3))');
        expect(colors.chart['4']).toBe('hsl(var(--chart-4))');
        expect(colors.chart['5']).toBe('hsl(var(--chart-5))');
      });
    });

    describe('sidebar colors', () => {
      it('should define sidebar background and foreground', () => {
        expect(colors.sidebar.DEFAULT).toBe('hsl(var(--sidebar-background))');
        expect(colors.sidebar.foreground).toBe('hsl(var(--sidebar-foreground))');
      });

      it('should define sidebar primary colors', () => {
        expect(colors.sidebar.primary).toBe('hsl(var(--sidebar-primary))');
        expect(colors.sidebar['primary-foreground']).toBe('hsl(var(--sidebar-primary-foreground))');
      });

      it('should define sidebar accent colors', () => {
        expect(colors.sidebar.accent).toBe('hsl(var(--sidebar-accent))');
        expect(colors.sidebar['accent-foreground']).toBe('hsl(var(--sidebar-accent-foreground))');
      });

      it('should define sidebar border and ring', () => {
        expect(colors.sidebar.border).toBe('hsl(var(--sidebar-border))');
        expect(colors.sidebar.ring).toBe('hsl(var(--sidebar-ring))');
      });
    });
  });

  describe('border radius', () => {
    const borderRadius = config.theme.extend.borderRadius;

    it('should define lg border radius using CSS variable', () => {
      expect(borderRadius.lg).toBe('var(--radius)');
    });

    it('should define md border radius as radius minus 2px', () => {
      expect(borderRadius.md).toBe('calc(var(--radius) - 2px)');
    });

    it('should define sm border radius as radius minus 4px', () => {
      expect(borderRadius.sm).toBe('calc(var(--radius) - 4px)');
    });
  });

  describe('font family', () => {
    const fontFamily = config.theme.extend.fontFamily;

    it('should define sans font family with Inter as primary', () => {
      expect(fontFamily.sans).toContain('Inter');
      expect(fontFamily.sans).toContain('system-ui');
      expect(fontFamily.sans).toContain('sans-serif');
    });

    it('should define mono font family with JetBrains Mono as primary', () => {
      expect(fontFamily.mono).toContain('JetBrains Mono');
      expect(fontFamily.mono).toContain('Menlo');
      expect(fontFamily.mono).toContain('monospace');
    });
  });

  describe('Radix UI animations', () => {
    const keyframes = config.theme.extend.keyframes;
    const animation = config.theme.extend.animation;

    describe('accordion keyframes', () => {
      it('should define accordion-down keyframe', () => {
        expect(keyframes['accordion-down']).toBeDefined();
        expect(keyframes['accordion-down'].from.height).toBe('0');
        expect(keyframes['accordion-down'].to.height).toBe('var(--radix-accordion-content-height)');
      });

      it('should define accordion-up keyframe', () => {
        expect(keyframes['accordion-up']).toBeDefined();
        expect(keyframes['accordion-up'].from.height).toBe('var(--radix-accordion-content-height)');
        expect(keyframes['accordion-up'].to.height).toBe('0');
      });
    });

    describe('collapsible keyframes', () => {
      it('should define collapsible-down keyframe', () => {
        expect(keyframes['collapsible-down']).toBeDefined();
        expect(keyframes['collapsible-down'].from.height).toBe('0');
        expect(keyframes['collapsible-down'].to.height).toBe('var(--radix-collapsible-content-height)');
      });

      it('should define collapsible-up keyframe', () => {
        expect(keyframes['collapsible-up']).toBeDefined();
        expect(keyframes['collapsible-up'].from.height).toBe('var(--radix-collapsible-content-height)');
        expect(keyframes['collapsible-up'].to.height).toBe('0');
      });
    });

    describe('slide keyframes', () => {
      it('should define slide-in-from-top keyframe', () => {
        expect(keyframes['slide-in-from-top']).toBeDefined();
        expect(keyframes['slide-in-from-top'].from.transform).toBe('translateY(-100%)');
        expect(keyframes['slide-in-from-top'].to.transform).toBe('translateY(0)');
      });

      it('should define slide-in-from-bottom keyframe', () => {
        expect(keyframes['slide-in-from-bottom']).toBeDefined();
        expect(keyframes['slide-in-from-bottom'].from.transform).toBe('translateY(100%)');
        expect(keyframes['slide-in-from-bottom'].to.transform).toBe('translateY(0)');
      });

      it('should define slide-in-from-left keyframe', () => {
        expect(keyframes['slide-in-from-left']).toBeDefined();
        expect(keyframes['slide-in-from-left'].from.transform).toBe('translateX(-100%)');
        expect(keyframes['slide-in-from-left'].to.transform).toBe('translateX(0)');
      });

      it('should define slide-in-from-right keyframe', () => {
        expect(keyframes['slide-in-from-right']).toBeDefined();
        expect(keyframes['slide-in-from-right'].from.transform).toBe('translateX(100%)');
        expect(keyframes['slide-in-from-right'].to.transform).toBe('translateX(0)');
      });
    });

    describe('fade keyframes', () => {
      it('should define fade-in keyframe', () => {
        expect(keyframes['fade-in']).toBeDefined();
        expect(keyframes['fade-in'].from.opacity).toBe('0');
        expect(keyframes['fade-in'].to.opacity).toBe('1');
      });

      it('should define fade-out keyframe', () => {
        expect(keyframes['fade-out']).toBeDefined();
        expect(keyframes['fade-out'].from.opacity).toBe('1');
        expect(keyframes['fade-out'].to.opacity).toBe('0');
      });
    });

    describe('zoom keyframes', () => {
      it('should define zoom-in keyframe', () => {
        expect(keyframes['zoom-in']).toBeDefined();
        expect(keyframes['zoom-in'].from.transform).toBe('scale(0.95)');
        expect(keyframes['zoom-in'].to.transform).toBe('scale(1)');
      });

      it('should define zoom-out keyframe', () => {
        expect(keyframes['zoom-out']).toBeDefined();
        expect(keyframes['zoom-out'].from.transform).toBe('scale(1)');
        expect(keyframes['zoom-out'].to.transform).toBe('scale(0.95)');
      });
    });

    describe('animation utilities', () => {
      it('should define all animation utilities', () => {
        expect(animation['accordion-down']).toBe('accordion-down 0.2s ease-out');
        expect(animation['accordion-up']).toBe('accordion-up 0.2s ease-out');
        expect(animation['collapsible-down']).toBe('collapsible-down 0.2s ease-out');
        expect(animation['collapsible-up']).toBe('collapsible-up 0.2s ease-out');
        expect(animation['slide-in-from-top']).toBe('slide-in-from-top 0.2s ease-out');
        expect(animation['slide-in-from-bottom']).toBe('slide-in-from-bottom 0.2s ease-out');
        expect(animation['slide-in-from-left']).toBe('slide-in-from-left 0.2s ease-out');
        expect(animation['slide-in-from-right']).toBe('slide-in-from-right 0.2s ease-out');
        expect(animation['fade-in']).toBe('fade-in 0.2s ease-out');
        expect(animation['fade-out']).toBe('fade-out 0.2s ease-out');
        expect(animation['zoom-in']).toBe('zoom-in 0.2s ease-out');
        expect(animation['zoom-out']).toBe('zoom-out 0.2s ease-out');
        expect(animation['spin-slow']).toBe('spin-slow 3s linear infinite');
      });
    });
  });

  describe('plugins', () => {
    it('should include tailwindcss-animate plugin', () => {
      expect(config.plugins).toHaveLength(1);
      expect(config.plugins[0]).toBeDefined();
    });
  });
});
