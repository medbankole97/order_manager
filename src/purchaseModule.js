const db = require("./config/db");

// Function to check if an order exists by ID
async function orderExists(id) {
  const [rows] = await connection.execute(
    'SELECT COUNT(*) AS count FROM purchase_orders WHERE id = ?',
    [id]
  );
  return rows[0].count > 0;
}


// Vérifier si un client existe
async function checkCustomerExists(customerId) {
  if (isNaN(customerId)) {
    throw new Error("Customer ID must be a number.");
  }
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
  if (isNaN(new Date(orderDate).getTime())) {
    throw new Error("Invalid order date.");
  }

  if (typeof trackNumber !== 'string' || trackNumber.trim() === '') {
    throw new Error("Track number must be a non-empty string.");
  }

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
  if (isNaN(quantity) || quantity <= 0) {
    throw new Error("Quantity must be a positive number.");
  }
  
  if (isNaN(price) || price <= 0) {
    throw new Error("Price must be a positive number.");
  }

  try {
    const [result] = await db.query(
      'INSERT INTO order_details (quantity, price, order_id, product_id) VALUES (?, ?, ?, ?)',
      [quantity, price, orderId, productId]
    );
    return result.affectedRows;
  } catch (error) {
    console.error("Error adding product to order:", error);
    throw error;
  }
}

// Mettre à jour une commande
async function update(orderId, orderDate, deliveryAddress, customerId, trackNumber, status) {
  if (isNaN(new Date(orderDate).getTime())) {
    throw new Error("Invalid order date.");
  }

  if (typeof trackNumber !== 'string' || trackNumber.trim() === '') {
    throw new Error("Track number must be a non-empty string.");
  }

  try {
    // Vérifier si la commande existe avant la mise à jour
    const [order] = await db.query('SELECT id FROM purchase_orders WHERE id = ?', [orderId]);
    if (order.length === 0) {
      throw new Error("Order not found.");
    }

    // Mettre à jour les détails de la commande
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

// Mettre à jour un détail de commande
async function updateOrderDetail(orderId, productId, newQuantity, newPrice) {
  if (isNaN(newQuantity) || newQuantity <= 0) {
    throw new Error("Quantity must be a positive number.");
  }
  
  if (isNaN(newPrice) || newPrice <= 0) {
    throw new Error("Price must be a positive number.");
  }

  // Check if the order exists
  const [order] = await db.query('SELECT * FROM purchase_orders WHERE id = ?', [orderId]);
  if (!order.length) {
    throw new Error("Order not found");
  }

  // Check if the product exists in the order
  const [orderDetail] = await db.query(
    'SELECT * FROM order_details WHERE order_id = ? AND product_id = ?',
    [orderId, productId]
  );
  
  if (!orderDetail.length) {
    throw new Error("Order detail not found");
  }

  // Update the quantity and price in the order details
  const [result] = await db.query(
    'UPDATE order_details SET quantity = ?, price = ? WHERE order_id = ? AND product_id = ?',
    [newQuantity, newPrice, orderId, productId]
  );

  return result.affectedRows; // Return the number of rows affected
}

// Ajouter ou mettre à jour un produit dans une commande
async function addOrUpdateOrderLine(orderId, productId, quantity, price) {
  if (isNaN(quantity) || quantity <= 0) {
    throw new Error("Quantity must be a positive number.");
  }
  
  if (isNaN(price) || price <= 0) {
    throw new Error("Price must be a positive number.");
  }

  try {
    // Vérifier si la ligne de commande existe déjà
    const [existingLine] = await db.query(
      'SELECT id FROM order_details WHERE order_id = ? AND product_id = ?',
      [orderId, productId]
    );

    if (existingLine.length > 0) {
      // Mettre à jour la ligne de commande existante
      const [result] = await db.query(
        'UPDATE order_details SET quantity = ?, price = ? WHERE order_id = ? AND product_id = ?',
        [quantity, price, orderId, productId]
      );
      return result.affectedRows; // Nombre de lignes affectées
    } else {
      // Ajouter une nouvelle ligne de commande
      const [result] = await db.query(
        'INSERT INTO order_details (quantity, price, order_id, product_id) VALUES (?, ?, ?, ?)',
        [quantity, price, orderId, productId]
      );
      return result.affectedRows; // Nombre de lignes affectées
    }
  } catch (error) {
    console.error("Error adding or updating order line:", error);
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
  destroy,
  orderExists,
  updateOrderDetail, 
  addOrUpdateOrderLine 
};
