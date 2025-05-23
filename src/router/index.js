import { createRouter, createWebHistory } from 'vue-router';
import RegisterView from '../views/Register.vue';
import LoginView from '../views/Login.vue';
import HomeView from '../views/Home.vue';
import EditProfile from '@/views/EditProfile.vue';
import LandingView from '@/views/Landing.vue';
import SupportView from '@/views/Support.vue';
import AdminDashboard from '@/views/AdminDashboard.vue';

const routes = [
  { path: '/register', component: RegisterView },
  { path: '/login', component: LoginView },
  { path: '/home', component: HomeView },
  { path: '/home/edit', component: EditProfile },
  { path: '/support', component: SupportView },
  { path: '/', component: LandingView },
  { path: '/admin-dashboard', component: AdminDashboard, meta: { requiresAdmin: true }
}
];

const router = createRouter({
  history: createWebHistory(),
  routes
});
router.beforeEach((to, from, next) => {
  const user = JSON.parse(localStorage.getItem('user'));

  if (to.meta.requiresAdmin) {
    if (user && user.role === 'admin') {
      next(); // Utente è admin, può procedere
    } else {
      next('/login'); // Non è admin, lo rimandiamo al login (o altro)
    }
  } else {
    next(); // Nessuna protezione speciale, procedi
  }
});

export default router;
