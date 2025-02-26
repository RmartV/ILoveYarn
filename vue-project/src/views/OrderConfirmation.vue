<template>
    <div>
      <header>
        <!-- Reuse your header component -->
      </header>
  
      <div class="confirmation-container">
        <div v-if="loading" class="loading">Loading confirmation...</div>
        <div v-else class="confirmation-content">
          <div class="success-message">
            <img src="../views/images/success-icon.png" alt="Success" class="success-icon">
            <h1>Order Confirmed! 🎉</h1>
            <p class="order-number">Order ID: #{{ transaction.transaction_id.slice(0, 8).toUpperCase() }}</p>
          </div>
  
          <div class="order-summary">
            <h2>Order Details</h2>
            <div class="summary-item">
              <span>Total Paid:</span>
              <span>₱{{ transaction.total_amount.toFixed(2) }}</span>
            </div>
            <div class="summary-item">
              <span>Payment Method:</span>
              <span>{{ transaction.payment_method }}</span>
            </div>
            <div class="summary-item">
              <span>Estimated Arrival:</span>
              <span>{{ formatDate(orderDetails.orderdetails_estimatearrival) }}</span>
            </div>
          </div>
  
          <div class="cta-buttons">
            <router-link to="/order-history" class="track-order-btn">
              Track My Order →
            </router-link>
            <router-link to="/home" class="continue-shopping-btn">
              Continue Shopping
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import { supabase } from '../lib/supabaseClient';
  import { useRoute } from 'vue-router';
  
  export default {
    setup() {
      const route = useRoute();
      const transaction = ref({});
      const orderDetails = ref({});
      const loading = ref(true);
  
      const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-PH', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      };
  
      const fetchOrderData = async () => {
        try {
          // Get transaction ID from route query
          const transactionId = route.query.transaction_id;
          
          if (!transactionId) throw new Error('Invalid transaction ID');
  
          // Fetch transaction
          const { data: transactionData } = await supabase
            .from('transaction')
            .select('*')
            .eq('transaction_id', transactionId)
            .single();
  
          transaction.value = transactionData;
  
          // Fetch order details
          const { data: orderData } = await supabase
            .from('order_details')
            .select('*')
            .eq('transaction_id', transactionId)
            .single();
  
          orderDetails.value = orderData;
  
        } catch (error) {
          console.error('Error fetching order data:', error);
          alert('Failed to load order confirmation');
        } finally {
          loading.value = false;
        }
      };
  
      onMounted(fetchOrderData);
  
      return {
        transaction,
        orderDetails,
        loading,
        formatDate
      };
    }
  };
  </script>
  
  <style scoped>
  .confirmation-container {
    max-width: 800px;
    margin: 2rem auto;
    padding: 2rem;
    text-align: center;
  }
  
  .success-message {
    margin-bottom: 2rem;
  }
  
  .success-icon {
    width: 100px;
    margin-bottom: 1rem;
  }
  
  .order-number {
    color: #666;
    margin: 1rem 0;
  }
  
  .order-summary {
    background: #f8f9fa;
    padding: 2rem;
    border-radius: 10px;
    margin: 2rem 0;
  }
  
  .summary-item {
    display: flex;
    justify-content: space-between;
    margin: 1rem 0;
    padding: 0.5rem 0;
    border-bottom: 1px solid #eee;
  }
  
  .cta-buttons {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .track-order-btn {
    background: #77c275;
    color: white;
    padding: 1rem;
    border-radius: 8px;
    text-decoration: none;
  }
  
  .continue-shopping-btn {
    background: #feb1bf;
    color: white;
    padding: 1rem;
    border-radius: 8px;
    text-decoration: none;
  }
  </style>