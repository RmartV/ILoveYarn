<template>
  <div class="shop-container">
        <header class="header">
          <div class="header-content">
            <div class="logo-container">
              <router-link to="/home" class="logo-link">
                <img src="../views/images/homelogo.jpg" alt="I LOVE YARN PH Logo" class="logo-img">
                <h1 class="logo-text">I LOVE YARN PH</h1>
              </router-link>
            </div>
            
            <div class="search-container">
              <input 
                v-model="searchQuery"
                type="text" 
                class="search-input" 
                placeholder="What are you looking for?"
              >
              <button class="search-btn">
                <img class="search-icon" src="../views/images/magnifying-glass.png" alt="Search">
              </button>
            </div>
  
            <div class="nav-icons">
              <router-link to="/user-cart" class="cart-icon">
                <img class="nav-img-icon" src="../views/images/shopping-cart.png" alt="Cart">
                <span class="cart-count" v-if="cartCount > 0">{{ cartCount }}</span>
              </router-link>
              
              
                <div class="user-avatar">
                  <router-link to="/user-details" class="user-info">
                  {{ userAccount?.useracc_fname?.charAt(0) || 'G' }}
                  </router-link>
                </div>
                <router-link to="/user-details" class="user-info">
                <span class="user-name">{{ userAccount?.useracc_fname || 'Guest' }}</span>
              </router-link>
            </div>
          </div>
        </header>
  
        <div class="main-content">
          <aside class="sidebar">
            <nav class="category-nav">
              <h2 class="nav-title">Categories</h2>
              <ul class="category-menu">
                <li class="category-item active">Yarn</li>
                <li class="category-item">Crochet Hooks</li>
                <li class="category-item">Decorative Tape</li>
                <li class="category-item">Ribbons</li>
                <li class="category-item">Accessories</li>
              </ul>
            </nav>
          </aside>
  
          <main class="content-area">
            <section class="hero-carousel" aria-label="Featured Products">
              <div class="carousel-slide">
                <img src="../views/images/slide1.png" alt="Featured Yarn Collection" class="carousel-image">
                <div class="carousel-content">
                  <h2 class="carousel-title">Discover Our Collection</h2>
                  <p class="carousel-subtitle">Premium yarns and tools for your creative projects</p>
                </div>
              </div>
            </section>
  
            <section class="products-section">
              <h2 class="section-title">All Products</h2>
              <div class="products-grid">
                <article 
                  v-for="product in products" 
                  :key="product.prod_id" 
                  class="product-card"
                >
                  <div class="product-image">
                    <img :src="product.image_url || '../views/images/default.png'" :alt="product.prod_name">
                  </div>
                  
                  <div class="product-content">
                    <span class="product-category">{{ product.prod_categorytype }}</span>
                    <h3 class="product-name">{{ product.prod_name }}</h3>
                    
                    <div class="product-meta" v-if="product.prod_categorytype === 'YARN'">
                      <span class="meta-tag">{{ product.yarn.yarn_composition }}</span>
                      <span class="meta-tag">{{ product.yarn.yarn_weight }}</span>
                      <span class="meta-tag">{{ product.yarn.yarn_thickness }}</span>
                    </div>
                    
                    <div class="product-meta" v-if="product.prod_categorytype === 'TOOL'">
                      <span class="meta-tag">{{ product.tool.tool_material }}</span>
                      <span class="meta-tag">{{ product.tool.tool_size }}</span>
                    </div>
                    
                    <div class="product-footer">
                      <div class="price-stock">
                        <span class="product-price">₱{{ product.prod_price.toFixed(2) }}</span>
                        <span class="stock-info">{{ product.prod_stock }} in stock</span>
                      </div>
                      <button 
                        @click="addToCart(product)" 
                        class="add-cart-btn"
                        :disabled="product.prod_stock === 0"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </article>
              </div>
            </section>
          </main>
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
          .select('*, yarn(yarn_composition, yarn_weight, yarn_thickness), tool(tool_material, tool_size)');
  
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
    --primary-hover: #e99ca9;
    --background-color: #f8f9fae7;
    --text-color: #2d3436;
    --light-gray: #a0a0a0;
    --success-color: #77c275;
    --border-radius: 12px;
    --shadow-sm: 0 2px 4px rgba(0,0,0,0.05);
    --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
    --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
    --container-max-width: 1400px;
  }
  
  /* Header Styles */
  .header {
  background-color: var(--primary-color);
  padding: 0.75rem 2rem;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: var(--container-max-width);
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

/* Logo Container */
.logo-container {
  display: flex;
  align-items: center;
  min-width: 200px; /* Ensure minimum width for logo */
}

.logo-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: var(--text-color);
}

