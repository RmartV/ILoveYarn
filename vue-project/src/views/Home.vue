<template>
    <!-- Header -->
    <header>
        <div class="logo-container">
          <router-link to="/home">
            <div class="logo">
              <img src="../views/images/homelogo.jpg" alt="ILoveYarnPH" class="logo-img">
            </div>
            <div class="store-name">ILoveYarnPH</div>
          </router-link>
        </div>
        <div class="search-container">
            <input type="text" class="search-bar" placeholder="Search for yarn products...">
        </div>
        <div class="user-actions">
          <div class="icon-container">
    <router-link to="/feedback" class="nav-link">
      <img src="../views/images/review.png" alt="Feedback" class="action-icon">
    </router-link>
  </div>
            <div class="icon-container">
                <div class="icon">
                  <router-link to="/order-history" class="nav-link">
                    <img src="../views/images/package.png" alt="Orders" class="action-icon">
                  </router-link>
                </div>
            </div>
            <div class="icon-container">
                <div class="icon">
                  <router-link to="/user-cart">
                    <img src="../views/images/shopping-cart.png" alt="Cart" class="action-icon">
                  </router-link>
                </div>
                <div class="cart-count">{{ cartCount }}</div>
            </div>
            <div class="user-name"><router-link to="/user-details">{{ userAccount?.useracc_fname || 'Guest' }}</router-link></div>
        </div>
    </header>

    <!-- Main Content -->
    <div class="main-container">
        <!-- Sidebar -->
        <div class="sidebar">
            <h3>Categories</h3>
            <ul>
                <li><a href="#">YARN</a></li>
                <li><a href="#">TOOLS</a></li>
                <li><a href="#">DECORATIVE TAPE</a></li>
                <li><a href="#">RIBBONS</a></li>
                <li><a href="#">ACCESSORIES</a></li>
            </ul>
        </div>
        
        <div class="content-area">
            <!-- Welcome Board (Formerly Carousel) -->
            <section class="welcome-board-container" aria-label="Welcome">
              <div class="welcome-board">
                <img src="../views/images/slide1.png" alt="Featured Yarn Collection" class="welcome-image">
                <div class="welcome-overlay">
                  <h2 class="welcome-title">Welcome to ILoveYarnPH</h2>
                  <p class="welcome-subtitle">Premium yarns and tools for your creative projects</p>
                  <button class="shop-now-button">Shop Now</button>
                </div>
              </div>
            </section>
            
            <!-- Product Display -->
            <div class="product-container">
                <h2 class="product-heading">Featured Products</h2>
                <div class="products-grid">
                    <!-- Product  -->
                    <div v-for="product in products" :key="product.prod_id" class="product-card">
                        <div class="product-image"><img :src="product.image_url || '../views/images/default.png'" alt="Product Image"></div>
                        <div class="product-details">
                            <div class="product-name">{{ product.prod_name }}</div>
                            <div class="product-type">{{ product.prod_categorytype }}</div>
                            <div class="product-description" v-if="product.prod_categorytype === 'YARN'">
                              {{ product.yarn?.yarn_composition }} • {{ product.yarn?.yarn_weight }} • {{ product.yarn?.yarn_thickness }}
                            </div>

                            <div class="product-description" v-if="product.prod_categorytype === 'TOOL'">
                              {{ product.tool?.tool_material }} • {{ product.tool?.tool_size }}
                            </div>

                            <div class="product-description" v-if="product.prod_categorytype === 'TAPE'">
                              {{ product.tape?.tape_type}} • {{ product.tape?.tape_length }} • {{ product.tape?.tape_size }}
                            </div>

                            <div class="product-description" v-if="product.prod_categorytype === 'ACCESSORIES'">
                              {{ product.accs?.accs_category }} • {{ product.accs?.accs_quantity }}
                            </div>

                            <div class="product-description" v-if="product.prod_categorytype === 'RIBBONS'">
                              {{ product.ribbons?.ribbons_length }} • {{ product.ribbons?.ribbons_thickness }} • {{ product.ribbons?.ribbons_material }}
                            </div>

                            <div class="stock-info">In stock: {{ product.prod_stock }}</div>
                            <div class="product-price">₱{{ product.prod_price.toFixed(2) }}</div>
                            <button @click="addToCart(product)" class="product-button":disabled="product.prod_stock === 0":class="{ 'disabled-button': product.prod_stock === 0 }">
                            {{ product.prod_stock === 0 ? 'Out of Stock' : 'Add to Cart' }}</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <footer>
        <div class="footer-content">
            <div class="footer-section">
                <h3>About ILoveYarnPH</h3>
                <p>We are a Philippine-based yarn store dedicated to providing high-quality yarns and accessories for all your crafting needs. Established in 2020, we've been serving the Filipino crafting community with love.</p>
            </div>
            <div class="footer-section">
                <h3>Quick Links</h3>
                <ul>
                    <li><a href="#">Facebook</a></li>
                    <li><a href="#">Instagram</a></li>
                    <li><a href="#">Shopee</a></li>
                    <li><a href="#">About us</a></li>
                </ul>
            </div>
            <div class="footer-section">
                <h3>Contact Us</h3>
                <p>Email: info@iloveyarnph.com</p>
                <p>Phone: +63 912 345 6789</p>
                <p>Address: 123 Craft Street, Manila, Philippines</p>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2025 ILoveYarnPH. All Rights Reserved.</p>
        </div>
    </footer>
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

    // Get user account info
    const fetchUserAccount = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from('user_account')
          .select('useracc_id, useracc_fname')
          .eq('useracc_email', user.email)
          .single();

        userAccount.value = data;
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    // Get active cart ID
    const getActiveCart = async (userId) => {
      const { data } = await supabase
        .from('cart')
        .select('cart_id')
        .eq('useracc_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

      return data?.[0]?.cart_id;
    };

    // Add to cart function
    const addToCart = async (product) => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Please login to add items to cart');

        // Get user ID
        const userId = userAccount.value.useracc_id;
        
        // Get or create cart
        let cartId = await getActiveCart(userId);
        if (!cartId) {
          const { data: newCart, error } = await supabase
            .from('cart')
            .insert([{ useracc_id: userId }])
            .select();
          
          if (error) throw error;
          cartId = newCart[0].cart_id;
        }

        // Add/update item in cart
        const { error } = await supabase
          .from('cart_item')
          .upsert({
            cart_id: cartId,
            prod_id: product.prod_id,
            quantity: 1
          }, {
            onConflict: 'cart_id,prod_id', // Match the constraint name
            ignoreDuplicates: false
          });

        if (error) throw error;
        
        // Update cart count
        const { count } = await supabase
          .from('cart_item')
          .select('*', { count: 'exact', head: true })
          .eq('cart_id', cartId);

        cartCount.value = count || 0;
        
        alert(`${product.prod_name} added to cart!`);
      } catch (error) {
        console.error('Cart error:', error);
        alert(error.message);
      }
    };

    // Get product image
    const getProductImage = (product) => {
      if (product.prod_id === 101) {
        return supabase.storage.from('product_images').getPublicUrl('chunky_yarn.jpg').data.publicUrl;
      } else if (product.prod_id === 201) {
        return supabase.storage.from('product_images').getPublicUrl('aluminum_hook.jpg').data.publicUrl;
      } else if (product.prod_id === 102) {
        return supabase.storage.from('product_images').getPublicUrl('102.png').data.publicUrl;
      } else if (product.prod_id === 103) {
        return supabase.storage.from('product_images').getPublicUrl('103.png').data.publicUrl;      
      } else if (product.prod_id === 104) {
        return supabase.storage.from('product_images').getPublicUrl('104.png').data.publicUrl;
      } else if (product.prod_id === 105) {
        return supabase.storage.from('product_images').getPublicUrl('105.png').data.publicUrl;         
      } else if (product.prod_id === 106) {
        return supabase.storage.from('product_images').getPublicUrl('106.png').data.publicUrl;         
      } else if (product.prod_id === 107) {
        return supabase.storage.from('product_images').getPublicUrl('107.png').data.publicUrl;         
      } else if (product.prod_id === 108) {
        return supabase.storage.from('product_images').getPublicUrl('108.png').data.publicUrl;
      } else if (product.prod_id === 109) {
        return supabase.storage.from('product_images').getPublicUrl('109.png').data.publicUrl; 
      } else if (product.prod_id === 110) {
        return supabase.storage.from('product_images').getPublicUrl('110.png').data.publicUrl;
      } else if (product.prod_id === 111) {
        return supabase.storage.from('product_images').getPublicUrl('111.png').data.publicUrl;
      } else if (product.prod_id === 112) {
        return supabase.storage.from('product_images').getPublicUrl('112.png').data.publicUrl;
      } else if (product.prod_id === 113) {
        return supabase.storage.from('product_images').getPublicUrl('113.png').data.publicUrl;      
      } else if (product.prod_id === 114) {
        return supabase.storage.from('product_images').getPublicUrl('114.png').data.publicUrl;     
      } else if (product.prod_id === 115) {
        return supabase.storage.from('product_images').getPublicUrl('115.png').data.publicUrl;
      } else if (product.prod_id === 116) {
        return supabase.storage.from('product_images').getPublicUrl('116.png').data.publicUrl; 
      } else if (product.prod_id === 117) {
        return supabase.storage.from('product_images').getPublicUrl('117.png').data.publicUrl;
      } else if (product.prod_id === 118) {
        return supabase.storage.from('product_images').getPublicUrl('118.png').data.publicUrl;      
      } else if (product.prod_id === 119) {
        return supabase.storage.from('product_images').getPublicUrl('119.png').data.publicUrl;     
      } else if (product.prod_id === 120) {
        return supabase.storage.from('product_images').getPublicUrl('120.png').data.publicUrl;
      } else if (product.prod_id === 121) {
        return supabase.storage.from('product_images').getPublicUrl('121.png').data.publicUrl; 
      } else if (product.prod_id === 125) {
        return supabase.storage.from('product_images').getPublicUrl('125.png').data.publicUrl; 
      } else if (product.prod_id === 202) {
        return supabase.storage.from('product_images').getPublicUrl('202.png').data.publicUrl; 
      } else if (product.prod_id === 203) {
        return supabase.storage.from('product_images').getPublicUrl('203.png').data.publicUrl; 
      } else if (product.prod_id === 204) {
        return supabase.storage.from('product_images').getPublicUrl('204.png').data.publicUrl; 
      }
      return '../views/images/default.png';
    };

    // Fetch products
    const fetchProducts = async () => {
  const { data, error } = await supabase
    .from('product')
    .select(`
      *,
      yarn(*),
      tool(*),
      tape(*),
      ribbons(*),
      accessories(*)
    `);

  if (!error) {
    products.value = data.map(product => ({
      ...product,
      image_url: getProductImage(product)
    }));
  }
};

    // Initial load
    onMounted(async () => {
      await fetchUserAccount();
      await fetchProducts();
    });

    return {
      userAccount,
      products,
      addToCart,
      cartCount,
      searchQuery
    };
  }
};
</script>
  
  <style>
        :root {
            --primary-color: #feb1bf;
            --highlights: #ff8da1;
            --background-color: #F2F2F2;
            --text-color: rgb(0, 0, 0);
            --light-gray: #646464;
            --green: #77c275;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Arial', sans-serif;
        }

        body {
            background-color: #f9f9f9;
        }

         
        header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 30px;
            background-color: var(--primary-color);
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            position: sticky;
            top: 0;
            z-index: 100;
        }

        .product-button.out-of-stock {
  background-color: #cccccc !important;
  cursor: not-allowed;
  opacity: 0.7;
}

