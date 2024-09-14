const pool = require("./config/db");


// Vérifier si un produit existe par ID
async function exists(id) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      "SELECT COUNT(*) AS count FROM products WHERE id = ?",
      [id]
    );
    return rows[0].count > 0; // Retourne true si le produit existe, sinon false
  } catch (error) {
    console.error("Error checking product existence:", error);
    throw error;
  } finally {
    connection.release();
  }
}

// Récupérer tous les produits
async function get() {
  const connection = await pool.getConnection();
  try {
    const [rows, _fields] = await connection.execute("SELECT * FROM products");
    return rows;
  } catch (error) {
    console.error("Error retrieving products:");
    throw error;
  } finally {
    connection.release();
  }
}

// Ajouter un produit
async function add(name, description, price, stock, category, barcode, status) {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.execute(
      "INSERT INTO products (name, description, price, stock, category, barcode, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [name, description, price, stock, category, barcode, status]
    );
    if (result && result.insertId) {
      return result.insertId; // Retourne l'ID du nouveau produit ajouté
    } else {
      throw new Error("Failed to retrieve insertId from the database");
    }
  } catch (error) {
    console.error("Error adding product:");
    throw error;
  } finally {
    connection.release();
  }
}

// Vérifier si un produit existe
async function exists(id) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      "SELECT COUNT(*) AS count FROM products WHERE id = ?",
      [id]
    );
    return rows[0].count > 0; // Retourne true si le produit existe, sinon false
  } catch (error) {
    console.error("Error checking product existence:");
    throw error;
  } finally {
    connection.release();
  }
}

// Mettre à jour un produit
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
    return result.affectedRows; // Retourne le nombre de lignes affectées
  } catch (error) {
    console.error("Error updating product:");
    throw error;
  } finally {
    connection.release();
  }
}

// Supprimer un produit
async function destroy(id) {
  const connection = await pool.getConnection();
  try {
    const existsProduct = await exists(id);
    if (!existsProduct) {
      throw new Error(`The product with ID ${id} does not exist.`);
    }

    const [result] = await connection.execute("DELETE FROM products WHERE id = ?", [id]);
    return result.affectedRows; // Retourne le nombre de lignes supprimées
  } catch (error) {
    if (error.code && error.code === "ER_ROW_IS_REFERENCED_2") {
      throw new Error(`Deletion error: The product with ID ${id} is referenced elsewhere.`);
    }
    console.error("Error deleting product:");
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = { get, add, update, destroy, exists };
