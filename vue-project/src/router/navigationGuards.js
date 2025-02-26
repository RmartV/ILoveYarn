import { supabase } from '../lib/supabaseClient';

export const orderDetailsGuard = async (to) => {
  try {
    const { data } = await supabase
      .from('order_details')
      .select('useracc_id')
      .eq('orderdetails_id', to.params.orderId)
      .single();

    const { data: { user } } = await supabase.auth.getUser();
    
    if (data.useracc_id !== user.id) {
      return '/unauthorized';
    }
    
    return true;
  } catch (error) {
    return '/order-not-found';
  }
};