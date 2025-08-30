class CartStorage {
  constructor(storageKey = "cart", fieldMap = {}) {
    this.storageKey = storageKey;
    this.fieldMap = {
      id: fieldMap.id || "id",
      price: fieldMap.price || "price",
      quantity: fieldMap.quantity || "quantity"
    };
    this.items = this._load() || {};
    this.eventTarget = new EventTarget();
  }

  addItem(rawItem) {
    const item = this._normalize(rawItem);

    if (!item.id) {
      throw new Error(`Item must have a valid id "${this.fieldMap.id}" field`);
    }

    if (item.price < 0) {
      throw new Error(`Price cannot be negative for item with id "${item.id}"`);
    }

    if (item.quantity < 0) {
      throw new Error(`Quantity cannot be negative for item with id "${item.id}"`);
    }

    if (this.items[item.id]) {
      console.warn(
        `Item with id "${item.id}" already exists. Updating quantity instead.`
      );
      return this.updateQuantity(item.id, this.items[item.id].quantity + item.quantity);
    }

    this.items[item.id] = item;
    this._save();
    return this;
  }

updateQuantity(id, quantity) {
  if (!this.items[id]) return this;

  quantity = Number(quantity);
  if (isNaN(quantity)) {
    console.warn(`Invalid quantity for item with id "${id}", ignoring update`);
    return this;
  }

  if (quantity < 1) {
    this.items[id].quantity = 1;
  } else {
    this.items[id].quantity = quantity;
  }

  this.items[id].total = this.items[id].price * this.items[id].quantity;
  this._save();
  return this;
}

increment(id, amount = 1) {
  if (!this.items[id]) {
    console.warn(`Item with id "${id}" not found in cart`);
    return this;
  }

  amount = Number(amount);
  if (isNaN(amount) || amount <= 0) {
    console.warn(`Invalid increment amount "${amount}" for item with id "${id}"`);
    return this;
  }

  return this.updateQuantity(id, this.items[id].quantity + amount);
}

decrement(id, amount = 1) {
  if (!this.items[id]) {
    console.warn(`Item with id "${id}" not found in cart`);
    return this;
  }

  amount = Number(amount);
  if (isNaN(amount) || amount <= 0) {
    console.warn(`Invalid decrement amount "${amount}" for item with id "${id}"`);
    return this;
  }

  return this.updateQuantity(id, this.items[id].quantity - amount);
}


  removeItem(id) {
    if (this.items[id]) {
      delete this.items[id];
      this._save();
    }
    return this;
  }

  clear() {
    this.items = {};
    this._save();
    return this;
  }

  getItem(id) {
    return this.items[id] || null;
  }

  getItems() {
    return Object.values(this.items);
  }

  getTotalQuantity() {
    return Object.values(this.items).reduce((acc, item) => acc + item.quantity, 0);
  }

  getTotalPrice() {
    return Object.values(this.items).reduce((acc, item) => acc + item.total, 0);
  }

  getSummary() {
    return {
      items: this.getItems(),
      totalQuantity: this.getTotalQuantity(),
      totalPrice: this.getTotalPrice(),
    };
  }

onChange(callback) {
  if (typeof callback !== "function") {
    console.warn("onChange expects a function as a callback");
    return null;
  }

  const handler = (event) => callback(event.detail);
  this.eventTarget.addEventListener("change", handler);
  return handler; 
}

  offChange(handler) {
    this.eventTarget.removeEventListener("change", handler);
  }

  _normalize(item) {
    const normalized = {
      id: item[this.fieldMap.id],
      price: Number(item[this.fieldMap.price]) || 0,
      quantity: Number(item[this.fieldMap.quantity]) || 1,
    };

    const standardKeys = ["id", "price", "quantity", "total"];
    Object.entries(item).forEach(([key, value]) => {
      if (!standardKeys.includes(key) && !Object.values(this.fieldMap).includes(key)) {
        normalized[key] = value;
      }
    });

    normalized.total = normalized.price * normalized.quantity;
    return normalized;
  }

  _storageAvailable() {
    try {
      const testKey = "__test__";
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  _save() {
    if (!this._storageAvailable()) {
      console.warn("localStorage is not available, data was not saved");
      return;
    }
    try {
      const safeItems = {};
      Object.entries(this.items).forEach(([id, item]) => {
        safeItems[id] = {
          id: item.id,
          price: item.price,
          quantity: item.quantity,
          total: item.total,
          ...Object.keys(item).reduce((acc, key) => {
            if (!["id", "price", "quantity", "total"].includes(key)) {
              acc[key] = item[key];
            }
            return acc;
          }, {})
        };
      });
      localStorage.setItem(this.storageKey, JSON.stringify(safeItems));

this.eventTarget.dispatchEvent(
  new CustomEvent("change", { detail: { ...this.items } })
);
    } catch (error) {
      console.error("Failed to save cart:", error);
    }
  }

  _load() {
    if (!this._storageAvailable()) return {};
    try {
      return JSON.parse(localStorage.getItem(this.storageKey)) || {};
    } catch {
      return {};
    }
  }
}
