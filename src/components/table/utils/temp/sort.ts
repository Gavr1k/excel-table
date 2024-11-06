export function headerClick(this: any, e: MouseEvent, colPos: number): void {
  const target = e.target as HTMLElement;

  // Разрешение редактирования заголовка, если это не запрещено и клик по `SPAN`
  if (!this.noHeaderEdit && target.tagName === 'SPAN') {
    target.contentEditable = "true";
    target.addEventListener('focusout', this.completeHeaderChange);
    return;
  }

  // Обработка клика левой кнопкой мыши для сортировки
  if (e.button === 0) {
    e.preventDefault();

    // Логика переключения направления сортировки
    if (this.sortPos === colPos && this.sortDir > 0) {
      this.sort(-1, colPos);
    } else if (this.sortDir === 0) {
      this.sort(1, colPos);
    } else {
      this.sort(0, colPos);
    }
  }
}

export function completeHeaderChange(this: any, e: FocusEvent): void {
  const target = e.target as HTMLElement;

  // Получаем элемент заголовка столбца (`th`)
  const th = target.parentElement?.parentElement as HTMLElement;
  if (!th) return;

  // Определяем индекс столбца
  const index = Array.from(th.parentElement!.children).indexOf(th);

  // Обновляем метку поля в массиве `fields`
  if (index > 0) {
    this.fields[index - 1].label = target.textContent || '';
  }
}

export function sort(this: any, n: number, pos?: number): void {
  const colPos = pos ?? this.columnFilterRef.colPos;
  const field = this.fields[colPos];

  // Проверка: если сортировка отключена для этого столбца
  if (field.noSorting) return;

  this.processing = true;
  const name = field.name;

  setTimeout(() => {
    // Определение функции сортировки
    let sorting = field.sorting;
    if (!sorting) {
      sorting = field.type === 'number'
        ? (a: any, b: any) => (Number(a) > Number(b) ? 1 : Number(a) < Number(b) ? -1 : 0)
        : (a: any, b: any) => String(a).localeCompare(String(b));
    }

    // Сортировка по умолчанию или по выбранному столбцу
    if (n === 0) {
      this.modelValue.sort((a: any, b: any) => (a.$id > b.$id ? 1 : -1));
      this.sortPos = 0;
    } else {
      this.modelValue.sort((a: any, b: any) => {
        if (field.sort) {
          return field.sort(a, b) * -n;
        } else {
          return sorting(a[name], b[name]) * -n;
        }
      });
      this.sortPos = colPos;
    }

    // Обновление направления сортировки и завершение обработки
    this.sortDir = n;
    this.refresh();
    this.processing = false;
  }, 0);
}

