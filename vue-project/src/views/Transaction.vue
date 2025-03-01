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

        const { data: userData } = await supabase
          .from('user_account')
          .select('useracc_id')
          .eq('useracc_email', user.email)
          .single();

        // Create transaction
        const { data: transaction, error: transError } = await supabase
          .from('transaction')
          .insert({
            useracc_id: userData.useracc_id,
            total_amount: grandTotal.value,
            payment_method: paymentMethod.value,
            status: 'PROCESSING',
            shipping_fee: shippingFee.value,
            shipping_address: userAddress.value,
            contact_number: userPhone.value
          })
          .select()
          .single();

        if (transError) throw transError;

        // Create transaction items
        const transactionItems = cartItems.value.map(item => ({
          transaction_id: transaction.transaction_id,
          prod_id: item.product.prod_id,
          quantity: item.quantity,
          price: item.product.prod_price
        }));

        const { error: itemsError } = await supabase
          .from('transaction_item')
          .insert(transactionItems);

        if (itemsError) throw itemsError;

        // Update stock
        for (const item of cartItems.value) {
          const { error: stockError } = await supabase
            .from('product')
            .update({ prod_stock: item.product.prod_stock - item.quantity })
            .eq('prod_id', item.product.prod_id);

          if (stockError) throw stockError;
        }

        // Create order details
        const itemsPurchased = cartItems.value
          .map(item => `${item.product.prod_name} (${item.quantity}x)`)
          .join(', ');

        const { error: orderError } = await supabase
          .from('order_details')
          .insert({
            orderdetails_itemspurchased: itemsPurchased,
            orderdetails_totalamount: grandTotal.value,
            orderdetails_estimatearrival: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            transaction_id: transaction.transaction_id,
            useracc_id: userData.useracc_id
          });

        if (orderError) throw orderError;

        // Update transaction status to success
        const { error: statusError } = await supabase
          .from('transaction')
          .update({ status: 'SUCCESS' })
          .eq('transaction_id', transaction.transaction_id);

        if (statusError) throw statusError;

        // Clear cart
        await supabase
          .from('cart_item')
          .delete()
          .eq('cart_id', cartId);

        router.push({
          path: '/order-confirmation',
          query: { transaction_id: transaction.transaction_id }
        });

      } catch (error) {
        console.error('Payment error:', error);
        alert(error.message || 'Payment processing failed');
        
        // Rollback transaction status
        if (transaction?.transaction_id) {
          await supabase
            .from('transaction')
            .update({ status: 'FAILED' })
            .eq('transaction_id', transaction.transaction_id);
        }
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

<style>
.shipping-address {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.address-form {
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

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
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.order-item {
  display: flex;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #eee;
}

.product-image {
  width: 250px;
  height: 250px;
  object-fit: cover;
  border-radius: 8px;
}

.item-info {
  flex: 1;
}

.total-summary {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 2px solid var(--primary-color);
}

.total-row {
  display: flex;
  justify-content: space-between;
  margin: 0.5rem 0;
}

.grand-total {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--primary-color);
}

.payment-methods {
  display: grid;
  gap: 1rem;
  margin: 1rem 0;
}

.payment-option {
  display: block;
}

.payment-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.payment-card:hover {
  border-color: var(--primary-color);
  background: #fef5f7;
}

.payment-icon {
  width: 40px;
  height: 40px;
}

.form-group {
  margin: 1rem 0;
}

.form-input {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.confirm-button {
  width: 100%;
  padding: 1rem;
  background: var(--highlights);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: transform 0.2s;
  margin-top: 1rem;
}

.confirm-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.status-controls {
  margin-top: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.status-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.success-button {
  background: var(--highlights);
  color: white;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.cancel-button {
  background: #ff6b6b;
  color: white;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

@media (max-width: 768px) {
  .checkout-content {
    grid-template-columns: 1fr;
  }
}
</style>
