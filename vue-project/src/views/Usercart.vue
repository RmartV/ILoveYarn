<template>
  <div>
    <h2>My Cart</h2>
    <div v-if="cartItems.length === 0">Your cart is empty.</div>
    <div v-else>
      <div v-for="item in cartItems" :key="item.cart_item_id" class="cart-item">
        <img :src="item.product.image_url || '../views/images/default.png'" alt="Product Image" class="cart-item-image" />
        <div class="cart-item-details">
          <h3>{{ item.product.prod_name }}</h3>
          <p>Price: ₱{{ item.product.prod_price.toFixed(2) }}</p>
          <p>Quantity: {{ item.quantity }}</p>
          <button @click="removeFromCart(item.cart_item_id)">Remove</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { supabase } from "../lib/supabaseClient";

export default {
  setup() {
    const cartItems = ref([]);

    const fetchCartItems = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from("CartItems")
          .select("cart_item_id, quantity, product:prod_id(*)")
          .eq("userinfo_id", user.id);

        if (error) throw error;
        cartItems.value = data;
      } catch (err) {
        console.error("Error fetching cart items:", err);
      }
    };

    const removeFromCart = async (cartItemId) => {
      try {
        const { error } = await supabase
          .from("CartItems")
          .delete()
          .eq("cart_item_id", cartItemId);

        if (error) throw error;

        cartItems.value = cartItems.value.filter((item) => item.cart_item_id !== cartItemId);
      } catch (err) {
        console.error("Error removing from cart:", err);
      }
    };

    onMounted(fetchCartItems);

    return { cartItems, removeFromCart };
  }
};
</script>

<style>
.cart-item {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.cart-item-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  margin-right: 15px;
}

.cart-item-details {
  flex: 1;
}
</style>
