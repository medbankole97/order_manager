const readlineSync = require("readline-sync");
const customerModule = require("./customerModule");
const productModule = require("./productModule");
const purchaseModule = require("./purchaseModule");
const paymentModule = require("./paymentModule");

// Main Menu
async function mainMenu() {
  console.log("\n***** MAIN MENU *****");
  console.log("1. Manage Customers");
  console.log("2. Manage Products");
  console.log("3. Manage Purchase Orders");
  console.log("4. Manage Payments");
  console.log("0. Exit");
  const choice = readlineSync.question("Your choice: ");
  return choice;
}

// Submenu for managing customers
async function customerMenu() {
  console.log("\n***** CUSTOMER MANAGEMENT *****");
  console.log("1. Add a customer");
  console.log("2. List all customers");
  console.log("3. Update customer information");
  console.log("4. Delete a customer");
  console.log("0. Return to main menu");
  const choice = readlineSync.question("Your choice: ");
  return choice;
}

// Submenu for managing products
async function productMenu() {
  console.log("\n***** PRODUCT MANAGEMENT *****");
  console.log("1. Add a product");
  console.log("2. List all products");
  console.log("3. Update product information");
  console.log("4. Delete a product");
  console.log("0. Return to main menu");
  const choice = readlineSync.question("Your choice: ");
  return choice;
}

// Submenu for managing purchase orders
async function purchaseMenu() {
  console.log("\n***** ORDER MANAGEMENT *****");
  console.log("1. Add a new order");
  console.log("2. List all orders");
  console.log("3. Edit an order");
  console.log("4. Edit order details");
  console.log("5. Delete an order");
  console.log("0. Return to the main menu");
  const choice = readlineSync.question("Your choice: ");
  return choice;
}

// Submenu for managing payments
async function paymentMenu() {
  console.log("\n***** PAYMENT MANAGEMENT *****");
  console.log("1. Add a payment");
  console.log("2. List all payments");
  console.log("3. Update payment information");
  console.log("4. Delete a payment");
  console.log("0. Return to main menu");
  const choice = readlineSync.question("Your choice: ");
  return choice;
}

// Fonction pour vérifier si une date est valide
function isValidDate(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) {
    return false;
  }

  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

// Fonction pour obtenir une date valide de l'utilisateur
function getValidDate(prompt) {
  let dateString = readlineSync.question(prompt);
  while (!isValidDate(dateString)) {
    console.log("\nPlease enter a valid date in the format YYYY-MM-DD.");
    dateString = readlineSync.question(prompt);
  }
  return dateString;
}

