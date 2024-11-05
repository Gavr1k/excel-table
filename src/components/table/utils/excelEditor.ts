import { getCurrentInstance } from 'vue';

// отложенная обработка с буферизацией
function lazyBuf<T>(context: any, item: T, processFunction: (items: T[]) => void, delay: number = 20) {
  const hash = hashCode(`${processFunction.name}${processFunction.toString()}`);

  if (context.lazyBuffer[hash]) {
    context.lazyBuffer[hash] = [];
  }

  context.lazyBuffer[hash].push(item);

  if (context.lazyTimeout[hash]) {
    clearTimeout(context.lazyTimeout[hash]);
  }

  context.lazyTimeout[hash] = setTimeout(() => {
    context.$nextTick(() => {
      processFunction(context.lazyBuffer[hash]);
      delete context.lazyTimeout[hash];
      delete context.lazyTimeout[hash];
    });
  }, delay);
}

//получение локальной даты
function localeDate(date = new Date()): string {
  const pad = (n: number): string => (n < 10 ? '0' + n : n.toString())
  return (
    date.getFullYear() +
    '-' +
    pad(date.getMonth() + 1) +
    '-' +
    pad(date.getDate()) +
    ' ' +
    pad(date.getHours()) +
    ':' +
    pad(date.getMinutes()) +
    ':' +
    pad(date.getSeconds())
  );
};

// Выбрать ячейку
function selectRecord(context: any, rowPos: number): void {
  if (typeof context.selected[rowPos] === 'undefined') {
    context.selectedCount++;
    context.selected[rowPos] = context.table[rowPos].$id;

    const rowElement = context.recordBody.children[rowPos - context.pageTop];
    if (rowElement) {
      rowElement.classList.add('select');
    }

    lazy(context, rowPos, (buf: any) => {
      context.$emit('select', buf, true);
    });
  }
}

function unSelectRecord(context: any, rowPos: number): void {
  if (typeof context.selected[rowPos] !== 'undefined') {
    delete context.selected[rowPos];
    context.selectedCount--;

    const rowElement = context.recordBody.children[rowPos - context.pageTop];
    if (rowElement) {
      rowElement.classList.remove('select');
    }

    lazy(context, rowPos, (buf: any) => {
      context.$emit('select', buf, false);
    });
  }
}

// ошибки на уровне строчек таблицы
function setRowError(context: any, error: string | null, row: any): void {
  const rid = `rid-${row.$id}`;
  const selector = context.systable.querySelector(`td#${rid}`);

  if (error) {
    context.rowerr[rid] = error;
    context.$emit('validate-error', error, row);

    if (selector) {
      selector.classList.add('error');
    }
  } else {
    if (context.rowerr[rid]) {
      delete context.rowerr[rid];
      context.$emit('validate-error', '', row);

      if (selector) {
        selector.classList.remove('error');
      }
    }
  }
}

// ошибки на уровне ячеек таблицы
function setFieldError(context: any, error: string | null, row: any, field: any): void {
  const id = `id-${row.$id}-${field.name}`;
  const selector = context.systable.querySelector(`td#${id}`);

  if (error) {
    context.errmsg[id] = error;
    context.$emit('validate-error', error, row, field);

    if (selector) {
      selector.classList.add('error');
    }
  } else {
    if (context.errmsg[id]) {
      delete context.errmsg[id];
      context.$emit('validate-error', '', row, field);

      if (selector) {
        selector.classList.remove('error');
      }
    }
  }
}

// достать ключи
function getKeys(context: any, rec: any): any[] {
  const record = rec || context.currentRecord;

  const keyFields = context.fields
    .filter(field => field.keyField)
    .map(field => record[field.name])
    .filter(key => key !== undefined && key !== null && key !== '');

  return keyFields.length > 0 ? keyFields : [record.$id];
};
//===================================================================================//

// Функция хеширования строки
export function hashCode(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash.toString();
}

