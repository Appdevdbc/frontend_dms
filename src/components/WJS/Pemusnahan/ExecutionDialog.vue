<template>
  <q-dialog v-model="showDialog" persistent>
    <q-card style="width: 90vw; max-width: 1400px;" class="tw-rounded-xl tw-shadow-2xl">
      <!-- Header -->
      <q-card-section class="tw-bg-gradient-to-r tw-from-purple-500 tw-to-purple-600 tw-text-white tw-py-4">
        <div class="tw-flex tw-items-center tw-justify-between">
          <div class="tw-flex tw-items-center tw-gap-3">
            <q-icon :name="props.module === 'mutasi' ? 'swap_horiz' : 'delete_forever'" size="32px" />
            <div>
              <div class="tw-text-xl tw-font-bold">Eksekusi {{ props.module === 'mutasi' ? 'Pemindahan' : 'Penghapusan' }} Arsip</div>
              <div class="tw-text-sm tw-opacity-90">{{ dt?.tr_no_tiket }}</div>
            </div>
          </div>
          <q-btn flat round dense icon="close" color="white" @click="closeDialog" />
        </div>
      </q-card-section>

      <q-card-section class="tw-p-6" style="max-height: 70vh; overflow-y: auto;">
        <!-- Full Ticket Info for Mutasi -->
        <div v-if="props.module === 'mutasi'" class="tw-mb-6 tw-p-4 tw-bg-blue-50 tw-rounded-lg tw-border tw-border-blue-200">
          <div class="tw-text-sm tw-font-bold tw-text-blue-800 tw-mb-3">Informasi Tiket Mutasi</div>
          <div class="tw-grid tw-grid-cols-2 tw-gap-3 tw-text-sm">
            <div>
              <div class="tw-text-slate-500 tw-text-xs tw-mb-1">Bisnis Unit</div>
              <div class="tw-font-semibold tw-text-slate-800">{{ dt?.bu_name || '-' }}</div>
            </div>
            <div>
              <div class="tw-text-slate-500 tw-text-xs tw-mb-1">Kategori Dokumen</div>
              <div class="tw-font-semibold tw-text-slate-800">{{ dt?.tr_kategori_dokumen || '-' }}</div>
            </div>
            <div>
              <div class="tw-text-slate-500 tw-text-xs tw-mb-1">Kategori Keamanan</div>
              <div class="tw-font-semibold tw-text-slate-800">{{ formatSecurity(dt?.tr_kategori_keamanan) }}</div>
            </div>
            <div>
              <div class="tw-text-slate-500 tw-text-xs tw-mb-1">No. Mutasi</div>
              <div class="tw-font-semibold tw-text-slate-800">{{ dt?.tr_no_tiket || '-' }}</div>
            </div>
            <div>
              <div class="tw-text-slate-500 tw-text-xs tw-mb-1">Tanggal Pengajuan</div>
              <div class="tw-font-semibold tw-text-slate-800">{{ formatDate(dt?.tr_tgl_pengajuan) }}</div>
            </div>
            <div>
              <div class="tw-text-slate-500 tw-text-xs tw-mb-1">Tanggal Mutasi</div>
              <div class="tw-font-semibold tw-text-slate-800">{{ formatDate(dt?.tr_tgl_mutasi) }}</div>
            </div>
            <div>
              <div class="tw-text-slate-500 tw-text-xs tw-mb-1">Arsiparis Lama</div>
              <div class="tw-font-semibold tw-text-slate-800">{{ dt?.arsiparis_lama_name || '-' }}</div>
            </div>
            <div>
              <div class="tw-text-slate-500 tw-text-xs tw-mb-1">Atasan Arsiparis Lama</div>
              <div class="tw-font-semibold tw-text-slate-800">{{ dt?.atasan_lama_name || '-' }}</div>
            </div>
            <div>
              <div class="tw-text-slate-500 tw-text-xs tw-mb-1">Arsiparis Baru</div>
              <div class="tw-font-semibold tw-text-slate-800">{{ dt?.arsiparis_baru_name || '-' }}</div>
            </div>
            <div>
              <div class="tw-text-slate-500 tw-text-xs tw-mb-1">Atasan Arsiparis Baru</div>
              <div class="tw-font-semibold tw-text-slate-800">{{ dt?.atasan_baru_name || '-' }}</div>
            </div>
            <div class="tw-col-span-2">
              <div class="tw-text-slate-500 tw-text-xs tw-mb-1">Keterangan Mutasi</div>
              <div class="tw-font-semibold tw-text-slate-800">{{ dt?.tr_keterangan_pemusnahan || '-' }}</div>
            </div>
          </div>
          <div class="tw-grid tw-grid-cols-2 tw-gap-3 tw-text-sm tw-mt-3 tw-pt-3 tw-border-t tw-border-blue-200">
            <div>
              <div class="tw-text-slate-500 tw-text-xs tw-mb-1">Catatan Arsiparis Lama</div>
              <div class="tw-font-semibold tw-text-slate-800">{{ dt?.tr_catatan_arsiparis_lama || '-' }}</div>
            </div>
            <div>
              <div class="tw-text-slate-500 tw-text-xs tw-mb-1">Catatan Atasan Arsiparis Lama</div>
              <div class="tw-font-semibold tw-text-slate-800">{{ dt?.tr_catatan_atasan_arsiparis_lama || '-' }}</div>
            </div>
            <div>
              <div class="tw-text-slate-500 tw-text-xs tw-mb-1">Catatan Arsiparis Baru</div>
              <div class="tw-font-semibold tw-text-slate-800">{{ dt?.tr_catatan_arsiparis_baru || '-' }}</div>
            </div>
            <div>
              <div class="tw-text-slate-500 tw-text-xs tw-mb-1">Catatan Atasan Arsiparis Baru</div>
              <div class="tw-font-semibold tw-text-slate-800">{{ dt?.tr_catatan_atasan_arsiparis_baru || '-' }}</div>
            </div>
          </div>
        </div>
        <!-- Simple ticket info for pemusnahan -->
        <div v-else class="tw-mb-6 tw-p-4 tw-bg-blue-50 tw-rounded-lg tw-border tw-border-blue-200">
          <div class="tw-grid tw-grid-cols-2 tw-gap-4 tw-text-sm">
            <div><span class="tw-text-slate-600">Tanggal Pengajuan:</span><span class="tw-ml-2 tw-font-semibold">{{ formatDate(dt?.tr_tgl_pengajuan) }}</span></div>
            <div><span class="tw-text-slate-600">Tanggal Pemusnahan:</span><span class="tw-ml-2 tw-font-semibold">{{ formatDate(dt?.tr_tgl_pemusnahan) }}</span></div>
            <div><span class="tw-text-slate-600">Lokasi Arsip:</span><span class="tw-ml-2 tw-font-semibold">{{ dt?.lokasi_arsip_name }}</span></div>
            <div><span class="tw-text-slate-600">Jumlah Arsip:</span><span class="tw-ml-2 tw-font-semibold">{{ archiveCount }} dokumen</span></div>
          </div>
        </div>
        <!-- Archive List -->
        <div class="tw-mb-6">
          <label class="tw-block tw-text-sm tw-font-semibold tw-text-slate-700 tw-mb-3">{{ props.module === 'mutasi' ? 'Daftar Arsip yang Akan Dipindahkan:' : 'Daftar Arsip yang Akan Dihapus:' }}</label>
          <div class="tw-max-h-60 tw-overflow-y-auto tw-border tw-border-slate-200 tw-rounded-lg">
            <q-list bordered separator>
              <q-item v-for="(archive, index) in archives" :key="index" class="tw-py-3">
                <q-item-section avatar><q-icon name="description" color="blue-6" size="24px" /></q-item-section>
                <q-item-section>
                  <q-item-label class="tw-font-semibold tw-text-slate-800">{{ archive.content_name }}</q-item-label>
                  <q-item-label caption class="tw-text-slate-600">{{ archive.arsip_no || archive.trdet_no_arsip }} - {{ archive.content_doc }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </div>

        <!-- Proses Mutasi Arsip Section -->
        <div v-if="props.module === 'mutasi' && ticketData?.tr_status === 8" class="tw-mb-6">
          <div class="tw-mb-4 tw-p-4 tw-bg-amber-50 tw-rounded-lg tw-border tw-border-amber-200">
            <div class="tw-flex tw-items-center tw-gap-2">
              <q-icon name="swap_horiz" color="amber-700" size="24px" />
              <span class="tw-font-bold tw-text-amber-800">Proses Mutasi Arsip</span>
            </div>
          </div>
          <div class="tw-grid tw-grid-cols-2 tw-gap-4 tw-mb-4">
            <div>
              <label class="tw-block tw-text-sm tw-font-semibold tw-text-slate-700 tw-mb-2">Dari Lokasi</label>
              <q-input :model-value="dt?.lokasi_lama_name || '-'" outlined readonly class="tw-rounded-lg tw-bg-slate-50">
                <template v-slot:prepend><q-icon name="location_on" color="red-6" /></template>
              </q-input>
            </div>
            <div>
              <label class="tw-block tw-text-sm tw-font-semibold tw-text-slate-700 tw-mb-2">Ke Lokasi Baru</label>
              <q-input :model-value="dt?.lokasi_baru_name || '-'" outlined readonly class="tw-rounded-lg tw-bg-slate-50">
                <template v-slot:prepend><q-icon name="location_on" color="green-6" /></template>
              </q-input>
            </div>
            <div>
              <label class="tw-block tw-text-sm tw-font-semibold tw-text-slate-700 tw-mb-2">Lemari Arsip</label>
              <q-select v-model="tmpForm.lemari_arsip" :options="lemariOptions" option-value="lemari_id" option-label="lemari_name" emit-value map-options outlined class="tw-rounded-lg" placeholder="Pilih Lemari Arsip" @update:model-value="onLemariChange">
                <template v-slot:prepend><q-icon name="inventory_2" color="purple-6" /></template>
              </q-select>
            </div>
            <div>
              <label class="tw-block tw-text-sm tw-font-semibold tw-text-slate-700 tw-mb-2">Tingkat Lemari</label>
              <q-input v-model="tmpForm.tingkat_lemari" outlined class="tw-rounded-lg" placeholder="Masukkan tingkat lemari" @blur="onTingkatBoxChange">
                <template v-slot:prepend><q-icon name="layers" color="purple-6" /></template>
              </q-input>
            </div>
            <div>
              <label class="tw-block tw-text-sm tw-font-semibold tw-text-slate-700 tw-mb-2">Box Ke</label>
              <q-input v-model="tmpForm.box_ke" outlined class="tw-rounded-lg" placeholder="Masukkan box ke" @blur="onTingkatBoxChange">
                <template v-slot:prepend><q-icon name="inbox" color="purple-6" /></template>
              </q-input>
            </div>
            <div>
              <label class="tw-block tw-text-sm tw-font-semibold tw-text-slate-700 tw-mb-2">Kode Lemari</label>
              <q-input v-model="tmpForm.kode_lemari" outlined readonly class="tw-rounded-lg tw-bg-slate-50" placeholder="Otomatis">
                <template v-slot:prepend><q-icon name="qr_code" color="purple-6" /></template>
              </q-input>
            </div>
            <div>
              <label class="tw-block tw-text-sm tw-font-semibold tw-text-slate-700 tw-mb-2">Kondisi Dokumen</label>
              <q-select v-model="tmpForm.kondisi_dokumen" :options="kondisiOptions" outlined class="tw-rounded-lg" emit-value map-options>
                <template v-slot:prepend><q-icon name="fact_check" color="purple-6" /></template>
              </q-select>
            </div>
            <div>
              <label class="tw-block tw-text-sm tw-font-semibold tw-text-slate-700 tw-mb-2">Keterangan BAST</label>
              <q-input v-model="tmpForm.catatan_bast" outlined class="tw-rounded-lg" placeholder="Keterangan BAST (opsional)">
                <template v-slot:prepend><q-icon name="note" color="purple-6" /></template>
              </q-input>
            </div>
          </div>
          <!-- Existing BAST Files -->
          <div v-if="dt?.tr_file_bast_1 || dt?.tr_file_bast_2 || dt?.tr_file_bast_3 || dt?.tr_file_bast_4" class="tw-mb-4 tw-p-3 tw-bg-slate-50 tw-rounded-lg tw-border tw-border-slate-200">
            <div class="tw-text-sm tw-font-semibold tw-text-slate-700 tw-mb-2">File BAST yang sudah diunggah:</div>
            <div class="tw-grid tw-grid-cols-2 tw-gap-2 tw-text-sm">
              <div v-if="dt?.tr_file_bast_1"><a :href="`${apiUrl}dms/mutasi/download-bast/${dt.tr_file_bast_1}`" target="_blank" class="tw-text-blue-600 tw-underline">Upload 1: {{ dt.tr_file_bast_1 }}</a></div>
              <div v-if="dt?.tr_file_bast_2"><a :href="`${apiUrl}dms/mutasi/download-bast/${dt.tr_file_bast_2}`" target="_blank" class="tw-text-blue-600 tw-underline">Upload 2: {{ dt.tr_file_bast_2 }}</a></div>
              <div v-if="dt?.tr_file_bast_3"><a :href="`${apiUrl}dms/mutasi/download-bast/${dt.tr_file_bast_3}`" target="_blank" class="tw-text-blue-600 tw-underline">Upload 3: {{ dt.tr_file_bast_3 }}</a></div>
              <div v-if="dt?.tr_file_bast_4"><a :href="`${apiUrl}dms/mutasi/download-bast/${dt.tr_file_bast_4}`" target="_blank" class="tw-text-blue-600 tw-underline">Upload 4: {{ dt.tr_file_bast_4 }}</a></div>
            </div>
          </div>
          <!-- Generate BAST + Upload -->
          <div class="tw-mb-4">
            <q-btn unelevated color="amber-7" label="Generate Berita Acara Serah Terima Mutasi Arsip" icon="description" class="tw-font-semibold tw-px-6 tw-rounded-lg tw-w-full" @click="generateMutasiBAST" />
          </div>
          <div class="tw-grid tw-grid-cols-2 tw-gap-4 tw-mb-4">
            <div>
              <label class="tw-block tw-text-sm tw-font-semibold tw-text-slate-700 tw-mb-2">Upload 1</label>
              <q-file v-model="tmpForm.file_bast_1" outlined accept=".pdf,.jpg,.jpeg,.png" max-file-size="15728640" class="tw-rounded-lg">
                <template v-slot:prepend><q-icon name="attach_file" color="purple-6" /></template>
              </q-file>
            </div>
            <div>
              <label class="tw-block tw-text-sm tw-font-semibold tw-text-slate-700 tw-mb-2">Upload 2</label>
              <q-file v-model="tmpForm.file_bast_2" outlined accept=".pdf,.jpg,.jpeg,.png" max-file-size="15728640" class="tw-rounded-lg">
                <template v-slot:prepend><q-icon name="attach_file" color="purple-6" /></template>
              </q-file>
            </div>
            <div>
              <label class="tw-block tw-text-sm tw-font-semibold tw-text-slate-700 tw-mb-2">Upload 3</label>
              <q-file v-model="tmpForm.file_bast_3" outlined accept=".pdf,.jpg,.jpeg,.png" max-file-size="15728640" class="tw-rounded-lg">
                <template v-slot:prepend><q-icon name="attach_file" color="purple-6" /></template>
              </q-file>
            </div>
            <div>
              <label class="tw-block tw-text-sm tw-font-semibold tw-text-slate-700 tw-mb-2">Upload 4</label>
              <q-file v-model="tmpForm.file_bast_4" outlined accept=".pdf,.jpg,.jpeg,.png" max-file-size="15728640" class="tw-rounded-lg">
                <template v-slot:prepend><q-icon name="attach_file" color="purple-6" /></template>
              </q-file>
            </div>
          </div>
        </div>
        <!-- BAST Section for Pemusnahan (status 8) -->
        <div v-if="props.module === 'pemusnahan' && ticketData?.tr_status === 8" class="tw-mb-6">
          <div class="tw-mb-4 tw-p-4 tw-bg-amber-50 tw-rounded-lg tw-border tw-border-amber-200">
            <div class="tw-flex tw-items-center tw-gap-2 tw-mb-2">
              <q-icon name="description" color="amber-700" size="24px" />
              <span class="tw-font-bold tw-text-amber-800">Berita Acara Serah Terima (BAST)</span>
            </div>
            <p class="tw-text-sm tw-text-amber-700">Lengkapi data BAST sebelum melakukan penghapusan arsip</p>
          </div>
          <div class="tw-grid tw-grid-cols-2 tw-gap-4 tw-mb-4">
            <div>
              <label class="tw-block tw-text-sm tw-font-semibold tw-text-slate-700 tw-mb-2">Tanggal Pemusnahan <span class="tw-text-red-500">*</span></label>
              <q-input v-model="tmpForm.tgl_pemusnahan" outlined type="date" class="tw-rounded-lg">
                <template v-slot:prepend><q-icon name="event" color="purple-6" /></template>
              </q-input>
            </div>
            <div>
              <label class="tw-block tw-text-sm tw-font-semibold tw-text-slate-700 tw-mb-2">Arsiparis Lokasi</label>
              <q-input :model-value="dt?.arsiparis_nama" outlined readonly class="tw-rounded-lg tw-bg-slate-50">
                <template v-slot:prepend><q-icon name="person" color="purple-6" /></template>
              </q-input>
            </div>
            <div>
              <label class="tw-block tw-text-sm tw-font-semibold tw-text-slate-700 tw-mb-2">Saksi 1 (NIK) <span class="tw-text-red-500">*</span></label>
              <q-input v-model="tmpForm.saksi1_nik" outlined placeholder="Masukkan NIK Saksi 1" class="tw-rounded-lg" @update:model-value="lookupSaksi1">
                <template v-slot:prepend><q-icon name="badge" color="purple-6" /></template>
              </q-input>
              <div v-if="saksi1Nama" class="tw-text-sm tw-text-green-600 tw-mt-1 tw-ml-1">✓ {{ saksi1Nama }}</div>
              <div v-if="saksi1Error" class="tw-text-sm tw-text-red-600 tw-mt-1 tw-ml-1">✗ {{ saksi1Error }}</div>
            </div>
            <div>
              <label class="tw-block tw-text-sm tw-font-semibold tw-text-slate-700 tw-mb-2">Saksi 2 (NIK) <span class="tw-text-red-500">*</span></label>
              <q-input v-model="tmpForm.saksi2_nik" outlined placeholder="Masukkan NIK Saksi 2" class="tw-rounded-lg" @update:model-value="lookupSaksi2">
                <template v-slot:prepend><q-icon name="badge" color="purple-6" /></template>
              </q-input>
              <div v-if="saksi2Nama" class="tw-text-sm tw-text-green-600 tw-mt-1 tw-ml-1">✓ {{ saksi2Nama }}</div>
              <div v-if="saksi2Error" class="tw-text-sm tw-text-red-600 tw-mt-1 tw-ml-1">✗ {{ saksi2Error }}</div>
            </div>
          </div>
          <div class="tw-mb-4">
            <q-btn unelevated color="amber-7" label="Generate Berita Acara Pemusnahan Arsip" icon="description" class="tw-font-semibold tw-px-6 tw-rounded-lg tw-w-full" @click="generateBAST" :disable="!canGenerateBAST" />
          </div>
          <div class="tw-grid tw-grid-cols-2 tw-gap-4 tw-mb-4">
            <div>
              <label class="tw-block tw-text-sm tw-font-semibold tw-text-slate-700 tw-mb-2">Upload BAST 1</label>
              <q-file v-model="tmpForm.file_bast_3" outlined accept=".pdf,.jpg,.jpeg,.png" max-file-size="5242880" class="tw-rounded-lg">
                <template v-slot:prepend><q-icon name="attach_file" color="purple-6" /></template>
              </q-file>
            </div>
            <div>
              <label class="tw-block tw-text-sm tw-font-semibold tw-text-slate-700 tw-mb-2">Upload BAST 2</label>
              <q-file v-model="tmpForm.file_bast_4" outlined accept=".pdf,.jpg,.jpeg,.png" max-file-size="5242880" class="tw-rounded-lg">
                <template v-slot:prepend><q-icon name="attach_file" color="purple-6" /></template>
              </q-file>
            </div>
          </div>
        </div>

        <!-- Catatan -->
        <div class="tw-mb-4">
          <label class="tw-block tw-text-sm tw-font-semibold tw-text-slate-700 tw-mb-2">{{ props.module === 'mutasi' ? 'Catatan Pemindahan' : 'Catatan Penghapusan' }}</label>
          <q-input v-model="tmpForm.catatan" outlined type="textarea" rows="3" :placeholder="props.module === 'mutasi' ? 'Masukkan catatan pemindahan (opsional)' : 'Masukkan catatan penghapusan (opsional)'" class="tw-rounded-lg" maxlength="500" counter />
        </div>

        <!-- Warning -->
        <div class="tw-p-4 tw-bg-red-50 tw-rounded-lg tw-border-2 tw-border-red-300">
          <div class="tw-flex tw-items-start tw-gap-3">
            <q-icon name="warning" color="red-700" size="32px" />
            <div class="tw-flex-1">
              <div class="tw-font-bold tw-text-red-800 tw-mb-2 tw-text-lg">PERINGATAN PENTING!</div>
              <ul v-if="props.module === 'mutasi'" class="tw-text-sm tw-text-red-700 tw-space-y-1 tw-list-disc tw-list-inside">
                <li>Arsip akan dipindahkan ke lokasi baru</li>
                <li>Lokasi arsip lama akan diperbarui secara otomatis</li>
                <li>Pastikan semua approval telah lengkap sebelum melanjutkan</li>
                <li>Proses ini akan menyelesaikan tiket mutasi</li>
              </ul>
              <ul v-else class="tw-text-sm tw-text-red-700 tw-space-y-1 tw-list-disc tw-list-inside">
                <li>Arsip yang dihapus TIDAK DAPAT dikembalikan</li>
                <li>Status arsip akan berubah menjadi "Dihapus" secara permanen</li>
                <li>Pastikan semua approval telah lengkap sebelum melanjutkan</li>
                <li>Proses ini akan menyelesaikan tiket pemusnahan</li>
              </ul>
            </div>
          </div>
        </div>
        <!-- Confirmation -->
        <div class="tw-mt-6">
          <q-checkbox v-model="confirmed" color="purple-6" class="tw-text-sm">
            <span class="tw-font-semibold tw-text-slate-700">{{ props.module === 'mutasi' ? 'Saya memahami bahwa tindakan ini akan memindahkan arsip ke lokasi baru' : 'Saya memahami bahwa tindakan ini tidak dapat dibatalkan dan akan menghapus arsip secara permanen' }}</span>
          </q-checkbox>
        </div>
      </q-card-section>

      <!-- Actions -->
      <q-card-actions class="tw-p-6 tw-pt-0 tw-flex tw-gap-3 tw-justify-end">
        <q-btn unelevated color="grey-6" label="Batal" icon="close" class="tw-font-semibold tw-px-6 tw-rounded-lg" @click="closeDialog" :disable="loading" />
        <q-btn unelevated color="purple-6" :label="props.module === 'mutasi' ? 'Eksekusi Pemindahan' : 'Eksekusi Penghapusan'" :icon="props.module === 'mutasi' ? 'swap_horiz' : 'delete_forever'" class="tw-font-semibold tw-px-6 tw-rounded-lg" @click="handleExecute" :loading="loading" :disable="!confirmed" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- PDF Preview Dialog -->
  <q-dialog v-model="showPdfDialog" maximized>
    <q-card>
      <q-card-section :class="`side-${domain()}-1 tw-text-white tw-py-4`">
        <div class="tw-flex tw-items-center tw-justify-between">
          <div class="tw-flex tw-items-center tw-gap-3">
            <q-icon name="picture_as_pdf" size="32px" />
            <div class="text-h6 tw-font-bold">Preview BAST {{ props.module === 'mutasi' ? 'Mutasi' : 'Pemusnahan' }}</div>
          </div>
          <q-btn flat round dense icon="close" color="white" @click="showPdfDialog = false" />
        </div>
      </q-card-section>
      <q-card-section class="tw-p-0" style="height: calc(100vh - 80px);">
        <iframe :src="pdfUrl" style="width: 100%; height: 100%; border: none;"></iframe>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue';
import axios from 'axios';
import { useNotify } from '../../../composables/useNotify';
import { empid, domain } from '../../../utils';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  ticketData: { type: Object, default: null },
  module: { type: String, default: 'pemusnahan' }
});
const emit = defineEmits(['update:modelValue', 'executed']);
const { success, error: showError } = useNotify();
const apiUrl = import.meta.env.VITE_API;
const showDialog = ref(false);
const loading = ref(false);
const confirmed = ref(false);
const archives = ref([]);
const saksi1Nama = ref('');
const saksi1Error = ref('');
const saksi2Nama = ref('');
const saksi2Error = ref('');
let saksi1Timeout = null;
let saksi2Timeout = null;
const lemariOptions = ref([]);
const kondisiOptions = [
  { label: 'Baik', value: 'baik' },
  { label: 'Rusak', value: 'rusak' }
];
const enrichedTicket = reactive({});
// dt = display ticket (enriched from detail endpoint, falls back to prop)
const dt = computed(() => Object.keys(enrichedTicket).length > 0 ? enrichedTicket : props.ticketData);

