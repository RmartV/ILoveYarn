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
        <section class="carousel-container" aria-label="Featured Products">
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
              <div class="product-meta" v-if="product.prod_categorytype === 'YARN'">
                <span class="meta-item">{{ product.yarn.yarn_composition }}</span>
                <span class="meta-item">{{ product.yarn.yarn_weight }}</span>
                <span class="meta-item">{{ product.yarn.yarn_thickness }}</span>
              </div>
              <div class="product-meta" v-if="product.prod_categorytype === 'TOOL'">
                <span class="meta-item">{{ product.tool.tool_material }}</span>
                <span class="meta-item">{{ product.tool.tool_size }}</span>
              </div>
              <div class="product-meta" v-if="product.prod_categorytype === 'TAPE'">
                <span class="meta-item">{{ product.tape.tape_type}}</span>
                <span class="meta-item">{{ product.tape.tape_length }}</span>
                <span class="meta-item">{{ product.tape.tape_size }}</span>
              </div>
              <div class="product-meta" v-if="product.prod_categorytype === 'ACCESSORIES'">
                <span class="meta-item">{{ product.accs.accs_category }}</span>
                <span class="meta-item">{{ product.accs.accs_quantity }}</span>
              </div>
              <div class="product-meta" v-if="product.prod_categorytype === 'RIBBONS'">
                <span class="meta-item">{{ product.ribbons.ribbons_length }}</span>
                <span class="meta-item">{{ product.ribbons.ribbons_thickness }}</span>
                <span class="meta-item">{{ product.ribbons.ribbons_material }}</span>
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
  box-shadow: 0 2px 15px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.logo-container {
  gap: 12px;
}

.logo-text {
  font-family: 'Brush Script MT', cursive;
  color: #ffffff;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
}

/* Enhanced Search Bar */
.search-container {
  max-width: 600px;
}

.search-input {
  padding: 12px 25px;
  font-size: 1rem;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.search-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 8px rgba(254, 177, 191, 0.3);
}

/* Improved Navigation Icons */
.nav-icons {
  gap: 30px;
}

.nav-img-icon {
  transition: transform 0.2s ease;
}

.nav-img-icon:hover {
  transform: scale(1.1);
}

.user-avatar {
  background: linear-gradient(45deg, #ff758c, #ff7eb3);
  color: white;
  font-size: 1.2rem;
}

/* Modern Sidebar */
.sidebar {
  background: linear-gradient(to bottom right, #ffffff, #fff5f7);
  padding: 30px 25px;
}

.sidebar-item {
  margin: 8px 0;
  font-weight: 500;
  color: #4a4a4a;
}

.sidebar-item.active {
  background: linear-gradient(to right, var(--primary-color), #ff9eb1);
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

/* Enhanced Product Cards */
.product-card {
  position: relative;
  overflow: visible;
}

.product-card::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, var(--primary-color), #ff9eb1, white);
  z-index: -1;
  border-radius: 12px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.product-card:hover::before {
  opacity: 1;
}

.product-image {
  height: 250px;
  position: relative;
}

.product-image img {
  transition: transform 0.3s ease;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

/* Better Price Display */
.product-price {
  color: #e91e63;
  font-size: 1.25rem;
  margin: 15px 0;
}

/* Improved Add to Cart Button */
.add-to-cart-btn {
  position: relative;
  overflow: hidden;
  padding: 10px 20px;
  transition: all 0.3s ease;
}

.add-to-cart-btn::after {
  content: '→';
  position: absolute;
  right: -20px;
  transition: right 0.3s ease;
}

.add-to-cart-btn:hover {
  padding-right: 40px;
}

.add-to-cart-btn:hover::after {
  right: 15px;
}

/* Better Category Chips */
.meta-item {
  background: rgba(254, 177, 191, 0.15);
  color: #e91e63;
  font-weight: 500;
}

/* Enhanced Carousel */
.carousel-overlay {
  backdrop-filter: blur(3px);
}

.carousel-title {
  font-size: 2.8rem;
  letter-spacing: -1px;
}

/* Responsive Improvements */
@media (max-width: 768px) {
  .logo-text {
    font-size: 1.5rem;
  }
  
  .user-info span {
    display: none;
  }
  
  .sidebar {
    padding: 20px 15px;
  }
  
  .product-card {
    margin: 0 10px;
  }
}
  </style>