<template>
    <div class="app-container">
      <header class="header">
        <div class="logo-container">
          <img src="css/homelogo.jpg" alt="I LOVE YARN PH Logo" class="logo-img">
          <h1 class="logo-text">I LOVE YARN PH</h1>
        </div>
  
        <div class="search-container">
          <input type="text" class="search-input" placeholder="What are you looking for?">
          <button class="search-btn"><img class="nav-img-icon" src="css/magnifying-glass.png"></button>
        </div>
  
        <div class="nav-icons">
          <div class="nav-icon" @click="goToCart">
            <img class="nav-img-icon" src="css/shopping-cart.png">
            <span v-if="cartItems.length" class="cart-badge">{{ getTotalItems() }}</span>
          </div>
          <div class="nav-icon user-info" v-if="currentUser">
            <p>{{ currentUser.userinfo_fname }} {{ currentUser.userinfo_lname }}</p>
          </div>
        </div>
      </header>
  
      <!-- Main Content Area -->
      <div class="main-content">
        <!-- Sidebar -->
        <div class="sidebar">
          <ul class="sidebar-menu">
            <li class="sidebar-item" @click="filterByCategory('YARN')">Yarn <i class="fas fa-chevron-right"></i></li>
            <li class="sidebar-item" @click="filterByCategory('TOOL')">Crochet Hooks <i class="fas fa-chevron-right"></i></li>
            <li class="sidebar-item" @click="filterByCategory('TAPE')">Decorative Tape <i class="fas fa-chevron-right"></i></li>
            <li class="sidebar-item" @click="filterByCategory('RIBBONS')">Ribbons <i class="fas fa-chevron-right"></i></li>
            <li class="sidebar-item" @click="filterByCategory('THREAD')">Sewing Threads <i class="fas fa-chevron-right"></i></li>
            <li class="sidebar-item" @click="filterByCategory('ACCESSORIES')">Accessories <i class="fas fa-chevron-right"></i></li>
          </ul>
        </div>
  
        <!-- Content Area -->
        <div class="content-area">
          <!-- Carousel -->
          <div class="carousel-container">
            <div class="carousel-slides">
              <div class="carousel-slide active">
                <img src="css/slide1.png" alt="Yarn Collection 1" class="carousel-image">
                <div class="carousel-overlay">
                  <h2 class="carousel-title">Up to 10% off Voucher</h2>
                  <button class="shop-now-btn">Shop Now</button>
                </div>
              </div>
            </div>
          </div>
  
          <!-- Categories Section -->
          <div class="categories-section">
            <hr>
            <div class="section-header-yarn">
              <h3 class="section-title-yarn">{{ selectedCategory || 'All Products' }}</h3>
              <div class="view-more">
                <a href="/all-products">View more</a>
              </div>
            </div>
  
            <div class="products-grid">
              <div v-for="product in filteredProducts" :key="product.prod_id" class="product-card">
                <div class="product-image">
                  <img src="css/product-placeholder.jpg" alt="Product Image" class="product-img">
                </div>
                <div class="product-name">{{ product.prod_name }}</div>
                <div class="product-price">₱{{ product.prod_price.toFixed(2) }}</div>
                <div v-if="product.prod_categoryType === 'YARN' && product.yarnDetails" class="product-details">
                  <div class="yarn-weight">Weight: {{ product.yarnDetails.yarn_weight }}</div>
                  <div class="yarn-composition">Composition: {{ product.yarnDetails.yarn_composition }}</div>
                </div>
                <div class="product-stock">{{ product.prod_stock }} in stock</div>
                <button 
                  class="add-to-cart-btn" 
                  @click="addToCart(product)"
                  :disabled="product.prod_stock <= 0"
                >
                  {{ product.prod_stock > 0 ? 'Add to cart' : 'Out of stock' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted, computed } from 'vue';
  import { createClient } from '@supabase/supabase-js';
  
  export default {
    setup() {
      const products = ref([]);
      const yarnDetails = ref([]);
      const cartItems = ref([]);
      const currentUser = ref(null);
      const selectedCategory = ref('');
  
      // Fetch current user
      const fetchCurrentUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('userinfo')
            .select('*')
            .eq('userinfo_email', user.email)
            .single();
          
          if (data && !error) {
            currentUser.value = data;
          }
        }
      };
  
      // Fetch products and yarn details
      const fetchProducts = async () => {
        const { data: productsData, error: productsError } = await supabase
          .from('product')
          .select('*');
        
        if (productsData && !productsError) {
          products.value = productsData;
          
          // Fetch yarn details for yarn products
          const yarnProducts = productsData.filter(p => p.prod_categoryType === 'YARN');
          if (yarnProducts.length) {
            const yarnIds = yarnProducts.map(p => p.prod_id);
            const { data: yarnData, error: yarnError } = await supabase
              .from('yarn')
              .select('*')
              .in('prod_id', yarnIds);
            
            if (yarnData && !yarnError) {
              yarnDetails.value = yarnData;
              
              // Merge yarn details with products
              products.value = products.value.map(product => {
                const yarn = yarnDetails.value.find(y => y.prod_id === product.prod_id);
                return {
                  ...product,
                  yarnDetails: yarn || null
                };
              });
            }
          }
        }
      };
  
      // Fetch cart items
      const fetchCartItems = async () => {
        if (currentUser.value) {
          const { data, error } = await supabase
            .from('usercart')
            .select(`
              usercart_id,
              usercart_totalprice,
              usercart_totalitems,
              product (
                prod_id,
                prod_name,
                prod_categoryType,
                prod_price,
                prod_stock
              )
            `)
            .eq('userinfo_id', currentUser.value.userinfo_id);
          
          if (data && !error) {
            cartItems.value = data.map(item => ({
              id: item.usercart_id,
              product: item.product,
              quantity: item.usercart_totalitems,
              totalPrice: item.usercart_totalprice
            }));
          }
        }
      };
  
      // Filter products by category
      const filterByCategory = (category) => {
        selectedCategory.value = category;
      };
  
      const filteredProducts = computed(() => {
        if (!selectedCategory.value) return products.value;
        return products.value.filter(p => p.prod_categoryType === selectedCategory.value);
      });
  
      // Add product to cart
      const addToCart = async (product) => {
        if (!currentUser.value) {
          alert('Please login to add items to cart');
          return;
        }
  
        // Check if item already exists in cart
        const existingCartItem = cartItems.value.find(
          item => item.product.prod_id === product.prod_id
        );
  
        if (existingCartItem) {
          // Update quantity if item exists
          const { error } = await supabase
            .from('usercart')
            .update({ 
              usercart_totalitems: existingCartItem.quantity + 1,
              usercart_totalprice: (existingCartItem.quantity + 1) * product.prod_price
            })
            .eq('usercart_id', existingCartItem.id);
          
          if (!error) {
            existingCartItem.quantity += 1;
            existingCartItem.totalPrice = existingCartItem.quantity * product.prod_price;
          }
        } else {
          // Add new item to cart
          const { data, error } = await supabase
            .from('usercart')
            .insert({
              userinfo_id: currentUser.value.userinfo_id,
              prod_id: product.prod_id,
              usercart_totalitems: 1,
              usercart_totalprice: product.prod_price
            })
            .select();
          
          if (data && !error) {
            cartItems.value.push({
              id: data[0].usercart_id,
              product: product,
              quantity: 1,
              totalPrice: product.prod_price
            });
          }
        }
      };
  
      // Get total items in cart
      const getTotalItems = () => {
        return cartItems.value.reduce((total, item) => total + item.quantity, 0);
      };
  
      // Navigate to cart page
      const goToCart = () => {
        window.location.href = '/cart';
      };
  
      onMounted(() => {
        fetchCurrentUser();
        fetchProducts();
        fetchCartItems();
      });
  
      return {
        products,
        currentUser,
        cartItems,
        selectedCategory,
        filteredProducts,
        addToCart,
        filterByCategory,
        getTotalItems,
        goToCart
      };
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
  
  .app-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
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
    font-weight: bold;
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
    align-items: center;
  }
  
  .nav-icon {
    color: var(--text-color);
    cursor: pointer;
    position: relative;
  }
  
  .user-info {
    background-color: rgba(255, 255, 255, 0.3);
    padding: 5px 10px;
    border-radius: 20px;
  }
  
  .cart-badge {
    position: absolute;
    top: -8px;
    right: -8px;
    background-color: var(--highlights);
    color: white;
    font-size: 12px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .nav-img-icon {
    height: 25px;
  }
  
  .main-content {
    display: flex;
    flex-grow: 1;
  }
  
  .sidebar {
    height: 100%;
    width: 250px;
    padding: 20px;
    background-color: var(--background-color);
    border-right: 2px solid var(--light-gray);
  }
  
  .sidebar-menu {
    list-style: none;
  }
  
  .sidebar-item {
    color: var(--text-color);
    padding: 12px 20px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .sidebar-item:first-child {
    padding-top: 50px;
  }
  
  .sidebar-item:hover {
    background-color: rgba(0, 0, 0, 0.05);
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
    height: 400px;
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
  
  hr {
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
  
  .view-more a {
    color: var(--primary-color);
    text-decoration: none;
    font-weight: bold;
  }
  
  .products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 20px;
  }
  
  .product-card {
    display: flex;
    flex-direction: column;
    padding: 15px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: white;
    transition: transform 0.3s, box-shadow 0.3s;
  }
  
  .product-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
  
  .product-image {
    width: 100%;
    height: 180px;
    margin-bottom: 10px;
    overflow: hidden;
    border-radius: 4px;
  }
  
  .product-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .product-name {
    font-weight: bold;
    margin-bottom: 5px;
  }
  
  .product-price {
    color: var(--primary-color);
    font-weight: bold;
    margin-bottom: 10px;
  }
  
  .product-details {
    font-size: 12px;
    color: var(--light-gray);
    margin-bottom: 10px;
  }
  
  .product-stock {
    font-size: 12px;
    color: var(--light-gray);
    margin-bottom: 10px;
  }
  
  .add-to-cart-btn {
    background-color: var(--primary-color);
    color: white;
    border: none;
    padding: 8px 0;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    margin-top: auto;
  }
  
  .add-to-cart-btn:hover {
    background-color: #e99dab;
  }
  
  .add-to-cart-btn:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
  
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
    
    .products-grid {
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    }
    
    .carousel-slides {
      height: 300px;
    }
  }
  </style>