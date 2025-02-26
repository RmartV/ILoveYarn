<template>
  <div>
    <header>
      <!-- Reuse your header component from other pages -->
      <div class="logo-container">
        <router-link to="/home">
          <div class="logo">
            <img src="../views/images/homelogo.jpg" alt="ILoveYarnPH" class="logo-img">
          </div>
          <div class="store-name">ILoveYarnPH | Order History</div>
        </router-link>
      </div>
      <div class="user-actions">
        <!-- Reuse your user actions from other pages -->
      </div>
    </header>

    <div class="order-history-container">
      <h1 class="page-title">Order History</h1>
      
      <div v-if="loading" class="loading-message">
        <div class="spinner"></div>
        Loading your orders...
      </div>

      <div v-else>
        <div v-if="orders.length === 0" class="empty-state">
          <!----<img src="../views/images/empty-order.png" alt="No orders" class="empty-icon">-->
          <p class="empty-text">You haven't placed any orders yet</p>
          <router-link to="/home" class="shop-button">
            Start Shopping
          </router-link>
        </div>

        <div v-else class="order-list">
          <div 
            v-for="order in orders" 
            :key="order.orderdetails_id" 
            class="order-card"
            @click="viewOrderDetails(order.orderdetails_id)"
          >
            <div class="order-header">
              <div class="order-meta">
                <span class="order-id">Order #{{ order.orderdetails_id }}</span>
                <span class="order-date">{{ formatDate(order.transaction.created_at) }}</span>
              </div>
              <div :class="['status-badge', statusClass(order.orderdetails_shipmentstatus)]">
                {{ formatStatus(order.orderdetails_shipmentstatus) }}
              </div>
            </div>

            <div class="product-previews">
              <div 
                v-for="item in order.transaction.transaction_items" 
                :key="item.prod_id" 
                class="product-preview"
              >
                <img 
                  :src="item.product.image_url || '../views/images/default-product.png'" 
                  :alt="item.product.prod_name" 
                  class="product-thumbnail"
                >
                <div class="product-info">
                  <span class="product-name">{{ item.product.prod_name }}</span>
                  <span class="product-quantity">x{{ item.quantity }}</span>
                </div>
              </div>
            </div>

            <div class="order-footer">
              <div class="total-amount">
                Total: ₱{{ order.orderdetails_totalamount.toFixed(2) }}
              </div>
              <div class="estimated-arrival">
                Estimated Arrival: {{ formatDate(order.orderdetails_estimatearrival) }}
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
import { useRouter } from 'vue-router';

export default {
  setup() {
    const router = useRouter();
    const orders = ref([]);
    const loading = ref(true);

    const fetchOrders = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get user's database ID
        const { data: userData, error: userError } = await supabase
          .from('user_account')
          .select('useracc_id')
          .eq('useracc_email', user.email)
          .single();

          if (userError) throw userError;

        // Fetch orders with nested data
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
            )
          `)
          .eq('useracc_id', userData.useracc_id)
          .order('orderdetails_id', { ascending: false });

        if (error) throw error;

        orders.value = data || [];
      } catch (error) {
        console.error('Error fetching orders:', error);
        alert('Error loading orders: ' + error.message);
      } finally {
        loading.value = false;
      }
    };

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    };

    const statusClass = (status) => {
      return {
        'processing': status === 'PROCESSING',
        'on-delivery': status === 'ON_DELIVERY',
        'delivered': status === 'DELIVERED'
      };
    };

    const formatStatus = (status) => {
      return status.replace('_', ' ');
    };

    const viewOrderDetails = (orderId) => {
      router.push(`/order-details/${orderId}`);
    };

    onMounted(() => {
      fetchOrders();
    });

    return {
      orders,
      loading,
      formatDate,
      statusClass,
      formatStatus,
      viewOrderDetails
    };
  }
};
</script>

<style scoped>
.order-history-container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.page-title {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 2rem;
}

.loading-message {
  text-align: center;
  padding: 2rem;
  color: #666;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #77c275;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 4rem 0;
}

.empty-icon {
  width: 150px;
  opacity: 0.8;
  margin-bottom: 1rem;
}

.empty-text {
  color: #666;
  margin-bottom: 1.5rem;
}

.shop-button {
  background: #77c275;
  color: white;
  padding: 0.8rem 2rem;
  border-radius: 25px;
  text-decoration: none;
  transition: transform 0.2s;
}

.shop-button:hover {
  transform: scale(1.05);
}

.order-list {
  display: grid;
  gap: 1.5rem;
}

.order-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.2s;
}

.order-card:hover {
  transform: translateY(-3px);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.order-meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.order-id {
  font-weight: 600;
  color: #2c3e50;
}

.order-date {
  color: #666;
  font-size: 0.9rem;
}

.status-badge {
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.status-badge.processing {
  background: #fff3cd;
  color: #856404;
}

.status-badge.on-delivery {
  background: #cce5ff;
  color: #004085;
}

.status-badge.delivered {
  background: #d4edda;
  color: #155724;
}

.product-previews {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin: 1rem 0;
}

.product-preview {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #f8f9fa;
  padding: 0.75rem;
  border-radius: 8px;
  width: 250px;
}

.product-thumbnail {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 6px;
}

.product-info {
  display: flex;
  flex-direction: column;
}

.product-name {
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.9rem;
}

.product-quantity {
  color: #666;
  font-size: 0.85rem;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.total-amount {
  font-weight: 600;
  color: #2c3e50;
}

.estimated-arrival {
  color: #666;
  font-size: 0.9rem;
}
</style>