// отложенное выполнение функции
export function lazy<T>(context: any, fnOrItem: T | (() => void), delay: number = 20, processFn?: (items: T[]) => void) {
  if (typeof fnOrItem !== 'function') {
    return lazyBuf(context, fnOrItem, processFn!, delay);
  }

  const callback = fnOrItem as () => void;
  const hash = hashCode(callback.name + callback.toString());

  if (context.lazyTimeout[hash]) {
    clearTimeout(context.lazyTimeout[hash]);
  }

  context.lazyTimeout[hash] = setTimeout(() => {
    callback();
    delete context.lazyTimeout[hash];
  }, delay);
}


// сравнения двух записей
export function isSameSinceLeft(context: any, limit: number, record1: any, record2: any): boolean {
  for (let index = 0; index <= limit; index++) {
    const field = context.field[index];

    if (field.invisible || !field.hideDuplicate) {
      continue;
    }

    const fieldName = field.name;

    if (record1[fieldName] !== record2[fieldName]) {
      return false;
    }
  }

  return true;
}

// генерация временного ключа
export function tempKey(): string {
  const timestamp = Date.now() % 1e8;
  const randomPart = Math.floor(Math.random() * 1e5).toString().padStart(5, '0');
  return `${timestamp}-${randomPart}`;
}

// очистки выбранных элементов
export function clearAllSelected(context: any): void {
  if (context.selectedCount > 0) {
    const selectedRows = Object.keys(context.selected).map(Number);
    context.$emit('select', selectedRows, false);
  }

  context.selected = {};
  context.selectedCount = 0;
}

// добавляет обработчики событий на глобальный объект
export function addEventListener(context: any): void {
  const eventListeners: [string, EventListenerOrEventListenerObject, AddEventListenerOptions?][] = [
    ['resize', context.winResize],
    ['paste', context.winPaste],
    ['keydown', context.winKeydown],
    ['keyup', context.winKeyup],
    ['scroll', context.winScroll],
    ['wheel', context.mousewheel, { passive: false }]
  ];

  eventListeners.forEach(([event, handleError, options]) => {
    window.addEventListener(event, handleError, options || false);
  });
}

// удаляем обработчики событий на глобальный объект
export function removeEventListener(context: any): void {
  const eventListeners: [string, EventListenerOrEventListenerObject][] = [
    ['resize', context.winResize],
    ['paste', context.winPaste],
    ['keydown', context.winKeydown],
    ['keyup', context.winKeyup],
    ['scroll', context.winScroll],
    ['wheel', context.mousewheel],
  ];

  eventListeners.forEach(([event, handler]) => {
    window.removeEventListener(event, handler);
  })
};


// группировка по условию
export function filterGrouping(context: any, record: any, index: number, table: any[]): boolean {
  if (index === 0) return true;

  const previousRecord = table[index - 1];
  let isGrouped = true;

  for (const field of context.fields) {
    const fieldName = field.name;

    if (field.grouping && record[fieldName] === previousRecord[fieldName]) {
      const groupKey = fieldName + record[fieldName];

      if (field.grouping === 'collapse' && context.ungroup[groupKey] !== true) {
        isGrouped = false;
        break;
      }

      if (field.grouping === 'expand' && context.ungroup[groupKey]) {
        isGrouped = false;
        break;
      }
    }
  }

  return isGrouped;
};

