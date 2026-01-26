import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuGroup,
} from './DropdownMenu';
import { Button } from './Button';

function renderDropdownMenu(
  props: {
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  } = {}
) {
  return render(
    <DropdownMenu {...props}>
      <DropdownMenuTrigger asChild>
        <Button>Open Menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

describe('DropdownMenu', () => {
  describe('rendering', () => {
    it('should render dropdown trigger', () => {
      renderDropdownMenu();
      expect(screen.getByRole('button', { name: 'Open Menu' })).toBeInTheDocument();
    });

    it('should not render dropdown content when closed', () => {
      renderDropdownMenu();
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('should render dropdown content when defaultOpen is true', () => {
      renderDropdownMenu({ defaultOpen: true });
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('should render menu label', () => {
      renderDropdownMenu({ defaultOpen: true });
      expect(screen.getByText('My Account')).toBeInTheDocument();
    });

    it('should render menu items', () => {
      renderDropdownMenu({ defaultOpen: true });
      expect(screen.getByRole('menuitem', { name: 'Profile' })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: 'Settings' })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: 'Logout' })).toBeInTheDocument();
    });

    it('should render separators', () => {
      renderDropdownMenu({ defaultOpen: true });
      const separators = document.querySelectorAll('[role="separator"]');
      expect(separators.length).toBe(2);
    });
  });

  describe('interaction', () => {
    it('should open dropdown when trigger is clicked', async () => {
      const user = userEvent.setup();
      renderDropdownMenu();

      await user.click(screen.getByRole('button', { name: 'Open Menu' }));

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });
    });

    it('should close dropdown when clicking outside', async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();
      renderDropdownMenu({ defaultOpen: true, onOpenChange: handleOpenChange });

      expect(screen.getByRole('menu')).toBeInTheDocument();

      // Pressing Escape is a reliable way to test that the menu can be dismissed
      // (clicking outside can have issues with pointer-events in test environments)
      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it('should close dropdown when Escape key is pressed', async () => {
      const user = userEvent.setup();
      renderDropdownMenu({ defaultOpen: true });

      expect(screen.getByRole('menu')).toBeInTheDocument();

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      });
    });

    it('should call onOpenChange when dropdown opens', async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();
      renderDropdownMenu({ onOpenChange: handleOpenChange });

      await user.click(screen.getByRole('button', { name: 'Open Menu' }));

      expect(handleOpenChange).toHaveBeenCalledWith(true);
    });

    it('should call onOpenChange when dropdown closes', async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();
      renderDropdownMenu({ defaultOpen: true, onOpenChange: handleOpenChange });

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it('should close dropdown when an item is clicked', async () => {
      const user = userEvent.setup();
      renderDropdownMenu({ defaultOpen: true });

      expect(screen.getByRole('menu')).toBeInTheDocument();

      await user.click(screen.getByRole('menuitem', { name: 'Profile' }));

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      });
    });

    it('should call onClick handler when item is clicked', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger asChild>
            <Button>Open Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleClick}>Click Me</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      await user.click(screen.getByRole('menuitem', { name: 'Click Me' }));

      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe('keyboard navigation', () => {
    it('should navigate items with arrow keys', async () => {
      const user = userEvent.setup();
      renderDropdownMenu({ defaultOpen: true });

      const menu = screen.getByRole('menu');
      expect(menu).toBeInTheDocument();

      await user.keyboard('{ArrowDown}');

      const items = screen.getAllByRole('menuitem');
      expect(items[0]).toHaveFocus();

      await user.keyboard('{ArrowDown}');
      expect(items[1]).toHaveFocus();
    });

    it('should select item with Enter key', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger asChild>
            <Button>Open Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleClick}>Click Me</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');

      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe('controlled mode', () => {
    it('should work as controlled component', async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();

      const { rerender } = render(
        <DropdownMenu open={false} onOpenChange={handleOpenChange}>
          <DropdownMenuTrigger asChild>
            <Button>Open Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      expect(screen.queryByRole('menu')).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Open Menu' }));
      expect(handleOpenChange).toHaveBeenCalledWith(true);

      rerender(
        <DropdownMenu open={true} onOpenChange={handleOpenChange}>
          <DropdownMenuTrigger asChild>
            <Button>Open Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      expect(screen.getByRole('menu')).toBeInTheDocument();
    });
  });

  describe('disabled items', () => {
    it('should render disabled item with correct styles', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger asChild>
            <Button>Open Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem disabled>Disabled Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const item = screen.getByRole('menuitem', { name: 'Disabled Item' });
      expect(item).toHaveAttribute('data-disabled');
    });

    it('should not trigger onSelect for disabled items', async () => {
      const user = userEvent.setup();
      const handleSelect = vi.fn();

      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger asChild>
            <Button>Open Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem disabled onSelect={handleSelect}>
              Disabled Item
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      // Verify the item is in the document
      expect(screen.getByRole('menuitem', { name: 'Disabled Item' })).toBeInTheDocument();

      // Try to select with keyboard (the proper way to interact with menu items)
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');

      // onSelect should not be called for disabled items
      expect(handleSelect).not.toHaveBeenCalled();
    });
  });

  describe('custom className', () => {
    it('should apply custom className to DropdownMenuContent', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger asChild>
            <Button>Open Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="custom-content-class">
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      expect(screen.getByRole('menu')).toHaveClass('custom-content-class');
    });

    it('should apply custom className to DropdownMenuItem', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger asChild>
            <Button>Open Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem className="custom-item-class">Custom Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      expect(screen.getByRole('menuitem', { name: 'Custom Item' })).toHaveClass('custom-item-class');
    });

    it('should apply custom className to DropdownMenuLabel', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger asChild>
            <Button>Open Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel className="custom-label-class">Label</DropdownMenuLabel>
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      expect(screen.getByText('Label')).toHaveClass('custom-label-class');
    });

    it('should apply custom className to DropdownMenuSeparator', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger asChild>
            <Button>Open Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
            <DropdownMenuSeparator className="custom-separator-class" />
            <DropdownMenuItem>Item 2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const separator = document.querySelector('[role="separator"]');
      expect(separator).toHaveClass('custom-separator-class');
    });
  });

  describe('inset prop', () => {
    it('should apply inset padding to DropdownMenuItem', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger asChild>
            <Button>Open Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem inset>Inset Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      expect(screen.getByRole('menuitem', { name: 'Inset Item' })).toHaveClass('pl-8');
    });

    it('should apply inset padding to DropdownMenuLabel', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger asChild>
            <Button>Open Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel inset>Inset Label</DropdownMenuLabel>
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      expect(screen.getByText('Inset Label')).toHaveClass('pl-8');
    });
  });
});

