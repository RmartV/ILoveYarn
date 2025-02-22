<template>
  <div class="cart-page">
    <header class="header">
      <!-- Reuse your existing header component -->
    </header>
    
    <div class="cart-container">
      <h2 class="page-title">Shopping Cart</h2>
      
      <div v-if="cartItems.length === 0" class="empty-cart">
        <p>Your cart is empty</p>
        <router-link to="/" class="continue-shopping">Continue Shopping</router-link>
      </div>

      <div v-else class="cart-content">
        <div class="cart-items">
          <div v-for="item in cartItems" :key="item.cart_id" class="cart-item">
            <div class="item-image">
              <img :src="item.product.image_url || '../views/images/default.png'" :alt="item.product.prod_name">
            </div>
            <div class="item-details">
              <h3 class="item-name">{{ item.product.prod_name }}</h3>
              <p class="item-category">{{ item.product.prod_categorytype }}</p>
              <p class="item-price">₱{{ item.product.prod_price.toFixed(2) }}</p>
            </div>
            <div class="item-quantity">
              <button @click="decreaseQuantity(item)" :disabled="item.quantity <= 1">-</button>
              <span>{{ item.quantity }}</span>
              <button @click="increaseQuantity(item)" :disabled="item.quantity >= item.product.prod_stock">+</button>
            </div>
            <div class="item-total">
              ₱{{ (item.quantity * item.product.prod_price).toFixed(2) }}
            </div>
            <button @click="removeItem(item)" class="remove-item">×</button>
          </div>
        </div>

        <div class="cart-summary">
          <h3>Order Summary</h3>
          <div class="summary-row">
            <span>Total Items:</span>
            <span>{{ totalItems }}</span>
          </div>
          <div class="summary-row">
            <span>Subtotal:</span>
            <span>₱{{ subtotal.toFixed(2) }}</span>
          </div>
          <button @click="checkout" class="checkout-btn">Proceed to Checkout</button>
        </div>
      </div>
    </div>
  </div>
</template>
  
<script>
import { ref, computed, onMounted } from 'vue';
import { supabase } from '../lib/supabaseClient';

export default {
  setup() {
    const cartItems = ref([]);
    const loading = ref(false);

    const fetchCartItems = async () => {
      loading.value = true;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user logged in');

        const { data, error } = await supabase
          .from('usercart')
          .select(`
            cart_id,
            quantity,
            product:prod_id (
              prod_id,
              prod_name,
              prod_categorytype,
              prod_price,
              prod_stock,
              image_url
            )
          `)
          .eq('userinfo_id', user.id);

        if (error) throw error;
        cartItems.value = data;
      } catch (err) {
        console.error('Error fetching cart:', err);
      } finally {
        loading.value = false;
      }
    };

    const updateCartItem = async (item, newQuantity) => {
      try {
        const { error } = await supabase
          .from('usercart')
          .update({
            quantity: newQuantity,
            usercart_totalprice: item.product.prod_price * newQuantity
          })
          .eq('cart_id', item.cart_id);

        if (error) throw error;
        await fetchCartItems();
      } catch (err) {
        console.error('Error updating cart:', err);
      }
    };

    const increaseQuantity = async (item) => {
      if (item.quantity < item.product.prod_stock) {
        await updateCartItem(item, item.quantity + 1);
      }
    };

    const decreaseQuantity = async (item) => {
      if (item.quantity > 1) {
        await updateCartItem(item, item.quantity - 1);
      }
    };

    const removeItem = async (item) => {
      try {
        const { error } = await supabase
          .from('usercart')
          .delete()
          .eq('cart_id', item.cart_id);

        if (error) throw error;
        await fetchCartItems();
      } catch (err) {
        console.error('Error removing item:', err);
      }
    };

    const totalItems = computed(() => {
      return cartItems.value.reduce((sum, item) => sum + item.quantity, 0);
    });

    const subtotal = computed(() => {
      return cartItems.value.reduce((sum, item) => {
        return sum + (item.quantity * item.product.prod_price);
      }, 0);
    });

    const checkout = () => {
      // Implement checkout logic
      alert('Checkout functionality will be implemented here');
    };

    onMounted(fetchCartItems);

    return {
      cartItems,
      loading,
      increaseQuantity,
      decreaseQuantity,
      removeItem,
      totalItems,
      subtotal,
      checkout
    };
  }
};
</script>
  
  <style>
.cart-page {
  min-height: 100vh;
  background-color: var(--background-color);
}

.cart-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.empty-cart {
  text-align: center;
  padding: 40px;
}

.continue-shopping {
  display: inline-block;
  margin-top: 20px;
  padding: 10px 20px;
  background-color: var(--primary-color);
  color: white;
  text-decoration: none;
  border-radius: 5px;
}

.cart-content {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
}

.cart-items {
  background: white;
  border-radius: 10px;
  padding: 20px;
}

.cart-item {
  display: grid;
  grid-template-columns: 100px 1fr auto auto 30px;
  gap: 20px;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.item-image img {
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: 5px;
}

.item-quantity {
  display: flex;
  align-items: center;
  gap: 10px;
}

.item-quantity button {
  width: 30px;
  height: 30px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 5px;
  cursor: pointer;
}

.item-quantity button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.remove-item {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #ff4444;
}

.cart-summary {
  background: white;
  border-radius: 10px;
  padding: 20px;
  height: fit-content;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin: 10px 0;
}

.checkout-btn {
  width: 100%;
  padding: 15px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 5px;
  margin-top: 20px;
  cursor: pointer;
}

.checkout-btn:hover {
  background-color: #e99ca9;
}

@media (max-width: 768px) {
  .cart-content {
    grid-template-columns: 1fr;
  }
  
  .cart-item {
    grid-template-columns: 80px 1fr;
    grid-template-areas:
      "image details"
      "image quantity"
      "total total"
      "remove remove";
    gap: 10px;
  }
  
  .item-image {
    grid-area: image;
  }
  
  .item-details {
    grid-area: details;
  }
  
  .item-quantity {
    grid-area: quantity;
  }
  
  .item-total {
    grid-area: total;
  }
  
  .remove-item {
    grid-area: remove;
  }
}
  </style>
  