import { createRouter, createWebHashHistory } from "vue-router";
import dmsRoutes from "./routes/wjs";
import reportRoutes from "./routes/report";
import masterRoutes from "./routes/master";
import transactionRoutes from "./routes/transaction";
import { authGuard, guestGuard } from "./router/guards";

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    ...dmsRoutes,
    ...reportRoutes,
    ...masterRoutes,
    ...transactionRoutes,
    {
      path: "/history_document",
      redirect: "/report/history_document"
    },
    {
      path: "/",
      redirect: "/dashboard",
      component: () => import("./layouts/MainLayout.vue"),
      children: [
        { path: "dashboard", component: () => import("./pages/Index.vue") },
        {
          path: "user",
          component: () => import("./pages/User.vue"),
        },
        {
          path: "domain",
          component: () => import("./pages/Domain.vue"),
        },
        {
          path: "site",
          component: () => import("./pages/Site.vue"),
        },
        {
          path: "application",
          component: () => import("./pages/Application.vue"),
        },
        
        /* {
          path: "payment",
          component: () => import("./pages/additional_fee/Payment.vue"),
        }, */
        /* Digitalisasi Laporan Projection (Akhir) */
      ],
      beforeEnter: (to, from, next) => {
        if (!window.localStorage.getItem("token")) {
          next({
            path: "/login",
          });
        } else {
          next();
        }
      },
    },
    {
      path: "/login",
      component: () => import("./layouts/MainLogin.vue"),
      beforeEnter: guestGuard,
    },
    {
      path: "/login_portal",
      component: () => import("./layouts/MainLoginPortal.vue"),
    },
    {
      path: "/approval",
      component: () => import("./pages/WJS/Agreement/ApprovalForm.vue"),
    },
    // Always leave this as last one,
    // but you can also remove it
    {
      path: "/:catchAll(.*)*",
      component: () => import("./pages/Error404.vue"),
    },
  ],
});

router.beforeEach((to, from, next) => {
  window.scrollTo(0, 0);

  if (to.meta.title) {
    document.title = to.meta.title;
  }
  if (to.meta.description) {
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', to.meta.description);
    }
  }
  next();
});

export default router;

