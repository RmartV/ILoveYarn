import { createRouter, createWebHistory } from 'vue-router';
import Login from '../components/Login.vue';
import Signup from '../components/Signup.vue';
import ProfileSetup from '../views/ProfileSetup.vue';
import Home from '../views/Home.vue';
import Authentication from '../views/Authentication.vue';
import UserAccount from '../views/UserAccount.vue';
import Usercart from '@/views/Usercart.vue';
import Transaction from '@/views/Transaction.vue';

const routes = [
  { path: '/', component: Login }, // Default route is Login
  { path: '/signup', component: Signup },
  { path: '/profile-setup', component: ProfileSetup },
  { path: '/authentication', component: Authentication },
  { path: '/user-details', component: UserAccount},
  { path:  '/user-cart', component: Usercart},
  { path: '/home', component: Home }, // Home page after login
  { 
    path: '/transaction/:cartId', 
    component: Transaction,
    props: true 
  },
  {
    path: '/order-history',
    component: () => import('@/views/OrderHistory.vue')
  },
  {
    path: '/order-details/:orderId',
    component: () => import('@/views/OrderHistory.vue'),
    props: true
  },
  {
    path: '/order-confirmation',
    component: () => import('@/views/OrderConfirmation.vue'),
    props: (route) => ({ transaction_id: route.query.transaction_id })
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;