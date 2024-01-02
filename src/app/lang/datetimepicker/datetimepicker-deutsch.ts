//////////
// Diese Datei dient zur Übersetzung gewisser Elemente der DateTimePicker-Komponente.
//////////

import {MtxDatetimepickerIntl} from "@ng-matero/extensions/datetimepicker";

export function datetimepickerDeutsch() {
  const pickerDE = new MtxDatetimepickerIntl()

  pickerDE.cancelLabel = "Abbrechen";
  pickerDE.okLabel = "Ok";

  return pickerDE;
}
