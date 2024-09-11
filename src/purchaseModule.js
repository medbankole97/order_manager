const db = require("./config/db"); // Assurez-vous que cette connexion fonctionne avec votre base de données

// Ajouter une nouvelle commande
async function add(orderDate, deliveryAddress, customerId, trackNumber, status) {
  try {
    const [result] = await db.query(
      'INSERT INTO purchase_orders (order_date, delivery_address, customer_id, track_number, status) VALUES (?, ?, ?, ?, ?)',
      [orderDate, deliveryAddress, customerId, trackNumber, status]
    );
    // console.log("Query result:", result); // Ajout du log pour voir le résultat
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
    const result = await db.query(
      'INSERT INTO order_details (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
      [orderId, productId, quantity, price]
    );
    return result.affectedRows;
  } catch (error) {
    console.error("Error adding product to order:", error);
    throw error;
  }
}

// Récupérer toutes les commandes
async function get() {
  try {
    const [rows] = await db.query('SELECT * FROM purchase_orders');
    return rows;
  } catch (error) {
    console.error("Error retrieving purchase orders:", error);
    throw error;
  }
}

// Mettre à jour une commande
async function update(orderId, orderDate, deliveryAddress, customerId, trackNumber, status) {
  try {
    const result = await db.query(
      'UPDATE purchase_orders SET order_date = ?, delivery_address = ?, customer_id = ?, track_number = ?, status = ? WHERE id = ?',
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
    const result = await db.query('DELETE FROM purchase_orders WHERE id = ?', [orderId]);
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