// Fonction pour ajouter une commande d'achat
async function addPurchaseOrder() {
  try {
    let orderDate = getValidDate("Enter the order date (YYYY-MM-DD): ");

    let deliveryAddress = readlineSync.question("Enter the delivery address: ");
    while (!deliveryAddress) {
      console.log("\nPlease enter the delivery address.");
      deliveryAddress = readlineSync.question("Enter the delivery address: ");
    }

    const customerId = readlineSync.questionInt("Enter the customer ID: ");
    while (isNaN(customerId) || customerId <= 0) {
      console.log("\nPlease enter a valid customer ID.");
      customerId = readlineSync.questionInt("Enter the customer ID: ");
    }

    const trackNumber = readlineSync.question("Enter the track number: ");
    while (!trackNumber) {
      console.log("\nPlease enter the track number.");
      trackNumber = readlineSync.question("Enter the track number: ");
    }

    const orderStatus = readlineSync.question("Enter the order status: ");
    while (!orderStatus) {
      console.log("\nPlease enter the order status.");
      orderStatus = readlineSync.question("Enter the order status: ");
    }

    const orderDetails = {
      orderDate,
      deliveryAddress,
      customerId,
      trackNumber,
      orderStatus,
      products: []
    };

    let addMoreProducts = true;

    while (addMoreProducts) {
      const productId = readlineSync.questionInt("Enter the product ID: ");
      while (isNaN(productId) || productId <= 0) {
        console.log("\nPlease enter a valid product ID.");
        productId = readlineSync.questionInt("Enter the product ID: ");
      }

      const quantity = readlineSync.questionInt("Enter the quantity: ");
      while (isNaN(quantity) || quantity <= 0) {
        console.log("\nPlease enter a valid quantity.");
        quantity = readlineSync.questionInt("Enter the quantity: ");
      }

      const price = readlineSync.questionFloat("Enter the price: ");
      while (isNaN(price) || price <= 0) {
        console.log("\nPlease enter a valid price.");
        price = readlineSync.questionFloat("Enter the price: ");
      }

      orderDetails.products.push({ productId, quantity, price });

      const action = readlineSync.keyInSelect(
        ["Add Another Product", "Save and Exit", "Quit Without Saving"], 
        "Choose an action: "
      );

      if (action === 0) {
        console.log("Add another product...");
      } else if (action === 1) {
        console.log("Review of the order details...");
        console.log(orderDetails);

        const confirmation = readlineSync.keyInYNStrict("Confirm the recording of this order?");
        if (confirmation) {
          try {
            const orderId = await purchaseModule.add(
              orderDetails.orderDate, 
              orderDetails.deliveryAddress, 
              orderDetails.customerId, 
              orderDetails.trackNumber, 
              orderDetails.orderStatus
            );

            for (const product of orderDetails.products) {
              await purchaseModule.addProductToOrder(orderId, product.productId, product.quantity, product.price);
            }

            console.log(`Order saved with ID: ${orderId}`);

          } catch (error) {
            console.error("Error saving the order:");
          }
        } else {
          console.log("Order not saved.");
        }
        addMoreProducts = false;
      } else {
        console.log("Order not saved.");
        addMoreProducts = false;
      }
    }
  } catch (error) {
    console.error("An unexpected error occurred:");
  }
}
async function modifyOrderDetails() {
  try {
    const orderId = readlineSync.questionInt("Enter the ID of the order to modify: ");
    const productId = readlineSync.questionInt("Enter the product ID to modify in the order: ");
    const newQuantity = readlineSync.questionInt("Enter the new quantity: ");
    const newPrice = readlineSync.questionFloat("Enter the new price: ");
    
    const updatedRows = await purchaseModule.updateOrderDetail(orderId, productId, newQuantity, newPrice);
    if (updatedRows > 0) {
      console.log("Order details successfully updated!");
    } else {
      console.log("No changes made to the order details.");
    }
  } catch (error) {
    console.error("Error updating the order details:");
  }
}

// Function to list all purchase orders
async function listAllPurchaseOrders() {
  try {
    const purchaseOrders = await purchaseModule.get(); // Get all purchase orders with details

    if (purchaseOrders.length === 0) {
      console.log("No purchase orders found.");
      return;
    }

    for (const order of purchaseOrders) {
      console.log(`\nOrder ID: ${order.id}`);
      console.log(`Order Date: ${order.date}`);
      console.log(`Delivery Address: ${order.delivery_address}`);
      console.log(`Customer ID: ${order.customer_id}`);
      console.log(`Tracking Number: ${order.track_number}`);
      console.log(`Order Status: ${order.status}`);

      if (!order.details || order.details.length === 0) {
        console.log("No products in this order.");
      } else {
        console.log("\n>>> Order Details:");
        order.details.forEach((detail) => {
          console.log(`  Product ID: ${detail.productId}`);
          console.log(`  Quantity: ${detail.quantity}`);
          console.log(`  Price: ${detail.price}`);
        });
      }
    }
  } catch (error) {
    console.error("Error retrieving purchase orders:");
  }
}
// modifier les commandes

