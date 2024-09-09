const pool = require("./db");

async function get() {
  const connection = await pool.getConnection();
  try {
    const [rows, _fields] = await connection.execute("SELECT * FROM customers");
    return rows;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
}

async function add(name, address, email, phone) {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.execute(
      "INSERT INTO customers (name, address, email, phone) values (?, ?, ?, ?)",
      [name, address, email, phone]
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
      "SELECT COUNT(*) as count FROM customers WHERE id = ?",
      [id]
    );
    return rows[0].count > 0;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
}

async function update(id, name, address, email, phone) {
  const connection = await pool.getConnection();
  try {
    const existsCustomer = await exists(id);
    if (!existsCustomer) {
      throw new Error(`The customer with ID ${id} does not exist.`);
    }

    const [result] = await connection.execute(
      "UPDATE customers SET name = ?, address = ?, email = ?, phone = ? WHERE id = ?",
      [name, address, email, phone, id]
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
    const existsCustomer = await exists(id);
    if (!existsCustomer) {
      throw new Error(`The customer with ID ${id} does not exist.`);
    }

    const [result] = await connection.execute(
      "DELETE FROM customers WHERE id = ?",
      [id]
    );
    return result.affectedRows;
  } catch (error) {
    if (error.code && error.code === "ER_ROW_IS_REFERENCED_2") {
      throw new Error(`Deletion error: The customer with ID ${id} is referenced elsewhere.`);
    }
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = { get, add, update, destroy };
