import { read, writeFile, utils } from 'xlsx';
import { updateCell } from './excelEditor';

// Функция экспорта таблицы
export async function exportTable(
  context: any,
  format: string,
  selectedOnly: boolean,
  filename: string = 'export'
): Promise<void> {
  context.processing = true;

  setTimeout(() => {
    const wb = utils.book_new();
    let data = context.table;

    // Фильтруем данные, если нужно экспортировать только выбранные строки
    if (selectedOnly) {
      data = context.table.filter((rec: any, i: number) => context.selected[i]);
    }

    // Преобразуем данные в объект, соответствующий полям
    const mapped = data.map((rec: any) => {
      const conv: { [key: string]: any } = {};
      context.fields.forEach((field: any) => {
        conv[field.name] = rec[field.name];
      });
      return conv;
    });

    // Создаем новый лист из данных
    const ws1 = utils.json_to_sheet(mapped, {
      header: context.fields.map((field: any) => field.name),
    });

    // Получаем заголовки колонок
    const labels = Array.from(context.labelTr.children)
      .slice(1)
      .map((t: HTMLElement) => t.children[0].innerText);

    // Добавляем заголовки на лист
    utils.sheet_add_aoa(ws1, [labels], { origin: 0 });

    // Устанавливаем ширину колонок
    ws1['!cols'] = Array.from(context.labelTr.children)
      .slice(1)
      .map((t: HTMLElement) => ({
        width: t.getBoundingClientRect().width / 6.5,
      }));

    // Добавляем лист в книгу
    utils.book_append_sheet(wb, ws1, 'Sheet1');

    // Определение расширения файла в зависимости от формата
    switch (format) {
      case 'csv':
        if (!filename.endsWith('.csv')) filename += '.csv';
        break;
      case 'xls':
        if (!filename.endsWith('.xls')) filename += '.xls';
        break;
      case 'xlsx':
      case 'excel':
      default:
        if (!filename.endsWith('.xlsx')) filename += '.xlsx';
        break;
    }

    // Сохранение файла
    writeFile(wb, filename, {
      compression: 'DEFLATE',
      compressionOptions: {
        level: 6,
      },
    });

    context.processing = false;
  }, 500);
}

// Функция импорта данных из файла
export async function doImport(context: any, e: Event): Promise<void> {
  context.processing = true;

  setTimeout(() => {
    const files = (e.target as HTMLInputElement).files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const fileReader = new FileReader();

    fileReader.onload = async (event: ProgressEvent<FileReader>) => {
      try {
        const data = event.target!.result as string;
        const wb = read(data, { type: 'binary', cellDates: true, cellStyle: false });
        const sheet = wb.SheetNames[0];
        let importData = utils.sheet_to_row_object_array(wb.Sheets[sheet]);

        // Убираем пустые строки и чистим данные
        importData = importData.filter((rec: any) => Object.keys(rec).length > 0).map((rec: any) => {
          if (rec.key_1) {
            rec.key = rec.key_1;
            delete rec.key_1;
          }
          Object.keys(rec).forEach(k => {
            if (typeof rec[k] === 'string') {
              rec[k] = rec[k].replace(/[ \r\n\t]+$/g, '');
            }
          });
          return rec;
        });

        if (importData.length === 0) {
          throw new Error('No records read');
        }

        const keyStart = String(new Date().getTime() % 1e8);

        let pass = 0;
        let inserted = 0;
        let updated = 0;

        // Основная логика импорта
        while (pass < 2) {
          const keys = context.fields.filter((f: any) => f.keyField);
          let uniqueKeys: string[] = [];

          for (let i = 0; i < importData.length; i++) {
            const line = importData[i];
            let rowPos = -1;

            // Поиск строки по ключевым полям
            if (keys.length) {
              rowPos = context.table.findIndex((v: any) =>
                keys.every((f: any) =>
                  v[f.name] !== undefined &&
                  (v[f.name] === line[f.name] || v[f.name] === line[f.label])
                )
              );

              if (rowPos === -1) {
                const lineKey = keys.map((k: any) => line[k.name] || line[k.label]).join(':');
                if (lineKey && !uniqueKeys.includes(lineKey)) {
                  uniqueKeys.push(lineKey);
                } else {
                  continue;
                }
              }
            }

            const rec: { [key: string]: any } = {
              $id: typeof line.$id === 'undefined' ? `${keyStart}-${('000000' + i).slice(-7)}` : line.$id,
            };

            for (const field of context.fields) {
              if (field.name.startsWith('$')) continue;

              let val = line[field.name] ?? line[field.label] ?? null;

              if (field.readonly) {
                throw new Error(`Readonly column detected: ${field.name}`);
              }

              if (field.change) {
                const result = await field.change(val, rec[field.name], rec, field);
                if (result === false) throw new Error(`Validation failed for: ${field.name}`);
              }

              if (field.validate) {
                const err = field.validate(val, rec[field.name], rec, field);
                if (err) throw new Error(`Validation error for ${field.name}: ${err}`);
              }

              if (val !== null) rec[field.name] = val;
            }

            if (pass === 1) {
              if (rowPos >= 0) {
                updated++;
                Object.keys(rec).forEach((name) => {
                  if (name.startsWith('$')) return;
                  updateCell(context, rowPos, name, rec[name]);
                });
                context.selected[rowPos] = context.table[rowPos].$id;
              } else {
                context.newRecord(rec, true);
                inserted++;
              }
            }
          }

          pass++;
        }

        if (context.importCallback) {
          context.importCallback({
            inserted,
            updated,
            recordAffected: inserted + updated,
          });
        }
      } catch (error) {
        context.importErrorCallback?.(error.message);
        throw new Error('VueExcelEditor: ' + error.stack);
      } finally {
        context.processing = false;
        (e.target as HTMLInputElement).value = '';
      }
    };

    fileReader.onerror = (error) => {
      context.processing = false;
      (e.target as HTMLInputElement).value = '';
      context.importErrorCallback?.(error.message);
    };

    fileReader.readAsBinaryString(file);
  }, 500);
}