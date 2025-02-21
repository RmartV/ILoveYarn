<template>
    <div>
      <h1>Welcome, {{ userInfo.userinfo_fname }}</h1>
      <router-link to="/user-cart">Go to Cart</router-link>
      <h2>Products</h2>
      <div v-for="product in products" :key="product.prod_id" class="product-card">
        <h3>{{ product.prod_name }}</h3>
        <p>Category: {{ product.prod_categorytype }}</p>
        <p>Price: &#8369;{{ product.prod_price.toFixed(2) }}</p>
        <p>Stock: {{ product.prod_stock }}</p>
        <div v-if="product.prod_categorytype === 'TOOL'">
          <p>Material: {{ product.tool_material }}</p>
          <p>Size: {{ product.tool_size }}</p>
        </div>
        <div v-if="product.prod_categorytype === 'YARN'">
          <p>Composition: {{ product.yarn_composition }}</p>
          <p>Weight: {{ product.yarn_weight }}</p>
          <p>Thickness: {{ product.yarn_thickness }}</p>
        </div>
        <button @click="addToCart(product)">Add to Cart</button>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import { supabase } from '../lib/supabaseClient';
  
  export default {
    setup() {
      const userInfo = ref('');
      const products = ref([]);
      const fetchUserInfo = async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user) {
            throw new Error('No user logged in');
          }
  
          const { data, error: fetchError } = await supabase
            .from('userinfo')
            .select('*')
            .eq('userinfo_email', user.email)
            .single();
  
          if (fetchError) throw fetchError;
          
          userInfo.value = data;
        } catch (err) {
          console.error('Error fetching user info:', err);
          error.value = err.message;
        }
      };
  
      const addToCart = async (product) => {
        await supabase.from('usercart').insert({
          userinfo_id: (await supabase.auth.getUser()).data.user.id,
          prod_id: product.prod_id,
          usercart_totalprice: product.prod_price,
          usercart_totalitems: 1
        });
        alert('Added to cart');
      };

      onMounted(() => {
        fetchUserInfo();
      });

      return { userinfo, products, yarn, tool, addToCart };
    }
    
  };
  </script>
  
  <style>
  .product-card {
    border: 1px solid #ddd;
    padding: 10px;
    margin: 10px;
    display: inline-block;
  }
  </style>