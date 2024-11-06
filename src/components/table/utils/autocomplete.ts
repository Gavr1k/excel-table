import {lazy} from './excelEditor';

/*
inputCellWrite
*/

export async function calAutocompleteList(context: any, force: boolean): Promise<number | void> {
  if (!context.currentField.autocomplete) return;

  if (force || (context.inputBoxChanged && context.inputBox.value.length > 0)) {
    if (context.recalAutoCompleteList !== undefined) clearTimeout(context.recalAutoCompleteList);

    const generateAutocompleteList = async () => {
      if (!force && (!context.focused || !context.inputBoxShow || !context.inputBoxChanged || !context.inputBox.value.length)) {
        context.autocompleteInputs = [];
        return;
      }

      const field = context.currentField;
      const name = field.name;
      const value = context.inputBox.value.toUpperCase();
      const listCount = context.autocompleteCount;
      let list: any[] = [];

      if (field.options) {
        if (typeof field.options === 'function') {
          list = await field.options(value, context.currentRecord);
          list = field.type === 'map' ? Object.values(list) : list.slice();
        } else {
          list = field.type === 'map' ? Object.values(field.options) : field.options.slice();
        }
        if (context.inputBoxShow) {
          list = list.filter((element: string) => element.toUpperCase().includes(value));
        }
        list.sort().splice(listCount);
      } else {
        for (const rec of context.modelValue) {
          if (rec[name] && rec[name].toString().toUpperCase().startsWith(value) && !list.includes(rec[name])) {
            list.push(rec[name]);
          }
          if (list.length >= listCount) break;
        }
        list.sort();
      }

      context.autocompleteSelect = list.findIndex(element => element?.toString().toUpperCase().startsWith(value));
      context.autocompleteInputs = list;

      const rect = context.currentCell.getBoundingClientRect();
      lazy(context, () => {
        const autocompleteEl = context.$refs.autocomplete as HTMLElement | undefined;
        if (!autocompleteEl) return;

        autocompleteEl.style.minWidth = `${rect.width}px`;
        const autocompleteRect = autocompleteEl.getBoundingClientRect();

        if (rect.bottom + autocompleteRect.height > window.innerHeight) {
          context.autocompleteInputs.reverse();
          context.autocompleteSelect = context.autocompleteInputs.length - context.autocompleteSelect - 1;
          autocompleteEl.style.top = `${rect.top - autocompleteRect.height}px`;
        } else {
          autocompleteEl.style.top = `${rect.bottom}px`;
        }

        autocompleteEl.style.left =
          rect.left + autocompleteRect.width > window.innerWidth
            ? `${rect.right - autocompleteRect.width}px`
            : `${rect.left}px`;

        const showTop = context.autocompleteSelect * 23 - 206;
        autocompleteEl.scrollTop = showTop > 0 ? showTop : 0;
      });

      return context.autocompleteSelect;
    };

    if (force) {
      generateAutocompleteList();
    } else {
      lazy(context, generateAutocompleteList, 700);
    }
  }
}


export function inputAutocompleteText(context: any, text: string, e?: Event): void {
  if (e) e.preventDefault();

  context.autocompleteInputs = [];
  context.autocompleteSelect = -1;
  context.inputBoxShow = 0;
  context.inputBoxChanged = false;

  setTimeout(() => {
    context.inputCellWrite(text);
  }, 0);
}

