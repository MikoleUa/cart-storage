# CartStorage - Документація

`CartStorage` - це гнучкий клас для управління кошиком покупок з автоматичним збереженням в `localStorage`.

---

## 📑 Зміст

[🚀 Швидкий старт](#-швидкий-старт)  
[🔗 Підключення](#-підключення)  
[⚙️ Ініціалізація CartStorage](#️-ініціалізація-cartstorage)  
[🗺️ fieldMap – схема](#️-fieldmap--схема)  
[🛠️ Методи](#️-методи)  
[🔄 Відстежування змін у кошику](#-відстежування-змін-у-кошику)  
[🔄 Chainable методи](#-chainable-методи)  
[🔧 Робота з різними структурами API](#-робота-з-різними-структурами-api)  
[⚠️ Обов'язкові ключі в fieldMap](#️-обовязкові-ключі-в-fieldmap)  
[💾 Автоматичне збереження](#-автоматичне-збереження)  
[📋 Структура збережених даних](#-структура-збережених-даних)  
[❌ Обробка помилок](#-обробка-помилок)  
[🎯 Приклади використання](#-приклади-використання)  
[📝 Короткі приклади методів](#-короткі-приклади-методів)

### 🚀 Швидкий старт

```javascript
// Ініціалізація кошика (ключ зберігання за замовчуванням: "cart")
const cart = new CartStorage();

// Реєстрація обробника змін (корисно для оновлення UI)
cart.onChange((items) => {
  updateUI(items);
});

// Додавання товару
cart.addItem({
  id: "1",
  name: "iPhone 15",
  price: 999,
  quantity: 1,
});

// Отримання зведення про кошик
console.log(cart.getSummary());
/*
{
  items: [
    { id: "1", name: "iPhone 15", price: 999, quantity: 1, total: 999 }
  ],
  totalQuantity: 1,
  totalPrice: 999
}
*/
```

---

### 🔗 **Підключення**

1. Класичне підключення через <script>

```HTML
<script src="https://cdn.jsdelivr.net/gh/MikoleUa/cart-storage@main/dist/CartStorage.js"></script>
<script>
  const cart = new CartStorage();
  cart.addItem({ id: "1", name: "iPhone 15", price: 999, quantity: 1 });
  console.log(cart.getSummary());
</script>
```

2. Модульний варіант (ESM)

```HTML
<script type="module">
  import { CartStorage } from "https://cdn.jsdelivr.net/gh/MikoleUa/cart-storage@main/dist/CartStorage.esm.js";
  const cart = new CartStorage();
  cart.addItem({ id: "1", name: "MacBook Pro", price: 2500, quantity: 1 });
</script>
```

### ⚙️ **Ініціалізація CartStorage**

При створенні кошика через конструктор:

```javascript
new CartStorage(storageKey, fieldMap);
```

`storageKey` (string, необов'язковий) – ключ для localStorage, за замовчуванням "cart".  
`fieldMap` (object, необов'язковий) – мапа полів для роботи з різними API.

Важливо про fieldMap:

Якщо передаєте fieldMap, він повинен містити три ключі:

- id – поле, де зберігається унікальний ідентифікатор товару
- price – поле з ціною
- quantity – поле з кількістю

Якщо fieldMap не передано, CartStorage очікує стандартні поля у товарів:

`id`, `price`, `quantity`.

Додаткові поля (name, category, description тощо) зберігаються як є.

### 🗺️ fieldMap – схема

Обов'язкові поля CartStorage → Поля API
| CartStorage | Примітка | Приклад значення |
| ----------- | ------------------------ | ---------------- |
| id | унікальний ідентифікатор | `"product123"` |
| price | ціна за одиницю | `999` |
| quantity | кількість | `2` |

Поле, яке створює CartStorage автоматично:  
`total` – загальна вартість товару (price \* quantity), **не передається вручну**  
 Додаткові поля (зберігаються як є):
title, name, description, specs, images та інші
Приклади ініціалізації:

```javascript
// 1. Стандартне використання - очікує поля: id, price, quantity
const cart = new CartStorage();
cart.addItem({
  id: "phone-1", // обов'язкове ✅
  price: 999, // обов'язкове ✅
  quantity: 1, // обов'язкове ✅
  name: "iPhone 15", // додаткове поле (зберігається) ✅
  category: "electronics", // додаткове поле (зберігається) ✅
});
```

```javascript
// 2. З кастомним ключем localStorage
const cart = new CartStorage("shopping_cart");
```

```javascript
// 3. З мапою полів для API - мапуємо назви полів API на стандартні
const cart = new CartStorage("api_cart", {
  id: "productId", // в API поле називається "productId"
  price: "cost", // в API поле називається "cost"
  quantity: "qty", // в API поле називається "qty"
});
```

```javascript
// Тепер можна додавати товари з API структурою
cart.addItem({
  productId: "abc123", // замість "id"
  cost: 999, // замість "price"
  qty: 1, // замість "quantity"
  title: "iPhone 15", // додаткове поле (зберігається як title)
  category: "electronics", // додаткове поле (зберігається)
});
```

### 🛠️ **Методи**

| Метод                          | Опис                                | Поведінка                                                                       | Вхідні параметри                                                                  |
| ------------------------------ | ----------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `addItem(item)`                | Додає товар                         | Якщо товар з таким `id` вже є — оновлює кількість                               | `item` (object) — об’єкт товару з полями `id`, `price`, `quantity` та додатковими |
| `updateQuantity(id, quantity)` | Оновлює кількість товару            | Якщо `quantity < 1` → кількість встановлюється в `1` (товар не видаляється)     | `id` (string/number), `quantity` (number) — нова кількість                        |
| `increment(id, amount = 1)`    | Збільшує кількість                  | Якщо `amount <= 0` → ігнорується                                                | `id` (string/number), `amount` (number, додатне)                                  |
| `decrement(id, amount = 1)`    | Зменшує кількість                   | Якщо `amount > quantity` → кількість стає `1`; якщо `amount <= 0` → ігнорується | `id` (string/number), `amount` (number, додатне)                                  |
| `removeItem(id)`               | Видаляє товар                       | Товар повністю видаляється                                                      | `id` (string/number)                                                              |
| `clear()`                      | Очищає кошик                        | Всі товари видаляються                                                          | —                                                                                 |
| `getItems()`                   | Повертає масив товарів              | Масив нормалізованих об’єктів                                                   | —                                                                                 |
| `getTotalQuantity()`           | Повертає загальну кількість         | Число — сума всіх `quantity`                                                    | —                                                                                 |
| `getTotalPrice()`              | Повертає загальну суму              | Число — сума `price * quantity`                                                 | —                                                                                 |
| `getSummary()`                 | Повертає повну інформацію про кошик | Об’єкт `{ items, totalQuantity, totalPrice }`                                   | —                                                                                 |
| `onChange(callback)`           | Підписка на зміни кошика            | Викликає `callback` при будь-якій зміні                                         | `callback(items)` — функція, де `items` — поточний стан кошика                    |
| `offChange(handler)`           | Відписка від змін                   | Видаляє підписку                                                                | `handler` — обробник, повернений `onChange`                                       |

### 🔄 **Відстежування змін у кошику**

CartStorage підтримує **підписку** на зміни стану кошика через `onChange` та відписку через `offChange`.
Це зручно, якщо потрібно автоматично оновлювати UI або виконувати інші дії після зміни кошика.

```javascript
const cart = new CartStorage();
// Підписка на зміни
cart.onChange((items) => {
  updateUI(items);
});
```

```javascript
const cart = new CartStorage();
const handler = cart.onChange((items) => {
  updateUI(items);
});
// Відписка
cart.offChange(handler);
```

`onChange(callback)` — додає підписку, повертає обробник для подальшого видалення.  
`offChange(handler)` — видаляє підписку.

**Практичний приклад:**

```javascript
// Автоматичне оновлення UI при змінах кошика
const cart = new CartStorage();

cart.onChange((items) => {
  // Оновити лічильник товарів
  document.getElementById("cart-badge").textContent = Object.keys(items).length;

  // Оновити загальну суму
  const totalPrice = cart.getTotalPrice();
  document.getElementById("cart-total").textContent = `${totalPrice}₴`;

  // Показати/сховати кнопку "Оформити замовлення"
  const checkoutBtn = document.getElementById("checkout-btn");
  checkoutBtn.style.display = totalPrice > 0 ? "block" : "none";
});

// Тепер будь-які зміни кошика автоматично оновлять UI
cart.addItem({ id: "1", price: 100, quantity: 1 }); // UI оновиться
cart.increment("1"); // UI оновиться
cart.removeItem("1"); // UI оновиться
```

### 🔄 **Chainable методи**

Всі методи, що змінюють стан, можна викликати у ланцюжку:

```javascript
// ✅ Важливо: усі методи повертають сам екземпляр CartStorage,
// тому їх можна викликати у ланцюжку (chainable)
cart
  .addItem({ id: "1", name: "Product 1", price: 100, quantity: 1 })
  .addItem({ id: "2", name: "Product 2", price: 200, quantity: 2 })
  .updateQuantity("1", 3)
  .removeItem("2");
```

### 🔧 Робота з різними структурами API

Різні API можуть використовувати різні назви полів, але CartStorage завжди очікує 3 стандартні поля:

```javascript
// Стандартна структура (без fieldMap)
{ "id": "123", "price": 100, "quantity": 1 }
// API #1 - інші назви полів
{ "productId": "123", "cost": 100, "qty": 1 }
// API #2 - ще інші назви
{ "sku": "123", "unitPrice": 100, "amount": 1 }
```

Рішення - fieldMap

fieldMap - це мапа відповідності, яка говорить CartStorage де шукати потрібні дані:

```javascript
// Для API #1
const cart1 = new CartStorage("cart1", {
  id: "productId", // шукати ID в полі "productId"
  price: "cost", // шукати ціну в полі "cost"
  quantity: "qty", // шукати кількість в полі "qty"
});
```

```javascript
// Для API #2
const cart2 = new CartStorage("cart2", {
  id: "sku", // шукати ID в полі "sku"
  price: "unitPrice", // шукати ціну в полі "unitPrice"
  quantity: "amount", // шукати кількість в полі "amount"
});
```

```javascript
// Тепер можна працювати з будь-якою структурою
cart1.addItem({
  productId: "123",
  cost: 100,
  qty: 1,
  title: "Product", // title збережеться як додаткове поле
});
cart2.addItem({
  sku: "456",
  unitPrice: 200,
  amount: 2,
  productName: "Product", // productName збережеться як додаткове поле
});
```

### ⚠️ **Обов'язкові ключі в fieldMap:**

Якщо ви передаєте fieldMap, він повинен містити всі 3 ключі:

```javascript
// Неправильно - пропущений ключ "price" ❌
const cart = new CartStorage("cart", {
  id: "productId",
  quantity: "qty",
  // price відсутній!
});
// Правильно - всі 3 ключі присутні ✅
const cart = new CartStorage("cart", {
  id: "productId",
  price: "cost",
  quantity: "qty",
});
```

### 💾 **Автоматичне збереження**

Кошик автоматично зберігається в localStorage після кожної зміни:

```javascript
const cart1 = new CartStorage("main_cart");
const cart2 = new CartStorage("wishlist");

// Кожен кошик автоматично зберігається у localStorage і відновлюється при перезавантаженні
cart1.addItem({ id: "1", price: 100 }); // → localStorage["main_cart"]
cart2.addItem({ id: "2", price: 200 }); // → localStorage["wishlist"]
```

### 📋 **Структура збережених даних**

Ключ у localStorage завжди відповідає `id` товару

CartStorage нормалізує всі товари до стандартного формату:

```javascript
// Вхідні дані (будь-які поля)
cart.addItem({
  productId: "item001",
  name: "Product A",
  cost: 1250,
  qty: 1,
  description: "Sample product description",
  attributes: { size: "M", color: "red" },
  tags: ["category1", "featured"],
});
```

Збережена структура (нормалізована)

```json
{
  "item001": {
    "id": "item001",
    "price": 1250,
    "quantity": 1,
    "total": 1250,
    "name": "Product A",
    "description": "Sample product description",
    "attributes": { "size": "M", "color": "red" },
    "tags": ["category1", "featured"]
  },
  "item002": {
    "id": "item002",
    "price": 75,
    "quantity": 3,
    "total": 225,
    "name": "Product B",
    "category": "sample-category",
    "weight": "2kg"
  },
  "item003": {
    "id": "item003",
    "price": 180,
    "quantity": 2,
    "total": 360,
    "name": "Product C",
    "brand": "Brand X",
    "rating": 4.5
  }
}
```

### ❌ **Обробка помилок**

Дублювання товарів

```javascript
cart.addItem({ id: "1", name: "Product", price: 100 });
cart.addItem({ id: "1", name: "Product", price: 100 });
// Console warning: Item with id "1" already exists. Updating quantity instead.
```

Відсутній `id`

```javascript
cart.addItem({ name: "Product", price: 100 });
// Error: Item must have a id field ❌
```

Якщо localStorage недоступний, помилка логується в консоль, але додаток не падає.

### 🎯 **Приклади використання**

```javascript
const cart = new CartStorage("shopping_cart");

// Додавання товару з каталогу
function addToCart(product) {
  try {
    cart.addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
      category: product.category,
    });

    // Оновити UI
    updateCartButton(product.id, true);
    showNotification(`${product.name} додано до кошика`);
  } catch (error) {
    if (error.message.includes("already in the cart")) {
      showNotification(`${product.name} вже в кошику`);
    }
  }
}

// Оновлення кількості в кошику
function updateCartItemQuantity(id, quantity) {
  cart.updateQuantity(id, quantity);
  renderCartSummary();
}
```

Інтеграція з API

```javascript
// Конфігурація під API
const apiCart = new CartStorage("api_cart", {
  id: "productId",
  price: "unitPrice",
  quantity: "qty",
  name: "title",
});

// Додавання товару з API відповіді
fetch("/api/products/123")
  .then((response) => response.json())
  .then((product) => {
    // API повертає: { productId, title, unitPrice, description, images }
    apiCart.addItem({
      ...product,
      qty: 1, // додаємо кількість
    });
  });
```

Множинні кошики

```javascript
const mainCart = new CartStorage("cart");
const wishlist = new CartStorage("wishlist");
const compareList = new CartStorage("compare");

// Переміщення з wishlist до кошика
function moveToCart(productId) {
  const item = wishlist.getItems().find((item) => item.id === productId);
  if (item) {
    wishlist.removeItem(productId);

    try {
      mainCart.addItem(item);
    } catch (error) {
      // Товар вже в кошику
      wishlist.addItem(item); // повертаємо назад
    }
  }
}
```

### 📝 Короткі приклади методів

➕ Додавання товару

```javascript
const cart = new CartStorage("shopping_cart");

cart.addItem({
  id: "item1",
  name: "Товар 1",
  price: 100,
  quantity: 1,
});

cart.addItem({ id: "item1", price: 100, quantity: 3 }); // оновлює кількість
```

🔄 Оновлення кількості

```javascript
cart.updateQuantity("item1", 5); // встановлює quantity = 5
cart.updateQuantity("item1", 0); // мінімум 1 (товар не видаляється)
cart.updateQuantity("item2", 2); // нічого не змінюється, товар відсутній

cart.increment("item1"); // +1
cart.increment("item1", 3); // +3
cart.decrement("item1"); // -1
cart.decrement("item1", 10); // мінімум 1
```

🗑️ Видалення товару

```javascript
cart.removeItem("item1"); // видаляє повністю
cart.removeItem("item2"); // нічого не робить, оскільки товару з таким id немає

cart.clear(); // очищення кошика
```

📊 Отримання даних

```javascript
console.log(cart.getItems()); // масив товарів
console.log(cart.getTotalQuantity()); // загальна кількість
console.log(cart.getTotalPrice()); // загальна сума
console.log(cart.getSummary()); // { items, totalQuantity, totalPrice }
```

🔔 Підписка на зміни

```javascript
const handler = cart.onChange((items) => {
  console.log("Кошик змінився", items);
}); // підписка

cart.offChange(handler); // відписка
```
