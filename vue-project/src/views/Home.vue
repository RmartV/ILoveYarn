<template>
 <header class="header">
        <div class="logo-container">
            <img src="../views/images/homelogo.jpg" alt="I LOVE YARN PH Logo" class="logo-img">
            <h1 class="logo-text">I LOVE YARN PH</h1>
        </div>
        
        <div class="search-container">
            <input type="text" class="search-input" placeholder="What are you looking for?">
            <button class="search-btn"><img class="nav-img-icon" src="../views/images/magnifying-glass.png"></button>
        </div>
        
        <div class="nav-icons">
            <div class="nav-icon"><img class="nav-img-icon" src="../views/images/shopping-cart.png"></div>
            <div class="nav-icon">
              <p><router-link to="/user-details">{{ userInfo?.userinfo_fname || 'Guest' }}</router-link></p>
            </div>
        </div>
    </header>
    
    <!-- Main Content Area -->
    <div class="main-content">
        <!-- Sidebar -->
        <div class="sidebar">
            <ul class="sidebar-menu">
                <li class="sidebar-item">Yarn <i class="fas fa-chevron-right"></i></li>
                <li class="sidebar-item">Crochet Hooks <i class="fas fa-chevron-right"></i></li>
                <li class="sidebar-item">Decorative Tape <i class="fas fa-chevron-right"></i></li>
                <li class="sidebar-item">Ribbons <i class="fas fa-chevron-right"></i></li>
                <li class="sidebar-item">Sewing Threads <i class="fas fa-chevron-right"></i></li>
                <li class="sidebar-item">Accessories <i class="fas fa-chevron-right"></i></li>
            </ul>
        </div>
        
        <!-- Content Area -->
        <div class="content-area">
            <!-- Static Banner (replaces Carousel) -->
            <div class="banner-container">
                <img src="../views/images/slide1.png" alt="Up to 10% off Voucher" class="banner-image">
                <div class="banner-overlay">
                    <h2 class="banner-title">Up to 10% off Voucher</h2>
                    <button class="shop-now-btn">Shop Now</button>
                </div>
            </div>
        </div>
    </div>         

    <!-- Categories Section -->
    <div class="categories-section">
        <hr>
        <div class="section-header-yarn">
            <h3 class="section-title-yarn">Browse By Yarn</h3>
            <div class="view-more">
                <a href="/yarn-page"><img src="../views/images/arrow.png">View more</a>
            </div>
        </div>
        
        <div class="categories-grid-yarn">
            <div v-if="loading" class="loading-message">
                Loading products...
            </div>
            <div v-else-if="error" class="error-message">
                {{ error }}
            </div>
            <div v-else class="categories-grid">
                <div v-for="product in products" :key="product.prod_id" class="category-card">
                    <img :src="getProductImage(product)" alt="Yarn product" class="product-image">
                    <p class="product-name">{{ product.prod_name }}</p>
                    <p class="product-category">{{ product.prod_categoryType }}</p>
                    <p class="product-price">₱{{ product.prod_price.toFixed(2) }}</p>
                    <p class="product-weight">Weight: {{ product.yarn.yarn_weight }}</p>
                    <p class="product-thickness">Thickness: {{ product.yarn.yarn_thickness }}</p>
                    
                    <div class="yarn-colors">
                        <select v-model="selectedColors[product.prod_id]" class="color-dropdown">
                            <option value="" disabled>Select Color</option>
                            <option 
                                v-for="color in product.available_colors" 
                                :key="color.color_id" 
                                :value="color.color_id"
                                :style="{ backgroundColor: color.color_hex }">
                                {{ color.color_name }}
                            </option>
                        </select>
                    </div>
                    
                    <p class="product-stock" :class="{ 'low-stock': product.prod_stock < 10 }">
                        Stock: {{ product.prod_stock }}
                    </p>
                    
                    <button 
                        class="add-to-cart-btn" 
                        :disabled="!selectedColors[product.prod_id] || product.prod_stock <= 0"
                        @click="addToCart(product)">
                        Add to cart
                    </button>
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

    onMounted(async () => {
      await fetchUserInfo();

      const { data, error } = await supabase
        .from('product')
        .select('*, yarn(yarn_composition, yarn_weight, yarn_thickness), tool(tool_material, tool_size)');
      if (!error) {
        products.value = data;
      }
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

.logo-container {
    display: flex;
    align-items: center;
}

.logo-img {
    width: 50px;
    height: 50px;
    margin-right: 10px;
}

.logo-text {
    font-size: 24px;
    font-weight: bold;;
}

.search-container {
    flex-grow: 1;
    max-width: 500px;
    margin: 0 20px;
    position: relative;
}

.search-input {
    width: 100%;
    padding: 10px 15px;
    border-radius: 20px;
    border: 2px solid #ddd;
    outline: none;
}

.search-btn {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
}

.nav-icons {
    display: flex;
    gap: 20px;
}

.nav-icon {
    color: var(--text-color);
    cursor: pointer;
}

.nav-img-icon{
    height: 25px;
}
.profile-img {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    object-fit: cover;
}

.sidebar {
    height: 100%;
    width: 350px;
    padding: 20px;
    background-color: var(--background-color);
    border-right: 2px solid var(--light-gray);
}

.sidebar-menu {
    list-style: none;
}


.sidebar-item {
    color: var(--text-color);
    padding: 12px 50px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.sidebar-item:first-child {
    padding-top: 80px;
}

.sidebar-item:last-child {
    border-bottom: none;
    padding-bottom: 100px;
}

.main-content {
    display: flex;
}

.content-area {
    flex-grow: 1;
    padding: 20px;
}

.carousel-container {
    position: relative;
    margin: 30px 0;
    overflow: hidden;
    border-radius: 8px;
}

.carousel-slides {
    margin: auto;
    position: relative;
    width: 85%;
    height: 400px; /* Adjust height as needed */
}

.carousel-slide {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    transition: opacity 0.5s ease-in-out;
}

.carousel-slide.active {
    opacity: 1;
    z-index: 1;
}

.carousel-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.carousel-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 40px;
    color: var(--light-gray);
    z-index: 2;
}

.carousel-title {
    color: var(--highlights);
    font-size: 36px;
    font-weight: bold;
    margin-bottom: 20px;
}

.shop-now-btn {
    background-color: var(--primary-color);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    width: fit-content;
    margin-top: 20px;
}

.carousel-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.7);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 3;
    transition: background 0.3s;
}

