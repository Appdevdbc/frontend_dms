<template>
  <div class="q-pa-md">
    <!-- Header Section -->
    <div class="tw-bg-gradient-to-r tw-from-blue-600 tw-to-blue-500 tw-px-6 tw-py-4 tw-mb-4 tw-rounded-lg tw-shadow-md">
      <div class="tw-flex tw-justify-between tw-items-center">
        <div>
          <h5 class="tw-text-white tw-text-xl tw-font-semibold tw-mb-1">Dashboard</h5>
          <div class="tw-flex tw-items-center tw-gap-2 tw-text-white/90 tw-text-sm">
            <span>Home</span>
            <q-icon name="chevron_right" size="12px"/>
            <span>Dashboard</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Card -->
    <q-card class="tw-shadow-lg">
      <q-card-section class="tw-bg-white tw-p-6">
        <!-- Statistics Cards -->
        <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-4 tw-mb-6">
          <!-- Total Prosedur Card -->
          <div class="tw-bg-red-500 tw-text-white tw-rounded-lg tw-p-4">
            <div class="tw-flex tw-items-center">
              <div class="tw-flex-shrink-0 tw-mr-4">
                <q-icon name="description" size="48px" />
              </div>
              <div class="tw-flex-1 tw-text-center">
                <div class="tw-text-sm tw-font-medium tw-mb-1">TOTAL PROSEDUR</div>
                <div class="tw-text-3xl tw-font-bold">
                  {{ stats.prosedur }}
                </div>
              </div>
            </div>
          </div>

          <!-- Total IK Card -->
          <div class="tw-bg-green-500 tw-text-white tw-rounded-lg tw-p-4">
            <div class="tw-flex tw-items-center">
              <div class="tw-flex-shrink-0 tw-mr-4">
                <q-icon name="description" size="48px" />
              </div>
              <div class="tw-flex-1 tw-text-center">
                <div class="tw-text-sm tw-font-medium tw-mb-1">TOTAL IK</div>
                <div class="tw-text-3xl tw-font-bold">
                  {{ stats.ik }}
                </div>
              </div>
            </div>
          </div>

          <!-- Total Form Card -->
          <div class="tw-bg-yellow-500 tw-text-white tw-rounded-lg tw-p-4">
            <div class="tw-flex tw-items-center">
              <div class="tw-flex-shrink-0 tw-mr-4">
                <q-icon name="description" size="48px" />
              </div>
              <div class="tw-flex-1 tw-text-center">
                <div class="tw-text-sm tw-font-medium tw-mb-1">TOTAL FORM</div>
                <div class="tw-text-3xl tw-font-bold">
                  {{ stats.form }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Chart Section -->
        <div class="tw-border tw-border-gray-200 tw-rounded-lg tw-p-4">
          <div class="tw-text-lg tw-font-semibold tw-mb-4 tw-text-gray-700">
            Total Dokumen Per Departemen
          </div>
          <div ref="chartContainer" style="min-width: 310px; height: 400px;"></div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Loading Overlay -->
    <q-inner-loading :showing="loading">
      <q-spinner-gears size="50px" color="primary" />
    </q-inner-loading>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useQuasar, Loading, QSpinnerBall } from 'quasar';
import { useRouter } from 'vue-router';
import axios from 'axios';
import Highcharts from 'highcharts';
import CryptoJS from "crypto-js";

const $q = useQuasar();
const router = useRouter();
const loading = ref(false);
const stats = ref({
  prosedur: 0,
  ik: 0,
  form: 0
});
const chartContainer = ref(null);

const tmpPage = reactive({
  add:'1',
  edit:'1',
  delete:'1',
  view:'1',
  admin:'1',
});

// Helper functions
const domain = () => {
  const value = window.localStorage.getItem("domain");
  if (!value) return "blue";
  
  const key = "WJSPASSWORD";
  const bytes = CryptoJS.AES.decrypt(value, key);
  const decryptedValue = bytes.toString(CryptoJS.enc.Utf8);
  
  return decryptedValue.toLowerCase();
};

