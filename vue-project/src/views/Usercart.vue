<template>
  <div>
    <header>
      <div class="logo-container">
        <router-link to="/home">
          <div class="logo">
            <img src="../views/images/homelogo.jpg" alt="ILoveYarnPH" class="logo-img">
          </div>
          <div class="store-name">ILoveYarnPH | Shopping</div>
        </router-link>
      </div>

      <div class="user-actions">
        <div class="icon-container">
          <div class="icon">
            <img src="../views/images/package.png" alt="Package" class="action-icon">
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
        <div class="user-name">
          <router-link to="/user-details">{{ userAccount?.useracc_fname || 'Guest' }}</router-link>
        </div>
      </div>
    </header>

    <div class="cart-container">
      <h1 class="cart-title">Your Shopping Cart</h1>
      <div v-if="loading" class="loading-spinner">⏳ Loading...</div>
      <div v-else>
        <div v-if="cartItems.length === 0" class="empty-cart">
          <img src="../views/images/shopping-cart.png" alt="Empty cart" class="empty-cart-img">
          <p class="empty-cart-text">Your cart is feeling lonely!</p>
          <router-link to="/" class="continue-shopping-btn">Continue Shopping</router-link>
        </div>
        <div v-else>
          <div class="cart-items">
            <div v-for="item in cartItems" :key="item.cart_item_id" class="cart-item">
              <img 
                :src="item.product.image_url || '../views/images/default-product.png'" 
                :alt="item.product.prod_name" 
                class="product-image"
              >
              <div class="item-details">
                <h3 class="product-name">{{ item.product.prod_name }}</h3>
                <p class="product-category">{{ item.product.prod_categorytype }}</p>
                <div class="price-quantity">
                  <p class="product-price">₱{{ (item.product.prod_price * item.quantity).toFixed(2) }}</p>
                  <div class="quantity-controls">
                    <button 
                      @click="updateQuantity(item, -1)" 
                      class="quantity-btn"
                      :disabled="item.quantity <= 1"
                    >-</button>
                    <span class="quantity">{{ item.quantity }}</span>
                    <button @click="updateQuantity(item, 1)" class="quantity-btn">+</button>
                  </div>
                </div>
                <button @click="removeItem(item)" class="remove-btn">
                  <img src="../views/images/recycle-bin.png" alt="Remove" class="remove-icon">
                </button>
              </div>
            </div>
          </div>
          
          <div class="cart-summary">
            <div class="summary-content">
              <h2 class="summary-title">Order Summary</h2>
              <div class="summary-row">
                <span>Total Items:</span>
                <span>{{ totalItems }}</span>
              </div>
              <div class="summary-row total">
                <span>Total Price:</span>
                <span>₱{{ totalPrice.toFixed(2) }}</span>
              </div>
              <button 
                @click="handleCheckout"
                class="checkout-btn"
                :disabled="cartItems.length === 0"
              >Proceed to Checkout →</button>
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
import { useRouter } from 'vue-router';

