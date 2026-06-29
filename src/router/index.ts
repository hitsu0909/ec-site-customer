import { createRouter, createWebHistory } from "vue-router";

import UserLogin from "../components/UserLogin.vue";
import RegisterForm from "../components/RegisterForm.vue";
import RegisterConfirm from "../components/RegisterConfirm.vue";
import RegisterComplete from "../components/RegisterComplete.vue";
import ProductList from "../components/ProductList.vue";
import ProductDetail from "../components/ProductDetail.vue";
import Cart from "../components/Cart.vue";
import OrderConfirm from "../components/OrderConfirm.vue";
import OrderComplete from "../components/OrderComplete.vue";
import Profile from "../components/Profile.vue";
import ProfileEdit from "../components/ProfileEdit.vue";
import OrderHistory from "../components/OrderHistory.vue";
import OrderDetail from "../components/OrderDetail.vue";

const routes = [
  // { path: '/', component: Top }        // 任意（無くてもOK）
  {
    path: "/userlogin",
    name: "login",
    component: UserLogin,
    meta: { hideHeader: true },
  },
  {
    path: "/register",
    name: "register",
    component: RegisterForm,
    meta: { hideHeader: true },
  },
  {
    path: "/confirm",
    name: "confirm",
    component: RegisterConfirm,
    meta: { hideHeader: true },
  },
  {
    path: "/complete",
    component: RegisterComplete,
    meta: { hideHeader: true },
  },
  { path: "/products", component: ProductList },
  { path: "/products/:id", component: ProductDetail },
  { path: "/cart", component: Cart },
  { path: "/orderconfirm", component: OrderConfirm },
  { path: "/ordercomplete", component: OrderComplete },
  {
    path: "/profile",
    component: Profile,
  },
  {
    path: "/profileedit",
    component: ProfileEdit,
  },
  {
    path: "/orderhistory",
    component: OrderHistory,
  },
  {
    path: "/orderdetail/:id",
    component: OrderDetail,
  },
  {
    path: "/",
    redirect: "/userlogin",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
