<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Modern Header -->
    <header class="fixed w-full top-0 bg-white/80 backdrop-blur-md shadow-sm z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <router-link to="/home" class="flex items-center space-x-3">
            <img src="../views/images/homelogo.jpg" alt="I LOVE YARN PH Logo" class="h-10 w-10 rounded-full">
            <span class="text-xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
              I LOVE YARN PH
            </span>
          </router-link>

          <!-- Search -->
          <div class="flex-1 max-w-lg mx-8">
            <div class="relative">
              <input 
                type="text" 
                class="w-full pl-4 pr-10 py-2 rounded-full border border-gray-200 focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition-all"
                placeholder="Search products..."
              >
              <button class="absolute right-3 top-1/2 -translate-y-1/2">
                <img src="../views/images/magnifying-glass.png" alt="Search" class="w-5 h-5 opacity-60">
              </button>
            </div>
          </div>

          <!-- Nav Icons -->
          <div class="flex items-center space-x-6">
            <router-link to="/user-cart" class="relative">
              <img src="../views/images/shopping-cart.png" alt="Cart" class="w-6 h-6">
              <span v-if="cartCount" class="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {{ cartCount }}
              </span>
            </router-link>
            
            <router-link to="/user-details" class="flex items-center space-x-3">
              <div class="w-8 h-8 rounded-full bg-gradient-to-r from-pink-400 to-rose-400 flex items-center justify-center text-white font-medium">
                {{ userAccount?.useracc_fname?.charAt(0) || 'G' }}
              </div>
              <span class="text-sm font-medium text-gray-700">
                {{ userAccount?.useracc_fname || 'Guest' }}
              </span>
            </router-link>
          </div>
        </div>
      </div>
    </header>

    <div class="flex pt-16">
      <!-- Sidebar -->
      <aside class="w-64 fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 overflow-y-auto">
        <nav class="p-4">
          <ul class="space-y-2">
            <li v-for="category in ['Yarn', 'Crochet Hooks', 'Decorative Tape', 'Ribbons', 'Accessories']" 
                :key="category"
                class="group">
              <a href="#" 
                 :class="[
                   'block px-4 py-2 rounded-lg text-sm font-medium transition-all',
                   category === 'Yarn' 
                     ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white' 
                     : 'text-gray-600 hover:bg-pink-50 hover:text-pink-600'
                 ]">
                {{ category }}
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 ml-64 p-6">
        <!-- Hero Carousel -->
        <section class="mb-8 rounded-2xl overflow-hidden bg-gradient-to-r from-pink-100 to-rose-100">
          <div class="relative h-[400px]">
            <img 
              src="../views/images/slide1.png" 
              alt="Featured Collection" 
              class="w-full h-full object-cover"
            >
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
              <div class="p-8 text-white max-w-2xl">
                <h1 class="text-4xl font-bold mb-3">Discover Our Collection</h1>
                <p class="text-lg opacity-90">Premium yarns and tools for your creative projects</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Products Grid -->
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-gray-800 mb-6">All Products</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <div v-for="product in products" 
                 :key="product.prod_id" 
                 class="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div class="aspect-square overflow-hidden">
                <img 
                  :src="product.image_url || '../views/images/default.png'" 
                  :alt="product.prod_name"
                  class="w-full h-full object-cover transform hover:scale-105 transition-transform"
                >
              </div>
              
              <div class="p-4">
                <div class="text-xs text-gray-500 mb-1">{{ product.prod_categorytype }}</div>
                <h3 class="font-medium text-gray-900 mb-2">{{ product.prod_name }}</h3>
                
                <div class="flex flex-wrap gap-2 mb-3">
                  <template v-if="product.prod_categorytype === 'YARN'">
                    <span v-for="detail in [product.yarn.yarn_composition, product.yarn.yarn_weight, product.yarn.yarn_thickness]"
                          :key="detail"
                          class="px-2 py-1 bg-pink-50 text-pink-600 rounded-full text-xs">
                      {{ detail }}
                    </span>
                  </template>
                  <!-- Similar templates for other product types -->
                </div>

                <div class="flex items-center justify-between mb-4">
                  <span class="text-lg font-bold text-gray-900">₱{{ product.prod_price.toFixed(2) }}</span>
                  <span class="text-sm text-gray-500">{{ product.prod_stock }} left</span>
                </div>

                <button @click="addToCart(product)" 
                        class="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-2 rounded-lg font-medium hover:from-pink-600 hover:to-rose-600 transition-all">
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
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
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root {
  --primary-gradient: linear-gradient(to right, #EC4899, #F43F5E);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Inter', sans-serif;
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #EC4899;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #F43F5E;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

/* Custom focus styles */
input:focus, 
button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.3);
}

/* Hover effects */
.hover-scale {
  transition: transform 0.2s ease-in-out;
}

.hover-scale:hover {
  transform: scale(1.05);
}
</style>