.product-button.out-of-stock:hover {
  transform: none;
  box-shadow: none;
}


        .logo-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
}

.action-icon {
    width: 20px;
    height: 20px;
    object-fit: contain;
}

.logo {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #f0c4e0;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

.logo-container {
    display: flex;
    align-items: center;
    gap: 15px;
}

.logo-container a {
    display: flex;
    align-items: center;
    text-decoration: none;
}

        .store-name {
            font-size: 22px;
            font-weight: bold;
            color: var(--background-color);
        }

        .search-container {
            flex: 1;
            max-width: 500px;
            margin: 0 30px;
        }

        .search-bar {
            width: 100%;
            padding: 10px 15px;
            border: 2px solid #e0e0e0;
            border-radius: 25px;
            outline: none;
            font-size: 16px;
        }

        .search-bar:focus {
            border-color: #ff8da1;
        }

        .user-actions {
    display: flex;
    align-items: center;
    gap: 15px;
}

.icon-container {
    position: relative;
    cursor: pointer;
}

.icon {
    width: 25px;
    height: 25px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.main-container {
    display: flex;
    min-height: calc(100vh - 140px);
}

.content-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    width: calc(100% - 250px);
}

.welcome-board-container {
    margin: 1.5rem;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    height: 350px;
    width: calc(100% - 3rem);
}

.welcome-board {
    height: 100%;
    position: relative;
    display: flex;
    align-items: center;
}

.welcome-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.welcome-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 2.5rem;
    background: linear-gradient(to right, rgba(0,0,0,0.7) 20%, transparent 70%);
    color: white;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
}

