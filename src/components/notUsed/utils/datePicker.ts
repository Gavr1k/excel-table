import { lazy } from './excelEditor';
import {inputCellWrite} from './inputBox';


export function showDatePickerDiv(context: any): void {
  if (!context.$refs.dpContainer) return;

  const cellRect = context.currentCell.getBoundingClientRect();
  const dpContainer = context.$refs.dpContainer;

  dpContainer.style.left = `${cellRect.left}px`;
  dpContainer.style.top = `${cellRect.bottom}px`;

  context.inputDateTime = new Date(context.currentCell.textContent);
  context.showDatePicker = true;

  lazy(context, () => {
    if (!dpContainer) return;
    const containerRect = dpContainer.getBoundingClientRect();

    if (containerRect.bottom > window.innerHeight) {
      dpContainer.style.top = `${cellRect.top - containerRect.height}px`;
    }

    if (containerRect.right > window.innerWidth) {
      dpContainer.style.left = `${window.innerWidth - containerRect.width}px`;
    }
  });
}

export function datepickerClick(context: any): void {
  const offset = new Date().getTimezoneOffset() * 60 * 1000;
  const selectedDate = new Date(new Date(context.inputDateTime).getTime() - offset);

  switch (context.currentField.type) {
    case 'date':
      context.inputBox.value = selectedDate.toISOString().slice(0, 10);
      break;
    case 'datetime':
      context.inputBox.value = selectedDate.toISOString().replace('T', ' ').slice(0, 16) + ':00';
      break;
    case 'datetimesec':
      context.inputBox.value = selectedDate.toISOString().replace('T', ' ').slice(0, 19);
      break;
    case 'datetick':
    case 'datetimetick':
    case 'datetimesectick':
      context.inputBox.value = String(selectedDate.getTime());
      break;
  }

  context.inputBoxShow = 0;
  inputCellWrite(context, context.inputBox.value);
  context.showDatePicker = false;
  context.focused = true;
}

