export default [
  {
    path: "/",
    redirect: "/dashboard",
    component: () => import("./../layouts/MainLayout.vue"),
    children: [
      {
        path: "collection/user",
        component: () => import("./../pages/Master/IndexUser.vue"),
      },
      {
        path: "collection/menu",
        component: () => import("./../pages/Master/IndexRole.vue"),
      },
      {
        path: "collection/dms-peminjaman-arsip",
        component: () => import("./../pages/Master/IndexRole.vue"),
      },
      {
        path: "collection/dms-master",
        component: () => import("./../pages/WJS/Master/Index.vue"),
      },
      {
        path: "collection/dms-no-document",
        component: () => import("./../pages/WJS/Agreement/Index.vue"),
      },
      {
        path: "collection/dms-doc-management",
        component: () => import("./../pages/WJS/Document/Index.vue"),
      },
      {
        path: "collection/dms-pemindahan-dan-penghapusan",
        component: () => import("./../pages/WJS/PemindahanDanPemusnahan/Index.vue"),
      },
      {
        path: "collection/dms-pengaduan",
        component: () => import("./../pages/WJS/Pengaduan/Index.vue"),
      },
      {
        path: "collection/dms-rekapitulasi",
        component: () => import("./../pages/WJS/Rekapitulasi/Index.vue"),
      },
      {
        path: "collection/dms-report",
        component: () => import("./../pages/WJS/Document/Index.vue"),
      },
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
]