.welcome-title {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    max-width: 60%;
}

.welcome-subtitle {
    font-size: 1.2rem;
    opacity: 0.9;
    margin-bottom: 1.5rem;
    max-width: 50%;
}

.shop-now-button {
    background-color: var(--highlights);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 30px;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.shop-now-button:hover {
    background-color: #ff7a92;
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}

        .cart-count {
            position: absolute;
            top: -8px;
            right: -8px;
            background-color: #ff4081;
            color: white;
            font-size: 12px;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .user-name a{
          text-decoration: none;
        }
        .user-name {
            color:white;
            font-size: 14px;
            font-weight: bold;
        }

        /* Main Content Styles */

        /* Sidebar Styles */
        .sidebar {
    width: 250px;
    background-color: #ffffff;
    padding: 20px;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.05);
    flex-shrink: 0;
}

        .sidebar h3 {
            font-size: 18px;
            margin-bottom: 15px;
            color: #ff8da1;
            border-bottom: 2px solid #f0c4e0;
            padding-bottom: 10px;
        }

        .sidebar ul {
            list-style: none;
        }

        .sidebar li {
            margin-bottom: 15px;
        }

        .sidebar a {
            text-decoration: none;
            color: #555;
            font-size: 16px;
            transition: color 0.3s;
            display: block;
            padding: 5px 0;
        }

        .sidebar a:hover {
            color: #ff8da1;
        }

        /* Product Display Styles */
        .product-container {
    padding: 20px;
    width: 100%;
}

        .product-heading {
            font-size: 24px;
            margin-bottom: 20px;
            color: #333;
        }

        .products-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
            gap: 25px;
        }

        .product-card {
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s;
            height: 100%;
            display: flex;
            flex-direction: column;
        }

        .product-card:hover {
            transform: translateY(-5px);
        }

        .product-image {
            height: 250px;
            background-color: #f5f5f5;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #666;
            position: relative;
            overflow: hidden;
        }

        .product-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center;
        }

        .image-dimensions {
            position: absolute;
            bottom: 5px;
            right: 5px;
            background-color: rgba(0, 0, 0, 0.6);
            color: white;
            font-size: 10px;
            padding: 2px 5px;
            border-radius: 3px;
        }

        .product-details {
            padding: 15px;
            flex-grow: 1;
            display: flex;
            flex-direction: column;
        }

        .product-name {
            font-size: 16px;
            font-weight: 500;
            margin-bottom: 8px;
            color: #333;
        }

        .product-type {
            font-size: 13px;
            color: #ff8da1;
            margin-bottom: 8px;
        }

        .product-description {
            background-color: #f9f5fd;
            border: 1px solid #e6d5f5;
            border-radius: 4px;
            padding: 8px;
            font-size: 12px;
            color: #666;
            margin-bottom: 10px;
            line-height: 1.4;
        }

        .product-price {
            font-size: 18px;
            font-weight: bold;
            color: #8a2be2;
            margin-bottom: 10px;
        }

        .product-rating {
            display: flex;
            color: #ffc107;
            font-size: 14px;
            margin-bottom: 10px;
        }

        .stock-info {
            font-size: 13px;
            color: #666;
            margin-bottom: 10px;
        }

        .product-button {
            background-color: var(--primary-color);
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            transition: background-color 0.3s;
            width: 100%;
            margin-top: auto;
        }

        .product-button:hover {
            background-color: #ff8da1;
        }

        /* Footer Styles */
        footer {
            background-color: #333;
            color: white;
            padding: 30px 50px;
        }

        .footer-content {
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 30px;
        }

        .footer-section {
            flex: 1;
            min-width: 200px;
        }

        .footer-section h3 {
            font-size: 18px;
            margin-bottom: 15px;
            color: #f0c4e0;
            border-bottom: 2px solid #ff8da1;
            padding-bottom: 10px;
            display: inline-block;
        }

        .footer-section p {
            margin-bottom: 10px;
            line-height: 1.5;
            font-size: 14px;
        }

        .footer-section ul {
            list-style: none;
        }

        .footer-section li {
            margin-bottom: 8px;
        }

        .footer-section a {
            text-decoration: none;
            color: #ddd;
            font-size: 14px;
            transition: color 0.3s;
        }

        .footer-section a:hover {
            color: #f0c4e0;
        }

        .footer-bottom {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #555;
            font-size: 14px;
        }

        
        @media (max-width: 768px) {
    .main-container {
        flex-direction: column;
    }
    
    .sidebar {
        width: 100%;
    }
    
    .content-area {
        width: 100%;
    }
    
    .welcome-board-container {
        height: 300px;
    }
    
    .welcome-title {
        font-size: 2rem;
        max-width: 80%;
    }
    
    .welcome-subtitle {
        font-size: 1rem;
        max-width: 70%;
    }
}

@media (max-width: 480px) {
    .welcome-board-container {
        height: 250px;
    }
    
    .welcome-overlay {
        background: linear-gradient(to right, rgba(0,0,0,0.8) 40%, transparent 100%);
    }
    
    .welcome-title {
        font-size: 1.5rem;
        max-width: 100%;
    }
    
    .welcome-subtitle {
        font-size: 0.9rem;
        max-width: 100%;
    }
}
  </style>