import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { menu_entry, order } from '../model/Model';
import { pool } from './db/pool';

// Retrieve the daily menu from the MySQL store.
// Returns all menu entries mapped to `menu_entry`, or an empty array when none exist.
export const getDailyMenu = async (): Promise<menu_entry[]> => {
    const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT name, description, imageUrl FROM menu'
    );

    return rows.map((row) => ({
        name: row.name,
        description: row.description,
        imageUrl: row.imageUrl
    }));
};

// Helper function to generate unique order IDs
export const generateOrderId = (): string => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `order-${timestamp}-${random}`;
};

// Retrieve an order by ID from the MySQL store, joining its items into `contents`.
// Rejects when `id` is missing or blank; resolves to `undefined` when no order matches.
export const findOrderById = async (id: string): Promise<order | undefined> => {
    if (!id || !id.trim()) {
        throw new Error('Invalid order identifier');
    }

    const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT o.id AS id, o.sender AS sender, o.status AS status,
                oi.name AS item_name, oi.quantity AS item_quantity
         FROM \`order\` o
         LEFT JOIN order_item oi ON oi.order_id = o.id
         WHERE o.id = ?`,
        [id]
    );

    if (rows.length === 0) {
        return undefined;
    }

    return {
        id: rows[0].id,
        sender: rows[0].sender,
        status: rows[0].status,
        contents: rows
            .filter((row) => row.item_name !== null)
            .map((row) => ({
                name: row.item_name,
                quantity: row.item_quantity
            }))
    };
};

// Update an existing order in the MySQL store inside a transaction.
// Updates only the provided fields among sender, status, and contents; omitted fields are left unchanged.
// Resolves to `null` when the order does not exist (no change made). Rejects on invalid status or contents,
// leaving the stored order unchanged. Resolves to the full updated `order` on success.
export const updateOrderById = async (id: string, updatedOrder: Partial<order>): Promise<order | null> => {
    // Ensure the order exists before making any change.
    const [existingRows] = await pool.query<RowDataPacket[]>(
        'SELECT id FROM `order` WHERE id = ?',
        [id]
    );

    if (existingRows.length === 0) {
        return null;
    }

    // Validate provided fields before touching the store.
    const statusProvided = updatedOrder.status !== undefined;
    if (statusProvided) {
        const validStatuses = ['RECEIVED', 'DELIVERING', 'DELIVERED', 'CANCELED'];
        if (!validStatuses.includes(updatedOrder.status as string)) {
            throw new Error('Invalid order status');
        }
    }

    const contentsProvided = updatedOrder.contents !== undefined;
    if (contentsProvided) {
        const contents = updatedOrder.contents;
        if (!Array.isArray(contents)) {
            throw new Error('Invalid order contents');
        }
        for (const item of contents) {
            if (!item || !item.name || !item.name.trim()) {
                throw new Error('Invalid order contents');
            }
            if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
                throw new Error('Invalid order contents');
            }
        }
    }

    const senderProvided = updatedOrder.sender !== undefined;

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Update only the provided scalar fields on the order row.
        const setClauses: string[] = [];
        const params: unknown[] = [];
        if (senderProvided) {
            setClauses.push('sender = ?');
            params.push(updatedOrder.sender);
        }
        if (statusProvided) {
            setClauses.push('status = ?');
            params.push(updatedOrder.status);
        }
        if (setClauses.length > 0) {
            params.push(id);
            await connection.query(
                `UPDATE \`order\` SET ${setClauses.join(', ')} WHERE id = ?`,
                params
            );
        }

        // Replace order items when contents are provided.
        if (contentsProvided) {
            await connection.query(
                'DELETE FROM order_item WHERE order_id = ?',
                [id]
            );
            for (const item of updatedOrder.contents as order['contents']) {
                await connection.query(
                    'INSERT INTO order_item (order_id, name, quantity) VALUES (?, ?, ?)',
                    [id, item.name, item.quantity]
                );
            }
        }

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }

    // Read the full updated order back and return it.
    const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT o.id AS id, o.sender AS sender, o.status AS status,
                oi.name AS item_name, oi.quantity AS item_quantity
         FROM \`order\` o
         LEFT JOIN order_item oi ON oi.order_id = o.id
         WHERE o.id = ?`,
        [id]
    );

    return {
        id: rows[0].id,
        sender: rows[0].sender,
        status: rows[0].status,
        contents: rows
            .filter((row) => row.item_name !== null)
            .map((row) => ({
                name: row.item_name,
                quantity: row.item_quantity
            }))
    };
};

// Persist a new order and its items to the MySQL store inside a transaction.
// Rejects on invalid input (blank sender, or empty/invalid contents) without persisting anything.
// Resolves to the stored `order`, including its generated id and `RECEIVED` status.
export const addOrder = async (orderData: Omit<order, 'id'>): Promise<order> => {
    if (!orderData.sender || !orderData.sender.trim()) {
        throw new Error('Invalid order sender');
    }

    const contents = orderData.contents;
    if (!Array.isArray(contents) || contents.length === 0) {
        throw new Error('Invalid order contents');
    }

    for (const item of contents) {
        if (!item || !item.name || !item.name.trim()) {
            throw new Error('Invalid order contents');
        }
        if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
            throw new Error('Invalid order contents');
        }
    }

    const id = generateOrderId();
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        await connection.query(
            'INSERT INTO `order` (id, sender, status) VALUES (?, ?, ?)',
            [id, orderData.sender, 'RECEIVED']
        );

        for (const item of contents) {
            await connection.query(
                'INSERT INTO order_item (order_id, name, quantity) VALUES (?, ?, ?)',
                [id, item.name, item.quantity]
            );
        }

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }

    return {
        id,
        sender: orderData.sender,
        status: 'RECEIVED',
        contents
    };
};

// Delete an order from the MySQL store by ID.
// Rejects when `id` is missing or blank. The FK ON DELETE CASCADE removes the
// associated order_item rows automatically. Resolves to `true` when a row was
// deleted, `false` when no matching order exists.
export const deleteOrderById = async (id: string): Promise<boolean> => {
    if (!id || !id.trim()) {
        throw new Error('Invalid order identifier');
    }

    const [result] = await pool.query<ResultSetHeader>(
        'DELETE FROM `order` WHERE id = ?',
        [id]
    );

    return result.affectedRows > 0;
};