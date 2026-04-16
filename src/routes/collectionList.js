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
        path: "collection/wjs-master-data",
        component: () => import("./../pages/WJS/MasterData/Index.vue"),
      },
      {
        path: "collection/wjs-master-transactions",
        component: () => import("./../pages/WJS/MasterTransactions/Index.vue"),
      },
      {
        path: "collection/terima-spk",
        component: () => import("./../pages/WJS/TerimaSPK/Index.vue"),
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
      {
        path: "collection/report-service-level",
        component: () => import("./../pages/Report/ServiceLevelCollection/Index.vue"),
      },
      {
        path: "collection/report-spk",
        component: () => import("./../pages/Report/SpkCollection/Index.vue"),
      },
      {
        path: "collection/report-lainnya",
        component: () => import("./../pages/Report/OtherReportCollection/Index.vue"),
      },
      {
        path: "collection-detail/:id/:parent/:parentName",
        component: () => import("./../pages/Master/CollectionDetail.vue"),
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