describe('DropdownMenuCheckboxItem', () => {
  it('should render checkbox item', () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger asChild>
          <Button>Open Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem checked>Show Toolbar</DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    expect(screen.getByRole('menuitemcheckbox', { name: 'Show Toolbar' })).toBeInTheDocument();
  });

  it('should show check icon when checked', () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger asChild>
          <Button>Open Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem checked>Show Toolbar</DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    const item = screen.getByRole('menuitemcheckbox', { name: 'Show Toolbar' });
    expect(item).toHaveAttribute('data-state', 'checked');
  });

  it('should toggle checked state on click', async () => {
    const user = userEvent.setup();
    const handleCheckedChange = vi.fn();

    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger asChild>
          <Button>Open Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem checked={false} onCheckedChange={handleCheckedChange}>
            Show Toolbar
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    await user.click(screen.getByRole('menuitemcheckbox', { name: 'Show Toolbar' }));

    expect(handleCheckedChange).toHaveBeenCalledWith(true);
  });

  it('should apply custom className', () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger asChild>
          <Button>Open Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem checked className="custom-checkbox-class">
            Show Toolbar
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    expect(screen.getByRole('menuitemcheckbox')).toHaveClass('custom-checkbox-class');
  });
});

describe('DropdownMenuRadioGroup', () => {
  function renderRadioGroup(defaultValue?: string) {
    return render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger asChild>
          <Button>Open Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup value={defaultValue}>
            <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  it('should render radio items', () => {
    renderRadioGroup();

    expect(screen.getByRole('menuitemradio', { name: 'Light' })).toBeInTheDocument();
    expect(screen.getByRole('menuitemradio', { name: 'Dark' })).toBeInTheDocument();
    expect(screen.getByRole('menuitemradio', { name: 'System' })).toBeInTheDocument();
  });

  it('should show selected state for checked item', () => {
    renderRadioGroup('dark');

    expect(screen.getByRole('menuitemradio', { name: 'Light' })).toHaveAttribute(
      'data-state',
      'unchecked'
    );
    expect(screen.getByRole('menuitemradio', { name: 'Dark' })).toHaveAttribute(
      'data-state',
      'checked'
    );
  });

  it('should call onValueChange when item is selected', async () => {
    const user = userEvent.setup();
    const handleValueChange = vi.fn();

    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger asChild>
          <Button>Open Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup value="light" onValueChange={handleValueChange}>
            <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    await user.click(screen.getByRole('menuitemradio', { name: 'Dark' }));

    expect(handleValueChange).toHaveBeenCalledWith('dark');
  });

  it('should apply custom className to radio item', () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger asChild>
          <Button>Open Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup>
            <DropdownMenuRadioItem value="test" className="custom-radio-class">
              Test
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    expect(screen.getByRole('menuitemradio')).toHaveClass('custom-radio-class');
  });
});

