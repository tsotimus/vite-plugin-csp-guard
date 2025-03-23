import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "root",
      component: () => import("../App.vue"),
    },
    {
      path: "/hello",
      name: "hello",
      component: () => import("../Hello.vue"),
    },
  ],
});

export default router;
