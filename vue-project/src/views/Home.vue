<template>
    <div class="home">
      <h1>Welcome, {{ username }}</h1>
      <div v-for="product in products" :key="product.prod_id" class="product">
        <h2>{{ product.prod_name }}</h2>
        <p>Category: {{ product.prod_categorytype }}</p>
        <p>Price: ${{ product.prod_price }}</p>
        <p>Stock: {{ product.prod_stock }}</p>
        <button @click="addToCart(product)">Add to Cart</button>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import { supabase } from '../lib/supabaseClient';
  
  export default {
    setup() {
      const username = ref('');
      const products = ref([]);
  
      onMounted(async () => {
        const user = supabase.auth.user();
        if (user) {
          username.value = user.email;
        }
        await fetchProducts();
      });
  
      async function fetchProducts() {
        const { data, error } = await supabase
          .from('product')
          .select('*');
        if (error) console.error('Error fetching products:', error);
        else products.value = data;
      }
  
      async function addToCart(product) {
        const { error } = await supabase
          .from('usercart')
          .insert([{ userinfo_id: supabase.auth.user().id, prod_id: product.prod_id }]);
        if (error) console.error('Error adding to cart:', error);
        else alert('Added to cart!');
      }
  
      return { username, products, addToCart };
    }
  };
  </script>
  
  <style>
  .home {
    padding: 20px;
  }
  .product {
    margin-bottom: 20px;
    padding: 10px;
    border: 1px solid #ccc;
  }
  </style>