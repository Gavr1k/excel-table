<template>
  <td
    :id="uid"
    ref="cellRef"
    contenteditable
    @dragenter.prevent="handleDragEnter"
    @dragover.prevent="handleDragOver"
    class="cell column-filter"
    :class="cellClass"
    :style="cellStyle"
    autocomplete="off"
    autocorrect="off"
    autocapitalize="off"
    spellcheck="false"
    tabindex="-1"
    v-on="listeners"
    :colspan="colspan"
    @focus="onFocus"
    @blur="onBlur"
    @keydown.left.exact="keyWest"
    @keydown.right.exact="keyEast"
    @keydown.enter.exact.prevent="keyEnter"
    @keyup.delete.exact="keyDelete"
    @mousemove="mouseMove"
    @mousedown="mouseDown" />
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, defineProps, defineEmits, useAttrs, nextTick } from 'vue';

// Определение интерфейсов для пропсов
interface Field {
  // Определите свойства, если необходимо
}

interface LocalizedLabel {
  // Если есть локализованные метки, добавьте сюда
}

interface Props {
  modelValue?: string;
  interactive?: boolean;
  colspan?: string | number;
  class?: string | Record<string, any>;
  style?: string | Record<string, any>;
}

// Определение пропсов с дефолтными значениями
const props = defineProps<Props>();

// Определение событий, которые компонент может эмитировать
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'showFilter'): void;
}>();

// Использование атрибутов для прослушивания дополнительных событий
const attrs = useAttrs();

// Определение ссылок на DOM элементы
const cellRef = ref<HTMLElement | null>(null);
const rowRef = ref<HTMLElement | null>(null);
const theadRef = ref<HTMLElement | null>(null);
const colLabelRef = ref<HTMLElement | null>(null);

// Уникальный идентификатор для ячейки
const uid = ref<string>('');

// Позиция столбца
const colPos = ref<number>(0);

// Вычисляемые свойства для классов и стилей
const listeners = computed(() => ({
  ...attrs,
  input: onInput,
}));

const cellClass = computed(() => props.class);
const cellStyle = computed(() => props.style);

// Вычисляемое свойство для ошибок (если необходимо)
const err = computed(() => {
  // Если есть метод validate, можно его использовать
  // if (validate)
  //   return validate(props.modelValue)
  // return ''
  return '';
});

// Методы

/**
 * Обновляет значение модели, если оно изменилось
 */
const updateValue = (e: Event) => {
  const target = e.target as HTMLElement;
  const content = target.textContent || '';
  if (props.modelValue !== content) {
    emit('update:modelValue', content);
  }
};

/**
 * Обработчик события input
 */
const onInput = (e: Event) => {
  if (props.interactive) {
    updateValue(e);
  }
};

/**
 * Обработчик события focus
 */
const onFocus = () => {
  setTimeout(() => {
    if (colLabelRef.value) {
      colLabelRef.value.classList.add('focus');
    }
    if (cellRef.value) {
      selectAll(cellRef.value);
    }
    // Если нужно взаимодействовать с родительским компонентом, используйте provide/inject или эмитируйте события
  }, 0);
};

/**
 * Выделяет весь текст внутри узла
 */
const selectAll = (node: HTMLElement) => {
  const selection = window.getSelection();
  if (selection) {
    const range = document.createRange();
    range.selectNodeContents(node);
    selection.removeAllRanges();
    selection.addRange(range);
  }
};

/**
 * Обработчик события blur
 */
const onBlur = (e: FocusEvent) => {
  updateValue(e);
  if (colLabelRef.value) {
    colLabelRef.value.classList.remove('focus');
  }
  const target = e.target as HTMLElement;
  target.classList.remove('edit');
};

/**
 * Обработчик нажатия клавиши "влево"
 */
const keyWest = (e: KeyboardEvent) => {
  const sel = window.getSelection();
  if (!sel) return;

  const target = e.target as HTMLElement;
  if (target.textContent === sel.toString() || sel.focusOffset === 0) {
    let td = target.previousElementSibling as HTMLElement | null;
    while (td && td.style.display === 'none') {
      td = td.previousElementSibling as HTMLElement | null;
    }
    if (td) {
      td.focus();
    }
  }
};

/**
 * Обработчик нажатия клавиши "вправо"
 */
const keyEast = (e: KeyboardEvent) => {
  const sel = window.getSelection();
  if (!sel) return;

  const target = e.target as HTMLElement;
  if (target.textContent === sel.toString() || (sel.focusOffset >= (target.textContent?.length || 0))) {
    let td = target.nextElementSibling as HTMLElement | null;
    while (td && td.style.display === 'none') {
      td = td.nextElementSibling as HTMLElement | null;
    }
    if (td) {
      td.focus();
    }
  }
};

/**
 * Обработчик нажатия клавиши "Enter"
 */
const keyEnter = (e: KeyboardEvent) => {
  e.preventDefault();
  if (cellRef.value) {
    selectAll(cellRef.value);
    updateValue(e);
  }
};

