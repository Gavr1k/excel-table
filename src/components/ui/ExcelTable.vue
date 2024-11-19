<template>
  <VueExcelEditor 
    class="excel-table" 
    v-model="localTableData" 
    @update:modelValue="localTableData = $event"
    v-bind="editorProps"
  >
    <VueExcelColumn 
    v-for="(column, colIndex) in columns" 
    :key="colIndex" 
    :field="column.field" 
    :label="column.label"
    :type="column.type" 
    :width="column.width" 
    :init-style="{ padding: '2px 4px', height: '15px' }" 
    auto-fill-width
    v-slot="scope"
    >
    </VueExcelColumn>
  </VueExcelEditor>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import VueExcelEditor from '../table/VueExcelEditor.vue';
import VueExcelColumn from '../table/VueExcelColumn.vue';
import { TableProps } from '../table/types';

const props = defineProps<TableProps>();
const { modelValue, ...editorProps } = props;

const emit = defineEmits(['update:modelValue']);

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