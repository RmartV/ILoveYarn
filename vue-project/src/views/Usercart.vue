<template>
  <div>
    <header class="header">
      <!-- Reuse the same header from home.vue -->
    </header>

    <div class="cart-container">
      <h1>Your Cart</h1>
      <div v-if="loading">Loading...</div>
      <div v-else>
        <div v-if="cartItems.length === 0" class="empty-cart">
          Your cart is empty
        </div>
        <div v-else>
          <div v-for="item in cartItems" :key="item.cart_item_id" class="cart-item">
            <div class="item-info">
              <h3>{{ item.product.prod_name }}</h3>
              <p>Price: ₱{{ item.product.prod_price.toFixed(2) }}</p>
              <p>Quantity: {{ item.quantity }}</p>
            </div>
          </div>
          <div class="cart-summary">
            <p>Total Items: {{ totalItems }}</p>
            <p>Total Price: ₱{{ totalPrice.toFixed(2) }}</p>
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
    const cartItems = ref([]);
    const totalPrice = ref(0);
    const totalItems = ref(0);
    const loading = ref(true);
    const userInfo = ref(null);

    const fetchUserInfo = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase
        .from('userinfo')
        .select('userinfo_id')
        .eq('userinfo_email', user.email)
        .single();
      return data;
    };

    const fetchCartData = async () => {
      try {
        userInfo.value = await fetchUserInfo();
        
        // Fetch latest order
        const { data: order } = await supabase
          .from('orders')
          .select('*')
          .eq('userinfo_id', userInfo.value.userinfo_id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (order) {
          totalPrice.value = order.total_amount;
          
          // Fetch cart items
          const { data: items } = await supabase
            .from('cartitems')
            .select('*, product:prod_id(*)')
            .eq('userinfo_id', userInfo.value.userinfo_id);

          cartItems.value = items;
          totalItems.value = items.reduce((sum, item) => sum + item.quantity, 0);
        }
      } catch (error) {
        console.error('Error fetching cart data:', error);
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      fetchCartData();
    });

    return { cartItems, totalPrice, totalItems, loading };
  }
};
</script>

<style scoped>
.cart-container {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.cart-item {
  border: 1px solid #ddd;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 8px;
}

.item-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cart-summary {
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  text-align: right;
}

.empty-cart {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #666;
}
</style>