async function modifyOrder() {
  try {
    // Demande à l'utilisateur l'ID de la commande à modifier
    const orderId = readlineSync.questionInt("Enter the ID of the order to modify: ");
    
    // Vérifie si la commande existe dans la base de données
    const orderExists = await purchaseModule.getById(orderId); // Assurez-vous que cette méthode existe dans votre module
    if (!orderExists) {
      console.log(`Order with ID: ${orderId} does not exist.`);
      return; // Arrête la fonction si l'ID de commande n'existe pas
    }

    // Si la commande existe, demande les nouvelles informations
    let newOrderDate = getValidDate("Enter the new order date (YYYY-MM-DD): ");
    let newDeliveryAddress = readlineSync.question("Enter the new delivery address: ");
    while (!newDeliveryAddress) {
      console.log("\nPlease enter the delivery address.");
      newDeliveryAddress = readlineSync.question("Enter the new delivery address: ");
    }

    let newCustomerId = readlineSync.questionInt("Enter the new customer ID: ");
    while (isNaN(newCustomerId) || newCustomerId <= 0) {
      console.log("\nPlease enter a valid customer ID.");
      newCustomerId = readlineSync.questionInt("Enter the new customer ID: ");
    }

    let newTrackNumber = readlineSync.question("Enter the new tracking number: ");
    while (!newTrackNumber) {
      console.log("\nPlease enter the tracking number.");
      newTrackNumber = readlineSync.question("Enter the new tracking number: ");
    }

    let newOrderStatus = readlineSync.question("Enter the new order status: ");
    while (!newOrderStatus) {
      console.log("\nPlease enter the order status.");
      newOrderStatus = readlineSync.question("Enter the new order status: ");
    }

    // Confirmation des nouvelles informations
    console.log("\nReview of the new order details...");
    console.log({
      orderId,
      newOrderDate,
      newDeliveryAddress,
      newCustomerId,
      newTrackNumber,
      newOrderStatus
    });

    const confirmation = readlineSync.keyInYNStrict("Confirm the update of this order?");
    if (confirmation) {
      try {
        // Mise à jour de la commande via le module
        const modifyOrderResult = await purchaseModule.update(
          orderId, newOrderDate, newDeliveryAddress, newCustomerId, newTrackNumber, newOrderStatus
        );
        
        console.log(`Number of rows updated: ${modifyOrderResult}`);
      } catch (error) {
        console.error("Error updating the order:");
        console.error(error);
      }
    } else {
      console.log("Order update canceled.");
    }
  } catch (error) {
    console.error("An unexpected error occurred:");
    console.error(error);
  }
}


// Fonction pour vérifier si une date est valide
function isValidDate(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) {
    return false;
  }

  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

// Fonction pour obtenir une date valide de l'utilisateur
function getValidDate(prompt) {
  let dateString = readlineSync.question(prompt);
  while (!isValidDate(dateString)) {
    console.log("\nPlease enter a valid date in the format YYYY-MM-DD.");
    dateString = readlineSync.question(prompt);
  }
  return dateString;
}

// Fonction pour ajouter un paiement
async function addPayment() {
  try {
    let paymentDate = getValidDate("Enter the payment date (YYYY-MM-DD): ");

    const amount = readlineSync.questionFloat("Enter the payment amount: ");
    while (isNaN(amount) || amount <= 0) {
      console.log("\nPlease enter a valid payment amount.");
      amount = readlineSync.questionFloat("Enter the payment amount: ");
    }

    let paymentMethod = readlineSync.question("Enter the payment method: ");
    while (!paymentMethod) {
      console.log("\nPlease enter the payment method.");
      paymentMethod = readlineSync.question("Enter the payment method: ");
    }

    const orderId = readlineSync.questionInt("Enter the associated order ID: ");
    while (isNaN(orderId) || orderId <= 0) {
      console.log("\nPlease enter a valid order ID.");
      orderId = readlineSync.questionInt("Enter the associated order ID: ");
    }

    const id = await paymentModule.add(paymentDate, amount, paymentMethod, orderId);
    console.log(`Payment added with ID: ${id}`);
  } catch (error) {
    console.error("Error adding payment:", error.message);
  }
}
// Function to list all payments
async function listAllPayments() {
  try {
    const payments = await paymentModule.get();
    if (payments.length === 0) {
      console.log("No payments found.");
    } else {
      console.log("List of payments:");
      console.table(payments);
    }
  } catch (error) {
    console.error("Error retrieving payments:", error.message);
  }
}

