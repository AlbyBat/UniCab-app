import { createRouter, createWebHistory } from 'vue-router';
import RegisterView from '../views/Register.vue';
import LoginView from '../views/Login.vue';
import HomeView from '../views/Home.vue';
import EditProfile from '@/views/EditProfile.vue';
import LandingView from '@/views/Landing.vue';
import SupportView from '@/views/Support.vue';
import AdminDashboard from '@/views/AdminDashboard.vue';
import RideDetails from '../views/RideDetails.vue';
import BookingView from '../views/Booking.vue';
import AddRide from '@/views/AddRide.vue';
import BookingList from '@/views/BookingList.vue';
import RideList from '@/views/RideList.vue';
import EditRide from '@/views/EditRide.vue';
import EditBooking from '@/views/EditBooking.vue';
import AuthSuccess from '@/views/AuthSuccess.vue';
import NotificationsView from '@/views/Notifications.vue';
import ManageBookings from '@/views/ManageBookings.vue';
import ReviewsList from '@/views/ReviewsList.vue';
import ReportSubmitter from '@/views/ReportSubmitter.vue';
import ReviewSubmitter from '@/views/ReviewSubmitter.vue';
import AdminUsers from '@/views/AdminUsers.vue';
import AdminRides from '@/views/AdminRides.vue';
import AdminReports from '@/views/AdminReports.vue';

const routes = [
  { path: '/register', component: RegisterView },
  { path: '/login', component: LoginView },
  { path: '/auth-success',  component: AuthSuccess},
  { path: '/home/:id', component: HomeView },
  { path: '/home/:id/reviews', component: ReviewsList},
  { path: '/home/:id/report', component: ReportSubmitter},
  { path: '/home/notifications', component: NotificationsView },  
  { path: '/home/edit', component: EditProfile },
  { path: '/home/create', component: AddRide },
  { path: '/home/bookings', component: BookingList },
  { path: '/home/bookings/edit/:id', component: EditBooking },
  { path: '/home/rides', component: RideList },
  { path: '/home/rides/:id/edit', component: EditRide },
  { path: '/home/rides/:id/bookings', component: ManageBookings },
  { path: `/home/rides/:rideId/review/:userId`, component: ReviewSubmitter, props: true },
  { path: '/support', component: SupportView },
  { path: '/', component: LandingView },
  { path: '/:id', component: RideDetails },
  { path: '/booking/:id', component: BookingView },
  { path: '/admin', component: AdminDashboard, meta: { requiresAdmin: true }},
  { path: '/admin/users', component: AdminUsers, meta: { requiresAdmin: true }},
  { path: '/admin/rides', component: AdminRides, meta: { requiresAdmin: true }},
  { path: '/admin/reports', component: AdminReports, meta: { requiresAdmin: true },
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
