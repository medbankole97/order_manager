const pool = require("./config/db");


// Function to check if a payment exists by ID
async function paymentExists(id) {
  const [rows] = await connection.execute(
    'SELECT COUNT(*) AS count FROM payments WHERE id = ?',
    [id]
  );
  return rows[0].count > 0;
}
// Récupérer tous les paiements
async function get() {
  const connection = await pool.getConnection();
  try {
    const [rows, _fields] = await connection.execute("SELECT * FROM payments");
    return rows;
  } catch (error) {
    console.error("Error retrieving payments:", error);
    throw error;
  } finally {
    connection.release();
  }
}

// Ajouter un paiement
async function add(payment_date, amount, payment_method, order_id) {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.execute(
      "INSERT INTO payments (payment_date, amount, payment_method, order_id) VALUES (?, ?, ?, ?)",
      [payment_date, amount, payment_method, order_id]
    );
    if (result && result.insertId) {
      return result.insertId; // Retourne l'ID du nouveau paiement ajouté
    } else {
      throw new Error("Failed to retrieve insertId from the database");
    }
  } catch (error) {
    console.error("Error adding payment:", error);
    throw error;
  } finally {
    connection.release();
  }
}

// Vérifier si un paiement existe
async function exists(id) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      "SELECT COUNT(*) AS count FROM payments WHERE id = ?",
      [id]
    );
    return rows[0].count > 0; // Retourne true si le paiement existe, sinon false
  } catch (error) {
    console.error("Error checking payment existence:", error);
    throw error;
  } finally {
    connection.release();
  }
}

// Mettre à jour un paiement
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
    return result.affectedRows; // Retourne le nombre de lignes affectées
  } catch (error) {
    console.error("Error updating payment:", error);
    throw error;
  } finally {
    connection.release();
  }
}

// Supprimer un paiement
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
    return result.affectedRows; // Retourne le nombre de lignes supprimées
  } catch (error) {
    if (error.code && error.code === "ER_ROW_IS_REFERENCED_2") {
      throw new Error(`Deletion error: The payment with ID ${id} is referenced elsewhere.`);
    }
    console.error("Error deleting payment:", error);
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = { get, add, update, destroy, paymentExists,exists }; // Ajout de la fonction 'exists' dans les exports