// Fonction pour mettre à jour un paiement
async function updatePayment() {
  try {
    const id = readlineSync.questionInt("Enter the ID of the payment to update: ");
    const exists = await paymentModule.exists(id);
    if (!exists) {
      console.log(`Payment with ID ${id} does not exist.`);
      return;
    }

    let paymentDate = getValidDate("Enter the new payment date (YYYY-MM-DD): ");

    const amount = readlineSync.questionFloat("Enter the new payment amount: ");
    while (isNaN(amount) || amount <= 0) {
      console.log("\nPlease enter a valid payment amount.");
      amount = readlineSync.questionFloat("Enter the new payment amount: ");
    }

    let paymentMethod = readlineSync.question("Enter the new payment method: ");
    while (!paymentMethod) {
      console.log("\nPlease enter the payment method.");
      paymentMethod = readlineSync.question("Enter the new payment method: ");
    }

    const orderId = readlineSync.questionInt("Enter the new associated order ID: ");
    while (isNaN(orderId) || orderId <= 0) {
      console.log("\nPlease enter a valid order ID.");
      orderId = readlineSync.questionInt("Enter the new associated order ID: ");
    }

    await paymentModule.update(id, paymentDate, amount, paymentMethod, orderId);
    console.log("Payment information updated successfully.");
  } catch (error) {
    console.error("Error updating payment information:", error.message);
  }
}


// Function to delete a payment
async function deletePayment() {
  try {
    const id = readlineSync.questionInt("Enter the ID of the payment to delete: ");
    const exists = await paymentModule.exists(id);
    if (!exists) {
      console.log(`Payment with ID ${id} does not exist.`);
      return;
    }

    const confirmation = readlineSync.keyInYNStrict("Are you sure you want to delete this payment?");
    if (confirmation) {
      await paymentModule.remove(id);
      console.log("Payment deleted successfully.");
    } else {
      console.log("Payment deletion canceled.");
    }
  } catch (error) {
    console.error("Error deleting payment:", error.message);
  }
}

// Function to add a customer
async function addCustomer() {
  try {
    let name = readlineSync.question("Enter the customer's name: ");
    while (!name) {
      console.log("\nPlease enter the customer's name.");
      name = readlineSync.question("Enter the customer's name: ");
    }

    let address = readlineSync.question("Enter the customer's address: ");
    while (!address) {
      console.log("\nPlease enter the customer's address.");
      address = readlineSync.question("Enter the customer's address: ");
    }

    let email = readlineSync.questionEMail("Enter the customer's email: ");
    while (!email) {
      console.log("\nPlease enter a valid email address.");
      email = readlineSync.questionEMail("Enter the customer's email: ");
    }

    let phone = readlineSync.question("Enter the customer's phone number: ");
    while (!phone) {
      console.log("\nPlease enter the customer's phone number.");
      phone = readlineSync.question("Enter the customer's phone number: ");
    }

    // Pass address along with other parameters
    const id = await customerModule.add(name, address, email, phone);
    console.log(`Customer added with ID: ${id}`);
  } catch (error) {
    console.error("Error adding customer:", error.message);
  }
}

// Function to list all customers
async function listAllCustomers() {
  try {
    const customers = await customerModule.get();
    if (customers.length === 0) {
      console.log("No customers found.");
    } else {
      console.log("List of customers:");
      console.table(customers);
    }
  } catch (error) {
    console.error("Error retrieving customers:", error.message);
  }
}

// Function to update customer information
async function updateCustomer() {
  try {
    const id = readlineSync.questionInt("Enter the ID of the customer to update: ");
    const exists = await customerModule.exists(id);
    if (!exists) {
      console.log(`Customer with ID ${id} does not exist.`);
      return;
    }

    let name = readlineSync.question("Enter the new name: ");
    while (!name) {
      console.log("\nPlease enter the new name.");
      name = readlineSync.question("Enter the new name: ");
    }

    let address = readlineSync.question("Enter the new address: ");
    while (!address) {
      console.log("\nPlease enter the new address.");
      address = readlineSync.question("Enter the new address: ");
    }

    let email = readlineSync.questionEMail("Enter the new email: ");
    while (!email) {
      console.log("\nPlease enter a valid email address.");
      email = readlineSync.questionEMail("Enter the new email: ");
    }

    let phone = readlineSync.question("Enter the new phone number: ");
    while (!phone) {
      console.log("\nPlease enter the new phone number.");
      phone = readlineSync.question("Enter the new phone number: ");
    }

    // Pass address in the update function
    await customerModule.update(id, name, address, email, phone);
    console.log("Customer information updated successfully.");
  } catch (error) {
    console.error("Error updating customer information:", error.message);
  }
}

