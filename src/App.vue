<template>
  <router-view />
</template>
<script setup>
import axios from "axios";
import { useQuasar } from "quasar";
import { ParseError } from "./utils";
import { useNotify } from "./composables/useNotify";

const $q = useQuasar();
const { error } = useNotify();

axios.interceptors.response.use(function (response) {
  return response;
}, function (err) {
  $q.loading.hide();
  
  // Skip interceptor notification if flag is set
  if (err.config && err.config.skipErrorInterceptor) {
    return Promise.reject(err);
  }
  
  if (err.response && err.response.status == 422) {
    for (const key in err.response.data.errors) {
      let values = Object.values(err.response.data.errors[key])[0]
      error(`${values}`);
    }
  } else {
    error(ParseError(err));
  }
  return Promise.reject(err);
});
</script>
 
