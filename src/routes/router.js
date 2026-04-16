import { createRouter, createWebHashHistory } from "vue-router";
import { role } from "./../utils";

import master from './master';
import dms from './wjs';
import collection from './collectionList';
import spk from './spk';
import report from './report';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    ...master,//Master general
    ...collection,//List Collection
    ...dms,//DMS routes
    ...spk,//SPK routes
    ...report,//Report routes
    // Standalone approval pages (no auth, no sidebar)
    {
      path: "/approval/mutasi",
      component: () => import("./../layouts/StandaloneLayout.vue"),
      props: {
        headerTitle: "Approval Mutasi Arsip",
        headerSubtitle: "Workshop Job System (WJS)",
        headerIcon: "swap_horiz",
        headerColor: "blue"
      },
      children: [
        {
          path: "",
          component: () => import("./../pages/WJS/PemindahanDanPemusnahan/MutasiApprovalStandalonePage.vue"),
        }
      ]
    },
    {
      path: "/approval/peminjaman",
      component: () => import("./../layouts/StandaloneLayout.vue"),
      props: {
        headerTitle: "Approval Peminjaman Dokumen",
        headerSubtitle: "Workshop Job System (WJS)",
        headerIcon: "folder_shared",
        headerColor: "blue"
      },
      children: [
        {
          path: "",
          component: () => import("./../pages/WJS/Peminjaman/ApprovalDirect.vue"),
        }
      ]
    },
    // Add more approval routes here as needed
    // Example for Pemusnahan (when implemented):
    {
      path: "/approval/pemusnahan",
      component: () => import("./../layouts/StandaloneLayout.vue"),
      props: {
        headerTitle: "Approval Pemusnahan Arsip",
        headerSubtitle: "Workshop Job System (WJS)",
        headerIcon: "delete_forever",
        headerColor: "red"
      },
      children: [
        {
          path: "",
          component: () => import("./../pages/WJS/PemindahanDanPemusnahan/PemusnahanApprovalStandalonePage.vue"),
        }
      ]
    },
    {
      path: "/approval/pengaduan",
      component: () => import("./../layouts/StandaloneLayout.vue"),
      props: {
        headerTitle: "Approval Pengaduan",
        headerSubtitle: "Workshop Job System (WJS)",
        headerIcon: "report_problem",
        headerColor: "blue"
      },
      children: [
        {
          path: "",
          component: () => import("./../pages/WJS/Pengaduan/PengaduanApprovalStandalonePage.vue"),
        }
      ]
    },
    {
      path: "/approval/peminjaman",
      component: () => import("./../layouts/StandaloneLayout.vue"),
      props: {
        headerTitle: "Approval Permintaan Dokumen",
        headerSubtitle: "Workshop Job System (WJS)",
        headerIcon: "folder_shared",
        headerColor: "blue"
      },
      children: [
        {
          path: "",
          component: () => import("./../pages/WJS/Peminjaman/ApprovalDirect.vue"),
        }
      ]
    },
    {
      path: "/",
      redirect: (to) => {
        // Check if user has token
        if (window.localStorage.getItem("token")) {
          return "/master/dashboard";
        } else {
          return "/login";
        }
      }
    },
    {
      path: "/dashboard",
      redirect: "/master/dashboard"
    },
    {
      path: "/login",
      component: () => import("./../layouts/MainLogin.vue"),
    },
    {
      path: "/approval",
      name: "PublicApproval",
      component: () => import("./../pages/WJS/Peminjaman/ApprovalDirect.vue"),
    },
    {
      path: "/404",
      component: () => import("./../pages/Error404.vue"),
    },
    {
      path: "/login-pass",
      component: () => import("./../layouts/MainLayout.vue"),
    },
    // Always leave this as last one,
    // but you can also remove it
    {
      path: "/:catchAll(.*)*",
      component: () => import("./../pages/Error404.vue"),
    },
  ],
});


router.beforeEach(async (to, from, next) => {
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