// Function to delete a customer
async function deleteCustomer() {
  try {
    const id = readlineSync.questionInt("Enter the ID of the customer to delete: ");
    const exists = await customerModule.exists(id);
    if (!exists) {
      console.log(`Customer with ID ${id} does not exist.`);
      return;
    }

    const confirmation = readlineSync.keyInYNStrict("Are you sure you want to delete this customer?");
    if (confirmation) {
      await customerModule.destroy(id);
      console.log("Customer deleted successfully.");
    } else {
      console.log("Customer deletion canceled.");
    }
  } catch (error) {
    console.error("Error deleting customer:", error.message);
  }
}

// Function to add a product
// Function to add a product
async function addProduct() {
  try {
    let name = readlineSync.question("Enter the product name: ");
    while (!name) {
      console.log("\nPlease enter the product name.");
      name = readlineSync.question("Enter the product name: ");
    }

    let description = readlineSync.question("Enter the product description: ");
    while (!description) {
      console.log("\nPlease enter the product description.");
      description = readlineSync.question("Enter the product description: ");
    }

    let price = readlineSync.questionFloat("Enter the product price: ");
    while (isNaN(price) || price <= 0) {
      console.log("\nPlease enter a valid product price.");
      price = readlineSync.questionFloat("Enter the product price: ");
    }

    let stock = readlineSync.questionInt("Enter the product stock: ");
    while (isNaN(stock) || stock < 0) {
      console.log("\nPlease enter a valid stock amount.");
      stock = readlineSync.questionInt("Enter the product stock: ");
    }

    let category = readlineSync.question("Enter the product category: ");
    while (!category) {
      console.log("\nPlease enter the product category.");
      category = readlineSync.question("Enter the product category: ");
    }

    let barcode = readlineSync.question("Enter the product barcode: ");
    while (!barcode) {
      console.log("\nPlease enter the product barcode.");
      barcode = readlineSync.question("Enter the product barcode: ");
    }

    let status = readlineSync.question("Enter the product status: ");
    while (!status) {
      console.log("\nPlease enter the product status.");
      status = readlineSync.question("Enter the product status: ");
    }

    const id = await productModule.add(name, description, price, stock, category, barcode, status);
    console.log(`Product added with ID: ${id}`);
  } catch (error) {
    console.error("Error adding product:", error.message);
  }
}

// Function to list all products
async function listAllProducts() {
  try {
    const products = await productModule.get();
    if (products.length === 0) {
      console.log("No products found.");
    } else {
      console.log("List of products:");
      console.table(products);
    }
  } catch (error) {
    console.error("Error retrieving products:", error.message);
  }
}

