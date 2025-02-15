<template>
  <div class="wrapper">
    <h1>Login</h1>
    <p id="error-message">{{ errorMessage }}</p>
    <form @submit.prevent="login">
      <div>
        <label for="email-input">
          <span>@</span>
        </label>
        <input type="email" v-model="email" id="email-input" placeholder="Email" required>
      </div>
      <div>
        <label for="password-input">
          <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm240-200q33 0 56.5-23.5T560-360q0-33-23.5-56.5T480-440q-33 0-56.5 23.5T400-360q0 33 23.5 56.5T480-280ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80Z"/></svg>
        </label>
        <input type="password" v-model="password" id="password-input" placeholder="Password" required>
      </div>
      <button type="submit">Login</button>
    </form>
    <p>New here? <router-link to="/signup">Create an Account</router-link></p>
  </div>
</template>

<script>
import { ref } from 'vue';
import { supabase } from '../supabase';

export default {
  setup() {
    const email = ref('');
    const password = ref('');
    const errorMessage = ref('');

    const login = async () => {
      try {
        const { user, error } = await supabase.auth.signIn({
          email: email.value,
          password: password.value,
        });
        if (error) throw error;
        // Redirect or handle successful login
      } catch (error) {
        errorMessage.value = error.message;
      }
    };

    return { email, password, errorMessage, login };
  },
};
</script>

<style scoped>
/* Add your loginstyle.css here */
</style>