<template>
  <VueExcelEditor 
    class="excel-table" 
    v-model="localTableData" 
    @update:modelValue="localTableData = $event"
    v-bind="editorProps"
    :selectedRows="selectedRows"
    @select="handleSelect"
  >
    <VueExcelColumn 
      v-for="(column, colIndex) in columns" 
      :key="colIndex" 
      :field="column.field" 
      :label="column.label"
      :type="column.type" 
      :width="column.width" 
      :init-style="{ padding: '2px 4px', height: '15px', 'text-align': 'center' }" 
      auto-fill-width
      v-slot="scope"
    >
    </VueExcelColumn>
  </VueExcelEditor>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import VueExcelEditor from '../table/VueExcelEditor.vue';
import VueExcelColumn from '../table/VueExcelColumn.vue';
import { TableProps } from '../table/types';

const props = defineProps<TableProps>();
const { modelValue, ...editorProps } = props;

const selectedRows = ref(['30acecbe-80ee-41f1-97ab-996135f0cc65']);

const emit = defineEmits(['update:modelValue']);

const handleSelect = (selectedId: string[], status: boolean): void => {
  console.log(selectedId);
};

const localTableData = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});
</script>

<style scoped lang="scss">
.excel-table::v-deep .component-content .table-content .systable {
  width: auto !important;
}
</style>