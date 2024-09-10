# Database_Crud

## Description du Projet

Ce projet est une application Node.js simple pour gérer des clients des produits, les commandes et les payemnets dans une base de données MySQL. Il offre des fonctionnalités pour ajouter, lister, mettre à jour et supprimer . L'application utilise `readline-sync` pour interagir avec l'utilisateur via la ligne de commande.



### Prérequis

- [Node.js](https://nodejs.org/) (version 14 ou supérieure)
- [MySQL](https://www.mysql.com/) (version 5.7 ou supérieure)

### Installation
 Suivez ces étapes pour configurer le projet sur votre machine locale :

1. **Clonez le dépôt du projet :**
   ```bash
   git clone https://github.com/medbankole97/databaseCrud_brief.git
   ```

2. **Accédez au dossier du projet :**
   ```bash
   cd databaseCrud_brief
   ```

3. **Configurez la base de données :**

    - Assurez-vous que Mysql est en cours d'exécution sur votre machine locale.
    - Mettez les paramètres de connexion dans `config/db.js`.
  
## Utilisation

Pour démarrer l'application, exécutez la commande suivante :

```bash
node app.js
```
## 5. ***Documentation des Fonctions***

### customerModule.js :
 ce module gère les opérations CRUD des de la table **customers**. 
 Il est composé des fonctions suivantes :

 - `get()` : Récupère tous les clients de la base de données.
 - `add(name, address, email, phone) `: Ajoute un nouveau client dans la base de données.
 - `update(id, name, address, email, phone)` : Met à jour les informations d'un client existant dans la base de données.
 - `destroy(id)` : Supprime un client de la base de données.
 
### productModule.js: 
ce module gère les opérations CRUD des de la table **products**.
 - `get()`: Récupère tous les produits de la base de données.
 - `add(name, description, price, stock, category, barcode, status)`:  Ajoute un nouveau produit dans la base de données.
 - `update(id, name, description, price, stock, category, barcode, status)`: Met à jour les informations d'un produit existant dans la base de données.
 - `destroy(id)`: Supprime un produit de la base de données.

### purchaseModule.js :


 - `get()`: Récupère tous les  de la base de données.
 - `add(order_date, delivery_address, customer_id, track_number, status)`:
 - `update(id, order_date, delivery_address, customer_id, track_number, status)`
 - `destroy(id) `: Supprime un  de la base de données

### paymentModule.js :
- `get()`: Récupère tous les  de la base de données.
- `add(payment_date, amount, payment_method, order_id)`:
- `update(id, payment_date, amount, payment_method, order_id)`:
- `destroy(id)`


### Schéma CMD et MLD

![](/src/assets/images/CMD.jpg)

![](/src/assets/images/MLD.png)


## Author
[Mohaohmed Bankolé](https://github.com/medbankole97)