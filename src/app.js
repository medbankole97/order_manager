const customerModule = require("./customerModule");
const productModule = require("./productModule");
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
