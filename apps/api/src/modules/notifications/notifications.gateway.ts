import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { NotificationsService } from './notifications.service';
import { JwtPayload } from '../auth/strategies';

@WebSocketGateway({
  namespace: '/notifications',
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
})
export class NotificationsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly notificationsService: NotificationsService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
    this.notificationsService.setServer(server);
  }

  async handleConnection(client: Socket) {
    try {
      const token = this.extractToken(client);
      if (!token) {
        throw new UnauthorizedException('No token provided');
      }

      const payload = await this.verifyToken(token);
      if (!payload) {
        throw new UnauthorizedException('Invalid token');
      }

      // Store user info in socket data
      client.data.user = {
        id: payload.sub,
        email: payload.email,
        orgId: payload.orgId,
        role: payload.role,
      };

      // Join user-specific room
      await client.join(`user:${payload.sub}`);

      // Join organization room
      await client.join(`org:${payload.orgId}`);

      this.logger.log(
        `Client connected: ${client.id} (user: ${payload.email}, org: ${payload.orgId})`
      );

      // Send connection confirmation
      client.emit('connected', {
        message: 'Successfully connected to notifications',
        userId: payload.sub,
      });
    } catch (error) {
      this.logger.error(`Connection failed: ${error instanceof Error ? error.message : error}`);
      client.emit('error', { message: 'Authentication failed' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const user = client.data.user;
    if (user) {
      this.logger.log(`Client disconnected: ${client.id} (user: ${user.email})`);
    } else {
      this.logger.log(`Client disconnected: ${client.id} (unauthenticated)`);
    }
  }

  /**
   * Subscribe to project notifications
   */
  @SubscribeMessage('subscribe:project')
  async handleSubscribeProject(
    @MessageBody() data: { projectId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;
    if (!user) {
      return { error: 'Unauthorized' };
    }

    const { projectId } = data;
    if (!projectId) {
      return { error: 'Project ID is required' };
    }

    // TODO: Verify user has access to this project
    // For now, we'll just allow subscription

    await client.join(`project:${projectId}`);

    this.logger.log(
      `User ${user.email} subscribed to project ${projectId} notifications`
    );

    return {
      success: true,
      message: `Subscribed to project ${projectId} notifications`,
    };
  }

  /**
   * Unsubscribe from project notifications
   */
  @SubscribeMessage('unsubscribe:project')
  async handleUnsubscribeProject(
    @MessageBody() data: { projectId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;
    if (!user) {
      return { error: 'Unauthorized' };
    }

    const { projectId } = data;
    if (!projectId) {
      return { error: 'Project ID is required' };
    }

    await client.leave(`project:${projectId}`);

    this.logger.log(
      `User ${user.email} unsubscribed from project ${projectId} notifications`
    );

    return {
      success: true,
      message: `Unsubscribed from project ${projectId} notifications`,
    };
  }

  /**
   * Subscribe to test run notifications
   */
  @SubscribeMessage('subscribe:test-run')
  async handleSubscribeTestRun(
    @MessageBody() data: { testRunId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;
    if (!user) {
      return { error: 'Unauthorized' };
    }

    const { testRunId } = data;
    if (!testRunId) {
      return { error: 'Test run ID is required' };
    }

    await client.join(`test-run:${testRunId}`);

    this.logger.log(
      `User ${user.email} subscribed to test run ${testRunId} notifications`
    );

    return {
      success: true,
      message: `Subscribed to test run ${testRunId} notifications`,
    };
  }

  /**
   * Unsubscribe from test run notifications
   */
  @SubscribeMessage('unsubscribe:test-run')
  async handleUnsubscribeTestRun(
    @MessageBody() data: { testRunId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;
    if (!user) {
      return { error: 'Unauthorized' };
    }

    const { testRunId } = data;
    if (!testRunId) {
      return { error: 'Test run ID is required' };
    }

    await client.leave(`test-run:${testRunId}`);

    this.logger.log(
      `User ${user.email} unsubscribed from test run ${testRunId} notifications`
    );

    return {
      success: true,
      message: `Unsubscribed from test run ${testRunId} notifications`,
    };
  }

  /**
   * Extract JWT token from socket handshake
   */
  private extractToken(client: Socket): string | null {
    const authHeader = client.handshake.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Also check query params for token (fallback)
    const token = client.handshake.auth?.token || client.handshake.query?.token;
    if (token && typeof token === 'string') {
      return token;
    }

    return null;
  }

  /**
   * Verify JWT token
   */
  private async verifyToken(token: string): Promise<JwtPayload | null> {
    try {
      const secret = this.configService.get<string>('jwt.secret');
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret,
      });
      return payload;
    } catch (error) {
      this.logger.error(`Token verification failed: ${error instanceof Error ? error.message : error}`);
      return null;
    }
  }
}
