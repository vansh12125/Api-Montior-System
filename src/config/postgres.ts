import {
  Pool,
  type QueryResult,
  type QueryResultRow,
} from "pg";

import logger from "./logger";
import config from "../constants";

class PostgresConnection {
  private pool: Pool | null;

  constructor() {
    this.pool = null;
  }

  /**
   * Creates and initializes the PostgreSQL connection pool.
   *
   * @returns {Promise<Pool>} The initialized PostgreSQL connection pool.
   * @throws {Error} If the PostgreSQL connection cannot be established.
   */
  async connectDb(): Promise<Pool> {
    try {
      if (this.pool) {
        logger.info("PostgreSQL pool already initialized");
        return this.pool;
      }

      const pool = new Pool({
        host: config.postgres.host,
        port: config.postgres.port,
        database: config.postgres.database,
        user: config.postgres.user,
        password: config.postgres.password,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      pool.on("error", (error) => {
        logger.error("Unexpected error on idle PostgreSQL client", error);
      });

      await pool.query("SELECT 1");

      this.pool = pool;

      logger.info("PostgreSQL pool created and connection verified");

      return this.pool;
    } catch (error) {
      logger.error("Failed to connect to PostgreSQL:", error);

      this.pool = null;

      throw error;
    }
  }

  /**
   * Tests the PostgreSQL database connection.
   *
   * @returns {Promise<void>}
   * @throws {Error} If the database connection test fails.
   */
  async testConnection(): Promise<void> {
    try {
      const pool = await this.connectDb();

      const result = await pool.query("SELECT NOW()");

      logger.info(
        `PostgreSQL connected successfully at ${result.rows[0].now}`
      );
    } catch (error) {
      logger.error("Failed to connect to PostgreSQL:", error);
      throw error;
    }
  }

  /**
   * Returns the active PostgreSQL connection pool.
   *
   * @returns {Pool | null} The active pool or null if not initialized.
   */
  getPool(): Pool | null {
    return this.pool;
  }

  /**
   * Returns the active PostgreSQL connection pool.
   *
   * @throws {Error} If the pool has not been initialized.
   * @returns {Pool} The active PostgreSQL pool.
   */
  private getRequiredPool(): Pool {
    if (!this.pool) {
      throw new Error("PostgreSQL pool is not initialized");
    }

    return this.pool;
  }

  /**
   * Executes a PostgreSQL query.
   *
   * @template T The expected row type.
   * @param {string} text SQL query text.
   * @param {unknown[]} params Query parameters.
   * @returns {Promise<QueryResult<T>>} The PostgreSQL query result.
   * @throws {Error} If the query fails.
   */
  async query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    params: unknown[] = []
  ): Promise<QueryResult<T>> {
    const pool = this.getRequiredPool();
    const start = Date.now();

    try {
      const result = await pool.query<T>(text, params);

      const duration = Date.now() - start;

      logger.debug("Executed PostgreSQL query", {
        text,
        duration,
        rows: result.rowCount,
      });

      return result;
    } catch (error) {
      logger.error("PostgreSQL query error", {
        text,
        error: error instanceof Error ? error.message : error,
      });

      throw error;
    }
  }

  /**
   * Closes the PostgreSQL connection pool.
   *
   * @returns {Promise<void>}
   */
  async close(): Promise<void> {
    if (!this.pool) {
      return;
    }

    try {
      await this.pool.end();

      logger.info("PostgreSQL pool closed");
    } finally {
      this.pool = null;
    }
  }
}

export default new PostgresConnection();