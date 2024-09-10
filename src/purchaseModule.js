const pool = require("./config/db");

async function get() {
  const connection = await pool.getConnection();
  try {
    const [rows, _fields] = await connection.execute("SELECT * FROM purchase_orders");
    return rows;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
}

async function add(order_date, delivery_address, customer_id, track_number, status) {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.execute(
      "INSERT INTO purchase_orders (order_date, delivery_address, customer_id, track_number, status) VALUES (?, ?, ?, ?, ?)",
      [order_date, delivery_address, customer_id, track_number, status]
    );
    return result.insertId;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
}

async function exists(id) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      "SELECT COUNT(*) as count FROM purchase_orders WHERE id = ?",
      [id]
    );
    return rows[0].count > 0;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
}

async function update(id, order_date, delivery_address, customer_id, track_number, status) {
  const connection = await pool.getConnection();
  try {
    const existsOrder = await exists(id);
    if (!existsOrder) {
      throw new Error(`The order with ID ${id} does not exist.`);
    }

    const [result] = await connection.execute(
      "UPDATE purchase_orders SET order_date = ?, delivery_address = ?, customer_id = ?, track_number = ?, status = ? WHERE id = ?",
      [order_date, delivery_address, customer_id, track_number, status, id]
    );
    return result.affectedRows;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
}

async function destroy(id) {
  const connection = await pool.getConnection();
  try {
    const existsOrder = await exists(id);
    if (!existsOrder) {
      throw new Error(`The order with ID ${id} does not exist.`);
    }

    const [result] = await connection.execute(
      "DELETE FROM purchase_orders WHERE id = ?",
      [id]
    );
    return result.affectedRows;
  } catch (error) {
    if (error.code && error.code === "ER_ROW_IS_REFERENCED_2") {
      throw new Error(`Deletion error: The order with ID ${id} is referenced elsewhere.`);
    }
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = { get, add, update, destroy };
