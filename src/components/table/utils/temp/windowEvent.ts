export function tableScroll(this: any): void {
  // Скрытие автодополнения и календаря при скролле
  this.showDatePicker = false;
  this.autocompleteInputs = [];

  // Обновление позиции выделенной ячейки при активном фокусе
  if (this.focused && this.currentField) {
    this.inputSquare.style.marginLeft = `${this.currentField.sticky ? this.tableContent.scrollLeft - this.squareSavedLeft : 0}px`;
  }

  // Вертикальный скролл
  if (this.tableContent.scrollTop !== this.vScroller.lastTop) {
    calVScroll(this);
    
    if (this.$refs.vScrollButton) {
      this.$refs.vScrollButton.classList.add('focus');
      lazy(this, () => this.$refs.vScrollButton.classList.remove('focus'), 1000);
    }

    this.vScroller.lastTop = this.tableContent.scrollTop;
  }

  // Горизонтальный скролл
  if (this.tableContent.scrollLeft !== this.hScroller.lastLeft) {
    if (this.$refs.hScroll && this.hScroller.tableUnseenWidth) {
      this.$refs.hScroll.classList.add('focus');
      lazy(this, () => this.$refs.hScroll.classList.remove('focus'), 1000);
      
      // Обновление позиции горизонтального скролла
      const ratio = this.tableContent.scrollLeft / this.hScroller.tableUnseenWidth;
      this.$refs.hScroll.style.left = `${this.hScroller.scrollerUnseenWidth * ratio}px`;
    }

    this.hScroller.lastLeft = this.tableContent.scrollLeft;
  }
}

export function winScroll(this: any): void {
  // Скрытие календаря и автодополнения при прокрутке окна
  this.showDatePicker = false;
  this.autocompleteInputs = [];
}

export function mousewheel(this: any, e: WheelEvent): boolean {
  // Прекращаем выполнение, если прокрутка отключена или мышь вне таблицы, или отсутствует изменение по оси Y
  if (this.noMouseScroll || !this.mousein || e.deltaY === 0) return false;

  let adjust = 0;

  // Определяем направление и корректируем `pageTop` при достижении конца или начала страницы
  if (e.deltaY > this.wheelSensitivity && this.pageTop + this.pageSize < this.table.length) {
    adjust = 1;
  } else if (e.deltaY < -this.wheelSensitivity && this.pageTop > 0) {
    adjust = -1;
  }

  if (adjust) {
    this.pageTop += adjust;
    setTimeout(() => calVScroll(this));

    if (this.$refs.vScrollButton) {
      this.$refs.vScrollButton.classList.add('focus');
      lazy(this, () => this.$refs.vScrollButton.classList.remove('focus'), 1000);
    }
  }

  e.preventDefault();
  e.stopPropagation();
  return false;
}

export function winResize(this: any): void {
  // Обновление размера страницы с задержкой
  lazy(this, () => this.refreshPageSize(), 500);
}

export function winPaste(this: any, e: ClipboardEvent): void {
  const target = e.target as HTMLElement;

  // Проверка, что событие произошло в `TEXTAREA`
  if (target.tagName !== 'TEXTAREA') return;

  // Проверка, что мышь внутри элемента или элемент в фокусе
  if (!this.mousein && !this.focused) return;

  // Проверка, что текущее поле существует и не является `readonly`
  if (!this.currentField || this.currentField.readonly) return;

  // Если поле редактирования отображается, отмечаем изменение значения
  if (this.inputBoxShow) {
    this.inputBoxChanged = true;
    return;
  }

  // Получение текста из буфера обмена и запись в ячейку
  const clipboardData = e.clipboardData?.getData('text/plain');
  if (clipboardData) {
    inputCellWrite(this, clipboardData);
  }
  
  e.preventDefault();
}

export function winKeyup(this: any, e: KeyboardEvent): void {
  // Убираем класс 'alt', если клавиша Alt не нажата
  if (!e.altKey) {
    this.systable.classList.remove('alt');
  }

  // Обработка маскирования поля типа `password`
  if (this.inputBoxShow && this.currentField?.type === 'password') {
    setTimeout(() => {
      const currentValue = this.inputBox.value.split('').map((char, index) =>
        char === this.currentField.masking ? this.inputBox._value[index] : char
      );
      this.inputBox._value = currentValue.join('');
      this.inputBox.value = this.currentField.masking.repeat(currentValue.length);
    });
  }
}

