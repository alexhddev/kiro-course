import mysql, { RowDataPacket } from 'mysql2/promise';

/**
 * MySQL connection pool for the Awesome Pizza data layer.
 *
 * Configuration is read from environment variables with documented defaults so
 * the API can run out of the box against a local MySQL instance:
 *
 * | Env var       | Default          | Purpose        |
 * | ------------- | ---------------- | -------------- |
 * | `DB_HOST`     | `localhost`      | MySQL host     |
 * | `DB_PORT`     | `3306`           | MySQL port     |
 * | `DB_USER`     | `root`           | MySQL user     |
 * | `DB_PASSWORD` | `password`       | MySQL password |
 * | `DB_NAME`     | `awesome_pizza`  | Database name  |
 */
export const pool = mysql.createPool({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'awesome_pizza',
  connectTimeout: 10_000, // Requirement 1.3: 10s connection timeout
  waitForConnections: true,
  connectionLimit: 10,
});

/** Create the `menu`, `order`, and `order_item` tables if they do not exist. */
export async function initSchema(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS menu (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      imageUrl VARCHAR(512) NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS \`order\` (
      id VARCHAR(64) PRIMARY KEY,
      sender VARCHAR(255) NOT NULL,
      status ENUM('RECEIVED','DELIVERING','DELIVERED','CANCELED') NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS order_item (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id VARCHAR(64) NOT NULL,
      name VARCHAR(255) NOT NULL,
      quantity INT NOT NULL,
      CONSTRAINT fk_order_item_order
        FOREIGN KEY (order_id) REFERENCES \`order\`(id)
        ON DELETE CASCADE
    )
  `);
}

/** The five original menu entries from the in-memory `database.ts`. */
const SEED_MENU: ReadonlyArray<[name: string, description: string, imageUrl: string]> = [
  ['Margherita Pizza', 'Classic pizza with fresh tomatoes, mozzarella cheese, and basil', 'assets/origs/margherita.png'],
  ['Pepperoni Pizza', 'Traditional pizza topped with pepperoni and mozzarella cheese', 'assets/origs/pepperoni.png'],
  ['Quattro Stagioni', 'Four seasons pizza with artichokes, ham, mushrooms, and olives', 'assets/origs/quattro.png'],
  ['Vegetarian Delight', 'Fresh vegetables including bell peppers, onions, mushrooms, and tomatoes', 'assets/origs/vegetarian.png'],
  ['BBQ Chicken Pizza', 'Grilled chicken with BBQ sauce, red onions, and cilantro', 'assets/origs/bbq-chicken.png'],
];

/** The three original seed orders from the in-memory `database.ts`. */
const SEED_ORDERS: ReadonlyArray<{
  id: string;
  sender: string;
  status: 'RECEIVED' | 'DELIVERING' | 'DELIVERED' | 'CANCELED';
  contents: ReadonlyArray<{ name: string; quantity: number }>;
}> = [
  {
    id: 'order-001',
    sender: 'John Doe',
    status: 'RECEIVED',
    contents: [
      { name: 'Margherita Pizza', quantity: 2 },
      { name: 'Pepperoni Pizza', quantity: 1 },
    ],
  },
  {
    id: 'order-002',
    sender: 'Jane Smith',
    status: 'DELIVERING',
    contents: [
      { name: 'Vegetarian Delight', quantity: 1 },
      { name: 'BBQ Chicken Pizza', quantity: 1 },
    ],
  },
  {
    id: 'order-003',
    sender: 'Mike Johnson',
    status: 'DELIVERED',
    contents: [{ name: 'Quattro Stagioni', quantity: 3 }],
  },
];

/**
 * Idempotently seed the menu and orders when the store is empty.
 *
 * Menu and orders are guarded independently with a `SELECT COUNT(*)`: the five
 * original menu entries are inserted only when `menu` is empty, and the three
 * original seed orders (with their items) only when `` `order` `` is empty.
 * Each order plus its `order_item` rows is inserted inside a transaction, so a
 * partial order can never be persisted. On a non-empty store nothing is
 * inserted and existing records are left unchanged (Requirement 2.4–2.5).
 */
export async function seedIfEmpty(): Promise<void> {
  const [menuRows] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) AS count FROM menu');
  if (Number(menuRows[0].count) === 0) {
    await pool.query(
      'INSERT INTO menu (name, description, imageUrl) VALUES ?',
      [SEED_MENU.map(([name, description, imageUrl]) => [name, description, imageUrl])]
    );
  }

  const [orderRows] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) AS count FROM `order`');
  if (Number(orderRows[0].count) === 0) {
    for (const seedOrder of SEED_ORDERS) {
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();
        await connection.query(
          'INSERT INTO `order` (id, sender, status) VALUES (?, ?, ?)',
          [seedOrder.id, seedOrder.sender, seedOrder.status]
        );
        await connection.query(
          'INSERT INTO order_item (order_id, name, quantity) VALUES ?',
          [seedOrder.contents.map((item) => [seedOrder.id, item.name, item.quantity])]
        );
        await connection.commit();
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    }
  }
}