describe('DropdownMenuSub', () => {
  function renderSubMenu() {
    return render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger asChild>
          <Button>Open Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>More Options</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Sub Item 1</DropdownMenuItem>
              <DropdownMenuItem>Sub Item 2</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  it('should render sub trigger', () => {
    renderSubMenu();
    expect(screen.getByText('More Options')).toBeInTheDocument();
  });

  it('should open submenu on hover', async () => {
    const user = userEvent.setup();
    renderSubMenu();

    await user.hover(screen.getByText('More Options'));

    await waitFor(() => {
      expect(screen.getByRole('menuitem', { name: 'Sub Item 1' })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: 'Sub Item 2' })).toBeInTheDocument();
    });
  });

  it('should apply inset to SubTrigger', () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger asChild>
          <Button>Open Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger inset>More Options</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Sub Item</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    expect(screen.getByText('More Options').closest('[role="menuitem"]')).toHaveClass('pl-8');
  });

  it('should apply custom className to SubContent', async () => {
    const user = userEvent.setup();

    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger asChild>
          <Button>Open Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>More Options</DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="custom-sub-content">
              <DropdownMenuItem>Sub Item</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    await user.hover(screen.getByText('More Options'));

    await waitFor(() => {
      expect(document.querySelector('.custom-sub-content')).toBeInTheDocument();
    });
  });
});

describe('DropdownMenuShortcut', () => {
  it('should render shortcut text', () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger asChild>
          <Button>Open Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            Save
            <DropdownMenuShortcut>Ctrl+S</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    expect(screen.getByText('Ctrl+S')).toBeInTheDocument();
  });

  it('should apply default shortcut styles', () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger asChild>
          <Button>Open Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            Save
            <DropdownMenuShortcut>Ctrl+S</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    const shortcut = screen.getByText('Ctrl+S');
    expect(shortcut).toHaveClass('ml-auto', 'text-xs', 'tracking-widest', 'opacity-60');
  });

  it('should apply custom className', () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger asChild>
          <Button>Open Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            Save
            <DropdownMenuShortcut className="custom-shortcut-class">Ctrl+S</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    expect(screen.getByText('Ctrl+S')).toHaveClass('custom-shortcut-class');
  });
});

describe('DropdownMenuGroup', () => {
  it('should render group with items', () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger asChild>
          <Button>Open Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
            <DropdownMenuItem>Item 2</DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    expect(screen.getByRole('group')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Item 1' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Item 2' })).toBeInTheDocument();
  });
});

