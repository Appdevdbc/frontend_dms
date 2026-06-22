export default [
  {
    path: "/transaction",
    component: () => import('../layouts/MainLayout.vue'),
    children: [
      {
        path: 'input-request',
        name: 'InputRequest',
        component: () => import('../pages/Transaction/InputRequest.vue'),
        meta: {
          requiresAuth: true,
          title: 'Input Request Data'
        }
      },
      {
        path: 'list-request',
        name: 'ListRequest',
        component: () => import('../pages/Transaction/ListRequest.vue'),
        meta: {
          requiresAuth: true,
          title: 'List Request'
        }
      },
      {
        path: 'detail-request/:id',
        name: 'DetailRequest',
        component: () => import('../pages/Transaction/DetailRequest.vue'),
        meta: {
          requiresAuth: true,
          title: 'Detail Request'
        }
      },
      {
        path: 'confirm-closing',
        name: 'ConfirmClosing',
        component: () => import('../pages/Transaction/ConfirmClosing.vue'),
        meta: {
          requiresAuth: true,
          title: 'Confirm Closing'
        }
      }
    ]
  }
];
