<template>
  <q-page class="flex flex-center bg-grey-2">
    <q-card class="q-pa-lg shadow-2" style="width: 450px; max-width: 90vw">
      <q-card-section class="text-center q-pb-none">
        <div class="text-h4 text-weight-bold text-primary q-mb-sm">
          Document Management System (DMS)
        </div>
        <div class="text-h6 text-grey-7">(WJS)</div>
        <div class="text-subtitle2 text-grey-6 q-mt-md">
          Silakan login untuk melanjutkan
        </div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="handleLogin" class="q-gutter-md">
          <q-input
            v-model="username"
            label="Username / NIK / Email"
            outlined
            dense
            :rules="[val => !!val || 'Username harus diisi']"
            :disable="loading"
          >
            <template v-slot:prepend>
              <q-icon name="person" />
            </template>
          </q-input>

          <q-input
            v-model="password"
            label="Password"
            :type="showPassword ? 'text' : 'password'"
            outlined
            dense
            :rules="[val => !!val || 'Password harus diisi']"
            :disable="loading"
          >
            <template v-slot:prepend>
              <q-icon name="lock" />
            </template>
            <template v-slot:append>
              <q-icon
                :name="showPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>

          <q-btn
            type="submit"
            color="primary"
            label="Login"
            class="full-width"
            :loading="loading"
            :disable="loading"
            size="md"
          />
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const username = ref('');
const password = ref('');
const showPassword = ref(false);
const loading = ref(false);

// Set page title
document.title = 'Login - Document Management System (DMS)';

const handleLogin = async () => {
  loading.value = true;

  const result = await authStore.login(username.value, password.value);

  if (result.success) {
    // Redirect to dashboard or intended route
    const redirect = router.currentRoute.value.query.redirect || '/';
    router.push(redirect);
  }

  loading.value = false;
};
</script>

<style scoped>
.q-card {
  border-radius: 12px;
}
</style>