/**
 * Обработчик нажатия клавиши "Delete"
 */
const keyDelete = (e: KeyboardEvent) => {
  const target = e.target as HTMLElement;
  if (target.textContent === '') {
    setTimeout(() => {
      updateValue(e);
    }, 0);
  }
};

/**
 * Обработчик события mousemove для изменения курсора
 */
const mouseMove = (e: MouseEvent) => {
  if (cellRef.value) {
    const cursorPosition = cellRef.value.offsetWidth - e.offsetX;
    cellRef.value.style.cursor = cursorPosition < 15 ? 'pointer' : 'text';
  }
};

/**
 * Обработчик события mousedown для отображения фильтра при клике возле края ячейки
 */
const mouseDown = (e: MouseEvent) => {
  if (e.button === 0 && cellRef.value) {
    const cursorPosition = cellRef.value.offsetWidth - e.offsetX;
    if (cursorPosition < 15) {
      e.preventDefault();
      setTimeout(() => {
        emit('showFilter');
        // Если нужно взаимодействовать с родительским компонентом, используйте provide/inject или эмитируйте события
      }, 0);
    }
  }
};

/**
 * Обработчик события dragenter
 */
const handleDragEnter = (event: DragEvent) => {
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'none';
  }
};

/**
 * Обработчик события dragover
 */
const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'none';
  }
};

// Логика инициализации после монтирования
onMounted(() => {
  // Генерация уникального ID
  uid.value = 'uid' + Math.random().toString(36).substr(2, 9);

  // Установка содержимого ячейки
  if (cellRef.value) {
    cellRef.value.textContent = props.modelValue;

    // Поиск родительских элементов row и thead
    rowRef.value = cellRef.value.parentElement;
    theadRef.value = rowRef.value?.parentElement;

    if (rowRef.value && theadRef.value) {
      const childrenArray = Array.from(rowRef.value.children);
      colPos.value = childrenArray.indexOf(cellRef.value) - 1;
      const thChildren = (theadRef.value.children[0] as HTMLElement).children;
      if (thChildren.length > colPos.value + 1) {
        colLabelRef.value = thChildren[colPos.value + 1] as HTMLElement;
      }
    }
  }
});

// Наблюдение за изменениями modelValue для обновления содержимого ячейки
watch(() => props.modelValue, (newVal) => {
  if (cellRef.value && newVal !== cellRef.value.textContent) {
    cellRef.value.textContent = newVal;
  }
});
</script>

<style scoped>
.column-filter {
  background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHsAAABuCAMAAAAwApxlAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAE4UExURQAAAAAAAICAgFVVVUBAQICAgGZmZoCAgJKSko6OjmZmZoCAgHZ2doCAgIiIiHh4eIeHh4CAgHl5eXl5eYaGhoWFhYCAgIWFhXt7e4SEhODg4CAgICAgH19fYKCgoCAgISEhIKCgn19fX19fYKCgoCAgH5+foGBgX5+foCAgHx8fH19fYCAgH5+foCAgHx8fH5+fn5+foGBgYCAgH5+fn5+foCAgIODg4CAgIGBgYODg3x8fICAgIGBgYCAgICAgH9/f39/f4CAgH9/f4CAgICAgH9/f4CAgIGBgYSEhODg4SEhH9/f4CAgH9/f4CAgICAgICAgH9/f4CAgH5+fn9/f35+foCAgIKCgoSEhODg4SEhIWFhYaGhoeHh4iIiImJiW6rGxQAAABedFJOUwABAgMEBAUGBwkKCg0ODxEREhMVFRcYGRsfJSowMTE0NDU7Pz9CQ0VNUFReXl9gZ2ttb3BxdXh5fH19f4CAgoWLkZqbnqChoaSkqqurra28wsXFydXW1tbq7u/x+fuJeTf3AAAACXBIWXMAABbqAAAW6gHljkMQAAABFUlEQVRoQ+3X11LCUBSF4RAEVFCwYEXFgr0g9gLYexcbahLDOcn7v4HArGfYmWHWd7X/q3O39xyDiIiIiIiIiIgoKOHORLwNs7DuhVK5tDyEkrX45Svv9wAla8e3LEvd9CElmXu6/nbtIY0WtaEcx9EXHUhRmdv3t8rjPEpYOjc3O4yZqFWlxrOZILZa3cjx88vTySRKVl65f653GkVKihS95j4fQEsy95t37K4fLWrpR9eUexRCihosXJ6dH46ihMWSval2zEQtyhzLb65PhVGyZl6r39XKKkrWlmfbtneVQEqKFBt/A/c+iFsS2m3cMX3dhRaV+/C1/7mGkhWfWNkuTPegxEVjGIiIiIiIiIiIiIJlGP8KtCi1NMvKyQAAAABJRU5ErkJggg==');
  background-repeat: no-repeat;
  background-size: 36px;
  background-position: right -12px top -1px;
}

.cell.column-filter {
  /* Дополнительные стили при необходимости */
  /* Например, можно добавить padding или изменить фон */
}
</style>
