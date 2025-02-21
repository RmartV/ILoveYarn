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
            <div class="user-avatar">{{ userInfo?.userinfo_fname.charAt(0) || 'G' }}</div>
            <span style="width: auto">{{ userInfo?.userinfo_fname || 'Guest' }}</span>
        </router-link>
          </div>
        </div>
      </header>
  
      <div class="main-content">
        <div class="sidebar">
          <ul class="sidebar-menu">
            <li class="sidebar-item active">Yarn</li>
            <li class="sidebar-item">Crochet Hooks</li>
            <li class="sidebar-item">Decorative Tape</li>
            <li class="sidebar-item">Ribbons</li>
            <li class="sidebar-item">Sewing Threads</li>
            <li class="sidebar-item">Accessories</li>
          </ul>
        </div>
  
        <div class="content-area">
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

        .cart-icon {
            position: relative;
        }

        .cart-count {
            position: absolute;
            top: -10px;
            right: -10px;
            background-color: var(--highlights);
            color: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
        }

        .nav-img-icon {
            height: 25px;
        }

        .user-info {
            width: 30px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .user-avatar {
            width: 35px;
            height: 35px;
            border-radius: 50%;
            background-color: #ddd;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
        }

        .main-content {
            display: flex;
        }

        .sidebar {
            height: 100vh;
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
            padding: 12px 15px;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-radius: 8px;
            transition: background-color 0.3s;
        }

        .sidebar-item:first-child {
            margin-top: 20px;
        }

        .sidebar-item:hover {
            background-color: rgba(254, 177, 191, 0.2);
        }

        .sidebar-item.active {
            background-color: var(--primary-color);
            color: white;
        }

        .content-area {
            flex-grow: 1;
            padding: 20px;
            min-height: 100vh;
        }

        .page-title {
            margin-bottom: 20px;
            font-size: 24px;
            color: var(--text-color);
            display: flex;
            align-items: center;
        }

        .page-title::before {
            content: '';
            width: 5px;
            height: 24px;
            background-color: var(--primary-color);
            margin-right: 10px;
            border-radius: 3px;
        }

        .products-container {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
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

        .product-image {
            height: 200px;
            width: 100%;
            background-color: #f5f5f5;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }

        .product-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .product-details {
            padding: 15px;
        }

        .product-category {
            font-size: 12px;
            color: var(--light-gray);
            text-transform: uppercase;
            margin-bottom: 5px;
        }

        .product-name {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 8px;
            color: var(--text-color);
        }

        .product-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-bottom: 12px;
        }

        .meta-item {
            background-color: #f5f5f5;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            color: var(--light-gray);
        }

        .product-price {
            font-weight: bold;
            font-size: 18px;
            color: var(--text-color);
            margin-bottom: 15px;
        }

        .product-stock {
            font-size: 14px;
            color: var(--light-gray);
            margin-bottom: 15px;
        }

        .product-actions {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .add-to-cart-btn {
            background-color: var(--primary-color);
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.3s;
            font-weight: bold;
        }

        .add-to-cart-btn:hover {
            background-color: #e99ca9;
        }

        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 30px 0 20px;
        }

        .section-title {
            font-size: 20px;
            color: var(--text-color);
            position: relative;
            padding-left: 15px;
        }

        .section-title::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            height: 100%;
            width: 5px;
            background-color: var(--primary-color);
            border-radius: 3px;
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
                height: auto;
                border-right: none;
                border-bottom: 2px solid var(--light-gray);
            }
            
            .products-container {
                grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
            }
        }
  </style>
  