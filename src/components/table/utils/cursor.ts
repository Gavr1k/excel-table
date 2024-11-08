import { lazy } from './excelEditor';
import { moveInputSquare} from './inputBox';
import { calVScroll} from './verticalScroll';
import {newRecord} from './update';
import {inputBoxBlur} from './inputBox';
import {calAutocompleteList} from './autocomplete';
import { refresh } from './other';
import {showDatePickerDiv} from './datePicker';

export function moveTo(context: any, rowPos: number, colPos: number = 0): boolean {
  const done = moveInputSquare(context, rowPos - context.pageTop, colPos);
  context.focused = true;

  setTimeout(() => context.inputBox.focus(), 0);

  return done;
}

export function moveToSouthWest(context: any): boolean {
  let goRowPos = context.table.length - 1;
  let goColPos = 0;

  while (context.fields[goColPos].invisible && goColPos < context.fields.length - 1) {
    goColPos++;
  }

  return moveTo(context, goRowPos, goColPos);
}

export function moveToWest(context: any): boolean {
  const goRowPos = context.currentRowPos;
  let goColPos = 0;

  while (context.fields[goColPos].invisible && goColPos < context.fields.length - 1) {
    goColPos++;
  }

  return moveTo(context, goRowPos, goColPos);
}

export function moveToEast(context: any): boolean {
  const goRowPos = context.currentRowPos;
  let goColPos = context.fields.length - 1;

  while (context.fields[goColPos].invisible && goColPos > 0) {
    goColPos--;
  }

  return moveTo(context, goRowPos, goColPos);
}

export function moveWest(context: any): boolean {
  if (context.focused && context.currentColPos > 0) {
    let goColPos = context.currentColPos - 1;

    while (context.fields[goColPos].invisible && goColPos > 0) {
      goColPos--;
    }

    if (goColPos === -1 || context.fields[goColPos].invisible) return false;

    return moveInputSquare(context, context.currentRowPos, goColPos);
  }

  return false;
}

export function moveEast(context: any): boolean {
  if (context.focused && context.currentColPos < context.fields.length - 1) {
    let goColPos = context.currentColPos + 1;

    while (context.fields[goColPos].invisible && goColPos < context.fields.length - 1) {
      goColPos++;
    }

    if (goColPos === context.fields.length || context.fields[goColPos].invisible) return false;

    return moveInputSquare(context, context.currentRowPos, goColPos);
  }

  return false;
}

export function moveNorth(context: any): boolean {
  if (!context.focused) return false;

  const done = moveInputSquare(context, context.currentRowPos - 1, context.currentColPos);

  calVScroll(context);

  if (context.$refs.vScrollButton) {
    setTimeout(() => {
      context.$refs.vScrollButton.classList.add('focus');
      lazy(context, () => {
        context.$refs.vScrollButton?.classList.remove('focus');
      }, 1000);
    });
  }

  return done;
}

export function moveSouth(context: any): boolean {
  if (!context.focused) return false;

  if (
    context.currentRowPos + 1 >= (context.pageBottom - context.pageTop) &&
    context.pageBottom >= context.table.length
  ) {
    if (context.readonly || !context.newIfBottom) return false;

    newRecord(context, {}, false, true);

    setTimeout(() => moveSouth(context), 0);
    return true;
  }

  const done = moveInputSquare(context, context.currentRowPos + 1, context.currentColPos);

  calVScroll(context);

  if (context.$refs.vScrollButton) {
    setTimeout(() => {
      context.$refs.vScrollButton.classList.add('focus');
      lazy(context, () => {
        context.$refs.vScrollButton?.classList.remove('focus');
      }, 1000);
    });
  }

  return done;
}

export function mouseDown(context: any, e: MouseEvent): void {
  const target = e.target as HTMLElement;

  if (
    target.parentNode?.parentNode?.tagName === 'TBODY' &&
    !target.classList.contains('first-col')
  ) {
    e.preventDefault();
    
    const row = target.parentNode as HTMLElement;
    const colPos = Array.from(row.children).indexOf(target) - 1;
    const rowPos = Array.from(row.parentNode!.children).indexOf(row);

    if (colPos !== context.currentColPos || rowPos !== context.currentRowPos) {
      inputBoxBlur(context);
    }

    context.currentField = context.fields[colPos];
    context.currentCell = row.children[colPos + 1];
    context.currentRecord = context.table[context.pageTop + rowPos];

    context.$emit(
      'cell-click',
      { rowPos, colPos },
      context.currentCell.textContent,
      context.currentRecord,
      context.currentField,
      context
    );


    if (typeof context.currentField.cellClick === 'function') {
      context.currentField.cellClick(
        context.currentCell.textContent,
        context.currentRecord,
        rowPos,
        colPos,
        context.currentField,
        context
      );
    }

    if (
      context.currentField.link &&
      context.currentCell.textContent
    ) {
      setTimeout(() =>
        context.currentField.link(
          context.currentCell.textContent,
          context.currentRecord,
          rowPos,
          colPos,
          context.currentField,
          context
        )
      );
      return;
    }

    if (context.currentField.grouping) {
      const key = context.currentField.name + context.currentCell.textContent;
      context.ungroup[key] = !context.ungroup[key];
      refresh(context);
      return;
    }

    setTimeout(() => context.inputBox.focus(), 0);
    context.focused = true;
    moveInputSquare(context, rowPos, colPos);

    if (context.currentField.listByClick) {
      calAutocompleteList(context, true);
      return;
    }

    if (target.offsetWidth - e.offsetX > 25 && target.offsetWidth < target.scrollWidth) {
      context.textTip = context.currentCell.textContent;
      context.$refs.texttip.style.opacity = '0';
      const rect = target.getBoundingClientRect();
      setTimeout(() => {
        const tooltipRect = context.$refs.texttip.getBoundingClientRect();
        context.$refs.texttip.style.top =
          rect.bottom + tooltipRect.height > window.innerHeight
            ? `${rect.top - tooltipRect.height}px`
            : `${rect.bottom}px`;
        context.$refs.texttip.style.left =
          rect.left + tooltipRect.width > window.innerWidth
            ? `${rect.right - tooltipRect.width}px`
            : `${rect.left}px`;
        context.$refs.texttip.style.opacity = '1';
      });
    }

    if (context.currentField.readonly) return;

    context.inputBox.value = context.currentCell.textContent;
    if (target.classList.contains('select')) {
      calAutocompleteList(context, true);
    }
    if (target.classList.contains('datepick')) {
      showDatePickerDiv(context);
    }
  }
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

export function mouseOver(context: any): void {
  context.mousein = true;
  context.systable.classList.add('mouseover');
}

export function mouseOut(context: any): void {
  context.mousein = false;
  context.systable.classList.remove('mouseover');
}



