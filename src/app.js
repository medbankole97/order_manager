const customerModule = require("./customerModule");
const productModule = require("./productModule");
const purchaseModule = require("./purchaseModule");
const paymentModule = require("./paymentModule");
const readlineSync = require("readline-sync");

function menu() {
  console.log("\n1 Add a customer");
  console.log("2 List all customers");
  console.log("3 Update customer information");
  console.log("4 Delete a customer");
  console.log("5 Add a product");
  console.log("6 List all products");
  console.log("7 Update product information");
  console.log("8 Delete a product");
  console.log("9 Add a purchase order");
  console.log("10 List all purchase orders");
  console.log("11 Update purchase order information");
  console.log("12 Delete a purchase order");
  console.log("13 Add a payment");
  console.log("14 List all payments");
  console.log("15 Update payment information");
  console.log("16 Delete a payment");
  console.log("0 Quit");
  const choice = readlineSync.question("Your choice: ");
  return choice;
}

async function main() {
  try {
    let choice = menu();
    while (choice !== "0") {
      switch (choice) {
        // Gestion des clients
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

        // Gestion des produits
        case "5":
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

        case "6":
          const products = await productModule.get();
          console.log("List of products:");
          console.log(products);
          break;

        case "7":
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

        case "8":
          const deleteProductId = readlineSync.questionInt("Enter the ID of the product to delete: ");
          const deleteProductResult = await productModule.destroy(deleteProductId);
          console.log(`Number of rows deleted: ${deleteProductResult}`);
          break;

        // Gestion des commandes (Purchase Orders)
        case "9":
          const orderDate = readlineSync.question("Enter the order date (YYYY-MM-DD): ");
          const deliveryAddress = readlineSync.question("Enter the delivery address: ");
          const customerId = readlineSync.questionInt("Enter the customer ID: ");
          const trackNumber = readlineSync.question("Enter the track number: ");
          const orderStatus = readlineSync.question("Enter the order status: ");
          const orderId = await purchaseModule.add(orderDate, deliveryAddress, customerId, trackNumber, orderStatus);
          console.log(`Purchase order added with ID: ${orderId}`);
          break;

        case "10":
          const orders = await purchaseModule.get();
          console.log("List of purchase orders:");
          console.log(orders);
          break;

        case "11":
          const updateOrderId = readlineSync.questionInt("Enter the ID of the purchase order to update: ");
          const newOrderDate = readlineSync.question("Enter the new order date (YYYY-MM-DD): ");
          const newDeliveryAddress = readlineSync.question("Enter the new delivery address: ");
          const newCustomerId = readlineSync.questionInt("Enter the new customer ID: ");
          const newTrackNumber = readlineSync.question("Enter the new track number: ");
          const newOrderStatus = readlineSync.question("Enter the new order status: ");
          const updateOrderResult = await purchaseModule.update(updateOrderId, newOrderDate, newDeliveryAddress, newCustomerId, newTrackNumber, newOrderStatus);
          console.log(`Number of rows updated: ${updateOrderResult}`);
          break;

        case "12":
          const deleteOrderId = readlineSync.questionInt("Enter the ID of the purchase order to delete: ");
          const deleteOrderResult = await purchaseModule.destroy(deleteOrderId);
          console.log(`Number of rows deleted: ${deleteOrderResult}`);
          break;

        // Gestion des paiements (Payments)
        case "13":
          const paymentDate = readlineSync.question("Enter the payment date (YYYY-MM-DD): ");
          const amount = readlineSync.questionFloat("Enter the amount: ");
          const paymentMethod = readlineSync.question("Enter the payment method: ");
          const paymentOrderId = readlineSync.questionInt("Enter the order ID: ");
          const paymentId = await paymentModule.add(paymentDate, amount, paymentMethod, paymentOrderId);
          console.log(`Payment added with ID: ${paymentId}`);
          break;

        case "14":
          const payments = await paymentModule.get();
          console.log("List of payments:");
          console.log(payments);
          break;

        case "15":
          const updatePaymentId = readlineSync.questionInt("Enter the ID of the payment to update: ");
          const newPaymentDate = readlineSync.question("Enter the new payment date (YYYY-MM-DD): ");
          const newAmount = readlineSync.questionFloat("Enter the new amount: ");
          const newPaymentMethod = readlineSync.question("Enter the new payment method: ");
          const newOrderId = readlineSync.questionInt("Enter the new order ID: ");
          const updatePaymentResult = await paymentModule.update(updatePaymentId, newPaymentDate, newAmount, newPaymentMethod, newOrderId);
          console.log(`Number of rows updated: ${updatePaymentResult}`);
          break;

        case "16":
          const deletePaymentId = readlineSync.questionInt("Enter the ID of the payment to delete: ");
          const deletePaymentResult = await paymentModule.destroy(deletePaymentId);
          console.log(`Number of rows deleted: ${deletePaymentResult}`);
          break;

        default:
          console.log("This option is invalid");
          break;
      }
      choice = menu();
    }
   
    
    console.log("Exiting...");
  } catch (e) {
    console.log("Error: ", e.message);
  }
}

main();