export default {
  setup() {
    const router = useRouter();
    const cartItems = ref([]);
    const totalPrice = ref(0);
    const totalItems = ref(0);
    const loading = ref(true);
    const cartCount = ref(0);
    const userAccount = ref(null);

    const getProductImage = (product) => {
      if (product.prod_id === 101) return supabase.storage.from('product_images').getPublicUrl('chunky_yarn.jpg').data.publicUrl;
      if (product.prod_id === 201) return supabase.storage.from('product_images').getPublicUrl('aluminum_hook.jpg').data.publicUrl;
      if (product.prod_id === 102) return supabase.storage.from('product_images').getPublicUrl('102.png').data.publicUrl;
      if (product.prod_id === 103) return supabase.storage.from('product_images').getPublicUrl('103.png').data.publicUrl;
      if (product.prod_id === 104) return supabase.storage.from('product_images').getPublicUrl('104.png').data.publicUrl;
      if (product.prod_id === 105) return supabase.storage.from('product_images').getPublicUrl('105.png').data.publicUrl;
      if (product.prod_id === 106) return supabase.storage.from('product_images').getPublicUrl('106.png').data.publicUrl;
      if (product.prod_id === 107) return supabase.storage.from('product_images').getPublicUrl('107.png').data.publicUrl;
      if (product.prod_id === 108) return supabase.storage.from('product_images').getPublicUrl('108.png').data.publicUrl;
      if (product.prod_id === 109) return supabase.storage.from('product_images').getPublicUrl('109.png').data.publicUrl;
      if (product.prod_id === 110) return supabase.storage.from('product_images').getPublicUrl('110.png').data.publicUrl;
      if (product.prod_id === 111) return supabase.storage.from('product_images').getPublicUrl('111.png').data.publicUrl;
      if (product.prod_id === 112) return supabase.storage.from('product_images').getPublicUrl('112.png').data.publicUrl;
      if (product.prod_id === 113) return supabase.storage.from('product_images').getPublicUrl('113.png').data.publicUrl;
      if (product.prod_id === 114) return supabase.storage.from('product_images').getPublicUrl('114.png').data.publicUrl;
      if (product.prod_id === 115) return supabase.storage.from('product_images').getPublicUrl('115.png').data.publicUrl;
      if (product.prod_id === 116) return supabase.storage.from('product_images').getPublicUrl('116.png').data.publicUrl;
      if (product.prod_id === 117) return supabase.storage.from('product_images').getPublicUrl('117.png').data.publicUrl;
      if (product.prod_id === 118) return supabase.storage.from('product_images').getPublicUrl('118.png').data.publicUrl;
      if (product.prod_id === 119) return supabase.storage.from('product_images').getPublicUrl('119.png').data.publicUrl;
      if (product.prod_id === 120) return supabase.storage.from('product_images').getPublicUrl('120.png').data.publicUrl;
      if (product.prod_id === 121) return supabase.storage.from('product_images').getPublicUrl('121.png').data.publicUrl;
      if (product.prod_id === 125) return supabase.storage.from('product_images').getPublicUrl('125.png').data.publicUrl;
      if (product.prod_id === 202) return supabase.storage.from('product_images').getPublicUrl('202.png').data.publicUrl;
      if (product.prod_id === 203) return supabase.storage.from('product_images').getPublicUrl('203.png').data.publicUrl;
      if (product.prod_id === 204) return supabase.storage.from('product_images').getPublicUrl('204.png').data.publicUrl;
      return '../views/images/default-product.png';
    };

    const getActiveCart = async (userId) => {
      const { data } = await supabase
        .from('cart')
        .select('cart_id')
        .eq('useracc_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);
      return data?.[0]?.cart_id;
    };

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

    const updateCartCount = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: userData } = await supabase
          .from('user_account')
          .select('useracc_id')
          .eq('useracc_email', user.email)
          .single();

        const cartId = await getActiveCart(userData.useracc_id);
        if (!cartId) {
          cartCount.value = 0;
          return;
        }

        const { count } = await supabase
          .from('cart_item')
          .select('*', { count: 'exact', head: true })
          .eq('cart_id', cartId);

        cartCount.value = count || 0;
      } catch (error) {
        console.error('Cart count error:', error);
      }
    };

    const fetchCartItems = async () => {
      try {
        await fetchUserAccount();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Please login');

        const { data: userData } = await supabase
          .from('user_account')
          .select('useracc_id')
          .eq('useracc_email', user.email)
          .single();

        const cartId = await getActiveCart(userData.useracc_id);
        if (!cartId) return;

        const { data } = await supabase
          .from('cart_item')
          .select(`
            cart_item_id, quantity,
            product:prod_id (*)
          `)
          .eq('cart_id', cartId);

        cartItems.value = data.map(item => ({
          ...item,
          product: {
            ...item.product,
            image_url: getProductImage(item.product)
          }
        })) || [];
        calculateTotals();
      } catch (error) {
        console.error('Error:', error);
      } finally {
        loading.value = false;
      }
    };

    const calculateTotals = () => {
      totalItems.value = cartItems.value.reduce((sum, item) => sum + item.quantity, 0);
      totalPrice.value = cartItems.value.reduce((sum, item) => 
        sum + (item.quantity * item.product.prod_price), 0);
    };

    const updateQuantity = async (item, change) => {
      const newQuantity = item.quantity + change;
      if (newQuantity < 1) return;

      try {
        await supabase
          .from('cart_item')
          .update({ quantity: newQuantity })
          .eq('cart_item_id', item.cart_item_id);

        item.quantity = newQuantity;
        calculateTotals();
        await updateCartCount();
      } catch (error) {
        console.error('Error:', error);
      }
    };

    const removeItem = async (item) => {
      try {
        await supabase
          .from('cart_item')
          .delete()
          .eq('cart_item_id', item.cart_item_id);

        cartItems.value = cartItems.value.filter(i => i.cart_item_id !== item.cart_item_id);
        calculateTotals();
        await updateCartCount();
      } catch (error) {
        console.error('Error:', error);
      }
    };

    const handleCheckout = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const { data: userData } = await supabase
          .from('user_account')
          .select('useracc_id')
          .eq('useracc_email', user.email)
          .single();

        const cartId = await getActiveCart(userData.useracc_id);
        router.push(`/transaction/${cartId}`);
      } catch (error) {
        console.error('Checkout error:', error);
        alert('Error proceeding to checkout');
      }
    };

    onMounted(async () => {
      await fetchUserAccount();
      await fetchCartItems();
      await updateCartCount();
    });

    return { 
      cartItems, 
      totalPrice, 
      totalItems, 
      loading, 
      updateQuantity, 
      removeItem, 
      cartCount,
      userAccount,
      handleCheckout
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

        .cart-container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.cart-title {
  font-size: 2rem;
  color: var(--primary-color);
  margin-bottom: 2rem;
  text-align: center;
}

.empty-cart {
  text-align: center;
  padding: 4rem 0;
}

.empty-cart-img {
  width: 200px;
  opacity: 0.8;
  margin-bottom: 1.5rem;
}

.empty-cart-text {
  font-size: 1.2rem;
  color: var(--light-gray);
  margin-bottom: 2rem;
}

.continue-shopping-btn {
  background: var(--primary-color);
  color: white;
  padding: 0.8rem 2rem;
  border-radius: 25px;
  text-decoration: none;
  transition: transform 0.2s;
}

.continue-shopping-btn:hover {
  transform: scale(1.05);
}

.cart-item {
  display: flex;
  gap: 1.5rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.product-image {
  width: 150px;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
}

.item-details {
  flex: 1;
  position: relative;
}

.product-name {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

.product-category {
  color: var(--light-gray);
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.price-quantity {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
}

.product-price {
  font-size: 1.1rem;
  font-weight: bold;
  color: var(--highlights);
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quantity-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #ddd;
  border-radius: 50%;
  background: white;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.quantity-btn:hover {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.quantity-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity {
  min-width: 30px;
  text-align: center;
}

.remove-btn {
  position: absolute;
  top: 0;
  right: 0;
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
}

.remove-icon {
  width: 20px;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.remove-icon:hover {
  opacity: 1;
}

.cart-summary {
  margin-top: 3rem;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.summary-content {
  max-width: 400px;
  margin-left: auto;
}

.summary-title {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.summary-row.total {
  font-size: 1.2rem;
  font-weight: bold;
  border-bottom: none;
  padding-top: 1rem;
}

.checkout-btn {
  width: 100%;
  padding: 1rem;
  background: var(--highlights);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: transform 0.2s;
  margin-top: 1.5rem;
}

.checkout-btn:hover {
  transform: translateY(-2px);
}
</style>