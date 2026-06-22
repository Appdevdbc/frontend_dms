<template>
  <q-layout view="hHh lpR fFf" class="standalone-layout">
    <!-- Header Only -->
    <q-header elevated class="modern-header" :class="headerClass">
      <q-toolbar class="main-toolbar text-white">
        <q-toolbar-title class="modern-title">
          <div class="title-container">
            <div class="tw-flex tw-items-center tw-gap-2">
              <q-icon :name="headerIcon" size="20px" class="tw-text-white/90" />
              <span class="app-name">{{ headerTitle }}</span>
            </div>
            <span class="app-subtitle">{{ headerSubtitle }}</span>
          </div>
        </q-toolbar-title>
        
        <!-- Optional header actions slot -->
        <slot name="header-actions"></slot>
      </q-toolbar>
    </q-header>

    <!-- Page Content -->
    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Footer -->
    <q-footer class="bg-grey-2 text-grey-8">
      <q-toolbar class="tw-py-3">
        <q-toolbar-title class="tw-text-center tw-text-sm">
          <div>© {{ new Date().getFullYear() }} {{ footerText }}</div>
          <div class="tw-text-xs tw-text-grey-6 tw-mt-1">{{ footerSubtext }}</div>
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

// Props for customization
const props = defineProps({
  headerTitle: {
    type: String,
    default: 'Legal Monitoring System'
  },
  headerSubtitle: {
    type: String,
    default: 'Document Management System'
  },
  headerIcon: {
    type: String,
    default: 'description'
  },
  headerColor: {
    type: String,
    default: 'blue' // blue, green, red, purple, etc.
  },
  footerText: {
    type: String,
    default: 'IT DBC'
  },
  footerSubtext: {
    type: String,
    default: 'Document Management System'
  }
});

// Dynamic header class based on color prop
const headerClass = computed(() => {
  const colorMap = {
    blue: 'bg-blue-900',
    green: 'bg-green-900',
    red: 'bg-red-900',
    purple: 'bg-purple-900',
    orange: 'bg-orange-900',
    teal: 'bg-teal-900'
  };
  return colorMap[props.headerColor] || 'bg-blue-900';
});
</script>

<style scoped>
.standalone-layout {
  background: #f5f5f5;
}

.modern-header {
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
}

.main-toolbar {
  min-height: 64px;
}

.title-container {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.app-name {
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.app-subtitle {
  font-size: 0.75rem;
  opacity: 0.9;
  font-weight: 400;
}

@media (max-width: 768px) {
  .app-name {
    font-size: 0.9rem;
  }
  
  .app-subtitle {
    font-size: 0.65rem;
  }
}
</style>

