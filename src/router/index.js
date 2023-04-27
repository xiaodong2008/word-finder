import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/home'
import RegisterView from '../views/register'
import LoginView from '../views/login'
import DictionaryView from "../views/dictionary";
import DashboardView from "../views/dashboard";
import SettingView from "../views/setting";

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView
  },
  {
    path: '/dictionary',
    name: 'dictionary',
    component: DictionaryView
  },
  {
    path: '/setting',
    name: 'setting',
    component: SettingView
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
