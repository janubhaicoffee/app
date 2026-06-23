export const PRODUCT_CATALOG = {
  "instantcoffee-100g": {
    name: "THODI HARD COFFEE (100g)",
    price: 300,
    weight: 100
  },
  "instantcoffee-1000g": {
    name: "THODI HARD COFFEE (1000g)",
    price: 3000,
    weight: 1000
  },
  "coffeebeans": {
    name: "AAA Grade Coffee Beans",
    price: 899,
    weight: 250
  }
};

export function calculateOrderTotal(cartItems, shippingCost) {
  let subtotal = 0;
  for (const item of cartItems) {
    const product = PRODUCT_CATALOG[item.id];
    if (!product) {
      throw new Error(`Product not found: ${item.id}`);
    }
    subtotal += product.price * item.quantity;
  }
  return subtotal + shippingCost;
}
