//////////
// Diese Datei dient zur Übersetzung gewisser Elemente der Paginator-Komponente.
//////////

import {MatPaginatorIntl} from '@angular/material/paginator';

export function paginatorDeutsch() {
  const paginatorDE = new MatPaginatorIntl();

  paginatorDE.itemsPerPageLabel = 'Ergebnisse pro Seite:';
  paginatorDE.nextPageLabel = 'Nächste Seite';
  paginatorDE.previousPageLabel = 'Vorherige Seite';
  paginatorDE.lastPageLabel = "Letzte Seite";
  paginatorDE.firstPageLabel = "Erste Seite";
  paginatorDE.getRangeLabel = (page:number, size:number, length:number) => {
    if(length === 0 || size === 0) return "Keine Ergebnisse vorhanden";
    else {
      length = Math.max(length,0);

      const start = page * size;
      const end = Math.min((start+size),length);
      const word = start+1 === end ? "Ergebnis " : "Ergebnisse "

      return word+(start+1)+" bis "+end+" von insgesamt "+length;
    }
  };

  return paginatorDE;
}
