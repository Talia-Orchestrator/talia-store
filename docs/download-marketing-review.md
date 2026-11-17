# Pagina download: consegna per revisione

## Ambito
Task t_734b2ad16870. Nuova hero, benefici, CTA verso i download, tre placeholder espliciti. Brand #F4BC53 e logo chiaro esistente. Nessuna dipendenza aggiunta. Copy basato sul manuale versionato; capacità subordinate a modelli, risorse, account e permessi.

Modifiche: `site/index.html`, `site/styles.css`. Logica `site/app.js`, manifest, versioni, indice release e link preesistenti non modificati. Nessun grafo del codice disponibile nel checkout: analizzati sorgenti, riferimenti e test del sito direttamente.

## Screenshot da produrre
1. Workspace, 16:10, suggerito 1600×1000: progetto dimostrativo con chat Commander, squadra e documenti.
2. Fonti, 4:3, suggerito 1200×900: documenti di progetto e risposta con riferimenti verificabili.
3. Squadra, 4:3, suggerito 1200×900: selezione agenti e modelli della chat.

Usare dati dimostrativi, nessuna credenziale o dato personale. Non simulare funzioni assenti. Sostituire il contenuto di ogni `.placeholder-body` con un'immagine in `site/assets/`, mantenere la figura, aggiornare didascalia e testo alternativo, rimuovere etichette «da aggiungere». Per le immagini usare larghezza 100%, altezza automatica e dimensioni intrinseche. I placeholder sono parte della consegna richiesta, non screenshot reali.

## Verifiche eseguite
- `npm test`: 18 test superati, validazione catalogo e routing inclusa.
- `npm run test:site`: 10 test superati.
- `npm run validate`: superato.
- `git diff --check`: superato.
- Browser Chromium: 1440, 390 e 320 px; nessun overflow orizzontale, 11 release renderizzate, nessun errore JavaScript.
- CTA hero raggiunge il download; checksum espandibile; 27 link installer corrispondono all'indice versionato, senza sostituzioni.
- Indice vuoto e risposta HTTP 503 simulati: messaggi empty/error visibili.
- Download manuale via server HTTP locale: file byte-identico all'originale.
- Preview desktop/mobile: nessuna immagine mancante, sovrapposizione o contrasto insufficiente rilevati. Navigazione Tab: 18 focus distinti osservati e visibili, nessun errore segnalato. Non equivale a un audit completo WCAG o screen reader.

## Limiti e note QA
La preview iniziale non osservava il download manuale nel proprio ambiente isolato; verifica separata via HTTP locale superata. La preview visiva finale passa; resta un avviso sulla scala tipografica (15 dimensioni, comprese le schede download preesistenti). Installer esterni non scaricati né eseguiti; disponibilità remota degli asset non certificata. Nessun test assistivo con screen reader. Nessuna build applicativa richiesta per questo sito statico.

## Git e distribuzione
`beta` creato da `origin/main` a 15e36fe e pubblicato su origin con autorizzazione. Worktree separato `worktrees/store-download-marketing`, ramo `feature/download_marketing`. Checkout utente e modifiche pregresse preservati. Nessun merge, rimozione worktree o pubblicazione live. Il workflow Pages pubblica da main, non da questa feature. L'endpoint protezione ramo segnala beta non protetto; nessuna protezione modificata. La PR deve essere verificata indipendentemente prima della richiesta di approvazione al merge.


## Correzione successiva alla QA — 17 novembre 2026
La nota iniziale su `app.js` invariato descrive la prima consegna. Ora il percorso comune `makePlatformCard` deriva aria-label dal testo visibile del link e aggiunge versione e piattaforma: «Scarica DMG — Talia … per …». Nessuna modifica a HTML/CSS marketing, placeholder, URL, indice o versioni.

- Regressione in `tests/download-site.test.cjs`: esegue il generatore reale in Node VM con DOM minimo, verifica il prefisso visibile e URL per tutti gli installer dell'indice versionato, coprendo DMG/EXE/ZIP/APPIMAGE. Non sostituisce il controllo browser.
- `npm run test:site`: 11/11; `npm test`: 18/18 e validazione superata; `git diff --check`: superato.
- Chromium reale tramite Playwright: 1440/390/320 px, 11 release, overflow orizzontale 0; CTA verso #downloads-title e checksum azionati a ogni larghezza; nessuna eccezione JS. Stati indice vuoto e HTTP 503 verificati.
- A 320 px verificati tutti i 27 nomi: aria-label inizia con textContent; tutti i 27 URL appartengono all'indice invariato. Axe-core 4.14.1, regola `label-content-name-mismatch`: 0 violazioni, 28 nodi passati (inclusi i 27 installer).

Riproduzione indipendente: eseguire i comandi test sopra; servire `site/` via HTTP e attendere le schede release. Per tutti i `.platform-card .download-button`, verificare `element.getAttribute('aria-label').startsWith(element.textContent)`, quindi eseguire Axe con `runOnly: {type: 'rule', values: ['label-content-name-mismatch']}`. Ripetere CTA e apertura checksum ai viewport 1440, 390 e 320 px. Script temporaneo di esecuzione locale: `/tmp/store-download-a11y-recheck.cjs` (dipende dai moduli QA temporanei, non è una dipendenza del progetto).

Limiti invariati: nessun audit WCAG completo o screen reader, installer esterni non scaricati. Nessun merge, pubblicazione o rimozione worktree; task non aggiornato.
