<template>
  <div class="page">
  <div class="wrapper">
    <h1>Signup</h1>
    <p id="error-message">{{ errorMessage }}</p>
    <form @submit.prevent="signUp">
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
        <label for="email-input">
          <span>@</span>
        </label>
        <input 
          type="email" 
          v-model="email" 
          id="email-input" 
          placeholder="Email" 
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
      <div :class="{ incorrect: hasError }">
        <label for="password-input">
          <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm240-200q33 0 56.5-23.5T560-360q0-33-23.5-56.5T480-440q-33 0-56.5 23.5T400-360q0 33 23.5 56.5T480-280ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80Z"/></svg>
        </label>
        <input 
          type="password" 
          v-model="password" 
          id="password-input" 
          placeholder="Password" 
          required
        >
      </div>
      <div :class="{ incorrect: hasError }">
        <label for="repeat-password-input">
          <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm240-200q33 0 56.5-23.5T560-360q0-33-23.5-56.5T480-440q-33 0-56.5 23.5T400-360q0 33 23.5 56.5T480-280ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80Z"/></svg>
        </label>
        <input 
          type="password" 
          v-model="repeatPassword" 
          id="repeat-password-input" 
          placeholder="Repeat Password" 
          required
        >
      </div>
      <button type="submit" :disabled="isLoading">
        {{ isLoading ? 'Signing up...' : 'Signup' }}
      </button>
    </form>
    <p>Already have an Account? <router-link to="/">login</router-link></p>
  </div>
</div>
</template>

<script>
import { ref, computed } from 'vue';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'vue-router';
import bcrypt from 'bcryptjs';

export default {
  setup() {
    const router = useRouter();
    const firstname = ref("");
    const lastname = ref("");
    const email = ref("");
    const phoneNum = ref("");
    const address = ref("");
    const password = ref("");
    const repeatPassword = ref("");
    const errorMessage = ref("");
    const isLoading = ref(false);
    
    const hasError = computed(() => errorMessage.value !== "");

    const signUp = async () => {
      errorMessage.value = "";
      isLoading.value = true;
      
      try {
        if (password.value !== repeatPassword.value) {
          throw new Error("Passwords do not match");
        }

        // Hash password
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password.value, salt);

        // Create Supabase auth user
        const { data, error } = await supabase.auth.signUp({
          email: email.value,
          password: password.value,
        });

        if (error) throw error;
        if (!data.user) throw new Error("Signup failed, please try again.");

        // Insert into custom user table
        const { error: insertError } = await supabase
          .from("user_account")
          .insert([
            {
              supabase_uid: data.user.id,
              useracc_fname: firstname.value,
              useracc_lname: lastname.value,
              useracc_email: email.value,
              useracc_phone: phoneNum.value,
              useracc_address: address.value,
              useracc_password_hash: hashedPassword
            }
          ]);

        if (insertError) throw insertError;

        alert("Signup successful! Please check your email for confirmation.");
        router.push('/authentication');
      } catch (err) {
        console.error("Signup error:", err);
        errorMessage.value = err.message;
      } finally {
        isLoading.value = false;
      }
    };

    return { 
      firstname, 
      lastname, 
      email, 
      phoneNum, 
      address, 
      password, 
      repeatPassword, 
      signUp, 
      errorMessage,
      isLoading,
      hasError
    };
  },
};
</script>


<style>
body {
  margin: 0;
  padding: 0;
}
</style>
<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@100;400;600;900&display=swap');

.page {
  margin: 0;
  padding: 0;
  font-family: Poppins, Segoe UI, sans-serif;
  font-size: 12pt;
  color: #f8bdca;
  text-align: center;
  min-height: 100vh;
  background-image: url(bg.png);
  background-size: fill;
  background-position: left;
  overflow: hidden;

}

.wrapper {
  box-sizing: border-box;
  background-color:white;
  height: 100vh;
  width: max(40%, 600px);
  padding: 10px;
  border-radius: 20px 0 0 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  float: left;
}

h1 {
  font-size: 3rem;
  font-weight: 900;
  text-transform: uppercase;
  -webkit-text-stroke: 1px #c38592;

}

form {
  width: min(400px, 100%);
  margin-top: 20px;
  margin-bottom: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

form > div {
  width: 100%;
  display: flex;
  justify-content: center;
}

form label {
  flex-shrink: 0;
  height: 50px;
  width: 50px;
  background-color: #f8bdca;
  fill: white;
  color: white;
  border-radius: 10px 0 0 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.5rem;
  font-weight: 500;
}

form input {
  box-sizing: border-box;
  flex-grow: 1;
  min-width: 0;
  height: 50px;
  padding: 1em;
  font: inherit;
  border-radius: 0 10px 10px 0;
  border: 2px solid #F3F0FF;
  border-left: none;
  background-color: #F3F0FF;
  transition: 150ms ease;

}

form input:hover {
  border-color: #f8bdca;
}

form input:focus {
  outline: none;
  border-color: #f8bdca;
}

div:has(input:focus) > label {
  background-color: #f8bdca;
}

form input::placeholder {
  color: #f8bdca;

}

form button {
  margin-top: 10px;
  border: none;
  border-radius: 1000px;
  padding: .85em 4em;
  background-color: #f8bdca;
  color: white;
  font: inherit;
  font-weight: 600;
  text-transform: uppercase;
  cursor: pointer;
  transition: 150ms ease;

}

form button:hover {
  background-color: #f8bdca;
}

form button:focus {
  outline: none;
  background-color: #f8bdca;
}

form button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

a {
  text-decoration: none;
  color: #f8bdca;

}

a:hover {
  text-decoration: underline;
}

@media(max-width: 1100px) {
  .wrapper {
    width: min(600px, 100%);
    border-radius: 0;
  }
}

form div.incorrect label {
  background-color: #f06272;
}

form div.incorrect input {
  border-color: #f06272;
}

#error-message {
  color: #f06272;
  -webkit-text-stroke: 1px #d14d5c;

}
</style>