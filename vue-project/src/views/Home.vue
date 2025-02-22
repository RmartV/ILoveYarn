<template>
  <div>
    <header class="header">
      <div class="header-content">
        <div class="logo-container">
          <img src="../views/images/homelogo.jpg" alt="I LOVE YARN PH Logo" class="logo-img">
          <h1 class="logo-text">I LOVE YARN PH</h1>
        </div>
        <div class="search-container">
          <input type="text" class="search-input" placeholder="Search for yarns, hooks, and more...">
          <button class="search-btn" aria-label="Search">
            <img class="nav-img-icon" src="../views/images/magnifying-glass.png" alt="">
          </button>
        </div>
        <div class="nav-icons">
          <div class="nav-icon cart-icon">
            <router-link to="/cart" class="cart-link">
              <img class="nav-img-icon" src="../views/images/shopping-cart.png" alt="Shopping Cart">
              <span class="cart-count" v-if="cartCount">{{ cartCount }}</span>
            </router-link>
          </div>
          <div class="nav-icon user-info">
            <router-link to="/user-details" class="user-link">
              <div class="user-avatar" :style="{ backgroundColor: getUserColor() }">
                {{ userInfo?.userinfo_fname?.charAt(0) || 'G' }}
              </div>
              <span class="user-name">{{ userInfo?.userinfo_fname || 'Guest' }}</span>
            </router-link>
          </div>
        </div>
      </div>
    </header>

    <div class="main-content">
      <aside class="sidebar">
        <nav>
          <ul class="sidebar-menu" role="navigation">
            <li v-for="(category, index) in categories" :key="index"
                class="sidebar-item"
                :class="{ active: currentCategory === category }"
                @click="setCategory(category)">
              {{ category }}
            </li>
          </ul>
        </nav>
      </aside>

      <main class="content-area">
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

        <section class="products-section">
          <header class="products-header">
            <h2 class="page-title">All Products</h2>
            <div class="products-filter">
              <select class="filter-select" v-model="sortBy">
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Name</option>
              </select>
            </div>
          </header>

          <div class="products-container">
            <article v-for="product in sortedProducts" 
                    :key="product.prod_id" 
                    class="product-card"
                    :class="{ 'low-stock': product.prod_stock < 5 }">
              <div class="product-image">
                <img :src="product.image_url || '../views/images/default.png'" 
                     :alt="product.prod_name">
                <span v-if="product.prod_stock < 5" class="stock-badge">Low Stock</span>
              </div>
              <div class="product-details">
                <span class="product-category">{{ product.prod_categorytype }}</span>
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
                <div class="product-price">₱{{ formatPrice(product.prod_price) }}</div>
                <div class="product-stock" :class="{ 'low-stock': product.prod_stock < 5 }">
                  In stock: {{ product.prod_stock }} pcs
                </div>
                <div class="product-actions">
                  <button @click="addToCart(product)" 
                          class="add-to-cart-btn"
                          :disabled="product.prod_stock === 0">
                    {{ product.prod_stock === 0 ? 'Out of Stock' : 'Add to Cart' }}
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
import { ref, computed, onMounted } from 'vue';
import { supabase } from '../lib/supabaseClient';

export default {
  setup() {
    const userInfo = ref(null);
    const products = ref([]);
    const currentCategory = ref('Yarn');
    const sortBy = ref('price-asc');
    const cartCount = ref(3); // This should be dynamic based on actual cart items

    const categories = [
      'Yarn',
      'Crochet Hooks',
      'Decorative Tape',
      'Ribbons',
      'Accessories'
    ];

    // Computed property for sorted products
    const sortedProducts = computed(() => {
      let sorted = [...products.value];
      switch (sortBy.value) {
        case 'price-asc':
          return sorted.sort((a, b) => a.prod_price - b.prod_price);
        case 'price-desc':
          return sorted.sort((a, b) => b.prod_price - a.prod_price);
        case 'name':
          return sorted.sort((a, b) => a.prod_name.localeCompare(b.prod_name));
        default:
          return sorted;
      }
    });

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

    const addToCart = async (product) => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Please login to add items to cart');

        const { error } = await supabase.from('usercart').insert({
          userinfo_id: user.id,
          prod_id: product.prod_id,
          usercart_totalprice: product.prod_price,
          usercart_totalitems: 1
        });

        if (error) throw error;
        cartCount.value++; // Update cart count
        alert('Added to cart successfully!');
      } catch (err) {
        alert(err.message);
      }
    };

    const formatPrice = (price) => {
      return price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    const getUserColor = () => {
      const colors = ['#ff97a7', '#77c275', '#5b8af7', '#f7935b', '#a35bf7'];
      const name = userInfo.value?.userinfo_fname || 'Guest';
      return colors[name.charCodeAt(0) % colors.length];
    };

    const setCategory = (category) => {
      currentCategory.value = category;
      // Here you could add filtering logic based on category
    };

    onMounted(async () => {
      await fetchUserInfo();
      await fetchProducts();
    });

    return {
      userInfo,
      products: sortedProducts,
      categories,
      currentCategory,
      sortBy,
      cartCount,
      addToCart,
      formatPrice,
      getUserColor,
      setCategory
    };
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
  --error-color: #e53e3e;
  --card-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  --transition: all 0.3s ease;
}

