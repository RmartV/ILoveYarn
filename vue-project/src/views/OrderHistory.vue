<template>
    <div>
      <header>
        <!-- Reuse your header component -->
      </header>
  
      <div class="order-history">
        <h1>Order History</h1>
        <div v-if="loading" class="loading">Loading orders...</div>
        <div v-else>
          <div v-if="orders.length === 0" class="no-orders">
            <p>No orders found</p>
            <router-link to="/" class="shop-btn">Continue Shopping</router-link>
          </div>
          <div v-else class="order-list">
            <div v-for="order in orders" :key="order.orderdetails_id" 
            @click="router.push(`/order-details/${order.orderdetails_id}`)">
              <div class="order-header">
                <span>Order #{{ order.orderdetails_id }}</span>
                <span :class="statusClass(order.orderdetails_shipmentstatus)">
                  {{ order.orderdetails_shipmentstatus }}
                </span>
              </div>
              <div class="order-body">
                <p>Items: {{ truncateItems(order.orderdetails_itemspurchased) }}</p>
                <p>Total: ₱{{ order.orderdetails_totalamount.toFixed(2) }}</p>
                <p>Estimated Arrival: {{ formatDate(order.orderdetails_estimatearrival) }}</p>
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
  
          const { data: userData } = await supabase
            .from('user_account')
            .select('useracc_id')
            .eq('useracc_email', user.email)
            .single();
  
          const { data } = await supabase
            .from('order_details')
            .select(`
              *,
              transaction:transaction_id (created_at)
            `)
            .eq('useracc_id', userData.useracc_id)
            .order('created_at', { ascending: false });
  
          orders.value = data || [];
        } catch (error) {
          console.error('Error fetching orders:', error);
        } finally {
          loading.value = false;
        }
      };
  
      const statusClass = (status) => {
        return {
          'processing': status === 'PROCESSING',
          'on-delivery': status === 'ON_DELIVERY',
          'delivered': status === 'DELIVERED'
        };
      };
  
      const truncateItems = (items) => {
        return items.length > 50 ? items.substring(0, 50) + '...' : items;
      };
  
      const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-PH', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      };
  
      const viewOrderDetails = (orderId) => {
        router.push(`/order-details/${orderId}`);
      };
  
      onMounted(fetchOrders);
  
      return {
        orders,
        loading,
        statusClass,
        truncateItems,
        formatDate,
        viewOrderDetails
      };
    }
  };
  </script>
  
  <style scoped>
  .order-history {
    max-width: 1200px;
    margin: 2rem auto;
    padding: 0 1rem;
  }
  
  .order-card {
    background: white;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1rem;
    cursor: pointer;
    transition: transform 0.2s;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .order-card:hover {
    transform: translateY(-2px);
  }
  
  .order-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }
  
  .status {
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-weight: bold;
  }
  
  .processing {
    background-color: #ffe08a;
    color: #946c00;
  }
  
  .on-delivery {
    background-color: #7dd3fc;
    color: #0369a1;
  }
  
  .delivered {
    background-color: #86efac;
    color: #166534;
  }
  
  .no-orders {
    text-align: center;
    padding: 2rem;
  }
  
  .shop-btn {
    background: #77c275;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    text-decoration: none;
    display: inline-block;
    margin-top: 1rem;
  }
  </style>