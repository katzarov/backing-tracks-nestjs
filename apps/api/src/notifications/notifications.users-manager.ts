import {
  BeforeApplicationShutdown,
  Logger,
  OnApplicationShutdown,
} from '@nestjs/common';
import { Response } from 'express';

const LogEventName = 'SSE';

/**
 * Keeps connected clients of user in memory.
 * Provides some common operations.
 */
export class NotificationsUsersManager
  implements BeforeApplicationShutdown, OnApplicationShutdown
{
  private readonly logger = new Logger();
  private connectedUsers = new Map<
    number,
    {
      clients: Response[];
    }
  >();

  beforeApplicationShutdown() {
    // Needed especially for the dev server.
    // We need to close all current sockets, and force client to establish a new connection.
    // otherwise client may still stay connected to some socket that is no longer in the context of our program.
    this.logger.debug(
      this.connectedUsers,
      LogEventName.concat(' - will close conns: '),
    );

    this.connectedUsers.forEach((user) =>
      user.clients.forEach((client) => client.end()),
    );
  }

  onApplicationShutdown() {
    // should already be clear at this point.
    if (this.connectedUsers.size !== 0) {
      this.logger.warn(
        this.connectedUsers,
        LogEventName.concat(' - leaky conns: '),
      );
      this.connectedUsers.clear();
    }
  }

  protected isUserConnected(userId: number) {
    return this.connectedUsers.has(userId);
  }

  /**
   *
   * Assume user exists in map.
   * @throws {Error} - when user is not found in map
   */
  protected sendMessageToClientsOfUser(userId: number, message: string) {
    const clientsOfUser = this.connectedUsers.get(userId);

    if (clientsOfUser === undefined) {
      throw new Error(
        `userId:${userId} does not exist. Client should check if user exists with isUserConnected() before calling sendMessageToClientsOfUser()`,
      );
    }

    for (const client of clientsOfUser.clients) {
      // TODO read .write documentation!
      // TODO handle if writing fails - maybe force client to reconnect and do some cleanup here. Or it failed bc of another reason.
      client.write(message);
    }
  }

  protected addNewClient(userId: number, res: Response) {
    if (!this.connectedUsers.has(userId)) {
      // add new user
      this.connectedUsers.set(userId, { clients: [res] });
    } else {
      // add client to existing user
      const value = this.connectedUsers.get(userId);
      value.clients.push(res);
    }

    this.logger.debug(
      this.connectedUsers,
      LogEventName.concat(' - client new conn: '),
    );
  }

  protected setClientSocketCloseCb(userId: number, res: Response) {
    res.on('close', () => {
      // remove client of user | assume userId exists
      const value = this.connectedUsers.get(userId);
      const newClients = value.clients.filter((client) => client !== res);

      if (newClients.length === 0) {
        // remove user from map if this was their last client
        this.connectedUsers.delete(userId);
      } else {
        this.connectedUsers.set(userId, { clients: newClients });
      }

      this.logger.debug(
        this.connectedUsers,
        LogEventName.concat(' - client disconn: '),
      );
    });
  }
}