function winKeydown(this: any, e: KeyboardEvent): void {
  if (e.altKey) this.systable.classList.add('alt');
  if (!this.mousein && !this.focused) return;

  // Обработка сочетаний клавиш с `Ctrl` или `Cmd`
  if (e.ctrlKey || e.metaKey) {
    switch (e.key.toLowerCase()) {
      case 'z': // Ctrl+Z
        undoTransaction(this);
        e.preventDefault();
        break;
      case 'a': // Ctrl+A
        toggleSelectAllRecords(this);
        e.preventDefault();
        break;
      case 'c': // Ctrl+C
        this.inputBox.value = this.currentCell.textContent;
        this.inputBox.focus();
        this.inputBox.select();
        document.execCommand('copy');
        e.preventDefault();
        break;
      case 'f': // Ctrl+F
        if (!this.noFinding) {
          this.showPanelFind = true;
          e.preventDefault();
        }
        break;
      case 'g': // Ctrl+G
        if (!this.noFindingNext && this.inputFind !== '') {
          doFind();
          e.preventDefault();
        }
        break;
      case 'l': // Ctrl+L
        e.preventDefault();
        calAutocompleteList(this, true);
        break;
    }
  } else {
    if (this.currentRowPos < 0) return;

    // Обработка клавиш навигации и функциональных клавиш
    switch (e.key) {
      case 'ArrowLeft':
        if (this.focused && !this.inputBoxShow) this.moveWest(e);
        else if (this.inputBox.selectionStart === 0) this.moveWest(e);
        e.preventDefault();
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (!this.focused) return;
        this.autocompleteInputs.length === 0 ? this.moveNorth() : this.adjustAutocompleteSelection(-1);
        break;
      case 'ArrowRight':
        if (this.focused && !this.inputBoxShow) this.moveEast(e);
        else if (this.inputBox.selectionEnd === this.inputBox.value.length) this.moveEast(e);
        e.preventDefault();
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!this.focused) return;
        this.autocompleteInputs.length === 0 ? this.moveSouth() : this.adjustAutocompleteSelection(1);
        break;
      case 'Tab':
        e.preventDefault();
        this.navigateWithTab(e.shiftKey);
        break;
      case 'Enter':
        e.preventDefault();
        this.handleEnterKey();
        break;
      case 'Escape':
        this.resetAutocompleteAndInput();
        break;
      case 'PageUp':
        this.prevPage();
        e.preventDefault();
        break;
      case 'PageDown':
        this.nextPage();
        e.preventDefault();
        break;
      case 'Delete':
      case 'Backspace':
        this.handleDeleteOrBackspace(e);
        break;
      default:
        this.handleCharacterInput(e);
        break;
    }
  }
}

function adjustAutocompleteSelection(this: any, direction: number): void {
  const newIndex = this.autocompleteSelect + direction;
  if (newIndex >= 0 && newIndex < this.autocompleteInputs.length) {
    this.autocompleteSelect = newIndex;
    this.updateAutocompleteScroll();
  }
}

function updateAutocompleteScroll(this: any): void {
  const itemHeight = 23;
  const maxVisibleItems = 10;
  const scrollTop = this.autocompleteSelect * itemHeight;
  this.$refs.autocomplete.scrollTop = Math.max(scrollTop - itemHeight * (maxVisibleItems - 1), 0);
}

function navigateWithTab(this: any, isShiftPressed: boolean): void {
  if (isShiftPressed) {
    if (!this.moveWest() && this.moveNorth()) this.moveToEast();
    else inputBoxBlur(this);
  } else {
    if (!this.moveEast() && this.moveSouth()) this.moveToWest();
    else inputBoxBlur(this);
  }
}

function handleEnterKey(this: any): void {
  if (this.autocompleteInputs.length > 0 && this.autocompleteSelect !== -1) {
    inputAutocompleteText(this, this.autocompleteInputs[this.autocompleteSelect]);
  } else {
    this.enterToSouth ? this.moveSouth() : this.moveEast();
  }
  inputBoxComplete(this);
}

function resetAutocompleteAndInput(this: any): void {
  this.showDatePicker = false;
  this.autocompleteInputs = [];
  this.autocompleteSelect = -1;
  if (this.inputBoxShow) {
    this.inputBox.value = this.currentCell.textContent;
    this.inputBoxShow = 0;
    this.inputBoxChanged = false;
  }
}

function handleDeleteOrBackspace(this: any, e: KeyboardEvent): void {
  if (this.currentField.readonly || this.autocompleteInputs.length) return;
  if (this.inputBoxShow) {
    this.inputBoxChanged = true;
    setTimeout(() => calAutocompleteList(this, true));
    return;
  }
  this.inputBox.value = '';
  inputBoxComplete(this);
}

function handleCharacterInput(this: any, e: KeyboardEvent): void {
  if (this.currentField.readonly || e.altKey || e.key.length > 1) return;
  if (!this.inputBoxShow && this.currentField.type === 'date') {
    this.showDatePickerDiv();
  } else {
    this.inputBox.value = '';
    this.inputBoxShow = 1;
    this.inputBox.focus();
    setTimeout(() => calAutocompleteList(this, false));
  }
  this.inputBoxChanged = true;
}

