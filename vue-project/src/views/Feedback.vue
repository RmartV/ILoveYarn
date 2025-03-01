<template>
  <div class="feedback-container">
    <!-- Original header preserved -->
    <header>
      <div class="logo-container">
        <router-link to="/home">
          <div class="logo">
            <img src="../views/images/homelogo.jpg" alt="ILoveYarnPH" class="logo-img">
          </div>
          <div class="store-name">ILoveYarnPH | Checkout</div>
        </router-link>
      </div>
      <div class="user-actions"></div>
    </header>

    <div class="feedback-content">
      <h1 class="page-title">Service Feedback</h1>
      
      <!-- Improved Feedback Form -->
      <div class="form-container">
        <form @submit.prevent="submitFeedback" class="feedback-form">
          <div class="rating-section">
            <label class="form-label">How would you rate our service?</label>
            <div class="star-rating">
              <button 
                v-for="star in 5" 
                :key="star" 
                type="button" 
                @click="selectedRating = star"
                :class="{ 'active': star <= selectedRating }"
                aria-label="Star rating"
              >
                <span class="star-icon">★</span>
              </button>
            </div>
            <span class="rating-text">{{ getRatingText(selectedRating) }}</span>
          </div>

          <div class="comments-section">
            <label class="form-label">Additional comments:</label>
            <textarea
              v-model="comments"
              rows="4"
              placeholder="Tell us about your experience..."
              class="comments-input"
            ></textarea>
            <div class="char-counter" :class="{ 'limit-warning': comments.length > 200 }">
              {{ comments.length }}/250 characters
            </div>
          </div>

          <button type="submit" class="submit-button" :disabled="!selectedRating">
            Submit Feedback
          </button>
        </form>
      </div>

      <!-- Improved Reviews Section -->
      <div class="reviews-section">
        <div class="reviews-header">
          <h2>Customer Reviews</h2>
          <div class="overall-rating" v-if="feedbackEntries.length > 0">
            <span class="average">{{ calculateAverageRating() }}</span>
            <div class="stars">
              <div class="filled-stars" :style="{ width: (calculateAverageRating() / 5 * 100) + '%' }">★★★★★</div>
              <div class="empty-stars">★★★★★</div>
            </div>
            <span class="review-count">{{ feedbackEntries.length }} reviews</span>
          </div>
        </div>
        
        <div class="filter-bar">
          <select v-model="filterRating" class="rating-filter">
            <option value="0">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>

        <div v-if="loading" class="loading">
          <div class="spinner"></div>
          <span>Loading reviews...</span>
        </div>
        
        <div v-else-if="filteredReviews.length === 0" class="no-reviews">
          <img src="../views/images/no-reviews.svg" alt="No reviews" class="empty-state-img">
          <p>No reviews found</p>
        </div>
        
        <div v-else class="review-list">
          <div v-for="feedback in filteredReviews" :key="feedback.userfeedback_id" class="review-card">
            <div class="review-header">
              <div class="user-info">
                <div class="avatar">{{ getUserInitials(feedback.user?.useracc_fname) }}</div>
                <span class="user-name">{{ feedback.user?.useracc_fname || 'Anonymous' }}</span>
              </div>
              <div class="rating-date">
                <div class="rating">
                  <span v-for="star in 5" :key="star" :class="{'filled': star <= feedback.userfeedback_rating}">★</span>
                </div>
                <span class="review-date">{{ formatDate(feedback.created_at) }}</span>
              </div>
            </div>
            <p class="comment">{{ feedback.userfeedback_comments }}</p>
          </div>
          
          <button v-if="hasMoreReviews" @click="loadMore" class="load-more-button">
            Load More Reviews
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { supabase } from '../lib/supabaseClient';

