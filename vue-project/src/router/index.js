import { createRouter, createWebHistory } from 'vue-router';
import Login from '../components/Login.vue';
import Signup from '@/views/Signup.vue';
import Home from '../views/Home.vue';

const routes = [
  { path: '/', component: Login }, // Default route is Login
  { path: '/signup', component: Signup },
  { path: '/home', component: Home } // Home page after login
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;