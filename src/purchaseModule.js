const db = require("./config/db");

// Vérifier si un client existe
async function checkCustomerExists(customerId) {
  try {
    const [rows] = await db.query('SELECT id FROM customers WHERE id = ?', [customerId]);
    return rows.length > 0; // Retourne true si le client existe, sinon false
  } catch (error) {
    console.error("Error checking customer existence:", error);
    throw error;
  }
}

// Ajouter une commande d'achat
async function add(orderDate, deliveryAddress, customerId, trackNumber, status) {
  try {
    // Vérifie si le client existe
    const customerExists = await checkCustomerExists(customerId);
    if (!customerExists) {
      throw new Error("Customer ID does not exist.");
    }

    const [result] = await db.query(
      'INSERT INTO purchase_orders (date, delivery_address, customer_id, track_number, status) VALUES (?, ?, ?, ?, ?)',
      [orderDate, deliveryAddress, customerId, trackNumber, status]
    );

    if (result && result.insertId) {
      return result.insertId; // Retourne l'ID de la nouvelle commande ajoutée
    } else {
      throw new Error("Failed to retrieve insertId from the database");
    }
  } catch (error) {
    console.error("Error adding purchase order:", error);
    throw error;
  }
}

// Ajouter un produit à une commande spécifique
async function addProductToOrder(orderId, productId, quantity, price) {
  try {
    const [result] = await db.query(
      'INSERT INTO order_details (quantity, price, order_id, product_id ) VALUES (?, ?, ?, ?)',
      [quantity, price, orderId, productId]
    );
    return result.affectedRows;
  } catch (error) {
    console.error("Error adding product to order:", error);
    throw error;
  }
}

// Récupérer toutes les commandes avec leurs détails
async function get() {
  try {
    // Récupère toutes les commandes
    const [orders] = await db.query(
      'SELECT id, date, delivery_address, customer_id, track_number, status FROM purchase_orders'
    );

    // Pour chaque commande, récupère les détails correspondants
    for (const order of orders) {
      const [details] = await db.query(
        'SELECT product_id AS productId, quantity, price FROM order_details WHERE order_id = ?', 
        [order.id]
      );
      order.details = details; // Ajoute les détails dans l'objet commande
    }

    return orders; // Retourne toutes les commandes avec leurs détails
  } catch (error) {
    console.error("Error retrieving purchase orders:", error);
    throw error;
  }
}

// Mettre à jour une commande
async function update(orderId, orderDate, deliveryAddress, customerId, trackNumber, status) {
  try {
    const [result] = await db.query(
      'UPDATE purchase_orders SET date = ?, delivery_address = ?, customer_id = ?, track_number = ?, status = ? WHERE id = ?',
      [orderDate, deliveryAddress, customerId, trackNumber, status, orderId]
    );
    return result.affectedRows; // Nombre de lignes affectées
  } catch (error) {
    console.error("Error updating purchase order:", error);
    throw error;
  }
}

// Supprimer une commande
async function destroy(orderId) {
  try {
    const [result] = await db.query('DELETE FROM purchase_orders WHERE id = ?', [orderId]);
    return result.affectedRows; // Nombre de lignes supprimées
  } catch (error) {
    console.error("Error deleting purchase order:", error);
    throw error;
  }
}

module.exports = {
  add,
  addProductToOrder,
  get,
  update,
  destroy
};
