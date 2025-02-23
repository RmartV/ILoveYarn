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
        
        <div class="nav-icon user-info">
            <span><router-link to="/user-details">{{ userAccount?.useracc_fname || 'Guest' }}</router-link></span>
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
router-link{
text-decoration: none;
}
        .header {
    background-color: var(--primary-color);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px 30px;
    border-bottom: 2px solid var(--light-gray);
    height: 80px; /* Added fixed height */
}

.logo-container {
    display: flex;
    align-items: center;
    min-width: 200px; /* Added minimum width */
}

.logo-img {
    width: 50px;
    height: 50px;
    margin-right: 10px;
}

        .logo-text {
            color: white;
            font-size: 24px;
            font-weight: bold;
            text-decoration: none;
        }

        .search-container {
    flex: 0 1 500px; /* Modified flex property */
    margin: 0 40px; /* Increased margin */
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
    gap: 30px;
    align-items: center;
    min-width: 150px; /* Added minimum width */
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

        .user-avatar {
    width: auto; /* Increased and matched with height */
    height: auto; /* Increased and matched with width */
    border-radius: 50%;
    background-color: #ddd;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 16px; /* Added to ensure text fits well */
}

.user-info {
    display: flex;
    align-items: center;
    gap: 12px; /* Adjusted gap */
    margin-left: 10px;
}

        .main-content {
            display: flex;
        }

        .sidebar {
            height: 100vh;
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
            padding: 12px 15px;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-radius: 8px;
            transition: background-color 0.3s;
        }

        .sidebar-item:first-child {
            margin-top: 80px;
        }

        .sidebar-item:hover {
            background-color: rgba(254, 177, 191, 0.2);
        }

        .sidebar-item.active {
            background-color: var(--primary-color);
            color: white;
        }

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