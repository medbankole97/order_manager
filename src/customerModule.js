const pool = require("./config/db");

// Function to check if a customer exists by ID
async function customerExists(id) {
  const [rows] = await connection.execute(
    'SELECT COUNT(*) AS count FROM customers WHERE id = ?',
    [id]
  );
  return rows[0].count > 0;
}


// Validation des données du client
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone) {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
}

function validateCustomerData(name, address, email, phone) {
  if (!name || !address || !email || !phone) {
    throw new Error('All fields (name, address, email, phone) are required.');
  }
  if (!isValidEmail(email)) {
    throw new Error('The email address is invalid.');
  }
  if (!isValidPhone(phone)) {
    throw new Error('The phone number is invalid.');
  }
}


// Récupérer tous les clients
async function get() {
  const connection = await pool.getConnection();
  try {
    const [rows, _fields] = await connection.execute("SELECT * FROM customers");
    return rows;
  } catch (error) {
    console.error("Error retrieving customers:", error);
    throw error;
  } finally {
    connection.release();
  }
}

// Ajouter un client
async function add(name, address, email, phone) {
  const connection = await pool.getConnection();
  try {
    validateCustomerData(name, address, email, phone); // Validation des données

    const [result] = await connection.execute(
      "INSERT INTO customers (name, address, email, phone) VALUES (?, ?, ?, ?)",
      [name, address, email, phone]
    );
    
    if (result && result.insertId) {
      return result.insertId; // Return the ID of the newly added customer
    } else {
      throw new Error("Failed to retrieve insertId from the database.");
    }
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error(`Duplicate entry: The email '${email}' already exists.`);
    }
    console.error("Error adding customer:", error);
    throw error;
  } finally {
    connection.release();
  }
}

// Vérifier si un client existe
async function exists(id) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      "SELECT COUNT(*) as count FROM customers WHERE id = ?",
      [id]
    );
    return rows[0].count > 0; // Retourne true si le client existe, sinon false
  } catch (error) {
    console.error("Error checking customer existence:", error);
    throw error;
  } finally {
    connection.release();
  }
}

// Mettre à jour un client
async function update(id, name, address, email, phone) {
  const connection = await pool.getConnection();
  try {
    validateCustomerData(name, address, email, phone); // Validation des données

    const existsCustomer = await exists(id);
    if (!existsCustomer) {
      throw new Error(`The customer with ID ${id} does not exist.`);
    }

    const [result] = await connection.execute(
      "UPDATE customers SET name = ?, address = ?, email = ?, phone = ? WHERE id = ?",
      [name, address, email, phone, id]
    );
    return result.affectedRows; // Retourne le nombre de lignes affectées
  } catch (error) {
    console.error("Error updating customer:", error);
    throw error;
  } finally {
    connection.release();
  }
}

// Supprimer un client
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
    return result.affectedRows; // Retourne le nombre de lignes supprimées
  } catch (error) {
    if (error.code && error.code === "ER_ROW_IS_REFERENCED_2") {
      throw new Error(`Deletion error: The customer with ID ${id} is referenced elsewhere.`);
    }
    console.error("Error deleting customer:", error);
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = { get, add, update, destroy, customerExists, exists }; 
