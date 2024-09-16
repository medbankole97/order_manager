const connPool = require("./config/db");

// Fonction pour valider les données du client
function validateCustomerData(name, address, email, phone) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+?[1-9]\d{1,14}$/; // Ex: +1234567890
  const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/; // Permet les lettres, espaces, accents, apostrophes et tirets
  
  if (typeof name !== 'string' || name.trim() === '') {
    throw new Error("Name must be a non-empty string.");
  }
  if (!nameRegex.test(name)) {
    throw new Error("Name must only contain letters, spaces, accents, apostrophes, or hyphens.");
  }
  if (typeof address !== 'string' || address.trim() === '') {
    throw new Error("Address must be a non-empty string.");
  }
  if (!emailRegex.test(email)) {
    throw new Error("Invalid email format.");
  }
  if (!phoneRegex.test(phone)) {
    throw new Error("Invalid phone number format.");
  }
}

// Function to check if the email or phone number already exists in the database
async function isEmailOrPhoneUnique(email, phone, excludeId = null) {
  const connection = await connPool.getConnection();
  try {
    let query = 'SELECT COUNT(*) AS count FROM customers WHERE (email = ? OR phone = ?)';
    const params = [email, phone];
    
    if (excludeId) {
      query += ' AND id != ?'; // Exclure l'ID du client actuel lors de la mise à jour
      params.push(excludeId);
    }

    const [rows] = await connection.execute(query, params);
    return rows[0].count === 0; // Retourne true si unique, sinon false
  } catch (error) {
    console.error('Error checking uniqueness:');
    throw error;
  } finally {
    connection.release();
  }
}

// Ajouter un client
async function add(name, address, email, phone) {
  const connection = await connPool.getConnection();
  try {
    // Étape 1 : Valider les données
    validateCustomerData(name, address, email, phone);

    // Étape 2 : Vérifier l'unicité
    const isUnique = await isEmailOrPhoneUnique(email, phone);
    if (!isUnique) {
      throw new Error('The email or phone number already exists.');
    }

    // Insérer le nouveau client
    const [result] = await connection.execute(
      "INSERT INTO customers (name, address, email, phone) VALUES (?, ?, ?, ?)",
      [name, address, email, phone]
    );

    if (result && result.insertId) {
      return result.insertId; // Retourne l'ID du nouveau client ajouté
    } else {
      throw new Error("Failed to retrieve insertId from the database.");
    }
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      if (error.message.includes('email')) {
        throw new Error(`Duplicate entry: The email '${email}' already exists.`);
      }
      if (error.message.includes('phone')) {
        throw new Error(`Duplicate entry: The phone '${phone}' already exists.`);
      }
    }
    console.error("Error adding customer:");
    throw error;
  } finally {
    connection.release();
  }
}
// Mettre à jour un client
async function update(id, name, address, email, phone) {
  const connection = await connPool.getConnection();
  try {
    // Étape 1 : Valider les données en premier
    validateCustomerData(name, address, email, phone); // Validation des formats

    // Étape 2 : Vérifier si le client existe dans la base de données
    const existsCustomer = await exists(id);
    if (!existsCustomer) {
      throw new Error(`The customer with ID ${id} does not exist.`);
    }

    // Étape 3 : Vérifier l'unicité de l'email et du téléphone (exclure l'ID du client en cours de modification)
    const isUnique = await isEmailOrPhoneUnique(email, phone, id);
    if (!isUnique) {
      throw new Error('The email or phone number already exists.');
    }

    // Étape 4 : Mettre à jour le client si tout est valide
    const [result] = await connection.execute(
      "UPDATE customers SET name = ?, address = ?, email = ?, phone = ? WHERE id = ?",
      [name, address, email, phone, id]
    );

    // Retourner le nombre de lignes affectées
    return result.affectedRows;
  } catch (error) {
    console.error("Error updating customer:");
    throw error;
  } finally {
    connection.release();
  }
}


// Supprimer un client
async function destroy(id) {
  const connection = await connPool.getConnection();
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
    console.error("Error deleting customer:");
    throw error;
  } finally {
    connection.release();
  }
}

// Vérifier si un client existe
async function exists(id) {
  const connection = await connPool.getConnection();
  try {
    const [rows] = await connection.execute(
      "SELECT COUNT(*) as count FROM customers WHERE id = ?",
      [id]
    );
    return rows[0].count > 0; // Retourne true si le client existe, sinon false
  } catch (error) {
    console.error("Error checking customer existence:");
    throw error;
  } finally {
    connection.release();
  }
}

// Récupérer tous les clients
async function get() {
  const connection = await connPool.getConnection();
  try {
    const [rows, _fields] = await connection.execute("SELECT * FROM customers");
    return rows;
  } catch (error) {
    console.error("Error retrieving customers:");
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = { get, add, update, destroy, isEmailOrPhoneUnique, exists };