const tmpForm = reactive({
  catatan: '', tgl_pemusnahan: '', saksi1_nik: '', saksi2_nik: '',
  file_bast_1: null, file_bast_2: null, file_bast_3: null, file_bast_4: null,
  lemari_arsip: null, tingkat_lemari: '', box_ke: '',
  kode_lemari: '', kondisi_dokumen: 'baik', catatan_bast: ''
});
const archiveCount = computed(() => archives.value.length);
// canGenerateBAST only for pemusnahan (saksi required)
const canGenerateBAST = computed(() => {
  return tmpForm.tgl_pemusnahan && tmpForm.saksi1_nik && tmpForm.saksi2_nik &&
    saksi1Nama.value && saksi2Nama.value && !saksi1Error.value && !saksi2Error.value;
});

watch(() => props.modelValue, async (val) => {
  showDialog.value = val;
  if (val && props.ticketData) {
    resetForm();
    await loadArchives();
    if (props.module === 'mutasi' && props.ticketData?.tr_status === 8) loadLemariOptions();
  }
});
watch(showDialog, (val) => { if (!val) emit('update:modelValue', false); });
const resetForm = () => {
  Object.assign(tmpForm, {
    catatan: '', tgl_pemusnahan: '', saksi1_nik: '', saksi2_nik: '',
    file_bast_1: null, file_bast_2: null, file_bast_3: null, file_bast_4: null,
    lemari_arsip: null, tingkat_lemari: '', box_ke: '',
    kode_lemari: '', kondisi_dokumen: 'baik', catatan_bast: ''
  });
  saksi1Nama.value = ''; saksi1Error.value = '';
  saksi2Nama.value = ''; saksi2Error.value = '';
  confirmed.value = false;
  // Clear enriched data
  Object.keys(enrichedTicket).forEach(k => delete enrichedTicket[k]);
};

