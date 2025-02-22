<template>
  <div>
    <header class="header">
      <div class="logo-container">
        <img src="../views/images/homelogo.jpg" alt="I LOVE YARN PH Logo" class="logo-img">
        <h1 class="logo-text">I LOVE YARN PH</h1>
      </div>
      <div class="search-container">
        <input type="text" class="search-input" placeholder="What are you looking for?">
        <button class="search-btn">
          <img class="nav-img-icon" src="../views/images/magnifying-glass.png" alt="Search">
        </button>
      </div>
      <div class="nav-icons">
        <div class="nav-icon cart-icon">
          <router-link to="/cart">
            <img class="nav-img-icon" src="../views/images/shopping-cart.png" alt="Cart">
            <span class="cart-count">3</span>
          </router-link>
        </div>
        <div class="nav-icon user-info">
          <router-link to="/user-details">
            <div class="user-avatar">{{ userInfo?.userinfo_fname?.charAt(0) || 'G' }}</div>
            <span style="width: 50px;">{{ userInfo?.userinfo_fname || 'Guest' }}</span>
          </router-link>
        </div>
      </div>
    </header>

    <!----------------------------- Sidebar -------------------------------->
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

      <!----------------------------- Main Area -------------------------------->
      <div class="content-area">
        <!-- Carousel -->
        <div class="carousel-container">
          <div class="carousel-slides">
            <div class="carousel-slide active">
              <img src="../views/images/slide1.png" alt="Yarn Collection 1" class="carousel-image">
              <div class="carousel-overlay">
                <h2 class="carousel-title">We have it all!</h2>
              </div>
            </div>
          </div>
        </div>
        <hr>
        <h2 class="page-title">All Products</h2>
        <div class="products-container">
         
          <div v-for="product in products" :key="product.prod_id" class="product-card">
            <div class="product-image">
              <img :src="product.image_url || '../views/images/default.png'" alt="Product Image">
            </div>
            <div class="product-details">
              <div class="product-category">{{ product.prod_categorytype }}</div>
              <h3 class="product-name">{{ product.prod_name }}</h3>
              <div class="product-meta" v-if="product.prod_categorytype === 'YARN'">
                <span class="meta-item">{{ product.yarn.yarn_composition }}</span>
                <span class="meta-item">{{ product.yarn.yarn_weight }}</span>
                <span class="meta-item">{{ product.yarn.yarn_thickness }}</span>
              </div>
              <div class="product-meta" v-if="product.prod_categorytype === 'TOOL'">
                <span class="meta-item">{{ product.tool.tool_material }}</span>
                <span class="meta-item">{{ product.tool.tool_size }}</span>
              </div>
              <div class="product-price">₱{{ product.prod_price.toFixed(2) }}</div>
              <div class="product-stock">In stock: {{ product.prod_stock }} pcs</div>
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
      const userInfo = ref(null);
      const products = ref([]);
  
      const fetchUserInfo = async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('No user logged in');
  
          const { data, error } = await supabase
            .from('userinfo')
            .select('userinfo_fname')
            .eq('userinfo_email', user.email)
            .single();
  
          if (error) throw error;
          userInfo.value = data;
        } catch (err) {
          console.error('Error fetching user info:', err);
        }
      };
  
      const fetchProducts = async () => {
        const { data, error } = await supabase
          .from('product')
          .select('*, yarn(yarn_composition, yarn_weight, yarn_thickness), tool(tool_material, tool_size)');
        
          if (!error) {
    products.value = data.map(product => {
      let imageUrl = '';

      if (product.prod_id === 101) {
        imageUrl = supabase.storage.from('product_images').getPublicUrl('chunky_yarn.jpg').data.publicUrl;
      } else if (product.prod_id === 201) {
        imageUrl = supabase.storage.from('product_images').getPublicUrl('aluminum_hook.jpg').data.publicUrl;
      }

      return {
        ...product,
        image_url: imageUrl
      };
    });
  }
};
  
      onMounted(async () => {
        await fetchUserInfo();
        await fetchProducts();
      });
  
      const addToCart = async (product) => {
        await supabase.from('usercart').insert({
          userinfo_id: (await supabase.auth.getUser()).data.user.id,
          prod_id: product.prod_id,
          usercart_totalprice: product.prod_price,
          usercart_totalitems: 1
        });
        alert('Added to cart');
      };
  
      return { userInfo, products, addToCart };
    }
  };
  </script>
  
  <style>
