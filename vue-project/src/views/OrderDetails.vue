<template>
    <div>
      <header>
        <!-- Reuse your header component -->
      </header>
  
      <div class="order-details">
        <div v-if="loading" class="loading">Loading order details...</div>
        <div v-else-if="order" class="details-content">
          <h1>Order #{{ order.orderdetails_id }}</h1>
          
          <div class="timeline">
            <div class="timeline-step" :class="{ 'active': currentStep >= 1 }">
              <div class="step-icon">📦</div>
              <div class="step-info">
                <h3>Order Processing</h3>
                <p v-if="order.transaction.created_at">
                  Ordered on {{ formatDate(order.transaction.created_at) }}
                </p>
              </div>
            </div>
  
            <div class="timeline-step" :class="{ 'active': currentStep >= 2 }">
              <div class="step-icon">🚚</div>
              <div class="step-info">
                <h3>On Delivery</h3>
                <p v-if="order.orderdetails_departdate">
                  Shipped on {{ formatDateTime(order.orderdetails_departdate) }}
                </p>
              </div>
            </div>
  
            <div class="timeline-step" :class="{ 'active': currentStep >= 3 }">
              <div class="step-icon">✅</div>
              <div class="step-info">
                <h3>Delivered</h3>
                <p v-if="order.orderdetails_arrivaldate">
                  Delivered on {{ formatDateTime(order.orderdetails_arrivaldate) }}
                </p>
                <p v-else>
                  Estimated arrival by {{ formatDate(order.orderdetails_estimatearrival) }}
                </p>
              </div>
            </div>
          </div>
  
          <div class="order-info">
            <div class="items-list">
              <h2>Items Purchased</h2>
              <ul>
                <li v-for="(item, index) in parsedItems" :key="index">{{ item }}</li>
              </ul>
            </div>
            
            <div class="payment-info">
              <h2>Payment Details</h2>
              <div class="info-row">
                <span>Total Amount:</span>
                <span>₱{{ order.orderdetails_totalamount.toFixed(2) }}</span>
              </div>
              <div class="info-row">
                <span>Payment Method:</span>
                <span>{{ order.transaction.payment_method }}</span>
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
import { useRoute } from 'vue-router';

export default {
  setup() {
    const route = useRoute();
    const order = ref(null);
    const loading = ref(true);

    const fetchOrderDetails = async () => {
      try {
        const { data, error } = await supabase
          .from('order_details')
          .select(`
            *,
            transaction:transaction_id (
              *,
              transaction_items:transaction_item (
                *,
                product:prod_id (*)
            )
          `)
          .eq('orderdetails_id', route.params.orderId)
          .single();

        if (error) throw error;
        order.value = data;

      } catch (error) {
        console.error('Error fetching order:', error);
        alert('Order not found');
        router.back();
      } finally {
        loading.value = false;
      }
    };

    onMounted(fetchOrderDetails);

    return { order, loading };
  }
};
  </script>
  
  <style scoped>
  .timeline {
    display: grid;
    gap: 2rem;
    margin: 2rem 0;
  }
  
  .timeline-step {
    display: flex;
    gap: 1rem;
    opacity: 0.5;
  }
  
  .timeline-step.active {
    opacity: 1;
  }
  
  .step-icon {
    font-size: 1.5rem;
  }
  
  .order-info {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 2rem;
    margin-top: 2rem;
  }
  
  .info-row {
    display: flex;
    justify-content: space-between;
    margin: 0.5rem 0;
  }
  </style>