<template>
    <div class="page">
      <div class="wrapper">
        <div class="content">
          <svg class="email-icon" xmlns="http://www.w3.org/2000/svg" height="100" viewBox="0 -960 960 960" width="100">
            <path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm320-280L160-640v400h640v-400L480-440Zm0-80 320-200H160l320 200ZM160-640v-80 480-400Z"/>
          </svg>
          <h1>Check Your Email</h1>
          <p class="message">Please check your email for Authentication!</p>
          <p class="thank-you">Thank you!</p>
          <router-link to="/login" class="back-button">Back to Login</router-link>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'EmailVerification'
  }
  </script>
  
  <style>
  body {
    margin: 0;
    padding: 0;
  }
  </style>
  
  <style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@100;400;600;900&display=swap');
  
  :root {
    --accent-color: #f8bdca;
    --base-color: white;
    --text-color: #f8bdca;
    --input-color: #F3F0FF;
    --stroke-color: #c38592;
  }
  
  .page {
    margin: 0;
    padding: 0;
    font-family: Poppins, Segoe UI, sans-serif;
    font-size: 12pt;
    color: #f8bdca;
    text-align: center;
    min-height: 100vh;
    background-image: url(bgL.png);
    background-size: fill;
    background-position: left;
    overflow: hidden;
    -webkit-text-stroke: 0.5px var(--stroke-color);
    text-stroke: 0.5px var(--stroke-color);
  }
  
  .wrapper {
    box-sizing: border-box;
    background-color: white;
    height: 100vh;
    width: max(40%, 600px);
    padding: 10px;
    border-radius: 20px 0 0 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    float: right;
  }
  
  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    animation: fadeIn 0.5s ease-out;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .email-icon {
    fill: #f8bdca;
    margin-bottom: 20px;
    animation: bounce 2s infinite;
  }
  
  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-20px);
    }
  }
  
  h1 {
    font-size: 3rem;
    font-weight: 900;
    text-transform: uppercase;
    margin: 0;
    -webkit-text-stroke: 1px var(--stroke-color);
    text-stroke: 1px var(--stroke-color);
  }
  
  .message {
    font-size: 1.2rem;
    margin: 0;
    color: #f8bdca;
    -webkit-text-stroke: 0.5px var(--stroke-color);
    text-stroke: 0.5px var(--stroke-color);
  }
  
  .thank-you {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 10px 0;
    color: #f8bdca;
    -webkit-text-stroke: 0.5px var(--stroke-color);
    text-stroke: 0.5px var(--stroke-color);
  }
  
  .back-button {
    display: inline-block;
    margin-top: 30px;
    text-decoration: none;
    color: white;
    background-color: #f8bdca;
    padding: 0.85em 4em;
    border-radius: 1000px;
    font-weight: 600;
    text-transform: uppercase;
    transition: 150ms ease;
    -webkit-text-stroke: 0.5px #aa7a85;
    text-stroke: 0.5px #aa7a85;
  }
  
  .back-button:hover {
    background-color: #c38592;
    text-decoration: none;
  }
  
  @media(max-width: 1100px) {
    .wrapper {
      width: min(600px, 100%);
      border-radius: 0;
    }
    
    h1 {
      font-size: 2.5rem;
    }
    
    .message {
      font-size: 1.1rem;
    }
  }
  </style>