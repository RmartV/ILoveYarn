<template>
  <div class="feedback-container">
    <header>
      <div class="logo-container">
        <router-link to="/home">
          <div class="logo">
            <img src="../views/images/homelogo.jpg" alt="ILoveYarnPH" class="logo-img">
          </div>
          <div class="store-name">ILoveYarnPH | Checkout</div>
        </router-link>
      </div>
      <div class="user-actions">
        
      </div>
    </header>

    <div class="feedback-content">
      <h1>Service Feedback</h1>
      
      <!-- Feedback Form -->
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

      <!-- Existing Reviews -->
      <div class="reviews-section">
        <h2>Recent Reviews</h2>
        <div v-if="loading" class="loading">Loading reviews...</div>
        <div v-else>
          <div v-for="feedback in feedbackEntries" :key="feedback.userfeedback_id" class="review-card">
            <div class="review-header">
              <span class="user-name">{{ feedback.user?.useracc_fname }}</span>
              <div class="rating">
                <span v-for="star in feedback.userfeedback_rating" :key="star">★</span>
              </div>
            </div>
            <p class="comment">{{ feedback.userfeedback_comments }}</p>
            <span class="review-date">{{ formatDate(feedback.created_at) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { supabase } from '../lib/supabaseClient';

export default {
  setup() {
    const selectedRating = ref(0);
    const comments = ref('');
    const feedbackEntries = ref([]);
    const loading = ref(true);

    const fetchFeedback = async () => {
      try {
        const { data, error } = await supabase
          .from('user_feedback')
          .select(`
            *,
            user:useracc_id (
              useracc_fname
            )
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        feedbackEntries.value = data;
      } catch (error) {
        console.error('Fetch feedback error:', error);
        alert('Failed to load reviews');
      } finally {
        loading.value = false;
      }
    };

    const submitFeedback = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Please login to submit feedback');

        // Get database user ID
        const { data: userData, error: userError } = await supabase
          .from('user_account')
          .select('useracc_id')
          .eq('supabase_uid', user.id)
          .single();

        if (userError) throw userError;

        const { error } = await supabase
          .from('user_feedback')
          .insert({
            userfeedback_rating: selectedRating.value,
            userfeedback_comments: comments.value,
            useracc_id: userData.useracc_id
          });

        if (error) throw error;
        
        alert('Thank you for your feedback!');
        selectedRating.value = 0;
        comments.value = '';
        await fetchFeedback(); // Refresh the list
      } catch (error) {
        console.error('Feedback error:', error);
        alert(error.message || 'Failed to submit feedback');
      }
    };

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    onMounted(fetchFeedback);

    return { 
      selectedRating, 
      comments, 
      submitFeedback,
      feedbackEntries,
      loading,
      formatDate
    };
  }
};
</script>

<style scoped>
.reviews-section {
  margin-top: 3rem;
}

.review-card {
  background: #fff;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.user-name {
  font-weight: 600;
  color: #333;
}

.rating {
  color: #ffd700;
}

.comment {
  color: #666;
  line-height: 1.6;
  margin-bottom: 0.5rem;
}

.review-date {
  font-size: 0.9rem;
  color: #999;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}
</style>