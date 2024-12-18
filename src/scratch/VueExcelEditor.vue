<template>
  <div class="editor">
    <div class="component-content">
      <div class="table-content">
        <table border="1" class="editor__table">
          <thead>
            <tr v-for="level in maxDepth + 1" :key="'header-row-' + level">
              <th 
                v-if="level === 1 && gridOptions.numCol" 
                :key="'header-col-num'"
                :rowSpan="maxDepth + 1"
                colspan="1"
                @contextmenu.prevent="contextMenus.showSettingsModal = true"
                >№
              </th>

              <th 
                v-if="level === 1 && gridOptions.selectable" 
                :key="'header-col-select'"
                :rowSpan="maxDepth + 1"
                colspan="1"
                @contextmenu.prevent="contextMenus.showSettingsModal = true"
              >
                <input 
                  type="checkbox" 
                  :checked="isAllSelected" 
                  @change="toggleSelectAll"
                />
              </th>

              <!--заменить верхнее на одну-->

              <th 
                v-for="col in flattenedColumns.filter(col => col.depth === level - 1)" 
                :key="'header-col-' + col.headerName"
                :colspan="getColspan(col)"
                :rowspan="getRowspan(col)"
              >
                {{ col.headerName }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, rowIndex) in rowData" :key="'row-' + rowIndex">
              <td v-if="gridOptions.numCol" :key="'cell-num-' + rowIndex">
                {{ rowIndex + 1 }}
              </td>

              <td 
                v-if="gridOptions.selectable" 
                :key="'cell-select-' + rowIndex"
              >
                <input 
                  type="checkbox" 
                  v-model="selectedRows[rowIndex]" 
                />
              </td>

              <td
                v-for="col in flattenedColumns.filter(col => !col.children)"
                :key="'cell-' + col.field + '-' + rowIndex"
              >
                {{ row[col.field] }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <settingsModal v-model="contextMenus.showSettingsModal"></settingsModal>
    </div>
    <button @click="exportTable('xlsx', false, 'test')"> export</button>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, ref, computed} from "vue";
import settingsModal from "./settingsModal.vue";
import * as XLSX from 'xlsx';

interface Column {
  headerName: string;
  field?: string;
  children?: Column[];
  depth?: number;
}

interface gridOptions {
  numCol?: boolean,
  selectable?: boolean,
}

interface Props {
  columns: Column[];
  rowData: Record<string, any>[];
  gridOptions: gridOptions;
}

const props = defineProps<Props>();

const contextMenus = ref({
  showSettingsModal: false,
});

const countChildren = (col: Column): number => {
  if (!col.children || col.children.length === 0) {
    return 1;
  }
  return col.children.reduce((sum, child) => sum + countChildren(child), 0);
};

const flattenColumns = (columns: Column[], depth = 0): { columns: Column[]; maxDepth: number } => {
  const flattened: Column[] = [];
  let maxDepth = depth;

  for (const col of columns) {
    if (col.depth === undefined) {
      col.depth = depth;
    }

    if (col.children) {
      const childResult = flattenColumns(col.children, depth + 1);
      maxDepth = Math.max(maxDepth, childResult.maxDepth);
      flattened.push({ ...col, depth });
      flattened.push(...childResult.columns);
    } else {
      flattened.push({ ...col, depth });
    }
  }

  return { columns: flattened, maxDepth };
};

const { columns: flattenedColumns, maxDepth } = flattenColumns(props.columns);

const getColspan = (col: Column): number => {
  return countChildren(col);
};

const getRowspan = (col: Column): number => {
  if (!col.children) {
    return maxDepth - (col.depth || 0) + 1;
  }

  return 1;
};


// Количество строк, которые будут выбраны
const selectedRows = ref<boolean[]>(new Array(props.rowData.length).fill(false));

// Функция для подсчета выбранных строк
const isAllSelected = computed(() => selectedRows.value.every(selected => selected));

// Функция для переключения выбора всех строк
const toggleSelectAll = () => {
  const newSelection = !isAllSelected.value;
  selectedRows.value = selectedRows.value.map(() => newSelection);
};




const exportTable = (format: string, selectedOnly: boolean, filename: string) => {
  const wb = XLSX.utils.book_new();

  // Если выбраны только выбранные строки
  let data = props.rowData;
  if (selectedOnly) {
    data = props.rowData.filter((_, i) => selectedRows.value[i]);
  }

  // Преобразуем данные в формат, который можно использовать в Excel
  const mappedData = data.map((rec) => {
    const conv = {};
    flattenedColumns.forEach((col) => {
      conv[col.field] = rec[col.field];
    });
    return conv;
  });

  // Создание листа Excel из данных
  const ws = XLSX.utils.json_to_sheet(mappedData, {
    header: flattenedColumns.map((col) => col.headerName)
  });

  // Добавляем лист в книгу
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

  // Устанавливаем имя файла по умолчанию
  filename = filename || 'exported_table';

  // Проверка формата и добавление расширения
  switch (format) {
    case 'csv':
      if (!filename.endsWith('.csv')) filename += '.csv';
      break;
    case 'xls':
      if (!filename.endsWith('.xls')) filename += '.xls';
      break;
    case 'xlsx':
    case 'excel':
    default:
      if (!filename.endsWith('.xlsx')) filename += '.xlsx';
      break;
  }

  // Сохранение файла
  if (filename.endsWith('.xlsx')) {
    XLSX.writeFile(wb, filename, {
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });
  } else {
    XLSX.writeFile(wb, filename);
  }
};

</script>

<style scoped lang="scss">
.editor {
  &__table {
    width: 100%; border-collapse: collapse;
  }
}


</style>
