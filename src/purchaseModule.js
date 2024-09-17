const connPool = require("./config/db");

// Function to check if an order exists by ID
async function orderExists(orderId) {
  try {
    const [rows] = await connPool.query('SELECT id FROM purchase_orders WHERE id = ?', [orderId]);
    return rows.length > 0; // Retourne true si la commande existe, sinon false
  } catch (error) {
    console.error("Error checking if order exists:");
    throw error;
  }
}

// Récupérer une commande par ID
async function getById(orderId) {
  try {
    const [rows] = await connPool.query(
      'SELECT id, date, delivery_address, customer_id, track_number, status FROM purchase_orders WHERE id = ?',
      [orderId]
    );
    
    if (rows.length === 0) {
      return null; // La commande n'existe pas
    }
    
    // Récupérer les détails associés à la commande
    const [details] = await connPool.query(
      'SELECT product_id AS productId, quantity, price FROM order_details WHERE order_id = ?',
      [orderId]
    );
    
    const order = rows[0]; // La commande principale
    order.details = details; // Ajoute les détails de la commande
    
    return order; // Retourne la commande avec ses détails
  } catch (error) {
    console.error("Error retrieving order by ID:");
    throw error;
  }
}

// Vérifier si un client existe
async function checkCustomerExists(customerId) {
  if (isNaN(customerId)) {
    throw new Error("Customer ID must be a number.");
  }
  try {
    const [rows] = await connPool.query('SELECT id FROM customers WHERE id = ?', [customerId]);
    return rows.length > 0; // Retourne true si le client existe, sinon false
  } catch (error) {
    console.error("Error checking customer existence:");
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

    const [result] = await connPool.query(
      'INSERT INTO purchase_orders (date, delivery_address, customer_id, track_number, status) VALUES (?, ?, ?, ?, ?)',
      [orderDate, deliveryAddress, customerId, trackNumber, status]
    );

    if (result && result.insertId) {
      return result.insertId; // Retourne l'ID de la nouvelle commande ajoutée
    } else {
      throw new Error("Failed to retrieve insertId from the database");
    }
  } catch (error) {
    console.error("Error adding purchase order:");
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
    const [result] = await connPool.query(
      'INSERT INTO order_details (quantity, price, order_id, product_id) VALUES (?, ?, ?, ?)',
      [quantity, price, orderId, productId]
    );
    return result.affectedRows;
  } catch (error) {
    console.error("Error adding product to order:");
    throw error;
  }
}

// Mettre à jour une commande
// Mettre à jour une commande
async function update(orderId, orderDate, deliveryAddress, customerId, trackNumber, status) {
  if (isNaN(new Date(orderDate).getTime())) {
    throw new Error("Invalid order date.");
  }

  if (typeof trackNumber !== 'string' || trackNumber.trim() === '') {
    throw new Error("Track number must be a non-empty string.");
  }

  // Vérifier si la commande et le client existent
  const orderExistsResult = await orderExists(orderId);
  if (!orderExistsResult) {
    throw new Error("Order not found.");
  }

  const customerExistsResult = await checkCustomerExists(customerId);
  if (!customerExistsResult) {
    console.log("Customer ID does not exist.");
  }

  try {
    // Mettre à jour les détails de la commande
    const [result] = await connPool.query(
      'UPDATE purchase_orders SET date = ?, delivery_address = ?, customer_id = ?, track_number = ?, status = ? WHERE id = ?',
      [orderDate, deliveryAddress, customerId, trackNumber, status, orderId]
    );
    return result.affectedRows; // Nombre de lignes affectées
  } catch (error) {
    // Affiche uniquement le message d'erreur sans détails de la pile
    console.error("Error updating purchase order:");
    console.log("Failed to update the order."); // Fournir un message d'erreur plus général
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
  const [order] = await connPool.query('SELECT * FROM purchase_orders WHERE id = ?', [orderId]);
  if (!order.length) {
    throw new Error("Order not found");
  }

  // Check if the product exists in the order
  const [orderDetail] = await connPool.query(
    'SELECT * FROM order_details WHERE order_id = ? AND product_id = ?',
    [orderId, productId]
  );
  
  if (!orderDetail.length) {
    throw new Error("Order detail not found");
  }

  // Update the quantity and price in the order details
  const [result] = await connPool.query(
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
    const [existingLine] = await connPool.query(
      'SELECT id FROM order_details WHERE order_id = ? AND product_id = ?',
      [orderId, productId]
    );

    if (existingLine.length > 0) {
      // Mettre à jour la ligne de commande existante
      const [result] = await connPool.query(
        'UPDATE order_details SET quantity = ?, price = ? WHERE order_id = ? AND product_id = ?',
        [quantity, price, orderId, productId]
      );
      return result.affectedRows; // Nombre de lignes affectées
    } else {
      // Ajouter une nouvelle ligne de commande
      const [result] = await connPool.query(
        'INSERT INTO order_details (quantity, price, order_id, product_id) VALUES (?, ?, ?, ?)',
        [quantity, price, orderId, productId]
      );
      return result.affectedRows; // Nombre de lignes affectées
    }
  } catch (error) {
    console.error("Error adding or updating order line:");
    throw error;
  }
}

// Vérifier si un produit existe dans une commande
async function orderDetailExists(orderId, productId) {
  try {
    const [rows] = await connPool.query(
      'SELECT * FROM order_details WHERE order_id = ? AND product_id = ?',
      [orderId, productId]
    );
    return rows.length > 0; // Retourne true si le produit existe dans la commande
  } catch (error) {
    console.error("Error checking if product exists in order:");
    throw error;
  }
}


// Récupérer toutes les commandes avec leurs détails
async function get() {
  try {
    // Récupère toutes les commandes
    const [orders] = await connPool.query(
      'SELECT id, date, delivery_address, customer_id, track_number, status FROM purchase_orders'
    );

    // Pour chaque commande, récupère les détails correspondants
    for (const order of orders) {
      const [details] = await connPool.query(
        'SELECT product_id AS productId, quantity, price FROM order_details WHERE order_id = ?',
        [order.id]
      );
      order.details = details; // Ajoute les détails dans l'objet commande
    }

    return orders; // Retourne toutes les commandes avec leurs détails
  } catch (error) {
    console.error("Error retrieving purchase orders:");
    throw error;
  }
}

// Supprimer une commande
async function destroy(orderId) {
  try {
    const [result] = await connPool.query('DELETE FROM purchase_orders WHERE id = ?', [orderId]);
    return result.affectedRows; // Nombre de lignes supprimées
  } catch (error) {
    console.error("Error deleting purchase order:" );
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
  addOrUpdateOrderLine,
  getById,
  orderDetailExists
};