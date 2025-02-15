<template>
  <div>
    <div>
      <h1>Welcome to Home Page</h1>
      <button @click="logout">Logout</button>
    </div>
    <div class="wrapper">
      <h1>Welcome, {{ userInfo.UserInfo_fname }} {{ userInfo.UserInfo_lname }}</h1>
      <p>Email: {{ userInfo.UserInfo_email }}</p>
      <p>Phone: {{ userInfo.UserInfo_phoneNum }}</p>
      <p>Address: {{ userInfo.UserInfo_address }}</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { supabase } from '../lib/supabaseClient';

export default {
  setup() {
    const userInfo = ref({});

    const fetchUserInfo = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) throw new Error("User not authenticated.");

        // Fetch user details from UserInfo table
        const { data, error } = await supabase
          .from("UserInfo")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (error) throw error;

        userInfo.value = data;
      } catch (err) {
        console.error("Error fetching user info:", err);
      }
    };

    const logout = () => {
      router.push('/'); // Redirect back to login
    };

    onMounted(() => {
      fetchUserInfo();
    });

    return { 
      userInfo,
      logout 
    };
  },
};
</script>
<style>
</style>