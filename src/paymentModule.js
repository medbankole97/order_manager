const pool = require("./config/db");

async function get() {
  const connection = await pool.getConnection();
  try {
    const [rows, _fields] = await connection.execute("SELECT * FROM payments");
    return rows;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
}

async function add(payment_date, amount, payment_method, order_id) {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.execute(
      "INSERT INTO payments (payment_date, amount, payment_method, order_id) VALUES (?, ?, ?, ?)",
      [payment_date, amount, payment_method, order_id]
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
      "SELECT COUNT(*) as count FROM payments WHERE id = ?",
      [id]
    );
    return rows[0].count > 0;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
}

async function update(id, payment_date, amount, payment_method, order_id) {
  const connection = await pool.getConnection();
  try {
    const existsPayment = await exists(id);
    if (!existsPayment) {
      throw new Error(`The payment with ID ${id} does not exist.`);
    }

    const [result] = await connection.execute(
      "UPDATE payments SET payment_date = ?, amount = ?, payment_method = ?, order_id = ? WHERE id = ?",
      [payment_date, amount, payment_method, order_id, id]
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
    const existsPayment = await exists(id);
    if (!existsPayment) {
      throw new Error(`The payment with ID ${id} does not exist.`);
    }

    const [result] = await connection.execute(
      "DELETE FROM payments WHERE id = ?",
      [id]
    );
    return result.affectedRows;
  } catch (error) {
    if (error.code && error.code === "ER_ROW_IS_REFERENCED_2") {
      throw new Error(`Deletion error: The payment with ID ${id} is referenced elsewhere.`);
    }
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = { get, add, update, destroy };
