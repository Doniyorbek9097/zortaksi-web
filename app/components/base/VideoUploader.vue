<template>
  <div class="space-y-4 max-w-3xl mx-auto">
    <BaseVideoPlayer ref="baseVideoPlayer" v-if="previewUrl" :video-url="previewUrl"/>
    <!-- Preview Grid -->
    <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
      <!-- Video Preview Cards -->
      <div 
        v-if="previewUrl"
        class="relative h-[150px] group rounded-xl overflow-hidden border bg-white shadow-sm
               hover:shadow-md transition flex items-center justify-center"
      >
        <!-- Video Thumbnail -->
        <video
          :src="previewUrl"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          muted
        ></video>

        <!-- Overlay -->
        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition"></div>

        <div @click="baseVideoPlayer.open" class="absolute w-full h-full flex justify-center items-center">
          <span class="mdi mdi-play-circle text-4xl text-white cursor-pointer"></span>
        </div>
        <!-- Progress Bar -->
        <div v-if="uploading" class="absolute bottom-0 left-0 w-full h-2 bg-gray-200">
          <div :style="{ width: progress + '%' }" class="h-2 bg-indigo-600 transition-all"></div>
        </div>

        <!-- Delete Button -->
        <button
          type="button"
          @click="clear()"
          class="absolute top-2 right-2 w-7 h-7
                 rounded-full bg-black/70 text-white
                 flex items-center justify-center
                 text-xs opacity-0
                 group-hover:opacity-100 transition"
        >
          ✕
        </button>
      </div>

      <!-- Upload Card -->
      <label
       v-if="!previewUrl"
        class="group relative border-2 border-dashed rounded-2xl h-[150px]
             flex flex-col items-center justify-center gap-2
             cursor-pointer transition-all
             border-gray-300 text-gray-400
             hover:border-blue-500 hover:text-blue-500
             focus-within:border-blue-500"
      >
        <div
          class="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800
                 flex items-center justify-center transition"
        >
          <span class="mdi mdi-multimedia text-2xl"></span>
        </div>
        <p class="text-sm text-center font-medium">Videoni yuklash</p>
        <input
          ref="fileInput"
          type="file"
          accept="video/*"
          class="hidden"
          @change="onFileSelected"
        />
      </label>
    </div>

    <!-- Error -->
    <div
      v-if="error"
      class="flex items-start gap-2 rounded-xl
             bg-red-50 border border-red-200
             p-3 text-red-600 text-xs"
    >
      <span>⚠️</span>
      <span>{{ error }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted, watch } from "vue";
import { useApi } from "#imports";

const props = defineProps({
    modelValue: {
        type: String,
        default: ""
    },
    isUpload: {
      type: Boolean,
      default: true
    }
});
const emits = defineEmits(['update:modelValue']);
const baseVideoPlayer = ref();
const maxSize = 10 * 1024 * 1024; // 10 MB
const acceptedTypes = ["video/mp4", "video/quicktime", "video/webm", "video/x-m4v"];

const fileInput = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const previewUrl = ref<string | null>(props.modelValue || null);
const progress = ref(0);
const uploading = ref(false);
const uploadedUrl = ref<string | null>(props.modelValue || null);
const error = ref<string | null>(null);
const isDragOver = ref(false);

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(2) + " " + sizes[i];
}

function validateFile(file: File) {
  if (file.size > maxSize) {
    error.value = `Limit: ${formatBytes(maxSize)}`;
    return false;
  }
  if (!acceptedTypes.includes(file.type)) {
    error.value = "Faqat MP4 / MOV / WEBM";
    return false;
  }
  return true;
}

function setFile(file: File) {
  clearPreview();
  selectedFile.value = file;
  previewUrl.value = URL.createObjectURL(file);
  uploadedUrl.value = null;
  progress.value = 0;
}

function clearPreview() {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = null;
  }
}

async function clear() {
  if (fileInput.value) fileInput.value.value = "";
  if (uploadedUrl.value) {
    await useApi(`/image-remove?video_url=${uploadedUrl.value}`, { method: "DELETE" });
     emits('update:modelValue', '');
  }
  selectedFile.value = null;
  uploadedUrl.value = null;
  progress.value = 0;
  uploading.value = false;
  error.value = null;
  clearPreview();
}


function onFileSelected(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  if (!validateFile(file)) return;
  setFile(file);
  startUpload()
}


async function startUpload() {
  if (!selectedFile.value) return;
  uploading.value = true;
  error.value = null;
  progress.value = 0;

  const form = new FormData();
  form.append("file", selectedFile.value);

  try {
    const res = await useApi("/video-upload", {
      method: "POST",
      body: form,
      onUploadProgress(e: any) {
        if (e.lengthComputable) progress.value = (e.loaded / e.total) * 100;
      }
    });
    uploadedUrl.value = res.data || "";
    emits('update:modelValue', uploadedUrl.value); // yuklangan videoni modelValue ga yuboramiz
  } catch (err: any) {
    error.value = err?.response?._data?.message || "Yuklashda xato!";
  } finally {
    uploading.value = false;
  }
}

onUnmounted(() => clearPreview());
</script>

