<template>
    <div class="feedback-container">
      <header>
        <!-- Reuse your header component -->
        <div class="logo-container">
          <router-link to="/home">
            <div class="logo">
              <img src="../views/images/homelogo.jpg" alt="ILoveYarnPH" class="logo-img">
            </div>
            <div class="store-name">ILoveYarnPH | Feedback</div>
          </router-link>
        </div>
        <div class="user-actions">
        </div>
      </header>
  
      <div class="feedback-content">
        <h1>Service Feedback</h1>
        <form @submit.prevent="submitFeedback">
          <div class="rating-section">
            <label>How would you rate our service?</label>
            <div class="star-rating">
              <button 
                v-for="star in 5" 
                :key="star" 
                type="button" 
                @click="selectedRating = star"
                :class="{ 'active': star <= selectedRating }"
              >
                ★
              </button>
            </div>
          </div>
  
          <div class="comments-section">
            <label>Additional comments:</label>
            <textarea
              v-model="comments"
              rows="5"
              placeholder="Tell us about your experience..."
            ></textarea>
          </div>
  
          <button type="submit" class="submit-button">Submit Feedback</button>
        </form>
      </div>
    </div>
  </template>
  
  <script>
  import { ref } from 'vue';
  import { supabase } from '../lib/supabaseClient';
  
  export default {
    setup() {
      const selectedRating = ref(0);
      const comments = ref('');
  
      const submitFeedback = async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('Please login to submit feedback');
  
          const { error } = await supabase
            .from('user_feedback')
            .insert({
              userfeedback_rating: selectedRating.value,
              userfeedback_comments: comments.value,
              useracc_id: user.id
            });
  
          if (error) throw error;
          
          alert('Thank you for your feedback!');
          selectedRating.value = 0;
          comments.value = '';
        } catch (error) {
          console.error('Feedback error:', error);
          alert(error.message || 'Failed to submit feedback');
        }
      };
  
      return { selectedRating, comments, submitFeedback };
    }
  };
  </script>
  
  <style scoped>
  .feedback-container {
    max-width: 800px;
    margin: 2rem auto;
    padding: 1rem;
  }
  
  .feedback-content {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }
  
  .star-rating {
    margin: 1rem 0;
  }
  
  .star-rating button {
    background: none;
    border: none;
    font-size: 2rem;
    color: #ccc;
    cursor: pointer;
    transition: color 0.2s;
  }
  
  .star-rating button.active {
    color: #ffd700;
  }
  
  .comments-section textarea {
    width: 100%;
    padding: 1rem;
    margin: 1rem 0;
    border: 1px solid #ddd;
    border-radius: 8px;
  }
  
  .submit-button {
    background: var(--primary-color);
    color: white;
    padding: 1rem 2rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem;
  }
  </style>