/* Base Styles */
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

/* Enhanced Header */
.header {
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 1000;
  padding: 1rem 2rem;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 2rem;
  align-items: center;
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
  white-space: nowrap;
}

/* Enhanced Search */
.search-container {
  position: relative;
  max-width: 600px;
  width: 100%;
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

/* Enhanced Navigation */
.nav-icons {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.cart-link, .user-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: var(--text-color);
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
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  transition: var(--transition);
}

.user-name {
  font-size: 0.9rem;
  font-weight: 500;
}

/* Enhanced Main Layout */
.main-content {
  max-width: 1400px;
  margin: 2rem auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 2rem;
}

/* Enhanced Sidebar */
.sidebar {
  background-color: white;
  border-radius: 12px;
  box-shadow: var(--card-shadow);
  padding: 1.5rem;
  height: fit-content;
  position: sticky;
  top: 100px;
}

.sidebar-menu {
  list-style: none;
}

.sidebar-item {
  padding: 0.875rem 1rem;
  margin-bottom: 0.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
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

/* Enhanced Carousel */
.carousel-container {
  margin-bottom: 2rem;
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
  text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
}

.carousel-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
}

/* Enhanced Products Section */
.products-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.filter-select {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 2px solid var(--border-color);
  background-color: white;
  font-size: 0.9rem;
}

.products-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}

/* Enhanced Product Cards */
.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--card-shadow);
  transition: var(--transition);
  position: relative;
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

.stock-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background-color: var(--error-color);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
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

.product-stock.low-stock {
  color: var(--error-color);
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

.add-to-cart-btn:hover:not(:disabled) {
  background-color: var(--primary-hover);
}

.add-to-cart-btn:disabled {
  background-color: var(--light-gray);
  cursor: not-allowed;
}

@media (max-width: 1024px) {
  .header-content {
    grid-template-columns: auto 1fr;
    gap: 1rem;
  }

  .nav-icons {
    grid-column: 2;
    justify-self: end;
  }

  .search-container {
    grid-column: 1 / -1;
    grid-row: 2;
  }

  .main-content {
    padding: 0 1rem;
    gap: 1.5rem;
  }

  .products-container {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
}

@media (max-width: 768px) {
  .header {
    position: sticky;
    padding: 1rem;
  }

  .main-content {
    grid-template-columns: 1fr;
    margin: 1rem auto;
  }

  .sidebar {
    position: static;
    margin-bottom: 1rem;
  }

  .sidebar-menu {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .sidebar-item {
    margin: 0;
    font-size: 0.9rem;
    white-space: nowrap;
  }

  .carousel-slide {
    height: 300px;
  }

  .carousel-title {
    font-size: 2rem;
  }

  .carousel-subtitle {
    font-size: 1rem;
  }

  .products-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
}

@media (max-width: 480px) {
  .header-content {
    grid-template-columns: 1fr;
  }

  .logo-container {
    justify-content: center;
  }

  .nav-icons {
    grid-column: 1;
    justify-self: center;
  }

  .products-container {
    grid-template-columns: 1fr;
  }

  .product-card {
    max-width: 100%;
  }

  .carousel-overlay {
    padding: 1.5rem;
  }

  .carousel-title {
    font-size: 1.5rem;
  }
}
</style>


  