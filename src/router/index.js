import { createRouter, createWebHistory } from 'vue-router';
import RegisterView from '../views/Register.vue';
import LoginView from '../views/Login.vue';
import HomeView from '../views/Home.vue';
import EditProfile from '@/views/EditProfile.vue'

const routes = [
  { path: '/register', component: RegisterView },
  { path: '/login', component: LoginView },
  { path: '/home', component: HomeView },
  { path: '/home/edit', component: EditProfile },
  { path: '/', redirect: '/register' }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