// Function to update product information
async function updateProduct() {
  try {
    const id = readlineSync.questionInt("Enter the ID of the product to update: ");
    const exists = await productModule.exists(id);
    if (!exists) {
      console.log(`Product with ID ${id} does not exist.`);
      return;
    }

    let name = readlineSync.question("Enter the new name: ");
    while (!name) {
      console.log("\nPlease enter the new name.");
      name = readlineSync.question("Enter the new name: ");
    }

    let description = readlineSync.question("Enter the new description: ");
    while (!description) {
      console.log("\nPlease enter the new description.");
      description = readlineSync.question("Enter the new description: ");
    }

    let price = readlineSync.questionFloat("Enter the new price: ");
    while (isNaN(price) || price <= 0) {
      console.log("\nPlease enter a valid new price.");
      price = readlineSync.questionFloat("Enter the new price: ");
    }

    let stock = readlineSync.questionInt("Enter the new stock amount: ");
    while (isNaN(stock) || stock < 0) {
      console.log("\nPlease enter a valid new stock amount.");
      stock = readlineSync.questionInt("Enter the new stock amount: ");
    }

    let category = readlineSync.question("Enter the new category: ");
    while (!category) {
      console.log("\nPlease enter the new category.");
      category = readlineSync.question("Enter the new category: ");
    }

    let barcode = readlineSync.question("Enter the new barcode: ");
    while (!barcode) {
      console.log("\nPlease enter the new barcode.");
      barcode = readlineSync.question("Enter the new barcode: ");
    }

    let status = readlineSync.question("Enter the new status: ");
    while (!status) {
      console.log("\nPlease enter the new status.");
      status = readlineSync.question("Enter the new status: ");
    }

    await productModule.update(id, name, description, price, stock, category, barcode, status);
    console.log("Product information updated successfully.");
  } catch (error) {
    console.error("Error updating product information:", error.message);
  }
}
// Function to delete a product
async function deleteProduct() {
  try {
    const id = readlineSync.questionInt("Enter the ID of the product to delete: ");
    const exists = await productModule.exists(id);
    if (!exists) {
      console.log(`Product with ID ${id} does not exist.`);
      return;
    }

    const confirmation = readlineSync.keyInYNStrict("Are you sure you want to delete this product?");
    if (confirmation) {
      await productModule.remove(id);
      console.log("Product deleted successfully.");
    } else {
      console.log("Product deletion canceled.");
    }
  } catch (error) {
    console.error("Error deleting product:", error.message);
  }
}

// Main function to handle menu and user input
async function main() {
  let choice;
  do {
    choice = await mainMenu();
    switch (choice) {
      case "1":
        let customerChoice;
        do {
          customerChoice = await customerMenu();
          switch (customerChoice) {
            case "1":
              await addCustomer();
              break;
            case "2":
              await listAllCustomers();
              break;
            case "3":
              await updateCustomer();
              break;
            case "4":
              await deleteCustomer();
              break;
            case "0":
              console.log("Returning to main menu...");
              break;
            default:
              console.log("Invalid choice, please try again.");
          }
        } while (customerChoice !== "0");
        break;

      case "2":
        let productChoice;
        do {
          productChoice = await productMenu();
          switch (productChoice) {
            case "1":
              await addProduct();
              break;
            case "2":
              await listAllProducts();
              break;
            case "3":
              await updateProduct();
              break;
            case "4":
              await deleteProduct();
              break;
            case "0":
              console.log("Returning to main menu...");
              break;
            default:
              console.log("Invalid choice, please try again.");
          }
        } while (productChoice !== "0");
        break;

       // Purchase Order Management
       case "3":
        let purchaseChoice = await purchaseMenu();
        while (purchaseChoice !== "0") {
          try {
            switch (purchaseChoice) {
              case "1":
                await addPurchaseOrder();
                break;
              case "2":
                await listAllPurchaseOrders();
                break;
                case "3":
                  await modifyOrder();
                  break;
              case "4":
                await modifyOrderDetails();
                break;
              case "5":
                const deleteOrderId = readlineSync.questionInt("Enter the ID of the order to delete: ");
                const deleteOrderResult = await purchaseModule.destroy(deleteOrderId);
                console.log(`Number of rows deleted: ${deleteOrderResult}`);
                break;
              default:
                console.log("Invalid option");
                break;
            }
          } catch (error) {
            console.error("An unexpected error occurred:");
          }
          purchaseChoice = await purchaseMenu();
        }
        break;

      case "4":
        let paymentChoice;
        do {
          paymentChoice = await paymentMenu();
          switch (paymentChoice) {
            case "1":
              await addPayment();
              break;
            case "2":
              await listAllPayments();
              break;
            case "3":
              await updatePayment();
              break;
            case "4":
              await deletePayment();
              break;
            case "0":
              console.log("Returning to main menu...");
              break;
            default:
              console.log("Invalid choice, please try again.");
          }
        } while (paymentChoice !== "0");
        break;

      case "0":
        console.log("Exiting the application...");
        break;

      default:
        console.log("Invalid choice, please try again.");
    }
  } while (choice !== "0");
}

// Execute the main function
main();
