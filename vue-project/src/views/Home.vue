<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-pink-200 p-4 shadow-md">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-4">
          <router-link to="/home" class="flex items-center gap-4">
            <img :src="require('../views/images/homelogo.jpg')" alt="Logo" class="w-12 h-12 rounded-full">
            <h1 class="text-2xl font-bold">I LOVE YARN PH</h1>
          </router-link>
        </div>
        
        <!-- Centered Search Bar -->
        <div class="flex-1 max-w-2xl mx-8">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="What are you looking for?"
              class="w-full px-4 py-2 rounded-full border-2 border-pink-300 focus:outline-none focus:border-pink-400"
            >
            <img src="../views/images/magnifying-glass.png" alt="Search" class="absolute right-4 top-2.5 w-5 h-5">
          </div>
        </div>
        
        <div class="flex items-center gap-6">
          <router-link to="/user-cart" class="relative">
            <img src="../views/images/shopping-cart.png" alt="Cart" class="w-6 h-6">
            <span class="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {{ cartCount }}
            </span>
          </router-link>
          <router-link to="/my-orders">
            <img src="../views/images/package.png" alt="My Orders" class="w-6 h-6">
          </router-link>
          <router-link to="/user-details" class="flex items-center gap-2">
            <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              {{ userAccount?.useracc_fname?.charAt(0) || 'G' }}
            </div>
            <span>{{ userAccount?.useracc_fname || 'Guest' }}</span>
          </router-link>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto mt-6 flex gap-6">
      <!-- Improved Sidebar with Filters -->
      <aside class="w-64 bg-white p-4 rounded-lg shadow-sm">
        <h2 class="text-lg font-semibold mb-4">Categories</h2>
        <div v-for="category in categories" :key="category.name" class="mb-4">
          <div class="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              :id="category.name"
              v-model="selectedCategories[category.name.toLowerCase()]"
              class="w-4 h-4 text-pink-500"
            >
            <label :for="category.name" class="font-medium">{{ category.name }}</label>
          </div>
          <div v-if="selectedCategories[category.name.toLowerCase()]" class="ml-6 space-y-2">
            <div v-for="sub in category.subCategories" :key="sub" class="flex items-center gap-2">
              <input type="checkbox" :id="sub" v-model="selectedSubCategories[sub]" class="w-3 h-3 text-pink-400">
              <label :for="sub" class="text-sm">{{ sub }}</label>
            </div>
          </div>
        </div>
        
        <div class="mt-6">
          <h2 class="text-lg font-semibold mb-4">Price Range</h2>
          <div class="space-y-2">
            <input
              type="range"
              v-model="priceRange"
              min="0"
              max="1000"
              class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            >
            <div class="flex justify-between text-sm text-gray-600">
              <span>₱{{ priceRange[0] }}</span>
              <span>₱{{ priceRange[1] }}</span>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="flex-1 bg-white p-6 rounded-lg shadow-sm">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold">All Products</h2>
          <select v-model="sortBy" class="border p-2 rounded-lg">
            <option value="featured">Sort by: Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="newest">Newest</option>
          </select>
        </div>
        
        <!-- Product Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="product in filteredProducts" :key="product.prod_id" class="border rounded-lg p-4 hover:shadow-lg transition-shadow">
            <div class="product-image">
              <img :src="product.image_url || '../views/images/default.png'" :alt="product.prod_name" class="w-full h-48 object-cover rounded-lg mb-4">
            </div>
            <div class="product-details">
              <div class="product-category text-gray-600 text-sm">{{ product.prod_categorytype }}</div>
              <h3 class="font-semibold">{{ product.prod_name }}</h3>
              <div v-if="product.prod_categorytype === 'YARN'" class="product-meta">
                <span class="meta-item">{{ product.yarn.yarn_composition }}</span>
                <span class="meta-item">{{ product.yarn.yarn_weight }}</span>
                <span class="meta-item">{{ product.yarn.yarn_thickness }}</span>
              </div>
              <div class="font-bold mt-2">₱{{ product.prod_price.toFixed(2) }}</div>
              <button @click="addToCart(product)" class="w-full mt-4 bg-pink-200 hover:bg-pink-300 py-2 rounded-lg font-medium transition-colors">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { supabase } from '../lib/supabaseClient';

export default {
  setup() {
    const userAccount = ref(null);
    const products = ref([]);
    const cartCount = ref(0);
    const searchQuery = ref('');
    const sortBy = ref('featured');
    const priceRange = ref([0, 1000]);

    const categories = [
      { name: 'Yarn', subCategories: ['Cotton', 'Acrylic', 'Wool', 'Blend'] },
      { name: 'Hooks', subCategories: ['Aluminum', 'Plastic', 'Steel'] },
      { name: 'Tape', subCategories: ['Washi', 'Decorative', 'Pattern'] },
      { name: 'Ribbons', subCategories: ['Satin', 'Grosgrain', 'Velvet'] },
      { name: 'Accessories', subCategories: ['Stitch Markers', 'Scissors', 'Needles'] }
    ];

    const selectedCategories = ref({
      yarn: false,
      hooks: false,
      tape: false,
      ribbons: false,
      accessories: false
    });

    const selectedSubCategories = ref({});

    const filteredProducts = computed(() => {
      return products.value.filter(product => {
        // Apply search filter
        if (searchQuery.value && !product.prod_name.toLowerCase().includes(searchQuery.value.toLowerCase())) {
          return false;
        }
        
        // Apply category filter
        if (Object.values(selectedCategories.value).some(val => val)) {
          if (!selectedCategories.value[product.prod_categorytype.toLowerCase()]) {
            return false;
          }
        }
        
        // Apply price filter
        if (product.prod_price < priceRange.value[0] || product.prod_price > priceRange.value[1]) {
          return false;
        }
        
        return true;
      }).sort((a, b) => {
        // Apply sorting
        switch (sortBy.value) {
          case 'price-asc':
            return a.prod_price - b.prod_price;
          case 'price-desc':
            return b.prod_price - a.prod_price;
          case 'newest':
            return new Date(b.createdAt) - new Date(a.createdAt);
          default:
            return 0;
        }
      });
    });

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

    return {
      userAccount,
      products,
      cartCount,
      searchQuery,
      sortBy,
      priceRange,
      categories,
      selectedCategories,
      selectedSubCategories,
      filteredProducts,
      addToCart
    };
  }
};
</script>

<style>
.product-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 8px 0;
}

.meta-item {
  background-color: #f5f5f5;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #646464;
}

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