import { Inject, Injectable, OnApplicationShutdown } from '@nestjs/common';
import { Connection, createConnection } from 'mongoose';
import { AppConfig } from '../../app.config.provider';

@Injectable()
export class MongoConnection implements OnApplicationShutdown {
  private connection: Connection | null = null;
  private connectionPromise: Promise<Connection> | null = null;

  constructor(@Inject('CONFIG') private readonly config: AppConfig) {}

  getConnection(): Promise<Connection> {
    if (this.config.database.driver !== 'mongodb') {
      throw new Error(
        `Unsupported database driver: ${this.config.database.driver}`,
      );
    }

    if (!this.connectionPromise) {
      this.connection = createConnection(this.config.database.url);
      this.connectionPromise = this.connection.asPromise().catch((error) => {
        this.connection = null;
        this.connectionPromise = null;
        throw error;
      });
    }

    return this.connectionPromise;
  }

  async onApplicationShutdown(): Promise<void> {
    if (this.connection) {
      await this.connection.close();
    }
  }
}
