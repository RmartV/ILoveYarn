<template>
  <div>
    <div>
      <h1>Welcome to Home Page</h1>
      <button @click="logout">Logout</button>
    </div>
    <div class="wrapper">
      <h1>Welcome, {{ userinfo.userinfo_fname }} {{ userinfo.userinfo_lname }}</h1>
      <p>Email: {{ userinfo.userinfo_email }}</p>
      <p>Phone: {{ userinfo.userinfo_phonenum }}</p>
      <p>Address: {{ userinfo.userinfo_address }}</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { supabase } from '../lib/supabaseClient';

export default {
  setup() {
    const userInfo = ref({});

    const fetchuserinfo = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) throw new Error("User not authenticated.");

        // Fetch user details from UserInfo table
        const { data, error } = await supabase
          .from("userinfo")
          .select("*")
          .eq("userinfo_id", user.id)
          .single();

        if (error) throw error;

        userinfo.value = data;
      } catch (err) {
        console.error("Error fetching user info:", err);
      }
    };

    const logout = () => {
      router.push('/'); // Redirect back to login
    };

    onMounted(() => {
      fetchuserinfo();
    });

    return { 
      userinfo,
      logout 
    };
  },
};
</script>
<style>
</style>