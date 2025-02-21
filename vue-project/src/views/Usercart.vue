<template>
    <div class="app-container">
      <header class="header">
        <div class="logo-container">
          <img src="css/homelogo.jpg" alt="I LOVE YARN PH Logo" class="logo-img">
          <h1 class="logo-text">I LOVE YARN PH</h1>
        </div>
  
        <div class="search-container">
          <input type="text" class="search-input" placeholder="What are you looking for?">
          <button class="search-btn"><img class="nav-img-icon" src="css/magnifying-glass.png"></button>
        </div>
  
        <div class="nav-icons">
          <div class="nav-icon" @click="goToHome">
            <img class="nav-img-icon" src="../views/images/homelogo.jpg">
          </div>
          <div class="nav-icon user-info" v-if="currentUser">
            <p>{{ currentUser.userinfo_fname }} {{ currentUser.userinfo_lname }}</p>
          </div>
        </div>
      </header>
  
      <div class="cart-container">
        <div class="cart-header">
          <h1>Shopping Cart</h1>
          <p v-if="cartItems.length === 0" class="empty-cart-message">Your cart is empty</p>
        </div>
  
        <div class="cart-content" v-if="cartItems.length > 0">
          <div class="cart-items">
            <div class="cart-item" v-for="item in cartItems" :key="item.id">
              <div class="item-details">
                <h3 class="item-name">{{ item.product.prod_name }}</h3>
                <p class="item-category">{{ item.product.prod_categoryType }}</p>
                <p class="item-price">₱{{ item.product.prod_price.toFixed(2) }}</p>
              </div>
              <div class="quantity-controls">
                <button 
                  class="quantity-btn" 
                  @click="decreaseQuantity(item)"
                  :disabled="item.quantity <= 1"
                >
                  -
                </button>
                <span class="quantity">{{ item.quantity }}</span>
                <button 
                  class="quantity-btn" 
                  @click="increaseQuantity(item)"
                  :disabled="item.quantity >= item.product.prod_stock"
                >
                  +
                </button>
              </div>
              <div class="item-total">
                ₱{{ (item.product.prod_price * item.quantity).toFixed(2) }}
              </div>
              <button class="remove-btn" @click="removeItem(item)">×</button>
            </div>
          </div>
  
          <div class="cart-summary">
            <h2>Order Summary</h2>
            <div class="summary-row">
              <span>Items ({{ getTotalItems() }})</span>
              <span>₱{{ getSubtotal().toFixed(2) }}</span>
            </div>
            <div class="summary-row">
              <span>Shipping</span>
              <span>₱{{ shippingFee.toFixed(2) }}</span>
            </div>
            <div class="summary-row discount" v-if="discount > 0">
              <span>Discount</span>
              <span>-₱{{ discount.toFixed(2) }}</span>
            </div>
            <div class="summary-divider"></div>
            <div class="summary-row total">
              <span>Total</span>
              <span>₱{{ getTotalAmount().toFixed(2) }}</span>
            </div>
            <button class="pay-now-btn">Pay Now</button>
            <button class="continue-shopping-btn" @click="goToHome">Continue Shopping</button>
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
      const currentUser = ref(null);
      const shippingFee = ref(50);
      const discount = ref(0);
  
      // Fetch current user
      const fetchCurrentUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('userinfo')
            .select('*')
            .eq('userinfo_email', user.email)
            .single();
          
          if (data && !error) {
            currentUser.value = data;
            fetchCartItems();
          }
        }
      };
  
      // Fetch cart items
      const fetchCartItems = async () => {
        if (currentUser.value) {
          const { data, error } = await supabase
            .from('usercart')
            .select(`
              usercart_id,
              usercart_totalprice,
              usercart_totalitems,
              prod_id,
              product (
                prod_id,
                prod_name,
                prod_categoryType,
                prod_price,
                prod_stock
              )
            `)
            .eq('userinfo_id', currentUser.value.userinfo_id);
          
          if (data && !error) {
            cartItems.value = data.map(item => ({
              id: item.usercart_id,
              product: item.product,
              quantity: item.usercart_totalitems,
              totalPrice: item.usercart_totalprice
            }));
          }
        }
      };
  
      // Increase item quantity
      const increaseQuantity = async (item) => {
        if (item.quantity < item.product.prod_stock) {
          const newQuantity = item.quantity + 1;
          const newTotalPrice = newQuantity * item.product.prod_price;
          
          const { error } = await supabase
            .from('usercart')
            .update({ 
              usercart_totalitems: newQuantity,
              usercart_totalprice: newTotalPrice
            })
            .eq('usercart_id', item.id);
          
          if (!error) {
            item.quantity = newQuantity;
            item.totalPrice = newTotalPrice;
          }
        }
      };
  
      // Decrease item quantity
      const decreaseQuantity = async (item) => {
        if (item.quantity > 1) {
          const newQuantity = item.quantity - 1;
          const newTotalPrice = newQuantity * item.product.prod_price;
          
          const { error } = await supabase
            .from('usercart')
            .update({ 
              usercart_totalitems: newQuantity,
              usercart_totalprice: newTotalPrice
            })
            .eq('usercart_id', item.id);
          
          if (!error) {
            item.quantity = newQuantity;
            item.totalPrice = newTotalPrice;
          }
        }
      };
  
      // Remove item from cart
      const removeItem = async (item) => {
        const { error } = await supabase
          .from('usercart')
          .delete()
          .eq('usercart_id', item.id);
        
        if (!error) {
          cartItems.value = cartItems.value.filter(i => i.id !== item.id);
        }
      };
  
      // Get total items in cart
      const getTotalItems = () => {
        return cartItems.value.reduce((total, item) => total + item.quantity, 0);
      };
  
      // Get subtotal (before shipping and discount)
      const getSubtotal = () => {
        return cartItems.value.reduce((total, item) => {
          return total + (item.product.prod_price * item.quantity);
        }, 0);
      };
  
      // Get total amount (including shipping and discount)
      const getTotalAmount = () => {
        const subtotal = getSubtotal();
        return subtotal + shippingFee.value - discount.value;
      };
  
      // Go to home page
      const goToHome = () => {
        window.location.href = '/';
      };
  
      onMounted(() => {
        fetchCurrentUser();
      });
  
      return {
        cartItems,
        currentUser,
        shippingFee,
        discount,
        increaseQuantity,
        decreaseQuantity,
        removeItem,
        getTotalItems,
        getSubtotal,
        getTotalAmount,
        goToHome
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
  
  body {
    background-color: var(--background-color);
  }
  
  .app-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
  
  .header {
    background-color: var(--primary-color);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px 30px;
    border-bottom: 2px solid var(--light-gray);
  }
  
  .logo-container {
    display: flex;
    align-items: center;
  }
  
  .logo-img {
    width: 50px;
    height: 50px;
    margin-right: 10px;
  }
  
  .logo-text {
    font-size: 24px;
    font-weight: bold;
  }
  
  .search-container {
    flex-grow: 1;
    max-width: 500px;
    margin: 0 20px;
    position: relative;
  }
  
  .search-input {
    width: 100%;
    padding: 10px 15px;
    border-radius: 20px;
    border: 2px solid #ddd;
    outline: none;
  }
  
  .search-btn {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
  }
  
  .nav-icons {
    display: flex;
    gap: 20px;
    align-items: center;
  }
  
  .nav-icon {
    color: var(--text-color);
    cursor: pointer;
  }
  
  .user-info {
    background-color: rgba(255, 255, 255, 0.3);
    padding: 5px 10px;
    border-radius: 20px;
  }
  
  .nav-img-icon {
    height: 25px;
  }
  
  .cart-container {
    max-width: 1200px;
    margin: 30px auto;
    padding: 0 20px;
  }
  
  .cart-header {
    margin-bottom: 30px;
  }
  </style>