<template>
  <modalUI v-model="props.modelValue" title="Настройки">
    <template #body>
      test
    </template>
    <template #footer>
      <buttonUi @click="handleImportTable">import table</buttonUi>
      <buttonUi @click="handleExportTable">Export table</buttonUi>

    </template>
  </modalUI>
</template>

<script setup lang="ts">
import modalUI from './modalUI.vue';
import buttonUi from './buttonUi.vue';

interface Props {
  modelValue: boolean,
}

const props = defineProps<Props>();

const handleImportTable = () => {
  console.log('here import');
};

const handleExportTable = () => {
  console.log('here export');
};

</script>

<style scoped lang="scss"></style>