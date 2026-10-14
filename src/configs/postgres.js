import { Pool } from "pg";

import logger from "./logger.js";
import config from "../constants/index.js";

class PostgresConnection {
  constructor() {
    this.pool = null;
  }

  /**
   * Creates and initializes the PostgreSQL connection pool.
   *
   * @returns {Promise<Pool>} The initialized PostgreSQL connection pool.
   * @throws {Error} If the PostgreSQL connection cannot be established.
   */
  async connectDb() {
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
  async testConnection() {
    try {
      const pool = await this.connectDb();

      const result = await pool.query("SELECT NOW()");

      logger.info(`PostgreSQL connected successfully at ${result.rows[0].now}`);
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
  getPool() {
    return this.pool;
  }

  /**
   * Returns the active PostgreSQL connection pool.
   *
   * @throws {Error} If the pool has not been initialized.
   * @returns {Pool} The active PostgreSQL pool.
   */
  _getRequiredPool() {
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

  async query(query, params = []) {
    const pool = this._getRequiredPool();
    const start = Date.now();
    const queryText = typeof query === "string" ? query : query.text;

    try {
      const result =
        typeof query === "string"
          ? await pool.query(query, params)
          : await pool.query(query);

      logger.debug("Executed PostgreSQL query", {
        duration: Date.now() - start,
        rows: result.rowCount,
      });

      return result;
    } catch (error) {
      logger.error("PostgreSQL query error", {
        text: queryText,
        error: error instanceof Error ? error.message : error,
        duration: Date.now() - start,
      });

      throw error;
    }
  }

  /**
   * Closes the PostgreSQL connection pool.
   *
   * @returns {Promise<void>}
   */
  async close() {
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
