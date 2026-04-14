<template>
  <div class="bast-container">
    <!-- Print Button (hidden when printing) -->
    <div class="no-print tw-p-4 tw-bg-white tw-border-b tw-border-slate-200">
      <q-btn
        unelevated
        color="purple-6"
        label="Print"
        icon="print"
        class="tw-font-semibold tw-px-6 tw-rounded-lg"
        @click="printDocument"
      />
    </div>

    <!-- BAST Document -->
    <div v-if="bastData" class="bast-document tw-p-8 tw-bg-white">
      <!-- Header -->
      <div class="tw-text-center tw-mb-8">
        <h1 class="tw-text-2xl tw-font-bold tw-mb-2">BERITA ACARA SERAH TERIMA MUTASI ARSIP</h1>
        <h2 class="tw-text-xl tw-font-semibold">No. {{ bastData.ticket.tr_no_tiket }}</h2>
      </div>

      <!-- Opening Paragraph -->
      <div class="tw-mb-6 tw-text-justify">
        <p class="tw-indent-12">
          Pada hari ini, tanggal {{ formatDateIndonesian(bastData.tgl_mutasi) }},
          di hadapan 2 (dua) orang saksi, telah dilaksanakan serah terima mutasi dokumen arsip
          dari lokasi penyimpanan {{ bastData.ticket.lokasi_arsip_lama }}
          ke lokasi penyimpanan {{ bastData.ticket.lokasi_arsip_baru }}
          oleh arsiparis lokasi {{ bastData.arsiparis_lama.nama }}
          kepada {{ bastData.arsiparis_baru.nama }}, yaitu:
        </p>
      </div>

      <!-- Document Table -->
      <div class="tw-mb-6">
        <table class="details-table">
          <thead>
            <tr>
              <th>Kode Arsip</th>
              <th>Nama Arsip</th>
              <th>Nomor Dokumen</th>
              <th>Tanggal Dokumen</th>
              <th>Status Berlaku</th>
              <th>Kategori Keamanan</th>
              <th>Document Owner</th>
              <th>Nama BU</th>
              <th>Lokasi Lama</th>
              <th>Lokasi Baru</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(detail, index) in bastData.details" :key="index">
              <td>{{ detail.trdet_no_arsip }}</td>
              <td>{{ detail.content_name }}</td>
              <td>{{ detail.content_doc }}</td>
              <td>{{ formatDate(detail.tgl_doc) }}</td>
              <td>{{ detail.status_berlaku }}</td>
              <td>{{ detail.content_security }}</td>
              <td>{{ detail.owner_nama }}</td>
              <td>{{ detail.bu_name }}</td>
              <td>{{ detail.lokasi_lama_name }}</td>
              <td>{{ bastData.ticket.lokasi_arsip_baru }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Legal Statement -->
      <div class="tw-mb-6 tw-text-justify">
        <p class="tw-indent-12">
          Dengan diserahterimakan ini, maka segala hak, kewajiban serta akibat hukum
          yang sebelumnya terbit dari dokumen-dokumen tersebut berpindah tanggung jawab
          dari Arsiparis Lokasi {{ bastData.arsiparis_lama.nama }}
          kepada Arsiparis Lokasi {{ bastData.arsiparis_baru.nama }}.
        </p>
      </div>

      <!-- Closing Statement -->
      <div class="tw-mb-8 tw-text-justify">
        <p class="tw-indent-12">
          Berita Acara ini dibuat dalam 1 (satu) rangkap untuk disimpan oleh
          Arsiparis Lokasi {{ bastData.arsiparis_baru.nama }} bagi PIHAK KESATU dan PIHAK KEDUA.
        </p>
      </div>

      <!-- Signature Section (4 signatories for Mutasi) -->
      <div class="tw-mb-8">
        <table class="signature-table tw-w-full">
          <tr>
            <td class="tw-text-center">Diserahkan oleh,<br/>&nbsp;</td>
            <td class="tw-text-center">&nbsp;<br/>&nbsp;</td>
            <td class="tw-text-center">Diterima oleh,<br/>&nbsp;</td>
            <td class="tw-text-center">&nbsp;<br/>&nbsp;</td>
          </tr>
          <tr>
            <td class="tw-text-center">Arsiparis Lokasi<br/>Lama<br/><br/><br/><br/></td>
            <td class="tw-text-center">Atasan<br/>Arsiparis Lama<br/><br/><br/><br/></td>
            <td class="tw-text-center">Arsiparis Lokasi<br/>Baru<br/><br/><br/><br/></td>
            <td class="tw-text-center">Atasan<br/>Arsiparis Baru<br/><br/><br/><br/></td>
          </tr>
          <tr>
            <td class="tw-text-center tw-font-semibold">{{ bastData.arsiparis_lama.nama }}</td>
            <td class="tw-text-center tw-font-semibold">{{ bastData.atasan_lama.nama }}</td>
            <td class="tw-text-center tw-font-semibold">{{ bastData.arsiparis_baru.nama }}</td>
            <td class="tw-text-center tw-font-semibold">{{ bastData.atasan_baru.nama }}</td>
          </tr>
        </table>
      </div>

      <!-- Witnesses Section -->
      <div class="tw-mb-6">
        <h3 class="tw-text-center tw-font-bold tw-mb-4">Saksi - saksi :</h3>
        <table class="details-table tw-mx-auto" style="width: 80%;">
          <thead>
            <tr>
              <th style="width: 10%;">No</th>
              <th style="width: 35%;">Nama</th>
              <th style="width: 30%;">Jabatan</th>
              <th style="width: 25%;">Tanda Tangan</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="tw-text-center">1</td>
              <td>{{ bastData.saksi1.nama }}</td>
              <td>{{ bastData.saksi1.nm_grade }}</td>
              <td>&nbsp;</td>
            </tr>
            <tr>
              <td class="tw-text-center">2</td>
              <td>{{ bastData.saksi2.nama }}</td>
              <td>{{ bastData.saksi2.nm_grade }}</td>
              <td>&nbsp;</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Location Footer -->
      <div class="tw-mt-8">
        <p><strong>Tempat Pelaksanaan:</strong> {{ bastData.ticket.lokasi_arsip_baru }}</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else class="tw-p-8 tw-text-center">
      <q-spinner color="purple-6" size="50px" />
      <p class="tw-mt-4 tw-text-slate-600">Memuat data BAST Mutasi...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { useNotify } from '../../../composables/useNotify';

const route = useRoute();
const { error: showError } = useNotify();

const bastData = ref(null);

onMounted(async () => {
  await loadBASTData();
  setTimeout(() => { window.print(); }, 500);
});

const loadBASTData = async () => {
  try {
    const { id } = route.params;
    const { saksi1_nik, saksi2_nik, tgl_pemusnahan } = route.query;

    const res = await axios.get(
      `${import.meta.env.VITE_API}dms/mutasi/${id}/bast`,
      { params: { saksi1_nik, saksi2_nik, tgl_mutasi: tgl_pemusnahan } }
    );

    bastData.value = res.data.data;
  } catch (error) {
    showError(error?.response?.data?.message || 'Gagal memuat data BAST');
  }
};

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatDateIndonesian = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

const printDocument = () => { window.print(); };
</script>

<style scoped>
.bast-container { min-height: 100vh; background-color: #f5f5f5; }
.bast-document { max-width: 210mm; margin: 0 auto; font-family: Arial, sans-serif; font-size: 10pt; line-height: 1.6; }
.details-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 9pt; }
.details-table th, .details-table td { border: 1px solid #888; padding: 8px; text-align: left; }
.details-table th { background-color: #f0f0f0; font-weight: bold; }
.signature-table { border-collapse: collapse; }
.signature-table td { padding: 10px; vertical-align: top; }

@media print {
  .no-print { display: none !important; }
  .bast-container { background-color: white; }
  .bast-document { max-width: 100%; margin: 0; padding: 20mm; }
  @page { size: A4 landscape; margin: 10mm; }
  body { margin: 0; }
  thead { display: table-header-group; }
  button { display: none; }
}
</style>

