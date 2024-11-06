import { lazy } from './excelEditor';
import { moveInputSquare, moveInputSquare } from './inputBox';

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

  calVScroll(this);

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

    newRecord(this, {}, false, true);

    setTimeout(() => moveSouth(context), 0);
    return true;
  }

  const done = moveInputSquare(context, context.currentRowPos + 1, context.currentColPos);

  calVScroll(this);

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
      this.refresh();
      return;
    }

    // Перемещение на выбранную ячейку и установка фокуса
    setTimeout(() => this.inputBox.focus(), 0);
    this.focused = true;
    moveInputSquare(this, rowPos, colPos);

    // Отображение автозаполнения, если включено
    if (this.currentField.listByClick) {
      calAutocompleteList(this, true);
      return;
    }

    // Отображение подсказки, если текст превышает ширину ячейки
    if (target.offsetWidth - e.offsetX > 25 && target.offsetWidth < target.scrollWidth) {
      this.textTip = this.currentCell.textContent;
      this.$refs.texttip.style.opacity = '0';
      const rect = target.getBoundingClientRect();
      setTimeout(() => {
        const tooltipRect = this.$refs.texttip.getBoundingClientRect();
        this.$refs.texttip.style.top =
          rect.bottom + tooltipRect.height > window.innerHeight
            ? `${rect.top - tooltipRect.height}px`
            : `${rect.bottom}px`;
        this.$refs.texttip.style.left =
          rect.left + tooltipRect.width > window.innerWidth
            ? `${rect.right - tooltipRect.width}px`
            : `${rect.left}px`;
        this.$refs.texttip.style.opacity = '1';
      });
    }

    // Если поле только для чтения, завершить обработку
    if (this.currentField.readonly) return;

    // Установка значения `inputBox` и отображение автозаполнения или календаря
    this.inputBox.value = this.currentCell.textContent;
    if (target.classList.contains('select')) {
      calAutocompleteList(this, true);
    }
    if (target.classList.contains('datepick')) {
      this.showDatePickerDiv();
    }
  }
}



