<template>
  <div class="revision-form-container">
    <div class="card">
      <div class="card-header">
        <h4 class="card-title">Form Revisi Permintaan Dokumen</h4>
      </div>
      
      <div class="card-body" v-if="loading">
        <div class="text-center">
          <div class="spinner-border" role="status">
            <span class="sr-only">Loading...</span>
          </div>
          <p class="mt-2">Memuat data revisi...</p>
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
          <p>Halaman form revisi akan segera tersedia. Saat ini Anda dapat menggunakan sistem PHP yang ada.</p>
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
  name: 'RevisionForm',
  setup() {
    const route = useRoute()
    const router = useRouter()
    
    const loading = ref(false)
    const error = ref('')

    onMounted(() => {
      // TODO: Implement revision form functionality
      console.log('Revision token:', route.query.token)
    })

    return {
      loading,
      error
    }
  }
}
</script>

<style scoped>
.revision-form-container {
  padding: 20px;
}
</style>

