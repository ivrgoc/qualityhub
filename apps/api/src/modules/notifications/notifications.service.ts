import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

export interface TestRunStartedPayload {
  testRunId: string;
  testRunName: string;
  projectId: string;
  startedAt: Date;
  startedBy?: string;
}

export interface TestRunCompletedPayload {
  testRunId: string;
  testRunName: string;
  projectId: string;
  completedAt: Date;
  statistics: {
    total: number;
    passed: number;
    failed: number;
    blocked: number;
    skipped: number;
    retest: number;
    untested: number;
    passRate: number;
  };
}

export interface TestResultAddedPayload {
  testRunId: string;
  testResultId: string;
  testCaseId: string;
  testCaseTitle: string;
  status: string;
  projectId: string;
  executedBy?: string;
  executedAt?: Date;
}

export interface ActivityPayload {
  type: string;
  message: string;
  projectId: string;
  userId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

@Injectable()
export class NotificationsService {
  private server: Server;

  setServer(server: Server): void {
    this.server = server;
  }

  /**
   * Notify when a test run has started
   */
  notifyTestRunStarted(payload: TestRunStartedPayload): void {
    if (!this.server) {
      return;
    }

    this.server
      .to(`project:${payload.projectId}`)
      .emit('test-run:started', payload);
  }

  /**
   * Notify when a test run has completed
   */
  notifyTestRunCompleted(payload: TestRunCompletedPayload): void {
    if (!this.server) {
      return;
    }

    this.server
      .to(`project:${payload.projectId}`)
      .emit('test-run:completed', payload);
  }

  /**
   * Notify when a test result has been added or updated
   */
  notifyTestResultAdded(payload: TestResultAddedPayload): void {
    if (!this.server) {
      return;
    }

    this.server
      .to(`project:${payload.projectId}`)
      .emit('test-result:added', payload);
  }

  /**
   * Notify about general activity in a project
   */
  notifyActivity(payload: ActivityPayload): void {
    if (!this.server) {
      return;
    }

    this.server
      .to(`project:${payload.projectId}`)
      .emit('activity:new', payload);
  }

  /**
   * Send a notification to a specific user
   */
  notifyUser(userId: string, event: string, payload: any): void {
    if (!this.server) {
      return;
    }

    this.server.to(`user:${userId}`).emit(event, payload);
  }

  /**
   * Broadcast a notification to all connected clients
   */
  broadcast(event: string, payload: any): void {
    if (!this.server) {
      return;
    }

    this.server.emit(event, payload);
  }
}
