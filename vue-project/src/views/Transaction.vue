<template>
    <div class="transaction-container">
      <header><!-- Reuse header from usercart.vue --></header>
      
      <div class="transaction-content">
        <h2>Transaction #{{ transactionId }}</h2>
        
        <div class="transaction-summary">
          <p>Total Items: {{ transactionDetails.transaction_totalitems }}</p>
          <p>Total Amount: ₱{{ transactionDetails.transaction_totalamount?.toFixed(2) }}</p>
        </div>
  
        <form @submit.prevent="processPayment">
          <div class="payment-method">
            <label>
              <input 
                type="radio" 
                v-model="paymentMethod" 
                value="COD"
              > Cash on Delivery
            </label>
            
            <label>
              <input 
                type="radio" 
                v-model="paymentMethod" 
                value="E-WALLET"
              > E-Wallet
            </label>
          </div>
  
          <div v-if="paymentMethod === 'E-WALLET'" class="ewallet-details">
            <input
              type="tel"
              v-model="ewalletPhone"
              placeholder="Enter phone number"
              required
            >
          </div>
  
          <button type="submit" :disabled="processing">
            {{ processing ? 'Processing...' : 'Confirm Payment' }}
          </button>
        </form>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import { supabase } from '../lib/supabaseClient';
  import { useRoute, useRouter } from 'vue-router';
  
  export default {
    setup() {
      const route = useRoute();
      const router = useRouter();
      const transactionId = route.params.transactionId;
      const transactionDetails = ref({});
      const paymentMethod = ref('');
      const ewalletPhone = ref('');
      const processing = ref(false);
  
      const fetchTransaction = async () => {
        const { data, error } = await supabase
          .from('transaction')
          .select('*')
          .eq('transaction_id', transactionId)
          .single();
  
        if (error) throw error;
        transactionDetails.value = data;
      };
  
      const processPayment = async () => {
        processing.value = true;
        try {
          // Update transaction
          const updates = {
            transaction_methodtype: paymentMethod.value,
            transaction_status: 'PROCESSING'
          };
  
          const { error: updateError } = await supabase
            .from('transaction')
            .update(updates)
            .eq('transaction_id', transactionId);
  
          if (updateError) throw updateError;
  
          // Handle payment method specifics
          if (paymentMethod.value === 'E-WALLET') {
            const referenceNumber = generateReferenceNumber();
            const { error: ewalletError } = await supabase
              .from('e_wallet')
              .insert([{
                transaction_id: transactionId,
                ewallet_phonenumber: ewalletPhone.value,
                ewallet_referencenumber: referenceNumber
              }]);
  
            if (ewalletError) throw ewalletError;
          }
  
          // Simulate payment processing
          setTimeout(async () => {
            const { error: completeError } = await supabase
              .from('transaction')
              .update({ transaction_status: 'SUCCESS' })
              .eq('transaction_id', transactionId);
  
            if (completeError) throw completeError;
            alert('Payment successful!');
            router.push('/order-confirmation');
          }, 2000);
  
        } catch (error) {
          console.error('Payment error:', error);
          await supabase
            .from('transaction')
            .update({ transaction_status: 'CANCELLED' })
            .eq('transaction_id', transactionId);
          
          alert('Payment failed: ' + error.message);
        } finally {
          processing.value = false;
        }
      };
  
      const generateReferenceNumber = () => {
        return 'REF-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      };
  
      onMounted(fetchTransaction);
  
      return {
        transactionId,
        transactionDetails,
        paymentMethod,
        ewalletPhone,
        processing,
        processPayment
      };
    }
  };
  </script>
  <style></style>