export default {
  setup() {
    const selectedRating = ref(0);
    const comments = ref('');
    const feedbackEntries = ref([]);
    const loading = ref(true);
    const filterRating = ref(0);
    const visibleReviews = ref(5);
    
    const filteredReviews = computed(() => {
      if (filterRating.value === 0) return feedbackEntries.value.slice(0, visibleReviews.value);
      return feedbackEntries.value
        .filter(feedback => feedback.userfeedback_rating === filterRating.value)
        .slice(0, visibleReviews.value);
    });
    
    const hasMoreReviews = computed(() => {
      const totalCount = filterRating.value === 0 
        ? feedbackEntries.value.length 
        : feedbackEntries.value.filter(f => f.userfeedback_rating === filterRating.value).length;
      return visibleReviews.value < totalCount;
    });

    const calculateAverageRating = () => {
      if (feedbackEntries.value.length === 0) return 0;
      const sum = feedbackEntries.value.reduce((acc, curr) => acc + curr.userfeedback_rating, 0);
      return (sum / feedbackEntries.value.length).toFixed(1);
    };
    
    const getRatingText = (rating) => {
      const texts = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];
      return texts[rating] || "";
    };
    
    const getUserInitials = (name) => {
      if (!name) return "?";
      return name.charAt(0).toUpperCase();
    };

    const loadMore = () => {
      visibleReviews.value += 5;
    };

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
      if (!selectedRating.value) {
        alert('Please select a rating');
        return;
      }
      
      try {
        loading.value = true;
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
      } finally {
        loading.value = false;
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
      formatDate,
      filterRating,
      filteredReviews,
      hasMoreReviews,
      loadMore,
      getRatingText,
      calculateAverageRating,
      getUserInitials
    };
  }
};
</script>

<style scoped>
/* General Styles */
.feedback-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.page-title {
  text-align: center;
  margin-bottom: 2.5rem;
  color: #6b46c1;
  font-size: 2.2rem;
  font-weight: 700;
}

/* Form Styles */
.form-container {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  padding: 2rem;
  margin-bottom: 3rem;
}

.form-label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #333;
  font-size: 1.1rem;
}

.rating-section {
  margin-bottom: 1.5rem;
  text-align: center;
}

.star-rating {
  display: flex;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.star-rating button {
  background: none;
  border: none;
  font-size: 2.5rem;
  color: #e2e8f0;
  cursor: pointer;
  transition: transform 0.2s;
  padding: 0 0.25rem;
}

.star-rating button:hover {
  transform: scale(1.1);
}

.star-rating button.active {
  color: #ffd700;
}

.rating-text {
  display: block;
  height: 1.5rem;
  font-size: 1rem;
  color: #666;
}

.comments-section {
  margin-bottom: 1.5rem;
}

.comments-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  resize: vertical;
  font-family: inherit;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.comments-input:focus {
  border-color: #6b46c1;
  outline: none;
  box-shadow: 0 0 0 3px rgba(107, 70, 193, 0.1);
}

.char-counter {
  text-align: right;
  font-size: 0.8rem;
  color: #888;
  margin-top: 0.25rem;
}

.char-counter.limit-warning {
  color: #e53e3e;
}

.submit-button {
  display: block;
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  background-color: #6b46c1;
  color: white;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-button:hover {
  background-color: #553c9a;
}

.submit-button:disabled {
  background-color: #a0aec0;
  cursor: not-allowed;
}

/* Reviews Section */
.reviews-section {
  margin-top: 3rem;
}

.reviews-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.reviews-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
}

.overall-rating {
  display: flex;
  align-items: center;
}

.average {
  font-size: 1.5rem;
  font-weight: 700;
  margin-right: 0.75rem;
}

.stars {
  position: relative;
  display: inline-block;
  font-size: 1.25rem;
  width: 6.25rem;
  height: 1.25rem;
  margin-right: 0.75rem;
}

.filled-stars {
  position: absolute;
  top: 0;
  left: 0;
  white-space: nowrap;
  overflow: hidden;
  color: #ffd700;
}

.empty-stars {
  position: absolute;
  top: 0;
  left: 0;
  color: #e2e8f0;
}

.review-count {
  color: #666;
  font-size: 0.9rem;
}

.filter-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
}

.rating-filter {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.review-card {
  background: #fff;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  transition: transform 0.2s;
}

.review-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #6b46c1;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-right: 0.75rem;
};
</style>