const loadArchives = async () => {
  try {
    const res = await axios.get(`${apiUrl}dms/${props.module}/${props.ticketData.tr_arsip_id}`, {
      params: { empid: empid(), domain: localStorage.getItem('domain') },
      skipErrorInterceptor: true
    });
    archives.value = res.data.data.details || [];
    if (res.data.data.header) Object.assign(enrichedTicket, props.ticketData, res.data.data.header);
  } catch (error) {
    showError('Gagal memuat daftar arsip');
  }
};

const loadLemariOptions = async () => {
  try {
    const lokasiId = enrichedTicket.tr_lokasi_arsip_id || props.ticketData?.tr_lokasi_arsip_id;
    if (!lokasiId) return;
    const res = await axios.get(`${apiUrl}dms/mutasi/lemari-by-lokasi`, { params: { lokasi_arsip_id: lokasiId }, skipErrorInterceptor: true });
    lemariOptions.value = res.data.data || [];
  } catch (error) { lemariOptions.value = []; }
};
const onLemariChange = (lemariId) => {
  tmpForm.kode_lemari = '';
  if (!lemariId) return;
  // PHP: kode_lemari is generated when lemari + tingkat + box are all filled
  if (tmpForm.tingkat_lemari && tmpForm.box_ke) {
    fetchKodeLemari(lemariId, tmpForm.tingkat_lemari, tmpForm.box_ke);
  }
};
const onTingkatBoxChange = () => {
  tmpForm.kode_lemari = '';
  if (tmpForm.lemari_arsip && tmpForm.tingkat_lemari && tmpForm.box_ke) {
    fetchKodeLemari(tmpForm.lemari_arsip, tmpForm.tingkat_lemari, tmpForm.box_ke);
  }
};
const fetchKodeLemari = async (lemariId, tingkat, box) => {
  try {
    const res = await axios.get(`${apiUrl}dms/mutasi/kode-lemari`, { params: { lemari_id: lemariId, tingkat, box }, skipErrorInterceptor: true });
    tmpForm.kode_lemari = res.data.data?.kode_lemari || '';
  } catch (error) { tmpForm.kode_lemari = ''; }
};

