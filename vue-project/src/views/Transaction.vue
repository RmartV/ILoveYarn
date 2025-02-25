<template>
  <div>
    <header>
      <div class="logo-container">
        <router-link to="/home">
          <div class="logo">
            <img src="../views/images/homelogo.jpg" alt="ILoveYarnPH" class="logo-img">
          </div>
          <div class="store-name">ILoveYarnPH | Checkout</div>
        </router-link>
      </div>
      <div class="user-actions">
        <!-- Reuse your header user actions -->
      </div>
    </header>

    <div class="checkout-container">
      <div v-if="loading" class="loading-spinner">Loading checkout details...</div>
      <div v-else class="checkout-content">
        <!-- Order Summary Section -->
        <div class="order-summary">
          <h2>Order Summary</h2>
          <div class="order-items">
            <div v-for="item in cartItems" :key="item.cart_item_id" class="order-item">
              <img :src="item.product.image_url" :alt="item.product.prod_name" class="product-image">
              <div class="item-info">
                <h3>{{ item.product.prod_name }}</h3>
                <p>Quantity: {{ item.quantity }}</p>
                <p>₱{{ (item.product.prod_price * item.quantity).toFixed(2) }}</p>
              </div>
            </div>
          </div>
          <div class="total-summary">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>₱{{ subtotal.toFixed(2) }}</span>
            </div>
            <div class="total-row">
              <span>Shipping Fee:</span>
              <span>₱{{ shippingFee.toFixed(2) }}</span>
            </div>
            <div class="total-row grand-total">
              <span>Grand Total:</span>
              <span>₱{{ grandTotal.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <!-- Shipping and Payment Section -->
        <div class="payment-section">
          <!-- Shipping Address Edit -->
          <div class="shipping-address">
            <h2>Shipping Address</h2>
            <div class="address-form">
              <div class="form-group">
                <label>Delivery Address</label>
                <textarea 
                  v-model="userAddress"
                  rows="3"
                  required
                  class="form-input"
                  placeholder="Enter full address including street, city, and zip code"
                ></textarea>
              </div>
              <div class="form-group">
                <label>Phone Number</label>
                <input 
                  type="tel"
                  v-model="userPhone"
                  pattern="[0-9]{11}"
                  required
                  class="form-input"
                  placeholder="09XXXXXXXXX"
                >
              </div>
            </div>
          </div>

          <!-- Payment Method Selection -->
          <h2>Payment Method</h2>
          <form @submit.prevent="handlePayment" class="payment-form">
            <div class="payment-methods">
              <label class="payment-option">
                <input 
                  type="radio" 
                  v-model="paymentMethod" 
                  value="COD" 
                  required
                >
                <div class="payment-card">
                  <span>Cash on Delivery</span>
                </div>
              </label>
              <label class="payment-option">
                <input 
                  type="radio" 
                  v-model="paymentMethod" 
                  value="E-WALLET" 
                  required
                >
                <div class="payment-card">
                  <span>E-Wallet</span>
                </div>
              </label>
            </div>

            <button 
              type="submit" 
              class="confirm-button"
              :disabled="processing"
            >
              {{ processing ? 'Processing...' : 'Confirm Payment' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { supabase } from '../lib/supabaseClient';
import { useRoute, useRouter } from 'vue-router';

export default {
  setup() {
    const route = useRoute();
    const router = useRouter();
    const cartId = route.params.cartId;
    
    // Reactive state
    const cartItems = ref([]);
    const paymentMethod = ref('COD');
    const processing = ref(false);
    const subtotal = ref(0);
    const grandTotal = ref(0);
    const shippingFee = ref(50.00);
    const userAddress = ref('');
    const userPhone = ref('');
    const loading = ref(true);

    const getProductImage = (product) => {
      // Replicate image logic from user_cart.vue
      if (product.prod_id === 101) return supabase.storage.from('product_images').getPublicUrl('chunky_yarn.jpg').data.publicUrl;
      if (product.prod_id === 201) return supabase.storage.from('product_images').getPublicUrl('aluminum_hook.jpg').data.publicUrl;
      if (product.prod_id === 102) return supabase.storage.from('product_images').getPublicUrl('102.png').data.publicUrl;
      // Add all your product image mappings here...
      return '../views/images/default-product.png';
    };

    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from('user_account')
          .select('useracc_address, useracc_phone')
          .eq('useracc_email', user.email)
          .single();

        if (data) {
          userAddress.value = data.useracc_address || '';
          userPhone.value = data.useracc_phone || '';
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        alert('Failed to load user information');
      }
    };

    const fetchCartItems = async () => {
      try {
        if (!cartId) {
          alert('Invalid cart');
          router.push('/user-cart');
          return;
        }

        const { data } = await supabase
          .from('cart_item')
          .select(`
            cart_item_id, quantity,
            product:prod_id (*)
          `)
          .eq('cart_id', cartId);

        cartItems.value = data?.map(item => ({
          ...item,
          product: {
            ...item.product,
            image_url: getProductImage(item.product)
          }
        })) || [];
        
        // Calculate totals
        subtotal.value = cartItems.value.reduce((sum, item) => 
          sum + (item.quantity * item.product.prod_price), 0);
        grandTotal.value = subtotal.value + shippingFee.value;
      } catch (error) {
        console.error('Error loading cart items:', error);
        alert('Failed to load cart items');
      }
    };

    const updateUserAddress = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
          .from('user_account')
          .update({
            useracc_address: userAddress.value,
            useracc_phone: userPhone.value
          })
          .eq('useracc_email', user.email);

        if (error) throw error;
      } catch (error) {
        console.error('Error updating address:', error);
        throw error;
      }
    };

    const handlePayment = async () => {
      processing.value = true;
      try {
        if (!userAddress.value.trim()) {
          throw new Error('Please enter a valid delivery address');
        }

        await updateUserAddress();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        // Get user's database ID
        const { data: userData } = await supabase
          .from('user_account')
          .select('useracc_id')
          .eq('useracc_email', user.email)
          .single();

        const transactionData = {
          useracc_id: userData.useracc_id,
          total_amount: grandTotal.value,
          payment_method: paymentMethod.value,
          status: 'PROCESSING',
          shipping_fee: shippingFee.value,
          shipping_address: userAddress.value,
          contact_number: userPhone.value
        };

        const { data: transaction, error } = await supabase
          .from('transaction')
          .insert(transactionData)
          .select()
          .single();

        if (error) throw error;

        const transactionItems = cartItems.value.map(item => ({
          transaction_id: transaction.transaction_id,
          prod_id: item.product.prod_id,
          quantity: item.quantity,
          price: item.product.prod_price
        }));

        await supabase.from('transaction_item').insert(transactionItems);

        for (const item of cartItems.value) {
          await supabase.rpc('decrement_stock', {
            product_id: item.product.prod_id,
            decrement_by: item.quantity
          });
        }

        await supabase
          .from('cart_item')
          .delete()
          .eq('cart_id', cartId);

        router.push('/order-confirmation');

      } catch (error) {
        console.error('Payment error:', error);
        alert(error.message || 'Payment processing failed');
      } finally {
        processing.value = false;
      }
    };

    onMounted(async () => {
      try {
        await fetchUserData();
        await fetchCartItems();
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        loading.value = false;
      }
    });

    return {
      cartItems,
      paymentMethod,
      processing,
      subtotal,
      grandTotal,
      shippingFee,
      userAddress,
      userPhone,
      handlePayment,
      loading
    };
  }
};
</script>

<style scoped>
/* Add your existing styles here */
.loading-spinner {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #666;
}

.checkout-container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.checkout-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.order-summary, .payment-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.product-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
}

.order-item {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.total-summary {
  margin-top: 2rem;
}

.total-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.grand-total {
  font-weight: bold;
  font-size: 1.1rem;
  margin-top: 1rem;
}

.form-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-top: 0.5rem;
}

.confirm-button {
  width: 100%;
  padding: 1rem;
  background: #77c275;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1.1rem;
  cursor: pointer;
  margin-top: 1rem;
}

.confirm-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>