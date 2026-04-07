import { createRouter, createWebHashHistory } from 'vue-router';

import HomePage from '@/pages/HomePage.vue';
import CompetitionPage from '@/pages/CompetitionPage.vue';
import RegistrationPage from '@/pages/RegistrationPage.vue';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
    },
    {
      path: '/competition',
      name: 'competition',
      component: CompetitionPage,
    },
    {
      path: '/register/:type(individual|team)',
      name: 'register',
      component: RegistrationPage,
      props: true,
    },
  ],
});

export default router;
