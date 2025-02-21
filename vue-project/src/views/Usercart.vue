<template>
    <div class="user-cart">
      <h1>Your Cart</h1>
      <div v-for="item in cartItems" :key="item.prod_id" class="cart-item">
        <h2>{{ item.prod_name }}</h2>
        <p>Price: ${{ item.prod_price }}</p>
        <p>Quantity: {{ item.quantity }}</p>
      </div>
      <p>Total Price: ${{ totalPrice }}</p>
      <p>Total Items: {{ totalItems }}</p>
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
  
      onMounted(async () => {
        await fetchCartItems();
      });
  
      async function fetchCartItems() {
        const { data, error } = await supabase
          .from('usercart')
          .select('*, product(*)')
          .eq('userinfo_id', supabase.auth.user().id);
        if (error) console.error('Error fetching cart items:', error);
        else {
          cartItems.value = data.map(d => ({ ...d.product, quantity: 1 }));
          calculateTotals();
        }
      }
  
      function calculateTotals() {
        totalPrice.value = cartItems.value.reduce((sum, item) => sum + item.prod_price * item.quantity, 0);
        totalItems.value = cartItems.value.reduce((sum, item) => sum + item.quantity, 0);
      }
  
      return { cartItems, totalPrice, totalItems };
    }
  };
  </script>
  
  <style>
  .user-cart {
    padding: 20px;
  }
  .cart-item {
    margin-bottom: 20px;
    padding: 10px;
    border: 1px solid #ccc;
  }
  </style>