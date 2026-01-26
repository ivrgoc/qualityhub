import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';

function renderTabs(props: {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
} = {}) {
  return render(
    <Tabs defaultValue={props.defaultValue ?? 'tab1'} value={props.value} onValueChange={props.onValueChange}>
      <TabsList>
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        <TabsTrigger value="tab3" disabled>Tab 3</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">Content for Tab 1</TabsContent>
      <TabsContent value="tab2">Content for Tab 2</TabsContent>
      <TabsContent value="tab3">Content for Tab 3</TabsContent>
    </Tabs>
  );
}

describe('Tabs', () => {
  describe('rendering', () => {
    it('should render all tab triggers', () => {
      renderTabs();
      expect(screen.getByRole('tab', { name: 'Tab 1' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Tab 2' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Tab 3' })).toBeInTheDocument();
    });

    it('should render tablist', () => {
      renderTabs();
      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });

    it('should render active tab content by default', () => {
      renderTabs({ defaultValue: 'tab1' });
      expect(screen.getByRole('tabpanel')).toBeInTheDocument();
      expect(screen.getByText('Content for Tab 1')).toBeInTheDocument();
    });

    it('should not render inactive tab content', () => {
      renderTabs({ defaultValue: 'tab1' });
      expect(screen.queryByText('Content for Tab 2')).not.toBeInTheDocument();
      expect(screen.queryByText('Content for Tab 3')).not.toBeInTheDocument();
    });

    it('should mark active tab as selected', () => {
      renderTabs({ defaultValue: 'tab1' });
      expect(screen.getByRole('tab', { name: 'Tab 1' })).toHaveAttribute('data-state', 'active');
      expect(screen.getByRole('tab', { name: 'Tab 2' })).toHaveAttribute('data-state', 'inactive');
    });

    it('should render disabled tab', () => {
      renderTabs();
      expect(screen.getByRole('tab', { name: 'Tab 3' })).toBeDisabled();
    });
  });

  describe('interaction', () => {
    it('should switch tab when clicking another tab', async () => {
      const user = userEvent.setup();
      renderTabs({ defaultValue: 'tab1' });

      expect(screen.getByText('Content for Tab 1')).toBeInTheDocument();
      expect(screen.queryByText('Content for Tab 2')).not.toBeInTheDocument();

      await user.click(screen.getByRole('tab', { name: 'Tab 2' }));

      expect(screen.queryByText('Content for Tab 1')).not.toBeInTheDocument();
      expect(screen.getByText('Content for Tab 2')).toBeInTheDocument();
    });

    it('should not switch to disabled tab when clicked', async () => {
      const user = userEvent.setup();
      renderTabs({ defaultValue: 'tab1' });

      await user.click(screen.getByRole('tab', { name: 'Tab 3' }));

      expect(screen.getByText('Content for Tab 1')).toBeInTheDocument();
      expect(screen.queryByText('Content for Tab 3')).not.toBeInTheDocument();
    });

    it('should call onValueChange when tab is clicked', async () => {
      const user = userEvent.setup();
      const handleValueChange = vi.fn();
      renderTabs({ defaultValue: 'tab1', onValueChange: handleValueChange });

      await user.click(screen.getByRole('tab', { name: 'Tab 2' }));

      expect(handleValueChange).toHaveBeenCalledWith('tab2');
    });

    it('should not call onValueChange when clicking disabled tab', async () => {
      const user = userEvent.setup();
      const handleValueChange = vi.fn();
      renderTabs({ defaultValue: 'tab1', onValueChange: handleValueChange });

      await user.click(screen.getByRole('tab', { name: 'Tab 3' }));

      expect(handleValueChange).not.toHaveBeenCalled();
    });
  });

  describe('keyboard navigation', () => {
    it('should focus next tab with ArrowRight key', async () => {
      const user = userEvent.setup();
      renderTabs({ defaultValue: 'tab1' });

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
      tab1.focus();

      await user.keyboard('{ArrowRight}');

      expect(screen.getByRole('tab', { name: 'Tab 2' })).toHaveFocus();
    });

    it('should focus previous tab with ArrowLeft key', async () => {
      const user = userEvent.setup();
      renderTabs({ defaultValue: 'tab2' });

      const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
      tab2.focus();

      await user.keyboard('{ArrowLeft}');

      expect(screen.getByRole('tab', { name: 'Tab 1' })).toHaveFocus();
    });

    it('should activate tab with Enter key', async () => {
      const user = userEvent.setup();
      renderTabs({ defaultValue: 'tab1' });

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
      tab1.focus();

      await user.keyboard('{ArrowRight}');
      await user.keyboard('{Enter}');

      expect(screen.getByText('Content for Tab 2')).toBeInTheDocument();
    });

    it('should activate tab with Space key', async () => {
      const user = userEvent.setup();
      renderTabs({ defaultValue: 'tab1' });

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
      tab1.focus();

      await user.keyboard('{ArrowRight}');
      await user.keyboard(' ');

      expect(screen.getByText('Content for Tab 2')).toBeInTheDocument();
    });
  });

  describe('controlled mode', () => {
    it('should work as controlled component', async () => {
      const user = userEvent.setup();
      const handleValueChange = vi.fn();

      const { rerender } = render(
        <Tabs value="tab1" onValueChange={handleValueChange}>
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      expect(screen.getByText('Content 1')).toBeInTheDocument();

      await user.click(screen.getByRole('tab', { name: 'Tab 2' }));
      expect(handleValueChange).toHaveBeenCalledWith('tab2');

      // Content doesn't change until parent updates value
      expect(screen.getByText('Content 1')).toBeInTheDocument();

      // Simulate parent updating state
      rerender(
        <Tabs value="tab2" onValueChange={handleValueChange}>
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper tablist role', () => {
      renderTabs();
      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });

    it('should have proper tab role for triggers', () => {
      renderTabs();
      expect(screen.getAllByRole('tab')).toHaveLength(3);
    });

    it('should have proper tabpanel role for content', () => {
      renderTabs();
      expect(screen.getByRole('tabpanel')).toBeInTheDocument();
    });

    it('should have aria-selected for active tab', () => {
      renderTabs({ defaultValue: 'tab1' });
      expect(screen.getByRole('tab', { name: 'Tab 1' })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByRole('tab', { name: 'Tab 2' })).toHaveAttribute('aria-selected', 'false');
    });

    it('should associate tabpanel with tab via aria-labelledby', () => {
      renderTabs({ defaultValue: 'tab1' });
      const tab = screen.getByRole('tab', { name: 'Tab 1' });
      const panel = screen.getByRole('tabpanel');

      expect(panel).toHaveAttribute('aria-labelledby', tab.id);
    });
  });

  describe('custom className', () => {
    it('should apply custom className to TabsList', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList className="custom-list-class" data-testid="tabs-list">
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content</TabsContent>
        </Tabs>
      );

      expect(screen.getByTestId('tabs-list')).toHaveClass('custom-list-class');
    });

    it('should apply custom className to TabsTrigger', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1" className="custom-trigger-class">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content</TabsContent>
        </Tabs>
      );

      expect(screen.getByRole('tab', { name: 'Tab 1' })).toHaveClass('custom-trigger-class');
    });

    it('should apply custom className to TabsContent', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" className="custom-content-class">Content</TabsContent>
        </Tabs>
      );

      expect(screen.getByRole('tabpanel')).toHaveClass('custom-content-class');
    });
  });

  describe('ref forwarding', () => {
    it('should forward ref to TabsList', () => {
      const ref = vi.fn();
      render(
        <Tabs defaultValue="tab1">
          <TabsList ref={ref}>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content</TabsContent>
        </Tabs>
      );
      expect(ref).toHaveBeenCalled();
    });

    it('should forward ref to TabsTrigger', () => {
      const ref = vi.fn();
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1" ref={ref}>Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content</TabsContent>
        </Tabs>
      );
      expect(ref).toHaveBeenCalled();
    });

    it('should forward ref to TabsContent', () => {
      const ref = vi.fn();
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" ref={ref}>Content</TabsContent>
        </Tabs>
      );
      expect(ref).toHaveBeenCalled();
    });
  });
});

describe('TabsList', () => {
  it('should render with base styles', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList data-testid="tabs-list">
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content</TabsContent>
      </Tabs>
    );

    const list = screen.getByTestId('tabs-list');
    expect(list).toHaveClass('inline-flex', 'items-center', 'rounded-md', 'bg-muted');
  });
});

describe('TabsTrigger', () => {
  it('should render with base styles', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content</TabsContent>
      </Tabs>
    );

    const trigger = screen.getByRole('tab', { name: 'Tab 1' });
    expect(trigger).toHaveClass('inline-flex', 'items-center', 'rounded-sm', 'text-sm', 'font-medium');
  });

  it('should have active styles when selected', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content</TabsContent>
      </Tabs>
    );

    const trigger = screen.getByRole('tab', { name: 'Tab 1' });
    expect(trigger).toHaveAttribute('data-state', 'active');
  });
});

describe('TabsContent', () => {
  it('should render with base styles', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content</TabsContent>
      </Tabs>
    );

    const content = screen.getByRole('tabpanel');
    expect(content).toHaveClass('mt-2', 'ring-offset-background');
  });
});
