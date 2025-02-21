<template>
    <div>
      <h1>Your Cart</h1>
      <div v-for="item in cart" :key="item.prod_id" class="cart-item">
        <h3>{{ item.prod_name }}</h3>
        <p>Price: &#8369;{{ item.prod_price.toFixed(2) }}</p>
        <p>Quantity: {{ item.usercart_totalitems }}</p>
        <p>Total: &#8369;{{ (item.prod_price * item.usercart_totalitems).toFixed(2) }}</p>
      </div>
      <h2>Overall Total: &#8369;{{ overallTotal.toFixed(2) }}</h2>
      <h3>Total Items: {{ totalItems }}</h3>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import { supabase } from '../lib/supabaseClient';
  
  export default {
    setup() {
      const cart = ref([]);
      const overallTotal = ref(0);
      const totalItems = ref(0);
  
      onMounted(async () => {
        const { data, error } = await supabase
          .from('usercart')
          .select('*, product(prod_name, prod_price)');
        if (!error) {
          cart.value = data;
          overallTotal.value = data.reduce((sum, item) => sum + item.prod_price * item.usercart_totalitems, 0);
          totalItems.value = data.reduce((sum, item) => sum + item.usercart_totalitems, 0);
        }
      });
  
      return { cart, overallTotal, totalItems };
    }
  };
  </script>
  
  <style>
  .cart-item {
    border-bottom: 1px solid #ddd;
    padding: 10px;
  }
  </style>
  