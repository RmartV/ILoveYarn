<template>
    <div class="wrapper">
      <h1>Profile</h1>
      <div class="profile-container" v-if="userInfo">
        <div class="profile-section">
          <h2>Personal Information</h2>
          <div class="info-grid">
            <div class="info-item">
              <label>First Name:</label>
              <p>{{ userInfo.userinfo_fname }}</p>
            </div>
            <div class="info-item">
              <label>Last Name:</label>
              <p>{{ userInfo.userinfo_lname }}</p>
            </div>
            <div class="info-item">
              <label>Email:</label>
              <p>{{ userInfo.userinfo_email }}</p>
            </div>
            <div class="info-item">
              <label>Phone Number:</label>
              <p>{{ userInfo.userinfo_phonenum || 'Not provided' }}</p>
            </div>
            <div class="info-item">
              <label>Address:</label>
              <p>{{ userInfo.userinfo_address || 'Not provided' }}</p>
            </div>
          </div>
        </div>
      </div>
      <p v-else>Loading user information...</p>
      <p v-if="error" class="error-message">{{ error }}</p>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import { supabase } from '../lib/supabaseClient';
  
  export default {
    setup() {
      const userInfo = ref(null);
      const error = ref('');
  
      const fetchUserInfo = async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user) {
            throw new Error('No user logged in');
          }
  
          const { data, error: fetchError } = await supabase
            .from('userinfo')
            .select('*')
            .eq('userinfo_email', user.email)
            .single();
  
          if (fetchError) throw fetchError;
          
          userInfo.value = data;
        } catch (err) {
          console.error('Error fetching user info:', err);
          error.value = err.message;
        }
      };
  
      onMounted(() => {
        fetchUserInfo();
      });
  
      return {
        userInfo,
        error
      };
    }
  };
  </script>
  
  <style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
  
  .wrapper {
    font-family: Poppins, Segoe UI, sans-serif;
    padding: 2rem;
    max-width: 800px;
    margin: 0 auto;
    color: #c38592;
  }
  
  h1 {
    font-size: 2.5rem;
    font-weight: 900;
    text-transform: uppercase;
    margin-bottom: 2rem;
    text-align: center;
  }
  
  .profile-container {
    background-color: white;
    border-radius: 20px;
    padding: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .profile-section {
    margin-bottom: 2rem;
  }
  
  h2 {
    font-size: 1.5rem;
    color: #f8bdca;
    margin-bottom: 1.5rem;
  }
  
  .info-grid {
    display: grid;
    gap: 1.5rem;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
  
  .info-item {
    background-color: #F3F0FF;
    padding: 1rem;
    border-radius: 10px;
  }
  
  .info-item label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #c38592;
  }
  
  .info-item p {
    margin: 0;
    color: #666;
  }
  
  .error-message {
    color: #f06272;
    text-align: center;
    margin-top: 1rem;
  }
  
  @media (max-width: 600px) {
    .wrapper {
      padding: 1rem;
    }
    
    .profile-container {
      padding: 1rem;
    }
    
    h1 {
      font-size: 2rem;
    }
  }
  </style>