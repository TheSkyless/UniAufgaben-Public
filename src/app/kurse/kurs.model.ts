export interface Kurs {
  id: string,
  name: string,
  semester: number,
  fach: string,
  bewertet: boolean,
  serien_insgesamt: number,
  serien_benoetigt: number,
  serien_bestanden: number,
  serien_nicht_bestanden: number,
  nutzer: string
}
