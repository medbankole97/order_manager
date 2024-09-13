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

// Function to handle adding a purchase order
async function addPurchaseOrder() {
  try {
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
  } catch (error) {
    console.error("An unexpected error occurred:", error.message);
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
    console.error("Error updating the order details:", error.message);
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
    console.error("Error retrieving purchase orders:", error);
  }
}

// Function to handle adding a payment
async function addPayment() {
  try {
    const paymentDate = readlineSync.question("Enter the payment date (YYYY-MM-DD): ");
    const amount = readlineSync.questionFloat("Enter the payment amount: ");
    const paymentMethod = readlineSync.question("Enter the payment method: ");
    const orderId = readlineSync.questionInt("Enter the order ID: ");

    const paymentId = await paymentModule.add(paymentDate, amount, paymentMethod, orderId);
    console.log(`Payment added with ID: ${paymentId}`);
  } catch (error) {
    console.error("An unexpected error occurred:", error.message);
  }
}

// Function to list all payments
async function listAllPayments() {
  try {
    const payments = await paymentModule.get();
    console.log("List of payments:");
    console.log(payments);
  } catch (error) {
    console.error("Error retrieving payments:", error);
  }
}

// Function to update payment information
async function updatePayment() {
  try {
    const paymentId = readlineSync.questionInt("Enter the ID of the payment to update: ");
    const newAmount = readlineSync.questionFloat("Enter the new amount: ");
    const newDate = readlineSync.question("Enter the new payment date (YYYY-MM-DD): ");
    const updateResult = await paymentModule.update(paymentId, newAmount, newDate);
    console.log(`Number of rows updated: ${updateResult}`);
  } catch (error) {
    console.error("Error updating the payment information:", error.message);
  }
}

// Function to delete a payment
async function deletePayment() {
  try {
    const paymentId = readlineSync.questionInt("Enter the ID of the payment to delete: ");
    const deleteResult = await paymentModule.destroy(paymentId);
    console.log(`Number of rows deleted: ${deleteResult}`);
  } catch (error) {
    console.error("Error deleting the payment:", error.message);
  }
}

// Main function
async function main() {
  try {
    let mainChoice = await mainMenu();
    while (mainChoice !== "0") {
      switch (mainChoice) {
        // Customer Management
        case "1":
          let customerChoice = await customerMenu();
          while (customerChoice !== "0") {
            try {
              switch (customerChoice) {
                case "1":
                  try {
                    const name = readlineSync.question("Enter the name: ");
                    const address = readlineSync.question("Enter the address: ");
                    const email = readlineSync.question("Enter the email: ");
                    const phone = readlineSync.question("Enter the phone number: ");
                    const id = await customerModule.add(name, address, email, phone);
                    console.log(`Customer added with ID: ${id}`);
                  } catch (error) {
                    console.error("An unexpected error occurred:", error.message);
                  }
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
            } catch (error) {
              console.error("An unexpected error occurred:", error.message);
            }
            customerChoice = await customerMenu();
          }
          break;

        // Product Management
        case "2":
          let productChoice = await productMenu();
          while (productChoice !== "0") {
            try {
              switch (productChoice) {
                case "1":
                  try {
                    const name = readlineSync.question("Enter the product name: ");
                    const price = readlineSync.questionFloat("Enter the price: ");
                    const id = await productModule.add(name, price);
                    console.log(`Product added with ID: ${id}`);
                  } catch (error) {
                    console.error("An unexpected error occurred:", error.message);
                  }
                  break;
                case "2":
                  const products = await productModule.get();
                  console.log("List of products:");
                  console.log(products);
                  break;
                case "3":
                  const updateId = readlineSync.questionInt("Enter the ID of the product to update: ");
                  const newName = readlineSync.question("Enter the new name: ");
                  const newPrice = readlineSync.questionFloat("Enter the new price: ");
                  const updateResult = await productModule.update(updateId, newName, newPrice);
                  console.log(`Number of rows updated: ${updateResult}`);
                  break;
                case "4":
                  const deleteId = readlineSync.questionInt("Enter the ID of the product to delete: ");
                  const deleteResult = await productModule.destroy(deleteId);
                  console.log(`Number of rows deleted: ${deleteResult}`);
                  break;
                default:
                  console.log("Invalid option");
                  break;
              }
            } catch (error) {
              console.error("An unexpected error occurred:", error.message);
            }
            productChoice = await productMenu();
          }
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
                  const modifyOrderId = readlineSync.questionInt("Enter the ID of the order to modify: ");
                  const newDeliveryAddress = readlineSync.question("Enter the new delivery address: ");
                  const newOrderStatus = readlineSync.question("Enter the new order status: ");
                  const modifyOrderResult = await purchaseModule.update(modifyOrderId, newDeliveryAddress, newOrderStatus);
                  console.log(`Number of rows updated: ${modifyOrderResult}`);
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
              console.error("An unexpected error occurred:", error.message);
            }
            purchaseChoice = await purchaseMenu();
          }
          break;

        // Payment Management
        case "4":
          let paymentChoice = await paymentMenu();
          while (paymentChoice !== "0") {
            try {
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
                default:
                  console.log("Invalid option");
                  break;
              }
            } catch (error) {
              console.error("An unexpected error occurred:", error.message);
            }
            paymentChoice = await paymentMenu();
          }
          break;

        default:
          console.log("Invalid choice. Please select a valid option.");
          break;
      }
      mainChoice = await mainMenu();
    }
    console.log("Exiting the application...");
  } catch (error) {
    console.error("An unexpected error occurred in the main function:", error.message);
  }
}

main();
