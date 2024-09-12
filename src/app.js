const readlineSync = require("readline-sync");
const customerModule = require("./customerModule");
const productModule = require("./productModule");
const purchaseModule = require("./purchaseModule");
const paymentModule = require("./paymentModule");

// Main Menu
function mainMenu() {
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
function customerMenu() {
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
function productMenu() {
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
function purchaseMenu() {
  console.log("\n***** PURCHASE ORDER MANAGEMENT *****");
  console.log("1. Add a purchase order");
  console.log("2. List all purchase orders");
  console.log("3. Update purchase order information");
  console.log("4. Delete a purchase order");
  console.log("0. Return to main menu");
  const choice = readlineSync.question("Your choice: ");
  return choice;
}

// Submenu for managing payments
function paymentMenu() {
  console.log("\n***** PAYMENT MANAGEMENT *****");
  console.log("1. Add a payment");
  console.log("2. List all payments");
  console.log("3. Update payment information");
  console.log("4. Delete a payment");
  console.log("0. Return to main menu");
  const choice = readlineSync.question("Your choice: ");
  return choice;
}

// Function to handle adding a purchase order
// Functions for managing purchase orders
async function addPurchaseOrder() {
  const orderDate = readlineSync.question("Enter the order date (YYYY-MM-DD): ");
  const deliveryAddress = readlineSync.question("Enter the delivery address: ");
  const customerId = readlineSync.questionInt("Enter the customer ID: ");
  const trackNumber = readlineSync.question("Enter the track number: ");
  const orderStatus = readlineSync.question("Enter the order status: ");

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
    const quantity = readlineSync.questionInt("Enter the quantity: ");
    const price = readlineSync.questionFloat("Enter the price: ");

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
          console.error("Error saving the order:", error);
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
}

async function listAllPurchaseOrders() {
  try {
    const purchaseOrders = await purchaseModule.get(); // Récupère toutes les commandes avec leurs détails

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
        // console.log("Order Details:");
        order.details.forEach((detail) => {
          console.log(`  Product ID: ${detail.productId}`);
          console.log(`  Quantity: ${detail.quantity}`);
          console.log(`  Price: ${detail.price}`);
        });
      }
    }
  } catch (error) {
    console.error("Error retrieving purchase orders:", error);
  }
}

async function main() {
  try {
    let mainChoice = mainMenu();
    while (mainChoice !== "0") {
      switch (mainChoice) {
        // Customer Management
        case "1":
          let customerChoice = customerMenu();
          while (customerChoice !== "0") {
            switch (customerChoice) {
              case "1":
                const name = readlineSync.question("Enter the name: ");
                const address = readlineSync.question("Enter the address: ");
                const email = readlineSync.question("Enter the email: ");
                const phone = readlineSync.question("Enter the phone number: ");
                const id = await customerModule.add(name, address, email, phone);
                console.log(`Customer added with ID: ${id}`);
                break;
              case "2":
                const customers = await customerModule.get();
                console.log("List of customers:");
                console.log(customers);
                break;
              case "3":
                const updateId = readlineSync.questionInt("Enter the ID of the customer to update: ");
                const newName = readlineSync.question("Enter the new name: ");
                const newAddress = readlineSync.question("Enter the new address: ");
                const newEmail = readlineSync.question("Enter the new email: ");
                const newPhone = readlineSync.question("Enter the new phone number: ");
                const updateResult = await customerModule.update(updateId, newName, newAddress, newEmail, newPhone);
                console.log(`Number of rows updated: ${updateResult}`);
                break;
              case "4":
                const deleteId = readlineSync.questionInt("Enter the ID of the customer to delete: ");
                const deleteResult = await customerModule.destroy(deleteId);
                console.log(`Number of rows deleted: ${deleteResult}`);
                break;
              default:
                console.log("Invalid option");
                break;
            }
            customerChoice = customerMenu();
          }
          break;

        // Product Management
        case "2":
          let productChoice = productMenu();
          while (productChoice !== "0") {
            switch (productChoice) {
              case "1":
                const productName = readlineSync.question("Enter the product name: ");
                const description = readlineSync.question("Enter the description: ");
                const price = readlineSync.questionFloat("Enter the price: ");
                const stock = readlineSync.questionInt("Enter the stock quantity: ");
                const category = readlineSync.question("Enter the category: ");
                const barcode = readlineSync.question("Enter the barcode: ");
                const status = readlineSync.question("Enter the status: ");
                const productId = await productModule.add(productName, description, price, stock, category, barcode, status);
                console.log(`Product added with ID: ${productId}`);
                break;
              case "2":
                const products = await productModule.get();
                console.log("List of products:");
                console.log(products);
                break;
              case "3":
                const updateProductId = readlineSync.questionInt("Enter the ID of the product to update: ");
                const newProductName = readlineSync.question("Enter the new product name: ");
                const newDescription = readlineSync.question("Enter the new description: ");
                const newPrice = readlineSync.questionFloat("Enter the new price: ");
                const newStock = readlineSync.questionInt("Enter the new stock quantity: ");
                const newCategory = readlineSync.question("Enter the new category: ");
                const newBarcode = readlineSync.question("Enter the new barcode: ");
                const newStatus = readlineSync.question("Enter the new status: ");
                const updateProductResult = await productModule.update(updateProductId, newProductName, newDescription, newPrice, newStock, newCategory, newBarcode, newStatus);
                console.log(`Number of rows updated: ${updateProductResult}`);
                break;
              case "4":
                const deleteProductId = readlineSync.questionInt("Enter the ID of the product to delete: ");
                const deleteProductResult = await productModule.destroy(deleteProductId);
                console.log(`Number of rows deleted: ${deleteProductResult}`);
                break;
              default:
                console.log("Invalid option");
                break;
            }
            productChoice = productMenu();
          }
          break;

      
       // Purchase Order Management
case "3":
  let purchaseChoice = purchaseMenu();
  while (purchaseChoice !== "0") {
    switch (purchaseChoice) {
      case "1":
        await addPurchaseOrder();
        break;
      case "2":
        await listAllPurchaseOrders();
        break;
      case "3": // Update a purchase order
        const updateOrderId = readlineSync.questionInt("Enter the ID of the purchase order to update: ");
        
        // Retrieve the existing order details
        try {
          const existingOrder = await purchaseModule.getById(updateOrderId);
          if (!existingOrder) {
            console.log(`Purchase order with ID ${updateOrderId} not found.`);
            break;
          }
          
          console.log("Current details of the purchase order:");
          console.log(existingOrder);

          // Get the updated details from the user
          const newOrderDate = readlineSync.question(`Enter the new order date (current: ${existingOrder.orderDate}): `) || existingOrder.orderDate;
          const newDeliveryAddress = readlineSync.question(`Enter the new delivery address (current: ${existingOrder.deliveryAddress}): `) || existingOrder.deliveryAddress;
          const newTrackNumber = readlineSync.question(`Enter the new track number (current: ${existingOrder.trackNumber}): `) || existingOrder.trackNumber;
          const newOrderStatus = readlineSync.question(`Enter the new order status (current: ${existingOrder.status}): `) || existingOrder.status;

          // Update the purchase order in the database
          await purchaseModule.update(updateOrderId, newOrderDate, newDeliveryAddress, newTrackNumber, newOrderStatus);
          console.log("Purchase order updated successfully.");
          
        } catch (error) {
          console.error("Error updating purchase order:", error);
        }
        break;
      
      case "4": // Delete a purchase order
        const deleteOrderId = readlineSync.questionInt("Enter the ID of the purchase order to delete: ");
        
        // Confirm deletion
        const confirmDeletion = readlineSync.keyInYNStrict(`Are you sure you want to delete purchase order with ID ${deleteOrderId}?`);
        if (confirmDeletion) {
          try {
            const deleteResult = await purchaseModule.destroy(deleteOrderId);
            if (deleteResult > 0) {
              console.log(`Purchase order with ID ${deleteOrderId} has been deleted.`);
            } else {
              console.log(`Purchase order with ID ${deleteOrderId} not found.`);
            }
          } catch (error) {
            console.error("Error deleting purchase order:", error);
          }
        } else {
          console.log("Deletion cancelled.");
        }
        break;
      
      default:
        console.log("Invalid option");
        break;
    }
    purchaseChoice = purchaseMenu();
  }
  break;

        // Payment Management
        case "4":
          let paymentChoice = paymentMenu();
          while (paymentChoice !== "0") {
            switch (paymentChoice) {
              case "1":
                const paymentDate = readlineSync.question("Enter the payment date (YYYY-MM-DD): ");
                const amount = readlineSync.questionFloat("Enter the amount: ");
                const paymentMethod = readlineSync.question("Enter the payment method: ");
                const paymentOrderId = readlineSync.questionInt("Enter the order ID: ");
                const paymentId = await paymentModule.add(paymentDate, amount, paymentMethod, paymentOrderId);
                console.log(`Payment added with ID: ${paymentId}`);
                break;
              case "2":
                const payments = await paymentModule.get();
                console.log("List of payments:");
                console.log(payments);
                break;
              case "3":
                const updatePaymentId = readlineSync.questionInt("Enter the ID of the payment to update: ");
                const newPaymentDate = readlineSync.question("Enter the new payment date (YYYY-MM-DD): ");
                const newAmount = readlineSync.questionFloat("Enter the new amount: ");
                const newPaymentMethod = readlineSync.question("Enter the new payment method: ");
                const newOrderId = readlineSync.questionInt("Enter the new order ID: ");
                const updatePaymentResult = await paymentModule.update(updatePaymentId, newPaymentDate, newAmount, newPaymentMethod, newOrderId);
                console.log(`Number of rows updated: ${updatePaymentResult}`);
                break;
              case "4":
                const deletePaymentId = readlineSync.questionInt("Enter the ID of the payment to delete: ");
                const deletePaymentResult = await paymentModule.destroy(deletePaymentId);
                console.log(`Number of rows deleted: ${deletePaymentResult}`);
                break;
              default:
                console.log("Invalid option");
                break;
            }
            paymentChoice = paymentMenu();
          }
          break;

        default:
          console.log("Invalid option");
          break;
      }
      mainChoice = mainMenu();
    }
    console.log("Exiting application...");
    process.exit();
  } catch (error) {
    console.error("Error:", error);
  }
}

// Run the main function
main();
