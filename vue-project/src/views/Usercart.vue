<template>
  <div>
    <header class="header">
      <!-- Reuse header from home.vue -->
    </header>

    <div class="cart-container">
      <h1>Your Cart</h1>
      <div v-if="loading">Loading...</div>
      <div v-else>
        <div v-if="cartItems.length === 0" class="empty-cart">
          Your cart is empty
        </div>
        <div v-else>
          <div v-for="item in cartItems" :key="item.cart_item_id" class="cart-item">
            <div class="item-info">
              <h3>{{ item.product.prod_name }}</h3>
              <p>Price: ₱{{ item.product.prod_price.toFixed(2) }}</p>
              <p>Quantity: {{ item.quantity }}</p>
              <button @click="updateQuantity(item, 1)">+</button>
              <button @click="updateQuantity(item, -1)">-</button>
              <button @click="removeItem(item)">Remove</button>
            </div>
          </div>
          <div class="cart-summary">
            <p>Total Items: {{ totalItems }}</p>
            <p>Total Price: ₱{{ totalPrice.toFixed(2) }}</p>
            <button class="checkout-btn">Proceed to Checkout</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { supabase } from '../lib/supabaseClient';

export default {
  setup() {
    const cartItems = ref([]);
    const totalPrice = ref(0);
    const totalItems = ref(0);
    const loading = ref(true);

    const fetchCartItems = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not logged in');

        const { data: userInfo } = await supabase
          .from('userinfo')
          .select('userinfo_id')
          .eq('userinfo_email', user.email)
          .single();

        const { data } = await supabase
          .from('cartitems')
          .select('*, product:prod_id(*)')
          .eq('userinfo_id', userInfo.userinfo_id);

        cartItems.value = data || [];
        calculateTotals();
      } catch (error) {
        console.error('Error fetching cart:', error);
      } finally {
        loading.value = false;
      }
    };

    const calculateTotals = () => {
      totalItems.value = cartItems.value.reduce((sum, item) => sum + item.quantity, 0);
      totalPrice.value = cartItems.value.reduce(
        (sum, item) => sum + (item.quantity * item.product.prod_price), 0
      );
    };

    const updateQuantity = async (item, change) => {
      const newQuantity = item.quantity + change;
      if (newQuantity < 1) return;

      try {
        const { error } = await supabase
          .from('cartitems')
          .update({ quantity: newQuantity })
          .eq('cart_item_id', item.cart_item_id);

        if (!error) {
          item.quantity = newQuantity;
          calculateTotals();
        }
      } catch (error) {
        console.error('Error updating quantity:', error);
      }
    };

    const removeItem = async (item) => {
      try {
        const { error } = await supabase
          .from('cartitems')
          .delete()
          .eq('cart_item_id', item.cart_item_id);

        if (!error) {
          cartItems.value = cartItems.value.filter(i => i.cart_item_id !== item.cart_item_id);
          calculateTotals();
        }
      } catch (error) {
        console.error('Error removing item:', error);
      }
    };

    onMounted(fetchCartItems);

    return { cartItems, totalPrice, totalItems, loading, updateQuantity, removeItem };
  }
};
</script>
<style scoped>
.cart-item {
  border: 1px solid #eee;
  padding: 1rem;
  margin: 1rem 0;
  border-radius: 8px;
}

.checkout-btn {
  background: #4CAF50;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;
}

button {
  margin: 0 5px;
  padding: 5px 10px;
  cursor: pointer;
}
</style>