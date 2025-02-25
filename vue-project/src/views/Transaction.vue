<template>
  <div>
    <header>
      <!-- Reuse your existing header component -->
      <div class="logo-container">
        <router-link to="/home">
          <div class="logo">
            <img src="../views/images/homelogo.jpg" alt="ILoveYarnPH" class="logo-img">
          </div>
          <div class="store-name">ILoveYarnPH | Checkout</div>
        </router-link>
      </div>
      <div class="user-actions">
        <!-- Reuse user actions from previous components -->
      </div>
    </header>

    <div class="checkout-container">
      <div class="checkout-content">
        <!-- Order Summary -->
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
              <span>Total Items:</span>
              <span>{{ totalItems }}</span>
            </div>
            <div class="total-row grand-total">
              <span>Grand Total:</span>
              <span>₱{{ grandTotal.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <!-- Payment Method -->
        <div class="payment-section">
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
                  <!-----<img src="../views/images/cash.png" alt="COD" class="payment-icon">--->
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
                  <!-------<img src="../views/images/wallet.png" alt="E-Wallet" class="payment-icon">--->
                  <span>E-Wallet</span>
                </div>
              </label>
            </div>

            <div v-if="paymentMethod === 'E-WALLET'" class="ewallet-details">
              <div class="form-group">
                <label>Phone Number</label>
                <input 
                  type="tel" 
                  v-model="phoneNumber" 
                  placeholder="0912 345 6789" 
                  pattern="[0-9]{11}"
                  required
                  class="form-input"
                >
              </div>
            </div>

            <button 
              type="submit" 
              class="confirm-button"
              :disabled="processing"
            >
              {{ processing ? 'Processing...' : 'Confirm Payment' }}
            </button>
          </form>

          <!-- Transaction Status Controls -->
          <div v-if="transactionStatus === 'PROCESSING'" class="status-controls">
            <p>Complete the transaction:</p>
            <div class="status-buttons">
              <button @click="completeTransaction(true)" class="success-button">
                Mark as Successful
              </button>
              <button @click="completeTransaction(false)" class="cancel-button">
                Cancel Transaction
              </button>
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
    const paymentMethod = ref('');
    const phoneNumber = ref('');
    const transactionStatus = ref('');
    const processing = ref(false);
    const route = useRoute();
    const cartId = route.params.cartId;
    const subtotal = ref(0);
    const totalItems = ref(0);
    const grandTotal = ref(0);

    const fetchCartItems = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: userData } = await supabase
          .from('user_account')
          .select('useracc_id')
          .eq('useracc_email', user.email)
          .single();

        const { data: cart } = await supabase
          .from('cart')
          .select('cart_id')
          .eq('useracc_id', userData.useracc_id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (!cart.length) return;

        const { data } = await supabase
          .from('cart_item')
          .select(`
            quantity,
            product:prod_id (
              *,
              yarn(yarn_composition, yarn_weight, yarn_thickness),
              tool(tool_material, tool_size)
          `)
          .eq('cart_id', cart[0].cart_id);

        cartItems.value = data || [];
        calculateTotals();
      } catch (error) {
        console.error('Error fetching cart items:', error);
      }
    };

    const calculateTotals = () => {
      subtotal.value = cartItems.value.reduce((sum, item) => 
        sum + (item.product.prod_price * item.quantity), 0);
      totalItems.value = cartItems.value.reduce((sum, item) => sum + item.quantity, 0);
      grandTotal.value = subtotal.value; // Add shipping/discounts here if needed
    };

    const handlePayment = async () => {
      processing.value = true;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not logged in');

        const { data: userData } = await supabase
          .from('user_account')
          .select('useracc_id')
          .eq('useracc_email', user.email)
          .single();

        // Create transaction
        const transactionData = {
          useracc_id: userData.useracc_id,
          total_amount: grandTotal.value,
          payment_method: paymentMethod.value,
          status: 'PROCESSING',
          phone_number: paymentMethod.value === 'E-WALLET' ? phoneNumber.value : null,
          reference_number: paymentMethod.value === 'E-WALLET' 
            ? 'REF-' + Math.random().toString(36).substr(2, 9).toUpperCase()
            : null
        };

        const { data: transaction, error } = await supabase
          .from('transaction')
          .insert(transactionData)
          .select()
          .single();

        if (error) throw error;

        // Create transaction items
        const transactionItems = cartItems.value.map(item => ({
          transaction_id: transaction.transaction_id,
          prod_id: item.product.prod_id,
          quantity: item.quantity,
          price: item.product.prod_price
        }));

        await supabase.from('transaction_item').insert(transactionItems);

        // Update stock
        for (const item of cartItems.value) {
          await supabase.rpc('decrement_stock', {
            product_id: item.product.prod_id,
            decrement_by: item.quantity
          });
        }

        // Clear cart
        const { data: cart } = await supabase
          .from('cart')
          .select('cart_id')
          .eq('useracc_id', userData.useracc_id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (cart.length) {
          await supabase
            .from('cart_item')
            .delete()
            .eq('cart_id', cart[0].cart_id);
        }

        transactionStatus.value = 'PROCESSING';
      } catch (error) {
        console.error('Payment error:', error);
        alert('Payment failed. Please try again.');
      } finally {
        processing.value = false;
      }
    };

    const completeTransaction = async (success) => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: transaction } = await supabase
          .from('transaction')
          .select('transaction_id')
          .eq('useracc_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        const status = success ? 'SUCCESS' : 'CANCELLED';
        await supabase
          .from('transaction')
          .update({ status })
          .eq('transaction_id', transaction.transaction_id);

        if (!success) {
          // Restore stock
          for (const item of cartItems.value) {
            await supabase.rpc('increment_stock', {
              product_id: item.product.prod_id,
              increment_by: item.quantity
            });
          }
          router.push('/cart');
        } else {
          router.push('/order-confirmation');
        }
      } catch (error) {
        console.error('Error completing transaction:', error);
      }
    };

    onMounted(fetchCartItems);

    return {
      cartItems,
      paymentMethod,
      phoneNumber,
      transactionStatus,
      processing,
      subtotal,
      totalItems,
      grandTotal,
      handlePayment,
      completeTransaction
    };
  }
};
</script>

<style scoped>
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
  width: 80px;
  height: 80px;
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