export function calSummary(context: any, name?: string): void {
  context.fields.forEach(field => {
    if (!field.summary) return;
    const i = field.name;
    if (name && name !== i) return;

    let result: any = '';
    const currentTick = new Date().getTime();
    const currentDateTimeSec = localeDate();
    const currentDateTime = currentDateTimeSec.slice(0, 19);
    const currentDate = currentDateTimeSec.slice(0, 10);

    switch (field.summary) {
      case 'sum':
        result = context.table.reduce((a, b) => a + Number(b[i] || 0), 0);
        result = Number(Math.round(result + 'e+5') + 'e-5');
        break;
      case 'avg':
        result = context.table.reduce((a, b) => a + Number(b[i] || 0), 0) / context.table.length;
        result = Number(Math.round(result + 'e+5') + 'e-5');
        break;
      case 'max':
        result = context.table.reduce((a, b) => (a > b[i] ? a : b[i]), Number.MIN_VALUE);
        break;
      case 'min':
        result = context.table.reduce((a, b) => (a < b[i] ? a : b[i]), Number.MAX_VALUE);
        break;
      case 'count':
        switch (field.type) {
          case 'checkYN':
            result = context.table.reduce((a, b) => a + (b[i] === 'Y' ? 1 : 0), 0);
            break;
          case 'check10':
            result = context.table.reduce((a, b) => a + (b[i] === '1' ? 1 : 0), 0);
            break;
          case 'checkTF':
            result = context.table.reduce((a, b) => a + (b[i] === 'T' ? 1 : 0), 0);
            break;
          case 'date':
            result = context.table.reduce((a, b) => a + (b[i] >= currentDate ? 1 : 0), 0);
            context.summary[i] = result;
            return;
          case 'datetime':
            result = context.table.reduce((a, b) => a + (b[i] >= currentDateTime ? 1 : 0), 0);
            context.summary[i] = result;
            return;
          case 'datetimesec':
            result = context.table.reduce((a, b) => a + (b[i] >= currentDateTimeSec ? 1 : 0), 0);
            context.summary[i] = result;
            return;
          case 'datetick':
          case 'datetimetick':
          case 'datetimesectick':
            result = context.table.reduce((a, b) => a + (b[i] >= currentTick ? 1 : 0), 0);
            context.summary[i] = result;
            return;
          default:
            result = context.table.reduce((a, b) => a + (b[i] ? 1 : 0), 0);
            break;
        }
        break;
    }

    if (field.type === 'number' && isNaN(result)) return;

    context.summary[i] = field.toText(result);
  });
}

export function reviseSelectedAfterTableChange(context: any): void {
  context.rowIndex = {};

  context.table.forEach((rec: any, i: number) => {
    context.rowIndex[rec.$id] = i;
  });

  const tempSelected = { ...context.selected };
  context.selected = {};

  Object.keys(tempSelected).forEach((p) => {
    const id = tempSelected[p];
    if (typeof context.rowIndex[id] !== 'undefined') {
      context.selected[context.rowIndex[id]] = id;
    }
  });

  context.selectedCount = Object.keys(context.selected).length;
}

// управление выбором всех записей
export function toggleSelectAllRecords(context: any, event?: Event): void {
  if (event) event.preventDefault();

  if (context.selectedCount > 0) {
    clearAllSelected(context);
  } else {
    for (let i = 0; i < context.table.length; i++) {
      selectRecord(context, i);
    }
    context.selectedCount = context.table.length;
  }
}

//обработка кликов по строчке
export function rowLabelClick(context: any, event: MouseEvent): void {
  let target = event.target as HTMLElement;

  while (target.tagName !== 'TD') {
    target = target.parentNode as HTMLElement;
  }

  const rowPos = Number(target.getAttribute('pos')) + context.pageTop;

  if (event.shiftKey) {
    document.getSelection()?.removeAllRanges();

    if (context.prevSelect !== -1 && context.prevSelect !== rowPos) {
      event.preventDefault();
      if (rowPos > context.prevSelect) {
        for (let i = context.prevSelect; i <= rowPos; i++) {
          selectRecord(context, i);
        }
      } else {
        for (let i = rowPos; i <= context.prevSelect; i++) {
          selectRecord(context, i);
        }
      }
    }
  } else {
    const selected = context.selected[rowPos];

    if (!context.freeSelect && !(event.ctrlKey || event.metaKey)) {
      clearAllSelected(context);
    }

    if (!selected) {
      selectRecord(context, rowPos);
    } else {
      unSelectRecord(context, rowPos);
    }
  }

  context.prevSelect = rowPos;
}

