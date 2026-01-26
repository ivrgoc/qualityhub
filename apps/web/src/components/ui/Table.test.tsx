import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from './Table';

describe('Table', () => {
  it('should render children', () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Table content</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByText('Table content')).toBeInTheDocument();
  });

  it('should have base styles', () => {
    render(
      <Table data-testid="table">
        <TableBody>
          <TableRow>
            <TableCell>Content</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    const table = screen.getByTestId('table');
    expect(table).toHaveClass('w-full');
    expect(table).toHaveClass('caption-bottom');
    expect(table).toHaveClass('text-sm');
  });

  it('should be wrapped in overflow container', () => {
    render(
      <Table data-testid="table">
        <TableBody>
          <TableRow>
            <TableCell>Content</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    const table = screen.getByTestId('table');
    const wrapper = table.parentElement;
    expect(wrapper).toHaveClass('relative');
    expect(wrapper).toHaveClass('w-full');
    expect(wrapper).toHaveClass('overflow-auto');
  });

  it('should apply custom className', () => {
    render(
      <Table className="custom-class" data-testid="table">
        <TableBody>
          <TableRow>
            <TableCell>Content</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByTestId('table')).toHaveClass('custom-class');
  });

  it('should forward ref', () => {
    const ref = vi.fn();
    render(
      <Table ref={ref}>
        <TableBody>
          <TableRow>
            <TableCell>Content</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(ref).toHaveBeenCalled();
  });

  it('should pass through additional props', () => {
    render(
      <Table data-testid="test-table">
        <TableBody>
          <TableRow>
            <TableCell>Content</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByTestId('test-table')).toBeInTheDocument();
  });
});

describe('TableHeader', () => {
  it('should render children', () => {
    render(
      <table>
        <TableHeader>
          <TableRow>
            <TableHead>Header content</TableHead>
          </TableRow>
        </TableHeader>
      </table>
    );
    expect(screen.getByText('Header content')).toBeInTheDocument();
  });

  it('should have base styles', () => {
    render(
      <table>
        <TableHeader data-testid="header">
          <TableRow>
            <TableHead>Content</TableHead>
          </TableRow>
        </TableHeader>
      </table>
    );
    const header = screen.getByTestId('header');
    expect(header).toHaveClass('[&_tr]:border-b');
  });

  it('should apply custom className', () => {
    render(
      <table>
        <TableHeader className="custom-class" data-testid="header">
          <TableRow>
            <TableHead>Content</TableHead>
          </TableRow>
        </TableHeader>
      </table>
    );
    expect(screen.getByTestId('header')).toHaveClass('custom-class');
  });

  it('should forward ref', () => {
    const ref = vi.fn();
    render(
      <table>
        <TableHeader ref={ref}>
          <TableRow>
            <TableHead>Content</TableHead>
          </TableRow>
        </TableHeader>
      </table>
    );
    expect(ref).toHaveBeenCalled();
  });
});

describe('TableBody', () => {
  it('should render children', () => {
    render(
      <table>
        <TableBody>
          <TableRow>
            <TableCell>Body content</TableCell>
          </TableRow>
        </TableBody>
      </table>
    );
    expect(screen.getByText('Body content')).toBeInTheDocument();
  });

  it('should have base styles', () => {
    render(
      <table>
        <TableBody data-testid="body">
          <TableRow>
            <TableCell>Content</TableCell>
          </TableRow>
        </TableBody>
      </table>
    );
    const body = screen.getByTestId('body');
    expect(body).toHaveClass('[&_tr:last-child]:border-0');
  });

  it('should apply custom className', () => {
    render(
      <table>
        <TableBody className="custom-class" data-testid="body">
          <TableRow>
            <TableCell>Content</TableCell>
          </TableRow>
        </TableBody>
      </table>
    );
    expect(screen.getByTestId('body')).toHaveClass('custom-class');
  });

  it('should forward ref', () => {
    const ref = vi.fn();
    render(
      <table>
        <TableBody ref={ref}>
          <TableRow>
            <TableCell>Content</TableCell>
          </TableRow>
        </TableBody>
      </table>
    );
    expect(ref).toHaveBeenCalled();
  });
});

describe('TableFooter', () => {
  it('should render children', () => {
    render(
      <table>
        <TableFooter>
          <TableRow>
            <TableCell>Footer content</TableCell>
          </TableRow>
        </TableFooter>
      </table>
    );
    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });

  it('should have base styles', () => {
    render(
      <table>
        <TableFooter data-testid="footer">
          <TableRow>
            <TableCell>Content</TableCell>
          </TableRow>
        </TableFooter>
      </table>
    );
    const footer = screen.getByTestId('footer');
    expect(footer).toHaveClass('border-t');
    expect(footer).toHaveClass('bg-muted/50');
    expect(footer).toHaveClass('font-medium');
  });

  it('should apply custom className', () => {
    render(
      <table>
        <TableFooter className="custom-class" data-testid="footer">
          <TableRow>
            <TableCell>Content</TableCell>
          </TableRow>
        </TableFooter>
      </table>
    );
    expect(screen.getByTestId('footer')).toHaveClass('custom-class');
  });

  it('should forward ref', () => {
    const ref = vi.fn();
    render(
      <table>
        <TableFooter ref={ref}>
          <TableRow>
            <TableCell>Content</TableCell>
          </TableRow>
        </TableFooter>
      </table>
    );
    expect(ref).toHaveBeenCalled();
  });
});

describe('TableRow', () => {
  it('should render children', () => {
    render(
      <table>
        <tbody>
          <TableRow>
            <TableCell>Row content</TableCell>
          </TableRow>
        </tbody>
      </table>
    );
    expect(screen.getByText('Row content')).toBeInTheDocument();
  });

  it('should have base styles', () => {
    render(
      <table>
        <tbody>
          <TableRow data-testid="row">
            <TableCell>Content</TableCell>
          </TableRow>
        </tbody>
      </table>
    );
    const row = screen.getByTestId('row');
    expect(row).toHaveClass('border-b');
    expect(row).toHaveClass('transition-colors');
    expect(row).toHaveClass('hover:bg-muted/50');
    expect(row).toHaveClass('data-[state=selected]:bg-muted');
  });

  it('should apply custom className', () => {
    render(
      <table>
        <tbody>
          <TableRow className="custom-class" data-testid="row">
            <TableCell>Content</TableCell>
          </TableRow>
        </tbody>
      </table>
    );
    expect(screen.getByTestId('row')).toHaveClass('custom-class');
  });

  it('should forward ref', () => {
    const ref = vi.fn();
    render(
      <table>
        <tbody>
          <TableRow ref={ref}>
            <TableCell>Content</TableCell>
          </TableRow>
        </tbody>
      </table>
    );
    expect(ref).toHaveBeenCalled();
  });

  it('should pass through data attributes', () => {
    render(
      <table>
        <tbody>
          <TableRow data-state="selected" data-testid="row">
            <TableCell>Content</TableCell>
          </TableRow>
        </tbody>
      </table>
    );
    expect(screen.getByTestId('row')).toHaveAttribute('data-state', 'selected');
  });
});

describe('TableHead', () => {
  it('should render children', () => {
    render(
      <table>
        <thead>
          <tr>
            <TableHead>Head content</TableHead>
          </tr>
        </thead>
      </table>
    );
    expect(screen.getByText('Head content')).toBeInTheDocument();
  });

  it('should render as th element', () => {
    render(
      <table>
        <thead>
          <tr>
            <TableHead>Header</TableHead>
          </tr>
        </thead>
      </table>
    );
    expect(screen.getByRole('columnheader')).toHaveTextContent('Header');
  });

  it('should have base styles', () => {
    render(
      <table>
        <thead>
          <tr>
            <TableHead data-testid="head">Content</TableHead>
          </tr>
        </thead>
      </table>
    );
    const head = screen.getByTestId('head');
    expect(head).toHaveClass('h-12');
    expect(head).toHaveClass('px-4');
    expect(head).toHaveClass('text-left');
    expect(head).toHaveClass('align-middle');
    expect(head).toHaveClass('font-medium');
    expect(head).toHaveClass('text-muted-foreground');
  });

  it('should apply custom className', () => {
    render(
      <table>
        <thead>
          <tr>
            <TableHead className="custom-class" data-testid="head">
              Content
            </TableHead>
          </tr>
        </thead>
      </table>
    );
    expect(screen.getByTestId('head')).toHaveClass('custom-class');
  });

  it('should forward ref', () => {
    const ref = vi.fn();
    render(
      <table>
        <thead>
          <tr>
            <TableHead ref={ref}>Content</TableHead>
          </tr>
        </thead>
      </table>
    );
    expect(ref).toHaveBeenCalled();
  });

  it('should accept colSpan prop', () => {
    render(
      <table>
        <thead>
          <tr>
            <TableHead colSpan={2} data-testid="head">
              Spanning Header
            </TableHead>
          </tr>
        </thead>
      </table>
    );
    expect(screen.getByTestId('head')).toHaveAttribute('colspan', '2');
  });
});

describe('TableCell', () => {
  it('should render children', () => {
    render(
      <table>
        <tbody>
          <tr>
            <TableCell>Cell content</TableCell>
          </tr>
        </tbody>
      </table>
    );
    expect(screen.getByText('Cell content')).toBeInTheDocument();
  });

  it('should render as td element', () => {
    render(
      <table>
        <tbody>
          <tr>
            <TableCell>Cell</TableCell>
          </tr>
        </tbody>
      </table>
    );
    expect(screen.getByRole('cell')).toHaveTextContent('Cell');
  });

  it('should have base styles', () => {
    render(
      <table>
        <tbody>
          <tr>
            <TableCell data-testid="cell">Content</TableCell>
          </tr>
        </tbody>
      </table>
    );
    const cell = screen.getByTestId('cell');
    expect(cell).toHaveClass('p-4');
    expect(cell).toHaveClass('align-middle');
  });

  it('should apply custom className', () => {
    render(
      <table>
        <tbody>
          <tr>
            <TableCell className="custom-class" data-testid="cell">
              Content
            </TableCell>
          </tr>
        </tbody>
      </table>
    );
    expect(screen.getByTestId('cell')).toHaveClass('custom-class');
  });

  it('should forward ref', () => {
    const ref = vi.fn();
    render(
      <table>
        <tbody>
          <tr>
            <TableCell ref={ref}>Content</TableCell>
          </tr>
        </tbody>
      </table>
    );
    expect(ref).toHaveBeenCalled();
  });

  it('should accept colSpan prop', () => {
    render(
      <table>
        <tbody>
          <tr>
            <TableCell colSpan={3} data-testid="cell">
              Spanning Cell
            </TableCell>
          </tr>
        </tbody>
      </table>
    );
    expect(screen.getByTestId('cell')).toHaveAttribute('colspan', '3');
  });
});

describe('TableCaption', () => {
  it('should render children', () => {
    render(
      <table>
        <TableCaption>Caption content</TableCaption>
        <tbody>
          <tr>
            <td>Content</td>
          </tr>
        </tbody>
      </table>
    );
    expect(screen.getByText('Caption content')).toBeInTheDocument();
  });

  it('should have base styles', () => {
    render(
      <table>
        <TableCaption data-testid="caption">Caption</TableCaption>
        <tbody>
          <tr>
            <td>Content</td>
          </tr>
        </tbody>
      </table>
    );
    const caption = screen.getByTestId('caption');
    expect(caption).toHaveClass('mt-4');
    expect(caption).toHaveClass('text-sm');
    expect(caption).toHaveClass('text-muted-foreground');
  });

  it('should apply custom className', () => {
    render(
      <table>
        <TableCaption className="custom-class" data-testid="caption">
          Caption
        </TableCaption>
        <tbody>
          <tr>
            <td>Content</td>
          </tr>
        </tbody>
      </table>
    );
    expect(screen.getByTestId('caption')).toHaveClass('custom-class');
  });

  it('should forward ref', () => {
    const ref = vi.fn();
    render(
      <table>
        <TableCaption ref={ref}>Caption</TableCaption>
        <tbody>
          <tr>
            <td>Content</td>
          </tr>
        </tbody>
      </table>
    );
    expect(ref).toHaveBeenCalled();
  });
});

describe('Table composition', () => {
  it('should render a complete table with all sections', () => {
    render(
      <Table data-testid="full-table">
        <TableCaption>A list of users</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>John Doe</TableCell>
            <TableCell>john@example.com</TableCell>
            <TableCell>Admin</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Jane Smith</TableCell>
            <TableCell>jane@example.com</TableCell>
            <TableCell>User</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>Total: 2 users</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    );

    expect(screen.getByTestId('full-table')).toBeInTheDocument();
    expect(screen.getByText('A list of users')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('Total: 2 users')).toBeInTheDocument();
  });

  it('should render a simple table with header and body', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Column 1</TableHead>
            <TableHead>Column 2</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Cell 1</TableCell>
            <TableCell>Cell 2</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    expect(screen.getByText('Column 1')).toBeInTheDocument();
    expect(screen.getByText('Column 2')).toBeInTheDocument();
    expect(screen.getByText('Cell 1')).toBeInTheDocument();
    expect(screen.getByText('Cell 2')).toBeInTheDocument();
  });

  it('should render an empty table with only header', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>No Data</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody />
      </Table>
    );

    expect(screen.getByText('No Data')).toBeInTheDocument();
  });

  it('should handle multiple rows with proper structure', () => {
    const data = [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
      { id: 3, name: 'Item 3' },
    ];

    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.id}</TableCell>
              <TableCell>{item.name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );

    expect(screen.getAllByRole('row')).toHaveLength(4); // 1 header + 3 body rows
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
  });
});
