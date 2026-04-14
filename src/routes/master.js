export default [
  {
    path: "/master",
    redirect: "/master/dashboard",
    component: () => import("./../layouts/MainLayout.vue"),
    children: [
      { path: "dashboard", component: () => import("./../pages/Index.vue") },
      {
        path: "users",
        component: () => import("./../pages/Master/UserManagement.vue"),
      },
      {
        path: "group-access",
        component: () => import("./../pages/Master/GroupAccess.vue"),
      },
      {
        path: "group-management",
        component: () => import("./../pages/Master/GroupManagement.vue"),
      },
      {
        path: "domain",
        component: () => import("./../pages/Master/Domain.vue"),
      },
      {
        path: "site",
        component: () => import("./../pages/Master/Site.vue"),
      },
      {
        path: "role",
        component: () => import("./../pages/Master/Role.vue"),
      },
      {
        path: "menu",
        component: () => import("./../pages/Master/Menu.vue"),
      },
      {
        path: "menu-detail/:id",
        component: () => import("./../pages/Master/MenuDetail.vue"),
      },
      
      {
        path: "collection",
        component: () => import("./../pages/Master/Collection.vue"),
      },
      {
        path: "collection-detail/:id/:parent/:parentName",
        component: () => import("./../pages/Master/CollectionDetail.vue"),
      },
      {
        path: "general-code",
        component: () => import("./../pages/Master/Gencode.vue"),
      },
      {
        path: "error-list",
        component: () => import("./../pages/Master/ErrorList.vue"),
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
