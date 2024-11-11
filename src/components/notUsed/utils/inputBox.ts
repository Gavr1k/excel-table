import { showDatePickerDiv } from './datePicker';


import {calAutocompleteList} from './autocomplete';
import {updateSelectedRows} from './update';
import {updateCell} from './excelEditor';

export function moveInputSquare(context: any, rowPos: number, colPos: number): boolean {
  context.textTip = '';

  if (colPos < 0) return false;

  const top = context.pageTop;
  let row = context.recordBody.children[rowPos];

  if (!row) {
    if (rowPos > context.currentRowPos) {
      if (context.pageTop + context.pageSize < context.table.length) {
        context.pageTop += 1;
      } else {
        return false;
      }
      row = context.recordBody.children[--rowPos];
    } else {
      if (context.pageTop - 1 >= 0) {
        context.pageTop -= 1;
      } else {
        return false;
      }
      row = context.recordBody.children[++rowPos];
    }
  }

  context.labelTr.children[context.currentColPos + 1]?.classList.remove('focus');
  if (context.currentRowPos >= 0 && context.currentRowPos < context.pagingTable.length) {
    context.recordBody.children[context.currentRowPos].children[0]?.classList.remove('focus');
  }
  context.lastCell?.classList.remove('focus');

  if (context.inputBoxShow) context.inputBoxShow = 0;
  if (context.inputBoxChanged) {
    const value = context.inputBox._value || context.inputBox.value;
    context.inputBox._value = '';
    inputCellWrite(context, value, context.currentColPos, top + context.currentRowPos);
    context.inputBoxChanged = false;
  }

  const cell = row.children[colPos + 1];
  if (!cell) return false;

  context.currentField = context.fields[colPos];
  const cellRect = cell.getBoundingClientRect();
  const tableRect = context.systable.getBoundingClientRect();
  context.squareSavedLeft = context.tableContent.scrollLeft;
  context.inputSquare.style.marginLeft = '0';
  context.inputSquare.style.left = `${cellRect.left - tableRect.left - 1}px`;
  context.inputSquare.style.top = `${cellRect.top - tableRect.top - 1}px`;
  context.inputSquare.style.width = `${cellRect.width + 1}px`;
  context.inputSquare.style.height = `${cellRect.height + 1}px`;
  context.inputSquare.style.zIndex = context.currentField.sticky ? '3' : '1';

  if (!context.currentField.sticky) {
    const boundRect = context.$el.getBoundingClientRect();
    if (cellRect.right >= boundRect.right - 12) {
      context.tableContent.scrollBy(cellRect.right - boundRect.right + 13, 0);
    }
    if (cellRect.left <= boundRect.left + context.leftMost) {
      context.tableContent.scrollBy(cellRect.left - boundRect.left - context.leftMost - 1, 0);
    }
  }

  context.currentRowPos = rowPos;
  context.currentColPos = colPos;
  context.currentCell = cell;
  context.currentRecord = context.table[top + rowPos];

  context.$emit('cell-focus', { rowPos, colPos, cell, record: context.currentRecord });
  context.currentCell.classList.add('focus');
  context.lastCell = context.currentCell;

  if (context.showDatePicker) context.showDatePicker = false;
  if (context.autocompleteInputs.length) {
    context.autocompleteInputs = [];
    context.autocompleteSelect = -1;
  }
  if (context.recalAutoCompleteList) clearTimeout(context.recalAutoCompleteList);

  if (context.currentRowPos >= 0 && context.currentRowPos < context.pagingTable.length) {
    context.inputBox.value = context.currentCell.textContent;
    context.inputBox.focus();
    context.focused = true;
    row.children[0]?.classList.add('focus');
    context.labelTr.children[colPos + 1]?.classList.add('focus');
  }

  return true;
}

export function inputSquareClick(context: any): void {
  if (!context.currentField.readonly && !context.inputBoxShow && context.currentField.type !== 'select') {
    context.inputBox.value = context.currentCell.textContent || '';

    context.inputBoxShow = 1;
    context.inputBox.focus();

    context.inputBoxChanged = false;

    context.focused = true;
  }
}

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

export function inputBoxMouseDown(context: any, e: MouseEvent): void {
  const offsetDiff = e.target instanceof HTMLElement ? e.target.offsetWidth - e.offsetX : 0;

  if (offsetDiff > 15 || context.currentField.readonly) return;

  if (context.currentField.options) {
    e.preventDefault();
    calAutocompleteList(context, true);
  }

  if (context.currentField.type === 'date') {
    e.preventDefault();
    showDatePickerDiv(context);
  }
}

export function inputCellWrite(context: any, setText: string, colPos?: number, recPos?: number): void {
  let field = context.currentField;

  if (colPos !== undefined) {
    field = context.fields[colPos];
  }

  if (recPos === undefined) {
    recPos = context.pageTop + context.currentRowPos;
  }

  if (!context.noMassUpdate && context.selected[recPos] !== undefined) {
    updateSelectedRows(context, field, setText);
  } else {
    const newValue = field.toValue(setText, context.table[recPos], field);
    updateCell(context, recPos, field, newValue);
  }
}

export function inputBoxBlur(context: any): void {
  const dpContainer = context.$refs.dpContainer as HTMLElement | undefined;
  if (!dpContainer) return;
  if (dpContainer.querySelector(':hover')) return;

  inputBoxComplete(context);
  context.focused = false;

  if (context.currentRowPos !== -1 && context.currentRowPos < context.recordBody.children.length) {
    context.recordBody.children[context.currentRowPos].children[0]?.classList.remove('focus');
    context.labelTr.children[context.currentColPos + 1]?.classList.remove('focus');
  }

  context.lastCell?.classList.remove('focus');
}

export function inputBoxComplete(context: any): void {
  if (context.inputBoxChanged) {
    const value = context.inputBox._value || context.inputBox.value;
    context.inputBox._value = '';

    inputCellWrite(context, value);
    context.inputBoxChanged = false;
  }

  context.inputBoxShow = 0;
  context.showDatePicker = false;

  context.focused = false;
  context.focused = true;
}