const empid = () => {
  const value = window.localStorage.getItem("empid");
  if (!value) return "";
  
  const key = "WJSPASSWORD";
  const bytes = CryptoJS.AES.decrypt(value, key);
  return bytes.toString(CryptoJS.enc.Utf8);
};

const admin = () => {
  const value = window.localStorage.getItem("role");
  if (!value) return "0";
  
  const key = "WJSPASSWORD";
  const bytes = CryptoJS.AES.decrypt(value, key);
  const role = bytes.toString(CryptoJS.enc.Utf8);
  return (role === "rw" || role === "rwx") ? "1" : "0";
};

const spinnerBall = () => {
  Loading.show({
    spinner: QSpinnerBall,
    spinnerColor: 'blue',
    backgroundColor: 'white',
    message: 'Loading...',
    messageColor: 'black'
  });
};

const getPageAkses = async () => {
  try {
    spinnerBall();
    const res = await axios.get(`${import.meta.env.VITE_API}pageakses`, {
      params: {
        role: window.localStorage.getItem("empid"),
        page: 'dashboard',
        domain: domain(),
      }
    });
    
    const decryptMessage = (msg) => {
      if (!msg) return "0";
      const key = "WJSPASSWORD";
      const bytes = CryptoJS.AES.decrypt(msg, key);
      return bytes.toString(CryptoJS.enc.Utf8);
    };
    
    tmpPage.add = decryptMessage(res.data.add);
    tmpPage.edit = decryptMessage(res.data.edit);
    tmpPage.delete = decryptMessage(res.data.delete);
    tmpPage.view = decryptMessage(res.data.view);
    tmpPage.admin = admin();
    Loading.hide();
  } catch (error) {
    console.error('getPageAkses error:', error);
    Loading.hide();
    // Dashboard is public, don't redirect on error
  }
};

// Get dashboard statistics
const getDashboardStats = async () => {
  try {
    const response = await axios.get('/getDashboardStats', {
      params: {
        domain: window.localStorage.getItem("domain"),
        empid: window.localStorage.getItem("empid")
      }
    });
    if (response.data.success) {
      stats.value = response.data.data;
    }
  } catch (error) {
    console.error('Error loading dashboard stats:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to load dashboard statistics',
      position: 'top'
    });
  }
};

// Get chart data and render
const loadChartData = async () => {
  try {
    const response = await axios.get('/getChartData', {
      params: {
        domain: window.localStorage.getItem("domain"),
        empid: window.localStorage.getItem("empid")
      }
    });
    if (response.data.success) {
      renderChart(response.data.data);
    }
  } catch (error) {
    console.error('Error loading chart data:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to load chart data',
      position: 'top'
    });
  }
};

// Render Highcharts column chart
const renderChart = (data) => {
  if (!chartContainer.value) return;

  Highcharts.chart(chartContainer.value, {
    chart: {
      type: 'column'
    },
    title: {
      text: null
    },
    xAxis: {
      categories: data.categories,
      crosshair: true
    },
    yAxis: {
      min: 0,
      title: {
        text: 'Jumlah Dokumen'
      }
    },
    tooltip: {
      headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
      pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
        '<td style="padding:0"><b>{point.y}</b></td></tr>',
      footerFormat: '</table>',
      shared: true,
      useHTML: true
    },
    plotOptions: {
      column: {
        pointPadding: 0.2,
        borderWidth: 0
      }
    },
    series: data.series
  });
};

// Load all dashboard data
const loadDashboard = async () => {
  loading.value = true;
  try {
    await Promise.all([
      getDashboardStats(),
      loadChartData()
    ]);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  getPageAkses();
  loadDashboard();
});
</script>

<style scoped>
/* Additional styling if needed */
</style>
