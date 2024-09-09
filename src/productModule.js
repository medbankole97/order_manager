const pool = require("./db");

async function get() {
  const connection = await pool.getConnection();
  try {
    const [rows, _fields] = await connection.execute("SELECT * FROM products");
    return rows;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
}

async function add(name, description, price, stock, category, barcode, status) {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.execute(
      "INSERT INTO products (name, description, price, stock, category, barcode, status) values (?, ?, ?, ?, ?, ?, ?)",
      [name, description, price, stock, category, barcode, status]
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
      "SELECT COUNT(*) as count FROM products WHERE id = ?",
      [id]
    );
    return rows[0].count > 0;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
}

async function update(id, name, description, price, stock, category, barcode, status) {
  const connection = await pool.getConnection();
  try {
    const existsProduct = await exists(id);
    if (!existsProduct) {
      throw new Error(`The product with ID ${id} does not exist.`);
    }

    const [result] = await connection.execute(
      "UPDATE products SET name = ?, description = ?, price = ?, stock = ?, category = ?, barcode = ?, status = ? WHERE id = ?",
      [name, description, price, stock, category, barcode, status, id]
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
    const existsProduct = await exists(id);
    if (!existsProduct) {
      throw new Error(`The product with ID ${id} does not exist.`);
    }

    const [result] = await connection.execute(
      "DELETE FROM products WHERE id = ?",
      [id]
    );
    return result.affectedRows;
  } catch (error) {
    if (error.code && error.code === "ER_ROW_IS_REFERENCED_2") {
      throw new Error(`Deletion error: The product with ID ${id} is referenced elsewhere.`);
    }
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = { get, add, update, destroy };