//динамические изменение курсора мыши
export function inputBoxMouseMove(context: any, event: MouseEvent): void {
  let cursor = 'text';

  if (!context.currentField.readonly &&
    (context.currentField.options || context.currentField.type === 'date') &&
    event.target instanceof HTMLElement &&
    event.target.offsetWidth - event.offsetX < 15) {
    cursor = 'pointer';
  }

  (event.target as HTMLElement).style.cursor = cursor;
}

// отображение поле ввода если не для чтения
export function inputSquareClick(context: any): void {
  if (!context.currentField.readonly && !context.inputBoxShow && context.currentField.type !== 'select') {
    context.inputBox.value = context.currentCell.textContent || '';

    context.inputBoxShow = 1;
    context.inputBox.focus();

    context.inputBoxChanged = false;

    context.focused = true;
  }
}

// динамически меняет курсор при наведении на ячейки таблицы
export function cellMouseMove(context: any, event: MouseEvent): void {
  let cursor = 'cell';

  if (context.inputBoxShow) {
    cursor = 'default';
  }

  if (event.target instanceof HTMLElement && event.target.offsetWidth - event.offsetX < 25) {
    const isReadonly = event.target.classList.contains('readonly');
    const isSelectable = event.target.classList.contains('select') || event.target.classList.contains('datepick');
    
    if (!isReadonly && isSelectable) {
      cursor = 'pointer';
    }

    if (event.target.offsetWidth < event.target.scrollWidth) {
      cursor = 'pointer';
    }
  }

  const row = event.target.parentNode as HTMLElement;
  const colPos = Array.from(row.children).indexOf(event.target) - 1;
  const currentField = context.fields[colPos];

  if (currentField?.type === 'action' || currentField?.grouping) {
    cursor = 'pointer';
  }

  event.target.style.cursor = cursor;
}

// Функция отображает тултип (всплывающую подсказку) с сообщением об ошибке
export function cellMouseOver(context: any, event: MouseEvent): void {
  const cell = event.target as HTMLElement;

  if (!cell.classList.contains('error')) return;

  if (context.tipTimeout) {
    clearTimeout(context.tipTimeout);
  }

  context.tip = context.errmsg[cell.getAttribute('id') || ''];

  if (context.tip === '') return;

  const rect = cell.getBoundingClientRect();
  context.$refs.tooltip.style.top = `${rect.top - 14}px`;
  context.$refs.tooltip.style.left = `${rect.right + 8}px`;

  cell.addEventListener('mouseout', context.cellMouseOut);
}

export function numcolMouseOver(context: any, event: MouseEvent): void {
  const cell = event.target as HTMLElement;

  if (!cell.classList.contains('error')) return;

  if (context.tipTimeout) {
    clearTimeout(context.tipTimeout);
  }

  context.tip = context.rowerr[cell.getAttribute('id') || ''];

  if (context.tip === '') return;

  const rect = cell.getBoundingClientRect();
  context.$refs.tooltip.style.top = `${rect.top - 14}px`;
  context.$refs.tooltip.style.left = `${rect.right + 8}px`;

  cell.addEventListener('mouseout', context.cellMouseOut);
}


export function cellMouseOut(context: any, event: MouseEvent): void {
  context.tipTimeout = setTimeout(() => {
    context.tip = '';
  }, 1000);

  event.target.removeEventListener(event.type, context.cellMouseOut);
}


export function mouseOver(context: any): void {
  context.mousein = true;
  context.systable.classList.add('mouseover');
}

export function mouseOut(context: any): void {
  context.mousein = false;
  context.systable.classList.remove('mouseover');
}