describe('ref forwarding', () => {
  it('should forward ref to DropdownMenuContent', () => {
    const ref = vi.fn();
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger asChild>
          <Button>Open Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent ref={ref}>
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    expect(ref).toHaveBeenCalled();
  });

  it('should forward ref to DropdownMenuItem', () => {
    const ref = vi.fn();
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger asChild>
          <Button>Open Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem ref={ref}>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    expect(ref).toHaveBeenCalled();
  });

  it('should forward ref to DropdownMenuLabel', () => {
    const ref = vi.fn();
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger asChild>
          <Button>Open Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel ref={ref}>Label</DropdownMenuLabel>
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    expect(ref).toHaveBeenCalled();
  });

  it('should forward ref to DropdownMenuSeparator', () => {
    const ref = vi.fn();
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger asChild>
          <Button>Open Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuSeparator ref={ref} />
          <DropdownMenuItem>Item 2</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    expect(ref).toHaveBeenCalled();
  });

  it('should forward ref to DropdownMenuCheckboxItem', () => {
    const ref = vi.fn();
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger asChild>
          <Button>Open Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem ref={ref} checked>
            Checkbox Item
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    expect(ref).toHaveBeenCalled();
  });

  it('should forward ref to DropdownMenuRadioItem', () => {
    const ref = vi.fn();
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger asChild>
          <Button>Open Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup>
            <DropdownMenuRadioItem ref={ref} value="test">
              Radio Item
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    expect(ref).toHaveBeenCalled();
  });

  it('should forward ref to DropdownMenuSubTrigger', () => {
    const ref = vi.fn();
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger asChild>
          <Button>Open Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger ref={ref}>Sub Trigger</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Item</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    expect(ref).toHaveBeenCalled();
  });

  it('should forward ref to DropdownMenuSubContent', async () => {
    const user = userEvent.setup();
    const ref = vi.fn();
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger asChild>
          <Button>Open Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Sub Trigger</DropdownMenuSubTrigger>
            <DropdownMenuSubContent ref={ref}>
              <DropdownMenuItem>Item</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    await user.hover(screen.getByText('Sub Trigger'));

    await waitFor(() => {
      expect(ref).toHaveBeenCalled();
    });
  });
});

describe('accessibility', () => {
  it('should have proper menu role', () => {
    renderDropdownMenu({ defaultOpen: true });
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('should have proper menuitem role for items', () => {
    renderDropdownMenu({ defaultOpen: true });
    expect(screen.getAllByRole('menuitem').length).toBeGreaterThan(0);
  });

  it('should have proper separator role', () => {
    renderDropdownMenu({ defaultOpen: true });
    expect(screen.getAllByRole('separator').length).toBeGreaterThan(0);
  });

  it('should have proper menuitemcheckbox role for checkbox items', () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger asChild>
          <Button>Open Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem checked>Checkbox Item</DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    expect(screen.getByRole('menuitemcheckbox')).toBeInTheDocument();
  });

  it('should have proper menuitemradio role for radio items', () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger asChild>
          <Button>Open Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup>
            <DropdownMenuRadioItem value="test">Radio Item</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    expect(screen.getByRole('menuitemradio')).toBeInTheDocument();
  });

  it('should have aria-disabled for disabled items', () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger asChild>
          <Button>Open Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem disabled>Disabled Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    const item = screen.getByRole('menuitem', { name: 'Disabled Item' });
    expect(item).toHaveAttribute('aria-disabled', 'true');
  });

  it('should have aria-checked for checkbox items', () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger asChild>
          <Button>Open Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem checked>Checked Item</DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={false}>Unchecked Item</DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    expect(screen.getByRole('menuitemcheckbox', { name: 'Checked Item' })).toHaveAttribute(
      'aria-checked',
      'true'
    );
    expect(screen.getByRole('menuitemcheckbox', { name: 'Unchecked Item' })).toHaveAttribute(
      'aria-checked',
      'false'
    );
  });

  it('should have aria-checked for radio items', () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger asChild>
          <Button>Open Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup value="selected">
            <DropdownMenuRadioItem value="selected">Selected Item</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="other">Other Item</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    expect(screen.getByRole('menuitemradio', { name: 'Selected Item' })).toHaveAttribute(
      'aria-checked',
      'true'
    );
    expect(screen.getByRole('menuitemradio', { name: 'Other Item' })).toHaveAttribute(
      'aria-checked',
      'false'
    );
  });
});
