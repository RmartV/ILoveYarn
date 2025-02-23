<template>
  <div>
    <header class="header">
      <div class="logo-container">
        <router-link to="/home">
          <img src="../views/images/homelogo.jpg" alt="I LOVE YARN PH Logo" class="logo-img">
        </router-link>
        <router-link to="/home">
          <h1 class="logo-text">I LOVE YARN PH</h1>
        </router-link>
      </div>
      <div class="search-container">
        <input type="text" class="search-input" placeholder="What are you looking for?">
        <button class="search-btn">
          <img class="nav-img-icon" src="../views/images/magnifying-glass.png" alt="Search">
        </button>
      </div>
      <div class="nav-icons">
        <div class="nav-icon cart-icon">
          <router-link to="/user-cart">
            <img class="nav-img-icon" src="../views/images/shopping-cart.png" alt="Cart">
            <span class="cart-count">{{ cartCount }}</span>
          </router-link>
        </div>
        <router-link to="/user-details">
          <div class="nav-icon user-info">
            <div class="user-avatar">{{ userAccount?.useracc_fname?.charAt(0) || 'G' }}</div>
            <span>{{ userAccount?.useracc_fname || 'Guest' }}</span>
          </div>
        </router-link>
      </div>
    </header>

    <div class="main-content">
      <div class="sidebar">
        <ul class="sidebar-menu">
          <li class="sidebar-item active">Yarn</li>
          <li class="sidebar-item">Crochet Hooks</li>
          <li class="sidebar-item">Decorative Tape</li>
          <li class="sidebar-item">Ribbons</li>
          <li class="sidebar-item">Accessories</li>
        </ul>
      </div>

      <div class="content-area">
        <section class="carousel-container">
          <div class="carousel-slides">
            <div class="carousel-slide active">
              <img src="../views/images/slide1.png" alt="Featured Yarn Collection" class="carousel-image">
              <div class="carousel-overlay">
                <h2 class="carousel-title">Discover Our Collection</h2>
                <p class="carousel-subtitle">Premium yarns and tools for your creative projects</p>
              </div>
            </div>
          </div>
        </section>

        <h2 class="page-title">All Products</h2>
        <div class="products-container">
          <div v-for="product in products" :key="product.prod_id" class="product-card">
            <div class="product-image">
              <img :src="product.image_url || '../views/images/default.png'" alt="Product Image">
            </div>
            <div class="product-details">
              <div class="product-category">{{ product.prod_categorytype }}</div>
              <h3 class="product-name">{{ product.prod_name }}</h3>
              <div class="product-meta">
                <span class="meta-item">₱{{ product.prod_price.toFixed(2) }}</span>
                <span class="meta-item">Stock: {{ product.prod_stock }} pcs</span>
              </div>
              <div class="product-actions">
                <button @click="addToCart(product)" class="add-to-cart-btn">Add to Cart</button>
              </div>
            </div>
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
    const userAccount = ref(null);
    const products = ref([]);
    const cartCount = ref(0);
    const searchQuery = ref('');

    const fetchUserAccount = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from('user_account')
          .select('useracc_fname')
          .eq('useracc_email', user.email)
          .single();

        userAccount.value = data;
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('product')
        .select('*, yarn(yarn_composition, yarn_weight, yarn_thickness), tool(tool_material, tool_size), tape(tape_type, tape_length, tape_size), ribbons(ribbons_length, ribbons_thickness, ribbons_material), accessories(accs_category, accs_quantity)');

      if (!error) {
        products.value = data.map(product => ({
          ...product,
          image_url: getProductImage(product)
        }));
      }
    };

    const getProductImage = (product) => {
      if (product.prod_id === 101) {
        return supabase.storage.from('product_images').getPublicUrl('chunky_yarn.jpg').data.publicUrl;
      } else if (product.prod_id === 201) {
        return supabase.storage.from('product_images').getPublicUrl('aluminum_hook.jpg').data.publicUrl;
      }
      return '../views/images/default.png';
    };

    const fetchCartCount = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: userData } = await supabase
          .from('user_account')
          .select('useracc_id')
          .eq('useracc_email', user.email)
          .single();

        const { count } = await supabase
          .from('cartitems')
          .select('*', { count: 'exact', head: true })
          .eq('useracc_id', userData.useracc_id);

        cartCount.value = count || 0;
      } catch (error) {
        console.error('Error fetching cart count:', error);
      }
    };

    const addToCart = async (product) => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not logged in');

        const { data: userData } = await supabase
          .from('user_account')
          .select('useracc_id')
          .eq('useracc_email', user.email)
          .single();

        const { error } = await supabase
          .from('cartitems')
          .upsert({
            useracc_id: userData.useracc_id,
            prod_id: product.prod_id,
            items_quantity: 1
          }, {
            onConflict: 'useracc_id, prod_id',
            ignoreDuplicates: false
          });

        if (error) throw error;
        await fetchCartCount();
        alert('Added to cart successfully!');
      } catch (error) {
        console.error('Error adding to cart:', error);
        alert(error.message);
      }
    };

    onMounted(async () => {
      await fetchUserAccount();
      await fetchProducts();
      await fetchCartCount();
    });

    return { userAccount, products, addToCart, cartCount, searchQuery };
  }
};
</script>
  
<style>
:root {
  --primary-color: #feb1bf;
  --background-color: #F2F2F2;
  --text-color: rgb(0, 0, 0);
  --light-gray: #646464;
  --highlights: #77c275;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Arial', sans-serif;
}

body {
  background-color: var(--background-color);
}

.header {
  background-color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 30px;
  border-bottom: 2px solid var(--light-gray);
}

.search-container {
  flex-grow: 1;
  max-width: 500px;
  position: relative;
}

.search-input {
  width: 100%;
  padding: 10px 15px;
  border-radius: 20px;
  border: 2px solid #ddd;
  outline: none;
}

.products-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 25px;
}

.product-card {
  background-color: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.15);
}
</style>
