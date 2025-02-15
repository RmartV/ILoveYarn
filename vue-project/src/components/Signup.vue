<template>
  <div class="wrapper">
    <h1>Signup</h1>
    <p id="error-message">{{ errorMessage }}</p>
    <form @submit.prevent="signup">
      <div>
        <label for="firstname-input">
          <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66 47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Z"/></svg>
        </label>
        <input type="text" v-model="firstname" id="firstname-input" placeholder="Firstname" required>
      </div>
      <div>
        <label for="lastname-input">
          <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66 47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Z"/></svg>
        </label>
        <input type="text" v-model="lastname" id="lastname-input" placeholder="Lastname" required>
      </div>
      <div>
        <label for="email-input">
          <span>@</span>
        </label>
        <input type="email" v-model="email" id="email-input" placeholder="Email" required>
      </div>
      <div>
        <label for="phonenum-input">
          <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66 47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Z"/></svg>
        </label>
        <input type="text" v-model="phoneNum" id="phonenum-input" placeholder="Phone Number">
      </div>
      <div>
        <label for="address-input">
          <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66 47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Z"/></svg>
        </label>
        <input type="text" v-model="address" id="address-input" placeholder="Address">
      </div>
      <div>
        <label for="password-input">
          <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm240-200q33 0 56.5-23.5T560-360q0-33-23.5-56.5T480-440q-33 0-56.5 23.5T400-360q0 33 23.5 56.5T480-280ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80Z"/></svg>
        </label>
        <input type="password" v-model="password" id="password-input" placeholder="Password" required>
      </div>
      <div>
        <label for="repeat-password-input">
          <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm240-200q33 0 56.5-23.5T560-360q0-33-23.5-56.5T480-440q-33 0-56.5 23.5T400-360q0 33 23.5 56.5T480-280ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80Z"/></svg>
        </label>
        <input type="password" v-model="repeatPassword" id="repeat-password-input" placeholder="Repeat Password" required>
      </div>
      <button type="submit">Signup</button>
    </form>
    <p>Already have an Account? <router-link to="/login">login</router-link></p>
  </div>
</template>

<script>
import { ref } from 'vue';
import { supabase } from '../supabase';

export default {
  setup() {
    const firstname = ref('');
    const lastname = ref('');
    const email = ref('');
    const phoneNum = ref('');
    const address = ref('');
    const password = ref('');
    const repeatPassword = ref('');
    const errorMessage = ref('');

    const signup = async () => {
      if (password.value !== repeatPassword.value) {
        errorMessage.value = 'Passwords do not match';
        return;
      }

      try {
        const { user, error } = await supabase.auth.signUp({
          email: email.value,
          password: password.value,
        });
        if (error) throw error;

        // Insert user info into the UserInfo table
        const { data, error: insertError } = await supabase
          .from('UserInfo')
          .insert([
            {
              UserInfo_fname: firstname.value,
              UserInfo_lname: lastname.value,
              UserInfo_email: email.value,
              UserInfo_phoneNum: phoneNum.value,
              UserInfo_address: address.value,
              UserInfo_password: password.value, // Note: In a real app, hash the password before storing
            },
          ]);
        if (insertError) throw insertError;

        // Redirect or handle successful signup
      } catch (error) {
        errorMessage.value = error.message;
      }
    };

    return { firstname, lastname, email, phoneNum, address, password, repeatPassword, errorMessage, signup };
  },
};
</script>

<style scoped>
/* Add your signupstyle.css here */
</style>