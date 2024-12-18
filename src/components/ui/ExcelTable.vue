<template>
  <VueExcelEditor 
    class="excel-table" 
    v-model="localTableData" 
    @update:modelValue="localTableData = $event"
    v-bind="editorProps"
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

// const selectedRows = ref(['30acecbe-80ee-41f1-97ab-996135f0cc65']);

const allSelectedIds = ref<string[]>([]);

const emit = defineEmits(['update:modelValue', 'selected']);

const handleSelect = (selectedId: string[], status: boolean,): void => {
  console.log('here', status);
  if (allSelectedIds.value.length || props.singleSelect) {
    allSelectedIds.value = [];
  }
  selectedId.forEach((id: string) => {
    const indexIfExist: number = allSelectedIds.value.indexOf(id);
    if (!status) {
      allSelectedIds.value.splice(indexIfExist, 1);
    } else {
      allSelectedIds.value.push(id);
    }
  });

  emit('selected', allSelectedIds.value);
};

const localTableData = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});
</script>

<style scoped lang="scss">
::v-deep .excel-table table > thead > tr > th {
  background-color: #009639;
  color: #fff;
}

::v-deep .excel-table td,
::v-deep .excel-table th {
  font-size: 10px;
  font-family: "Montserrat";
}

.excel-table::v-deep .component-content .table-content .systable {
  width: auto !important;
}
</style>