.logo-img {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.logo-text {
  font-size: 1.5rem;
  margin-left: 0.75rem;
  color: white;
  white-space: nowrap;
}

/* Search Container */
.search-container {
  flex: 1;
  max-width: 500px;
  margin: 0 2rem;
  position: relative;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  padding-right: 3rem;
  border-radius: 20px;
  border: none;
  font-size: 0.95rem;
}

.search-input:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
}

.search-btn {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
}

.search-icon {
  width: 20px;
  height: 20px;
  opacity: 0.6;
}

/* Nav Icons */
.nav-icons {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  min-width: 200px; /* Ensure minimum width for nav icons */
  justify-content: flex-end;
}

.cart-icon {
  position: relative;
  text-decoration: none;
}

.nav-img-icon {
  height: 25px;
  filter: brightness(0) invert(1); /* Make icons white */
}

.cart-count {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: var(--success-color);
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: white;
}

.user-avatar {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.user-name {
  font-size: 0.9rem;
  font-weight: 500;
  color: white;
}
  
  /* Main Content Layout */
  .main-content {
    display: flex;
    max-width: var(--container-max-width);
    margin: 0 auto;
    padding: 2rem;
    gap: 2rem;
  }
  
  /* Sidebar */
  .sidebar {
    width: 280px;
    flex-shrink: 0;
  }
  
  .category-nav {
    background-color: white;
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-sm);
    overflow: hidden;
  }
  
  .nav-title {
    padding: 1.5rem;
    margin: 0;
    font-size: 1.25rem;
    border-bottom: 1px solid #eee;
  }
  
  .category-menu {
    list-style: none;
    padding: 1rem 0;
  }
  
  .category-item {
    padding: 0.75rem 1.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 500;
  }
  
  .category-item:hover {
    background-color: rgba(254, 177, 191, 0.1);
  }
  
  .category-item.active {
    background-color: var(--primary-color);
    color: white;
  }
  
  /* Content Area */
  .content-area {
    flex: 1;
    min-width: 0;
  }
  
  /* Hero Carousel */
  .hero-carousel {
    border-radius: var(--border-radius);
    overflow: hidden;
    margin-bottom: 2rem;
    box-shadow: var(--shadow-md);
  }
  
  .carousel-slide {
    position: relative;
    height: 400px;
  }
  
  .carousel-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .carousel-content {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 3rem;
    background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
    color: white;
  }
  
  .carousel-title {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
  }
  
  /* Products Grid */
  .products-section {
    margin-top: 2rem;
  }
  
  .section-title {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
    position: relative;
    padding-left: 1rem;
  }
  
  .section-title::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 24px;
    background-color: var(--primary-color);
    border-radius: 2px;
  }
  
  .products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
  }
  
  /* Product Cards */
  .product-card {
    background-color: white;
    border-radius: var(--border-radius);
    overflow: hidden;
    box-shadow: var(--shadow-sm);
    transition: all 0.3s ease;
  }
  
  .product-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
  }
  
  .product-image {
    height: 240px;
    width: 100%;
    overflow: hidden;
  }
  
  .product-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }
  
  .product-card:hover .product-image img {
    transform: scale(1.05);
  }
  
  .product-content {
    padding: 1.5rem;
  }
  
  .product-category {
    font-size: 0.75rem;
    text-transform: uppercase;
    color: var(--light-gray);
    letter-spacing: 0.5px;
  }
  
  .product-name {
    margin: 0.5rem 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-color);
  }
  
  .product-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin: 1rem 0;
  }
  
  .meta-tag {
    background-color: #f8f9fa;
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
    font-size: 0.75rem;
    color: var(--light-gray);
  }
  
  .product-footer {
    margin-top: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .price-stock {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .product-price {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-color);
  }
  
  .stock-info {
    font-size: 0.75rem;
    color: var(--light-gray);
  }
  
  .add-cart-btn {
    background-color: var(--primary-color);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: var(--border-radius);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .add-cart-btn:hover {
    background-color: var(--primary-hover);
  }
  
  .add-cart-btn:disabled {
    background-color: var(--light-gray);
    cursor: not-allowed;
  }
  
  /* Responsive Design */
  @media (max-width: 1200px) {
    .header-content {
      padding: 0 1rem;
    }
  
    .main-content {
      padding: 1.5rem;
    }
  
    .products-grid {
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    }
  }
  
  @media (max-width: 992px) {
    .sidebar {
      width: 240px;
    }
  
    .carousel-slide {
      height: 350px;
    }
  
    .carousel-title {
      font-size: 2rem;
    }
  }
  
  @media (max-width: 768px) {
    .header-content {
      flex-direction: column;
      gap: 1rem;
      padding: 1rem;
    }
  
    .search-container {
      width: 100%;
      max-width: none;
      margin: 0;
    }
  
    .nav-icons {
      width: 100%;
      justify-content: space-between;
    }
  
    .main-content {
      flex-direction: column;
      padding: 1rem;
    }
  
    .sidebar {
      width: 100%;
      margin-bottom: 1.5rem;
    }
  
    .category-nav {
      position: relative;
    }
  
    .category-menu {
      display: flex;
      overflow-x: auto;
      padding: 0.5rem;
      gap: 0.5rem;
      -webkit-overflow-scrolling: touch;
    }
  
    .category-item {
      white-space: nowrap;
      padding: 0.5rem 1rem;
      border-radius: var(--border-radius);
    }
  
    .products-grid {
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
    }
  
    .product-image {
      height: 200px;
    }
  
    .product-content {
      padding: 1rem;
    }
  
    .carousel-slide {
      height: 300px;
    }
  
    .carousel-content {
      padding: 1.5rem;
    }
  
    .carousel-title {
      font-size: 1.75rem;
    }
  }
  
  @media (max-width: 480px) {
    .logo-text {
      font-size: 1.25rem;
    }
  
    .user-name {
      display: none;
    }
  
    .products-grid {
      grid-template-columns: 1fr;
    }
  
    .product-card {
      max-width: 100%;
    }
  
    .carousel-slide {
      height: 250px;
    }
  
    .carousel-title {
      font-size: 1.5rem;
    }
  
    .carousel-subtitle {
      font-size: 0.875rem;
    }
  
    .product-footer {
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;
    }
  
    .add-cart-btn {
      width: 100%;
    }
  
    .meta-tag {
      font-size: 0.7rem;
      padding: 0.2rem 0.5rem;
    }
  }
  
  /* Animation keyframes */
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  /* Add smooth loading animation to products */
  .product-card {
    animation: fadeIn 0.3s ease-out;
  }
  
  /* Improve focus styles for accessibility */
  :focus {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }
  
  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb {
    background: var(--primary-color);
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: var(--primary-hover);
  }

  @media (max-width: 992px) {
  .header {
    padding: 0.75rem 1rem;
  }
  
  .search-container {
    margin: 0 1rem;
  }
}

@media (max-width: 768px) {
  .header-content {
    gap: 1rem;
  }

  .logo-container {
    min-width: auto;
  }

  .nav-icons {
    min-width: auto;
  }

  .user-name {
    display: none;
  }
}

@media (max-width: 480px) {
  .header {
    padding: 0.75rem;
  }

  .logo-text {
    display: none;
  }

  .search-container {
    margin: 0 0.5rem;
  }
}
  
  </style>