.carousel-arrow:hover {
    background: rgba(255, 255, 255, 0.9);
}


.carousel-circle-nav {
    position: absolute;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 15px;
    z-index: 10;
}

.circle-btn {
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.7);
    border: 2px solid white;
    cursor: pointer;
    transition: all 0.3s ease;
    padding: 0;
}

.circle-btn:hover {
    background-color: rgba(255, 255, 255, 0.9);
    transform: scale(1.1);
}

.circle-btn.active {
    background-color: var(--primary-color);
    border-color: white;
    transform: scale(1.2);
}

.circle-btn:focus {
    outline: none;
}


.categories-section {
    margin-top: 40px;
    margin: auto;
    width: 94%;
}

.section-header-yarn {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}
hr{
    border-style: solid;
    height: 2px;
    color: var(--light-gray);
}
.section-title-yarn {
    color: var(--text-color);
    margin: 40px 0 30px 0;
    left: 20px;
    font-size: 24px;
    font-weight: bold;
    position: relative;
}

.section-title-yarn:before {
    content: '';
    width: 10px;
    height: 100%;
    border-radius: 3px;
    background-color: var(--primary-color);
    position: absolute;
    left: -19px;
}

.nav-arrows {
    display: flex;
    gap: 10px;
}

.nav-arrow {
    width: 30px;
    height: 30px;
    border: 1px solid #ddd;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.categories-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 20px;
}

.category-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 8px;
    cursor: pointer;
    transition: transform 0.3s;
}

.category-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.category-icon {
    width: 50px;
    height: 50px;
    margin-bottom: 15px;
}

.category-name {
    text-align: center;
    font-size: 14px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .header {
        flex-direction: column;
        padding: 10px;
    }
    
    .search-container {
        margin: 15px 0;
        max-width: 100%;
    }
    
    .main-content {
        flex-direction: column;
    }
    
    .sidebar {
        width: 100%;
        min-height: auto;
        border-bottom: 1px solid #e0e0e0;
    }
    
    .categories-grid {
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    }
    
    .carousel-slides {
        height: 300px;
    }
}
</style>
