const connPool = require("./config/db");

// Vérifier si un paiement existe par ID
async function exists(id) {
  if (isNaN(id) || id <= 0) {
    throw new Error("Invalid ID provided.");
  }

  const connection = await connPool.getConnection();
  try {
    const [rows] = await connection.execute(
      "SELECT COUNT(*) AS count FROM payments WHERE id = ?",
      [id]
    );
    return rows[0].count > 0; // Retourne true si le paiement existe, sinon false
  } catch (error) {
    console.error("Error checking payment existence:");
    throw new Error("An error occurred while checking if the payment exists.");
  } finally {
    connection.release();
  }
}

// Récupérer tous les paiements
async function get() {
  const connection = await connPool.getConnection();
  try {
    const [rows, _fields] = await connection.execute("SELECT * FROM payments");
    return rows;
  } catch (error) {
    console.error("Error retrieving payments:");
    throw new Error("An error occurred while retrieving payments.");
  } finally {
    connection.release();
  }
}

// Ajouter un paiement
async function add(paymentDate, amount, paymentMethod, orderId) {
  // Validation des champs obligatoires
  if (!paymentDate || !amount || !paymentMethod || !orderId) {
    throw new Error("All fields are required.");
  }

  // Validation du format de la date
  if (!/^\d{4}-\d{2}-\d{2}$/.test(paymentDate)) {
    throw new Error("Invalid date format. Please use YYYY-MM-DD.");
  }

  // Validation des valeurs numériques
  if (isNaN(amount) || amount <= 0) {
    throw new Error("Amount must be a positive number.");
  }

  if (isNaN(orderId) || orderId <= 0) {
    throw new Error("Order ID must be a positive number.");
  }

  const connection = await connPool.getConnection();
  try {
    const [result] = await connection.execute(
      "INSERT INTO payments (payment_date, amount, payment_method, order_id) VALUES (?, ?, ?, ?)",
      [paymentDate, amount, paymentMethod, orderId]
    );
    if (result && result.insertId) {
      return result.insertId; // Retourne l'ID du nouveau paiement ajouté
    } else {
      throw new Error("Failed to retrieve insertId from the database.");
    }
  } catch (error) {
    console.error("Error adding payment:");
    throw new Error("An error occurred while adding the payment. Please check your input and try again.");
  } finally {
    connection.release();
  }
}

// Mettre à jour un paiement
async function update(id, paymentDate, amount, paymentMethod, orderId) {
  // Validation des champs obligatoires
  if (!id || !paymentDate || !amount || !paymentMethod || !orderId) {
    throw new Error("All fields are required.");
  }
  
    // Validation du format de la date
    if (!/^\d{4}-\d{2}-\d{2}$/.test(paymentDate)) {
      throw new Error("Invalid date format. Please use YYYY-MM-DD.");
    }
  
  // Validation des valeurs numériques
  if (isNaN(id) || id <= 0) {
    throw new Error("Invalid payment ID provided.");
  }

  if (isNaN(amount) || amount <= 0) {
    throw new Error("Amount must be a positive number.");
  }

  if (isNaN(orderId) || orderId <= 0) {
    throw new Error("Order ID must be a positive number.");
  }

  // Vérifier si le paiement existe
  const existsPayment = await exists(id);
  if (!existsPayment) {
    throw new Error(`The payment with ID ${id} does not exist.`);
  }

  const connection = await connPool.getConnection();
  try {
    const [result] = await connection.execute(
      "UPDATE payments SET payment_date = ?, amount = ?, payment_method = ?, order_id = ? WHERE id = ?",
      [paymentDate, amount, paymentMethod, orderId, id]
    );
    return result.affectedRows; // Retourne le nombre de lignes affectées
  } catch (error) {
    console.error("Error updating payment:");
    throw new Error("An error occurred while updating the payment.");
  } finally {
    connection.release();
  }
}

// Supprimer un paiement
async function destroy(id) {
  const connection = await connPool.getConnection();
  // Validation des champs obligatoires
  if (isNaN(id) || id <= 0) {
    throw new Error("Invalid ID provided.");
  }

  // Vérifier si le paiement existe
  const existsPayment = await exists(id);
  if (!existsPayment) {
    throw new Error(`The payment with ID ${id} does not exist.`);
  }

  try {
    const [result] = await connection.execute(
      "DELETE FROM payments WHERE id = ?",
      [id]
    );
    return result.affectedRows; // Retourne le nombre de lignes supprimées
  } catch (error) {
    if (error.code && error.code === "ER_ROW_IS_REFERENCED_2") {
      throw new Error(`Deletion error: The payment with ID ${id} is referenced elsewhere.`);
    }
    console.error("Error deleting payment:");
    throw new Error("An error occurred while deleting the payment.");
  } finally {
    connection.release();
  }
}


module.exports = { get, add, update, destroy, exists };
