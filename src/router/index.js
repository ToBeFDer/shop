import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const Login = () => import('components/component/login/Login.vue')
const Home = () => import('views/home/Home')
const Welcome = () => import('views/welcome/Welcome')
const Users = () => import('views/users/Users')
const Rights = () => import('views/power/Rights')
const Roles = () => import('views/power/Roles')
const Cate = () => import('views/goods/Cate')
const Params = () => import('views/goods/Params')
const List = () => import('views/goods/List')
const Add = () => import('views/goods/Add')
const Order = () => import('views/order/Order')
const Report = () => import('views/report/Report')

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      // 子组件的地址是服务器规定的，因此这里必须和服务器保持一致
      {
        path: '/welcome',
        component: Welcome
      },
      {
        path: '/users',
        component: Users
      },
      {
        path: '/rights',
        component: Rights
      },
      {
        path: '/roles',
        component: Roles
      },
      {
        path: '/categories',
        component: Cate
      },
      {
        path: '/params',
        component: Params
      },
      {
        path: '/goods',
        component: List
      },
      {
        path: '/goods/add',
        component: Add
      },
      {
        path: '/orders',
        component: Order
      },
      {
        path: '/reports',
        component: Report
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to 表示要访问的路径
  // from 代表从哪个路径跳转而来呢
  // next 是一个函数，表示放行
  // next()放行， next('./login')强制跳转
  if (to.path === '/login') {
    return next()
  }
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) {
    return next('/login')
  }
  next()
})

export default router
