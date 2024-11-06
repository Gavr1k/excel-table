export function showDatePickerDiv(this: any): void {
  if (!this.$refs.dpContainer) return;

  const cellRect = this.currentCell.getBoundingClientRect();
  const dpContainer = this.$refs.dpContainer;

  // Устанавливаем начальные координаты для `dpContainer`
  dpContainer.style.left = `${cellRect.left}px`;
  dpContainer.style.top = `${cellRect.bottom}px`;

  // Преобразуем содержимое текущей ячейки в дату
  this.inputDateTime = new Date(this.currentCell.textContent);
  this.showDatePicker = true;

  // С задержкой проверяем положение `dpContainer` и корректируем при необходимости
  lazy(this, () => {
    if (!dpContainer) return;
    const containerRect = dpContainer.getBoundingClientRect();

    // Корректируем положение по вертикали, если `dpContainer` выходит за пределы экрана снизу
    if (containerRect.bottom > window.innerHeight) {
      dpContainer.style.top = `${cellRect.top - containerRect.height}px`;
    }

    // Корректируем положение по горизонтали, если `dpContainer` выходит за пределы экрана справа
    if (containerRect.right > window.innerWidth) {
      dpContainer.style.left = `${window.innerWidth - containerRect.width}px`;
    }
  });
}

export function datepickerClick(this: any): void {
  const offset = new Date().getTimezoneOffset() * 60 * 1000;
  const selectedDate = new Date(new Date(this.inputDateTime).getTime() - offset);

  switch (this.currentField.type) {
    case 'date':
      this.inputBox.value = selectedDate.toISOString().slice(0, 10);
      break;
    case 'datetime':
      this.inputBox.value = selectedDate.toISOString().replace('T', ' ').slice(0, 16) + ':00';
      break;
    case 'datetimesec':
      this.inputBox.value = selectedDate.toISOString().replace('T', ' ').slice(0, 19);
      break;
    case 'datetick':
    case 'datetimetick':
    case 'datetimesectick':
      this.inputBox.value = String(selectedDate.getTime());
      break;
  }

  this.inputBoxShow = 0;
  inputCellWrite(this, this.inputBox.value);
  this.showDatePicker = false;
  this.focused = true;
}