const lookupSaksi1 = (nik) => {
  if (saksi1Timeout) clearTimeout(saksi1Timeout);
  if (!nik || nik.length < 3) { saksi1Nama.value = ''; saksi1Error.value = ''; return; }
  saksi1Timeout = setTimeout(async () => {
    try { const r = await axios.get(`${apiUrl}dms/employee/${nik}`, { skipErrorInterceptor: true }); saksi1Nama.value = r.data.data.nama; saksi1Error.value = ''; }
    catch (e) { saksi1Nama.value = ''; saksi1Error.value = 'Karyawan tidak ditemukan'; }
  }, 500);
};
const lookupSaksi2 = (nik) => {
  if (saksi2Timeout) clearTimeout(saksi2Timeout);
  if (!nik || nik.length < 3) { saksi2Nama.value = ''; saksi2Error.value = ''; return; }
  saksi2Timeout = setTimeout(async () => {
    try { const r = await axios.get(`${apiUrl}dms/employee/${nik}`, { skipErrorInterceptor: true }); saksi2Nama.value = r.data.data.nama; saksi2Error.value = ''; }
    catch (e) { saksi2Nama.value = ''; saksi2Error.value = 'Karyawan tidak ditemukan'; }
  }, 500);
};
const generateBAST = async () => {
  if (!canGenerateBAST.value) { showError('Lengkapi semua field BAST terlebih dahulu'); return; }
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_API}dms/pemusnahan/${props.ticketData.tr_arsip_id}/generate-bast-pdf`,
      { params: { saksi1_nik: tmpForm.saksi1_nik, saksi2_nik: tmpForm.saksi2_nik, tgl_pemusnahan: tmpForm.tgl_pemusnahan }, skipErrorInterceptor: true }
    );
    const filename = res.data.data.filename;
    pdfUrl.value = `${import.meta.env.VITE_API}pdf/${filename}`;
    showPdfDialog.value = true;
  } catch (err) {
    showError(err?.response?.data?.message || 'Gagal generate BAST PDF');
  }
};
// Mutasi BAST: generate PDF on backend and download via link (matching PHP bastmutasi)
const pdfUrl = ref('');
const showPdfDialog = ref(false);

const generateMutasiBAST = async () => {
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_API}dms/mutasi/${props.ticketData.tr_arsip_id}/generate-bast-pdf`,
      { skipErrorInterceptor: true }
    );
    const filename = res.data.data.filename;
    pdfUrl.value = `${import.meta.env.VITE_API}pdf/${filename}`;
    showPdfDialog.value = true;
  } catch (err) {
    showError(err?.response?.data?.message || 'Gagal generate BAST PDF');
  }
};
const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
};
const formatSecurity = (val) => {
  if (!val) return '-';
  return val.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

const handleExecute = async () => {
  if (!confirmed.value) { showError('Anda harus mengkonfirmasi terlebih dahulu'); return; }
  const isBast = props.ticketData?.tr_status === 8;
  // Saksi validation only for pemusnahan
  if (isBast && props.module === 'pemusnahan') {
    if (!tmpForm.tgl_pemusnahan || !tmpForm.saksi1_nik || !tmpForm.saksi2_nik) {
      showError('Lengkapi tanggal dan saksi terlebih dahulu'); return;
    }
    if (!saksi1Nama.value || !saksi2Nama.value) { showError('Pastikan NIK saksi valid'); return; }
  }
  try {
    loading.value = true;
    if (props.module === 'pemusnahan' && isBast) {
      const fd = new FormData();
      fd.append('creator', empid()); fd.append('catatan', tmpForm.catatan);
      fd.append('saksi1_nik', tmpForm.saksi1_nik); fd.append('saksi2_nik', tmpForm.saksi2_nik);
      fd.append('tgl_pemusnahan', tmpForm.tgl_pemusnahan);
      if (tmpForm.file_bast_3) fd.append('tr_file_bast_3', tmpForm.file_bast_3);
      if (tmpForm.file_bast_4) fd.append('tr_file_bast_4', tmpForm.file_bast_4);
      await axios.put(`${apiUrl}dms/pemusnahan/${props.ticketData.tr_arsip_id}/execute-bast`, fd, { headers: { 'Content-Type': 'multipart/form-data' }, skipErrorInterceptor: true });
    } else if (props.module === 'mutasi' && isBast) {
      const fd = new FormData();
      fd.append('creator', empid()); fd.append('catatan', tmpForm.catatan);
      fd.append('lemari_arsip', tmpForm.lemari_arsip || '');
      fd.append('tingkat_lemari', tmpForm.tingkat_lemari);
      fd.append('box_ke', tmpForm.box_ke);
      fd.append('kode_lemari', tmpForm.kode_lemari);
      fd.append('kondisi_dokumen', tmpForm.kondisi_dokumen);
      fd.append('catatan_bast', tmpForm.catatan_bast);
      if (tmpForm.file_bast_1) fd.append('upload1', tmpForm.file_bast_1);
      if (tmpForm.file_bast_2) fd.append('upload2', tmpForm.file_bast_2);
      if (tmpForm.file_bast_3) fd.append('upload3', tmpForm.file_bast_3);
      if (tmpForm.file_bast_4) fd.append('upload4', tmpForm.file_bast_4);
      await axios.post(`${apiUrl}dms/mutasi/${props.ticketData.tr_arsip_id}/execute`, fd, { headers: { 'Content-Type': 'multipart/form-data' }, skipErrorInterceptor: true });
    } else {
      await axios.post(`${apiUrl}dms/${props.module}/${props.ticketData.tr_arsip_id}/execute`, { creator: empid(), catatan: tmpForm.catatan }, { skipErrorInterceptor: true });
    }
    loading.value = false;
    success(props.module === 'mutasi' ? 'Pemindahan arsip berhasil dieksekusi' : 'Penghapusan arsip berhasil dieksekusi');
    emit('executed'); closeDialog();
  } catch (error) {
    loading.value = false;
    showError(error?.response?.data?.message || error?.message || 'Gagal mengeksekusi');
  }
};
const closeDialog = () => { showDialog.value = false; };
</script>

