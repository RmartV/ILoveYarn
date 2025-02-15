<template>
    <div>
      <h1>Welcome to Home Page</h1>
      <button @click="logout">Logout</button>
    </div>
  </template>
  
  <script>
  export default {
    methods: {
      logout() {
        this.$router.push('/'); // Redirect back to login
      }
    }
  };
  </script>
  