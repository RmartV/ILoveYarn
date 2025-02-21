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
                <div v-for="product in yarnProducts" :key="product.prod_id" class="category-card">
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
.product-card {
  border: 1px solid #ddd;
  padding: 10px;
  margin: 10px;
  display: inline-block;
}
</style>
