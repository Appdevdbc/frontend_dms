import { createRouter, createWebHashHistory } from "vue-router";
import { role } from "./../utils";

import master from './master';
import dms from './wjs';
import collection from './collectionList';
import spk from './spk';
import report from './report';
import transaction from './transaction';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    ...master,//Master general
    ...collection,//List Collection
    ...dms,//DMS routes
    ...spk,//SPK routes
    ...report,//Report routes
    ...transaction,//Transaction routes
    {
      path: "/",
      redirect: (to) => {
        // Check if user has token
        if (window.localStorage.getItem("token")) {
          return "/report/dashboard";
        } else {
          return "/login";
        }
      }
    },
    {
      path: "/dashboard",
      redirect: "/report/dashboard"
    },
    {
      path: "/login",
      component: () => import("./../layouts/MainLogin.vue"),
    },
    {
      path: "/404",
      component: () => import("./../pages/Error404.vue"),
    },
    // Redirect old routes to new routes for backward compatibility
    {
      path: "/master_menu",
      redirect: "/master/menu"
    },
    {
      path: "/master_user",
      redirect: "/master/users"
    },
    {
      path: "/master_plant",
      redirect: "/master/plant"
    },
    {
      path: "/master_dept",
      redirect: "/master/dept"
    },
    {
      path: "/master_dept",
      redirect: "/master/dept"
    },
    {
      path: "/master_folder",
      redirect: "/master/folder"
    },
    {
      path: "/master_content",
      redirect: "/master/content"
    },
    {
      path: "/master_akses",
      redirect: "/master/akses"
    },
    {
      path: "/dept/:deptSeo/:folderSeo?/:subfolder1Seo?/:subfolder2Seo?",
      redirect: to => `/transaction/dept/${to.params.deptSeo}${to.params.folderSeo ? '/' + to.params.folderSeo : ''}${to.params.subfolder1Seo ? '/' + to.params.subfolder1Seo : ''}${to.params.subfolder2Seo ? '/' + to.params.subfolder2Seo : ''}`
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


