# UniAufgaben

<p align="center">
  <img src="https://github.com/TheSkyless/UniAufgaben-Public/assets/108612292/752c34a3-ceef-4833-8351-b1c85dd7c7b5" alt="UniAufgaben Logo" width="150"/>
</p>

## 1: Beschreibung
UniAufgaben ist eine Webapplikation, welche im Rahmen einer Bachelorarbeit erstellt wurde und genutzt werden kann, um Aufgaben im Studium organisieren zu können. Die Applikation kann von mehreren Nutzern verwendet werden. Für die Erstellung wurde der MEAN-Stapel verwendet, welcher besteht aus MongoDB, Express.js, Angular und Node.js.

## 2: Installation

Laden Sie die Dateien aus dem Projekt herunter und extrahieren Sie die Dateien aus dem .zip-Archiv. Plazieren Sie dann sämtliche Dateien in einen Ordner, wo die Applikation laufen soll.

### 2.1: Backend
Das Backend läuft mit Node.js. Es ist deshalb nötig, [Node.js](https://nodejs.org/) zu installieren. Stellen Sie dabeit sicher, das npm ebenfalls korrekt installiert wurde, da dieses benötigt wird, um die nötigen Erweiterungen installieren zu können. Installiert werden müssen: 
- [Mongoose](https://www.npmjs.com/package/mongoose)
- [mongoose-unique-validator](https://www.npmjs.com/package/mongoose-unique-validator)
- [Bcrypt](https://www.npmjs.com/package/bcrypt)
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)
- [dotenv](https://www.npmjs.com/package/dotenv)

Bearbeiten Sie anschliessend die Datei mit dem Namen `.env.template`; Fügen Sie alle benötigten Daten, um eine Verbindung zu MongoDB herstellen zu können (d.h. alle Variablen, welche mit `DB` beginnen). Für die Variabel `TOKEN_KEY` müssen Sie selbst eine Zeichenfolge definieren, welche verwendet wird, um die Token zu verschlüsseln. Diese sollte möglichst lang sein. Benennen Sie schliesslich die Datei um in `.env`.

Um das Backend zu starten, öffnen Sie ein Terminal im Ordner der Applikation und geben Sie den Befehl `node server.js` ein.

>[!IMPORTANT]
>Verwalten Sie die Software von per SSH-Verbindung, müssen Sie sicherstellen, dass das Backend weiterhin aktiv ist, während Sie das Terminal für andere Bereiche nutzen.
>Ist das Backend nicht aktiv, kann das Frontend keine Verbindung zur Datenbank herstellen.
>Sie können [GNU Screen](https://www.gnu.org/software/screen/) verwenden, um das Backend am laufen zu lassen, während Sie z.B. das Frontend aufstarten.

### 2.2: Frontend
Das Frontend wurde mit Angular erstellt. Eine Anleitung zur Installation von Angular finden sie hier: https://angular.io/guide/setup-local.
Sobald Angular installiert wurde, kann der Client bei `http://localhost:4200` aufgerufen werden, indem Sie ein Terminal im Order `src` öffnen, und anschliessend `ng serve` eingeben.

Um die Dateien zu kompilieren, um diese bspw. auf einem Ubuntu Server zu beherbergen, ist es ratsam, das Frontend nicht mit `ng server` zu verwenden, sondern in statische Seiten umzuwandeln. Hierfür müssen Sie erst ein Environment erstellen. Duplizieren Sie die Datei `environment.development.ts` im Ordner `src/environements` und benennen Sie diese um in `environement.ts`. Anschliessend bearbeiten Sie die Datei und setzen Sie die IP oder Domain des Servers bei der Variabel `apiDomain` ein. Schliesslich geben Sie den Befehl `ng run uniAufgaben:build:production` im Terminal ein. Die generierten Dateien befinden sich dann im Ordner `dist` und können dann mithilfe von einer Webserver-Software wie [nginx](https://nginx.org) für die Nutzung bereitgestellt werden.

>[!WARNING]
>Die Software besitzt zurzeit keinerlei Möglichkeiten zum Wiederherstellen eines Passworts oder zur Verwaltung von Nutzern. Um einen Nutzer zu löschen, müssen alle Einträge vom Nutzer in der Datenbank manuell entfernt werden.
