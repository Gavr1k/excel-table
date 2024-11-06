export function refreshPageSize(this: any): void {
  // Обновление горизонтального скроллера
  if (this.$refs.hScroll) {
    const fullWidth = this.systable.getBoundingClientRect().width;
    const viewWidth = this.tableContent.getBoundingClientRect().width;
    this.hScroller.tableUnseenWidth = fullWidth - viewWidth;
    this.$refs.hScroll.style.width = `${(100 * viewWidth) / fullWidth}%`;
    
    const scrollerWidth = this.$refs.hScroll.getBoundingClientRect().width;
    this.hScroller.scrollerUnseenWidth =
      this.footer.getBoundingClientRect().width - this.numColWidth - scrollerWidth;
  }

  // Вычисление нижнего отступа
  let outerElement = this.editor;
  let bottomOffset = 0;
  
  if (this.height !== 'auto') {
    while (outerElement && outerElement.style.height !== 'auto' && !outerElement.style.height) {
      const style = getComputedStyle(outerElement);
      bottomOffset += parseInt(style.marginBottom) + parseInt(style.paddingBottom) + parseInt(style.borderBottomWidth);
      outerElement = outerElement.parentElement;
    }
  }

  if (outerElement) {
    const style = getComputedStyle(outerElement);
    bottomOffset += parseInt(style.paddingBottom) + parseInt(style.borderBottomWidth);
  }

  const outerHeight = outerElement?.clientHeight || window.innerHeight;
  const outerTop = outerElement?.getBoundingClientRect().top || 0;

  // Вычисление размера страницы
  if (!this.noPaging) {
    const offset = bottomOffset + (this.summaryRow ? 25 : 0) + (this.noFooter ? 0 : 25);
    let controlHeight = outerHeight - (this.recordBody.getBoundingClientRect().top - outerTop) - offset;

    if (this.height) {
      if (this.height === 'auto') {
        const parent = this.editor.parentElement;
        if (parent && parent.scrollHeight > parent.clientHeight) {
          controlHeight += parent.clientHeight - parent.scrollHeight;
        }
      } else {
        const height = parseInt(this.height) + this.systable.getBoundingClientRect().top - this.recordBody.getBoundingClientRect().top;
        controlHeight = Math.min(controlHeight, height);
      }
    }

    this.pageSize = this.page || Math.floor(controlHeight / 24);
  } else if (this.height === 'auto') {
    let height = Math.floor(window.innerHeight - this.tableContent.getBoundingClientRect().top - 25);
    let offset = 4;

    if (this.filterRow) offset += 29;
    if (this.summaryRow) offset += 25;
    if (!this.footerRow) offset += 25;

    height = Math.min(24 * (this.table.length - this.pageTop) + offset, height);
    this.systable.parentNode.style.height = `${height}px`;
  }

  // Заполнение ширины столбцов и обновление вертикального скроллера
  this.columnFillWidth();
  setTimeout(() => calVScroll(this));
}

export function firstPage(this: any, e?: Event): void {
  if (e) e.stopPropagation();

  // Устанавливаем начальную страницу и обновляем вертикальный скролл
  this.pageTop = 0;
  calVScroll(this);

  // Временное добавление фокуса к кнопке вертикального скролла
  if (this.$refs.vScrollButton) {
    setTimeout(() => {
      this.$refs.vScrollButton.classList.add('focus');
      lazy(this, () => {
        this.$refs.vScrollButton?.classList.remove('focus');
      }, 1000);
    });
  }
}

export function lastPage(this: any, e?: Event): void {
  if (e) e.stopPropagation();

  // Устанавливаем страницу на последнюю возможную позицию
  this.pageTop = Math.max(0, this.table.length - this.pageSize);
  calVScroll(this);

  // Временное добавление фокуса к кнопке вертикального скролла
  if (this.$refs.vScrollButton) {
    setTimeout(() => {
      this.$refs.vScrollButton.classList.add('focus');
      lazy(this, () => {
        this.$refs.vScrollButton?.classList.remove('focus');
      }, 1000);
    });
  }
}

export function prevPage(this: any, e?: Event): void {
  if (e) e.stopPropagation();

  // Устанавливаем страницу на предыдущую, или на первую, если `pageTop` меньше `pageSize`
  this.pageTop = Math.max(0, this.pageTop - this.pageSize);
  calVScroll(this);

  // Временное добавление фокуса к кнопке вертикального скролла
  if (this.$refs.vScrollButton) {
    setTimeout(() => {
      this.$refs.vScrollButton.classList.add('focus');
      lazy(this, () => {
        this.$refs.vScrollButton?.classList.remove('focus');
      }, 1000);
    });
  }
}

export function nextPage(this: any, e?: Event): void {
  if (e) e.stopPropagation();

  // Переход на следующую страницу, если она существует
  if (this.pageTop + this.pageSize < this.table.length) {
    this.pageTop = Math.min(this.pageTop + this.pageSize, this.table.length - this.pageSize);
  }

  // Обновляем вертикальный скроллер
  calVScroll(this);

  // Временное добавление фокуса к кнопке вертикального скролла
  if (this.$refs.vScrollButton) {
    setTimeout(() => {
      this.$refs.vScrollButton.classList.add('focus');
      lazy(this, () => {
        this.$refs.vScrollButton?.classList.remove('focus');
      }, 1000);
    });
  }
}

