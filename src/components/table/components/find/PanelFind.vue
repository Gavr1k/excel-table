<template>
  <div id="panelModal" v-show="show" class="panel-modal" @click="clickOutside" @keydown.exact.esc="hidePanel">
    <div ref="panelFind" class="panel-body">
      <SearchInput v-model="inputFind" @search="doFind" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits, nextTick } from 'vue';
import SearchInput from './SearchInput.vue';

const props = defineProps<{ show: boolean }>();
const emit = defineEmits(['doFind', 'close']);

const inputFind = ref('');

const clickOutside = (e: MouseEvent) => {
  if ((e.target as HTMLElement).id === 'panelModal') {
    hidePanel();
  }
};

const doFind = (value: string) => {
  hidePanel();
  emit('doFind', value);
};

const hidePanel = () => {
  emit('close');
};

watch(
  () => props.show,
  async (newValue) => {
    if (newValue) {
      await nextTick();
      document.getElementById('inputField')?.focus();
    }
  }
);
</script>

<style scoped>
.panel-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #0007;
  z-index: 999;
}

.panel-body {
  background-color: white;
  position: fixed;
  border-radius: 5px;
  padding: 1rem;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 28rem;
  max-width: 75vh;
  display: flex;
  flex-direction: column;
}
</style>
