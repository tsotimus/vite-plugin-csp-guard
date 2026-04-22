import { createRouter, createWebHistory } from "vue-router";
import App from "../App.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "root",
      component: App,
    },
    {
      path: "/hello",
      name: "hello",
      component: () => import("../Hello.vue"),
    },
    {
      path: "/bye",
      name: "bye",
      component: () => import("../Bye.vue"),
    },
    {
      path: "/four",
      name: "four",
      component: () => import("../Four.vue"),
    },
  ],
});

export default router;
