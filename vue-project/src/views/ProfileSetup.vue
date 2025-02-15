<template>
    <div class="wrapper">
      <h1>Complete Your Profile</h1>
      <p id="error-message">{{ errorMessage }}</p>
      <form @submit.prevent="saveProfile">
        <div :class="{ incorrect: hasError }">
          <label for="firstname-input">
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66 47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Z"/></svg>
          </label>
          <input 
            type="text" 
            v-model="firstname" 
            id="firstname-input" 
            placeholder="Firstname" 
            required
          >
        </div>
        <div :class="{ incorrect: hasError }">
          <label for="lastname-input">
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66 47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Z"/></svg>
          </label>
          <input 
            type="text" 
            v-model="lastname" 
            id="lastname-input" 
            placeholder="Lastname" 
            required
          >
        </div>
        <div :class="{ incorrect: hasError }">
          <label for="phonenum-input">
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66 47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Z"/></svg>
          </label>
          <input 
            type="text" 
            v-model="phoneNum" 
            id="phonenum-input" 
            placeholder="Phone Number"
          >
        </div>
        <div :class="{ incorrect: hasError }">
          <label for="address-input">
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66 47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Z"/></svg>
          </label>
          <input 
            type="text" 
            v-model="address" 
            id="address-input" 
            placeholder="Address"
          >
        </div>
        <button type="submit" :disabled="isLoading">
          {{ isLoading ? 'Saving...' : 'Save Profile' }}
        </button>
      </form>
    </div>
  </template>
  
  <script>
  import { ref, computed } from 'vue';
  import { supabase } from '../lib/supabaseClient';
  import { useRouter } from 'vue-router';
  
  export default {
    setup() {
      const router = useRouter();
      const firstname = ref("");
      const lastname = ref("");
      const phoneNum = ref("");
      const address = ref("");
      const errorMessage = ref("");
      const isLoading = ref(false);
      
      const hasError = computed(() => errorMessage.value !== "");
  
      const saveProfile = async () => {
        errorMessage.value = "";
        isLoading.value = true;
        
        try {
          const { data: { user } } = await supabase.auth.getUser();
  
          if (!user) throw new Error("User not authenticated.");
  
          // Insert user details into the UserInfo table
          const { error } = await supabase
            .from("userinfo")
            .insert([
              {
                userinfo_id: user.id,
                userinfo_fname: firstname.value,
                userinfo_lname: lastname.value,
                userinfo_phoneNum: phoneNum.value,
                userinfo_address: address.value,
              },
            ]);
  
          if (error) throw error;
  
          // Redirect to home page
          router.push('/home');
        } catch (err) {
          console.error("Profile setup error:", err);
          errorMessage.value = err.message;
        } finally {
          isLoading.value = false;
        }
      };
  
      return { 
        firstname, 
        lastname, 
        phoneNum, 
        address, 
        saveProfile, 
        errorMessage,
        isLoading,
        hasError
      };
    },
  };
  </script>