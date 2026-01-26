import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { NotificationsPopover, type Notification } from './NotificationsPopover';

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
};

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'info',
    title: 'Test notification',
    message: 'This is a test notification message.',
    timestamp: new Date().toISOString(),
    read: false,
    href: '/test',
  },
  {
    id: '2',
    type: 'success',
    title: 'Success notification',
    message: 'Operation completed successfully.',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    read: true,
  },
  {
    id: '3',
    type: 'warning',
    title: 'Warning notification',
    message: 'Please review this item.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    read: false,
  },
];

describe('NotificationsPopover', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the notifications button', () => {
    renderWithRouter(<NotificationsPopover />);

    expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument();
  });

  it('should show unread count badge when there are unread notifications', () => {
    renderWithRouter(<NotificationsPopover notifications={mockNotifications} />);

    // 2 unread notifications
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should not show badge when all notifications are read', () => {
    const readNotifications = mockNotifications.map((n) => ({ ...n, read: true }));
    renderWithRouter(<NotificationsPopover notifications={readNotifications} />);

    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('should open popover when button is clicked', async () => {
    const user = userEvent.setup();
    renderWithRouter(<NotificationsPopover notifications={mockNotifications} />);

    const button = screen.getByRole('button', { name: /notifications/i });
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText('Notifications')).toBeInTheDocument();
    });
  });

  it('should display notification titles', async () => {
    const user = userEvent.setup();
    renderWithRouter(<NotificationsPopover notifications={mockNotifications} />);

    await user.click(screen.getByRole('button', { name: /notifications/i }));

    await waitFor(() => {
      expect(screen.getByText('Test notification')).toBeInTheDocument();
      expect(screen.getByText('Success notification')).toBeInTheDocument();
      expect(screen.getByText('Warning notification')).toBeInTheDocument();
    });
  });

  it('should display notification messages', async () => {
    const user = userEvent.setup();
    renderWithRouter(<NotificationsPopover notifications={mockNotifications} />);

    await user.click(screen.getByRole('button', { name: /notifications/i }));

    await waitFor(() => {
      expect(screen.getByText('This is a test notification message.')).toBeInTheDocument();
    });
  });

  it('should show empty state when no notifications', async () => {
    const user = userEvent.setup();
    renderWithRouter(<NotificationsPopover notifications={[]} />);

    await user.click(screen.getByRole('button', { name: /notifications/i }));

    await waitFor(() => {
      expect(screen.getByText('No notifications')).toBeInTheDocument();
    });
  });

  it('should call onMarkAsRead when clicking a notification with href', async () => {
    const user = userEvent.setup();
    const onMarkAsRead = vi.fn();
    renderWithRouter(
      <NotificationsPopover
        notifications={mockNotifications}
        onMarkAsRead={onMarkAsRead}
      />
    );

    await user.click(screen.getByRole('button', { name: /notifications/i }));

    await waitFor(() => {
      expect(screen.getByText('Test notification')).toBeInTheDocument();
    });

    // Click the notification link
    const notificationLink = screen.getByRole('link', { name: /test notification/i });
    await user.click(notificationLink);

    expect(onMarkAsRead).toHaveBeenCalledWith('1');
  });

  it('should call onMarkAllAsRead when clicking "Mark all read"', async () => {
    const user = userEvent.setup();
    const onMarkAllAsRead = vi.fn();
    renderWithRouter(
      <NotificationsPopover
        notifications={mockNotifications}
        onMarkAllAsRead={onMarkAllAsRead}
      />
    );

    await user.click(screen.getByRole('button', { name: /notifications/i }));

    await waitFor(() => {
      expect(screen.getByText('Mark all read')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Mark all read'));

    expect(onMarkAllAsRead).toHaveBeenCalled();
  });

  it('should not show "Mark all read" when all notifications are read', async () => {
    const user = userEvent.setup();
    const readNotifications = mockNotifications.map((n) => ({ ...n, read: true }));
    renderWithRouter(<NotificationsPopover notifications={readNotifications} />);

    await user.click(screen.getByRole('button', { name: /notifications/i }));

    await waitFor(() => {
      expect(screen.getByText('Notifications')).toBeInTheDocument();
    });

    expect(screen.queryByText('Mark all read')).not.toBeInTheDocument();
  });

  it('should call onDismiss when clicking dismiss button', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    renderWithRouter(
      <NotificationsPopover
        notifications={mockNotifications}
        onDismiss={onDismiss}
      />
    );

    await user.click(screen.getByRole('button', { name: /notifications/i }));

    await waitFor(() => {
      expect(screen.getByText('Test notification')).toBeInTheDocument();
    });

    // Hover to show dismiss button and click it
    const dismissButtons = screen.getAllByLabelText('Dismiss notification');
    expect(dismissButtons.length).toBeGreaterThan(0);
    await user.click(dismissButtons[0]!);

    expect(onDismiss).toHaveBeenCalledWith('1');
  });

  it('should show "View all notifications" link', async () => {
    const user = userEvent.setup();
    renderWithRouter(<NotificationsPopover notifications={mockNotifications} />);

    await user.click(screen.getByRole('button', { name: /notifications/i }));

    await waitFor(() => {
      expect(screen.getByText('View all notifications')).toBeInTheDocument();
    });
  });

  it('should show 99+ for more than 99 unread notifications', () => {
    const manyNotifications = Array.from({ length: 100 }, (_, i) => ({
      id: String(i),
      type: 'info' as const,
      title: `Notification ${i}`,
      message: 'Message',
      timestamp: new Date().toISOString(),
      read: false,
    }));

    renderWithRouter(<NotificationsPopover notifications={manyNotifications} />);

    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    renderWithRouter(<NotificationsPopover className="custom-class" />);

    const button = screen.getByRole('button', { name: /notifications/i });
    expect(button).toHaveClass('custom-class');
  });

  it('should format timestamp as "Just now" for very recent notifications', async () => {
    const user = userEvent.setup();
    const recentNotification: Notification[] = [
      {
        id: '1',
        type: 'info',
        title: 'Recent',
        message: 'Just happened',
        timestamp: new Date().toISOString(),
        read: false,
      },
    ];
    renderWithRouter(<NotificationsPopover notifications={recentNotification} />);

    await user.click(screen.getByRole('button', { name: /notifications/i }));

    await waitFor(() => {
      expect(screen.getByText('Just now')).toBeInTheDocument();
    });
  });

  it('should format timestamp in minutes for recent notifications', async () => {
    const user = userEvent.setup();
    const notification: Notification[] = [
      {
        id: '1',
        type: 'info',
        title: 'Minutes ago',
        message: 'Happened a few minutes ago',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        read: false,
      },
    ];
    renderWithRouter(<NotificationsPopover notifications={notification} />);

    await user.click(screen.getByRole('button', { name: /notifications/i }));

    await waitFor(() => {
      expect(screen.getByText('5m ago')).toBeInTheDocument();
    });
  });

  it('should format timestamp in hours', async () => {
    const user = userEvent.setup();
    const notification: Notification[] = [
      {
        id: '1',
        type: 'info',
        title: 'Hours ago',
        message: 'Happened hours ago',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        read: false,
      },
    ];
    renderWithRouter(<NotificationsPopover notifications={notification} />);

    await user.click(screen.getByRole('button', { name: /notifications/i }));

    await waitFor(() => {
      expect(screen.getByText('3h ago')).toBeInTheDocument();
    });
  });

  it('should indicate unread notifications visually', async () => {
    const user = userEvent.setup();
    renderWithRouter(<NotificationsPopover notifications={mockNotifications} />);

    await user.click(screen.getByRole('button', { name: /notifications/i }));

    await waitFor(() => {
      // Unread notifications should have the unread indicator (small blue dot)
      // The selector is specific to avoid matching the Badge component
      const unreadIndicators = document.querySelectorAll('.h-2.w-2.rounded-full.bg-primary');
      expect(unreadIndicators.length).toBe(2); // 2 unread notifications
    });
  });
});
