<template>
  <div class="user-confirmation-container">
    <div class="card">
      <div class="card-header">
        <h4 class="card-title">Konfirmasi Penerimaan Dokumen</h4>
      </div>
      
      <div class="card-body" v-if="loading">
        <div class="text-center">
          <div class="spinner-border" role="status">
            <span class="sr-only">Loading...</span>
          </div>
          <p class="mt-2">Memuat data konfirmasi...</p>
        </div>
      </div>

      <div class="card-body" v-else-if="error">
        <div class="alert alert-danger">
          <h5>Error</h5>
          <p>{{ error }}</p>
        </div>
      </div>

      <div class="card-body" v-else>
        <div class="alert alert-info">
          <h5>Informasi</h5>
          <p>Halaman konfirmasi penerimaan dokumen akan segera tersedia. Saat ini Anda dapat menggunakan sistem PHP yang ada.</p>
          <p>Token: {{ $route.query.token }}</p>
        </div>
        
        <div class="d-flex gap-2">
          <button 
            type="button" 
            class="btn btn-secondary" 
            @click="$router.go(-1)"
          >
            <i class="fas fa-arrow-left"></i> Kembali
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default {
  name: 'UserConfirmation',
  setup() {
    const route = useRoute()
    const router = useRouter()
    
    const loading = ref(false)
    const error = ref('')

    onMounted(() => {
      // TODO: Implement user confirmation functionality
      console.log('User confirmation token:', route.query.token)
    })

    return {
      loading,
      error
    }
  }
}
</script>

<style scoped>
.user-confirmation-container {
  padding: 20px;
}
</style>