export function calStickyLeft(context: any): void {
  let left = 0, n = 0;
  context.leftMost = -1;

  Array.from(context.labelTr.children).forEach((th: HTMLElement) => {
    left += th.offsetWidth;
    const field = context.fields[n++];

    if (field) {
      if (field.sticky) {
        field.left = `${left}px`;
        context.leftMost = -1;
      } else if (context.leftMost === -1) {
        context.leftMost = left;
      }
    }
  });

  const instance = getCurrentInstance();
  instance?.proxy?.$forceUpdate();
}

export function colSepMouseMove(context: any, event: MouseEvent): void {
  if (!context.sep || !context.sep.curCol) return;

  const diffX = event.pageX - context.sep.pageX;

  const newWidth = (context.sep.curColWidth + diffX) + 'px';

  context.sep.curCol.style.width = newWidth;

  context.sep.curField.width = newWidth;

  lazy(context, calStickyLeft.bind(context), 200);
}



// export function colSepMouseUp(this: any, event: MouseEvent): void {
//   event.preventDefault();
//   event.stopPropagation();

//   // Удаляем объект `sep`
//   delete this.sep;

//   // Удаляем ранее добавленные обработчики событий
//   window.removeEventListener('mousemove', this.boundColSepMouseMove);
//   window.removeEventListener('mouseup', this.boundColSepMouseUp);

//   // Получаем текущие настройки
//   const setting = this.getSetting();

//   if (this.remember) {
//     const key = `${window.location.pathname}${window.location.hash}.${this.token}`;
//     localStorage.setItem(key, JSON.stringify(setting));
//   }

//   this.$emit('setting', setting);
// }

export function getSetting(context: any): { colHash: string; fields: Array<{ name: string; invisible: boolean; width: string; label: string }> } {
  const colWidth = Array.from(context.colgroupTr.children).map((col: HTMLElement) => col.style.width);

  const fields = context.fields.map((field: any, i: number) => {
    return {
      name: field.name,
      invisible: field.invisible,
      width: colWidth[i + 1],
      label: field.label
    };
  });

  return {
    colHash: context.colHash,
    fields: fields
  };
}

export async function updateCell(
  context: any, 
  row: string | number | object, 
  field: any, 
  newVal: any, 
  isUndo: boolean
): Promise<void> {
  switch (typeof row) {
    case 'string': 
      row = context.modelValue.find((r: any) => r.$id === row);
      break;
    case 'number':
      row = context.table[row];
      break;
    case 'object':
      break;
    default:
      throw new Error('Invalid row argument type');
  }

  switch (typeof field) {
    case 'string':
      field = context.fields.find((f: any) => f.name === field);
      break;
    case 'number':
      field = context.fields[field];
      break;
    case 'object':
      break;
    default:
      throw new Error('Invalid field argument type');
  }

  if (!field) throw new Error('Invalid field argument');
  if (!row) return;

  const oldVal = row[field.name];
  const oldKeys = getKeys(context, row);

  if (field.change) {
    const result = await field.change(newVal, oldVal, row, field);
    if (result === false) return;
  }

  row[field.name] = newVal;

  setTimeout(() => {
    const transaction = {
      $id: row.$id,
      keys: getKeys(context, row),
      oldKeys: oldKeys,
      name: field.name,
      field: field,
      oldVal: typeof oldVal !== 'undefined' ? oldVal : '',
      newVal: newVal,
      err: ''
    };

    if (field.validate !== null) {
      transaction.err = field.validate(newVal, oldVal, row, field);
    }

    if (field.mandatory && newVal === '') {
      transaction.err += (transaction.err ? '\n' : '') + field.mandatory;
    }

    setFieldError(context, transaction.err, row, field);

    if (context.validate !== null) {
      transaction.rowerr = context.validate(newVal, oldVal, row, field);
      setRowError(context, transaction.rowerr, row);
    }

    if (field.summary) {
      calSummary(context, field.name);
    }

    lazy(context, transaction, (buf: any) => {
      context.$emit('update', buf);
      if (!isUndo) context.redo.push(buf);
    }, 50);
  });
}