:root {
    --primary-color: #ff97a7;
    --primary-hover: #ff7d91;
    --secondary-color: #77c275;
    --background-color: #f8f9fa;
    --text-color: #2d3748;
    --light-gray: #718096;
    --border-color: #e2e8f0;
    --card-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    --transition: all 0.3s ease;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Inter', 'Segoe UI', sans-serif;
}

body {
    background-color: var(--background-color);
    color: var(--text-color);
    line-height: 1.5;
}

/* Header Improvements */
.header {
    background-color: white;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    position: sticky;
    top: 0;
    z-index: 1000;
    padding: 1rem 2rem;
}

.logo-container {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.logo-img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
}

.logo-text {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--primary-color);
}

.search-container {
    position: relative;
    max-width: 600px;
    margin: 0 2rem;
}

.search-input {
    width: 100%;
    padding: 0.75rem 1rem;
    padding-right: 3rem;
    border-radius: 9999px;
    border: 2px solid var(--border-color);
    transition: var(--transition);
    font-size: 0.95rem;
}

.search-input:focus {
    border-color: var(--primary-color);
    outline: none;
    box-shadow: 0 0 0 3px rgba(255, 151, 167, 0.2);
}

.search-btn {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    opacity: 0.6;
    transition: var(--transition);
}

.search-btn:hover {
    opacity: 1;
}

/* Navigation Icons */
.nav-icons {
    display: flex;
    gap: 1.5rem;
    align-items: center;
}

.nav-icon {
    position: relative;
    cursor: pointer;
}

.cart-count {
    position: absolute;
    top: -8px;
    right: -8px;
    background-color: var(--secondary-color);
    color: white;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
}

.user-avatar {
    width: 35px;
    height: 35px;
    border-radius: 50%;
    background-color: var(--primary-color);
    color: white;
    font-weight: 600;
    transition: var(--transition);
}

/* Sidebar Improvements */
.sidebar {
    background-color: white;
    border-radius: 12px;
    box-shadow: var(--card-shadow);
    padding: 1.5rem;
    height: calc(100vh - 80px);
    position: sticky;
    top: 80px;
}

.sidebar-menu {
    margin-top: 2rem;
}

.sidebar-item {
    padding: 0.875rem 1rem;
    margin-bottom: 0.5rem;
    border-radius: 8px;
    font-weight: 500;
    transition: var(--transition);
}

.sidebar-item:hover {
    background-color: rgba(255, 151, 167, 0.1);
    color: var(--primary-color);
}

.sidebar-item.active {
    background-color: var(--primary-color);
    color: white;
    font-weight: 600;
}

/* Carousel Improvements */
.carousel-container {
    margin: 2rem 0;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: var(--card-shadow);
}

.carousel-slide {
    height: 400px;
    position: relative;
}

.carousel-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.carousel-overlay {
    background: linear-gradient(to right, rgba(0,0,0,0.6), transparent);
    padding: 3rem;
}

.carousel-title {
    font-size: 2.5rem;
    color: white;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
}

/* Product Cards Improvements */
.products-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 2rem;
    padding: 2rem 0;
}

.product-card {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: var(--card-shadow);
    transition: var(--transition);
}

.product-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 20px rgba(0,0,0,0.1);
}

.product-image {
    height: 220px;
    position: relative;
    overflow: hidden;
}

.product-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: var(--transition);
}

.product-card:hover .product-image img {
    transform: scale(1.05);
}

.product-details {
    padding: 1.5rem;
}

.product-category {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--light-gray);
    margin-bottom: 0.5rem;
}

.product-name {
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: var(--text-color);
}

.product-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.meta-item {
    background-color: var(--background-color);
    padding: 0.375rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    color: var(--light-gray);
}

.product-price {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-color);
    margin-bottom: 1rem;
}

.product-stock {
    font-size: 0.875rem;
    color: var(--light-gray);
    margin-bottom: 1.5rem;
}

.add-to-cart-btn {
    width: 100%;
    background-color: var(--primary-color);
    color: white;
    border: none;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
}

.add-to-cart-btn:hover {
    background-color: var(--primary-hover);
}

/* Responsive Improvements */
@media (max-width: 1024px) {
    .header {
        padding: 1rem;
    }
    
    .search-container {
        margin: 0 1rem;
    }
    
    .products-container {
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 1.5rem;
    }
}

@media (max-width: 768px) {
    .header {
        position: relative;
        padding: 1rem;
    }
    
    .logo-container {
        margin-bottom: 1rem;
    }
    
    .search-container {
        margin: 1rem 0;
    }
    
    .sidebar {
        height: auto;
        position: relative;
        top: 0;
        margin-bottom: 1.5rem;
    }
    
    .products-container {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1rem;
    }
    
    .product-image {
        height: 180px;
    }
}
  </style>
  