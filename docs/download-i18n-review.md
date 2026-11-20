# Download app multilingue — verifica frontend

## Ambito e struttura

Richiesta: pagina download nella voce «Download app», tradotta nelle lingue dell’app, compatibile con GitHub Pages. Conservato il redesign premium: tipografia ampia, spazio negativo, brand Talia e tre grandi cornici dichiaratamente destinate a screenshot reali.

- `site/download-app/index.html`: pagina dedicata, completamente tradotta nel normale percorso JavaScript.
- `site/index.html`: home preesistente conservata, con aggiunta della voce «Download app». Tutti gli anchor e i download storici continuano a funzionare. Le sezioni manuale e SolidCraft rimangono disponibili nella home; nessuna pagina catalogo preesistente è stata eliminata.
- `site/i18n.js`, `site/locale-meta.json`, `site/locales/*.json`: selezione e traduzioni statiche.
- `site/app.js`: unico renderer download condiviso con la home storica; risoluzione dell’indice relativa al file dello script, non alla sottocartella della pagina.
- `site/styles.css`: navigazione, selettore nativo, focus e adattamento RTL/mobile.
- `tests/download-i18n.test.cjs`: copertura delle tabelle, metadati e nomi accessibili.
- `scripts/check-download-browser.cjs`: verifica ripetibile in Chromium con server statico temporaneo.

La richiesta di traduzione riguarda la nuova pagina download, non l’intera home storica, il manuale Markdown o le pagine esterne GitHub.

## Fonti delle lingue e comportamento

Fonti lette dal checkout locale dell’app, senza modificarlo:

- `desktop/src/renderer/modules/i18n.js`: registro `_LOCALES`, nomi nativi, `htmlLang`, locale Intl, fallback inglese e direzione araba.
- `desktop/src/main/i18n.ts`: `normalizeLang`, varianti regionali e rilevamento della lingua.
- Cartella `desktop/src/renderer/locales/`: presenza effettiva delle 19 tabelle.
- Revisione app osservata: `c01345f3a37eb5abfeb271d43a2d11b410d7c7ac`. Nessuna modifica locale nei due file sorgente citati al controllo.

Lingue: `zh`, `zh-tw`, `en`, `fr`, `de`, `hi`, `id`, `it`, `ja`, `ko`, `pt`, `pt-pt`, `ru`, `es`, `es-419`, `th`, `tr`, `vi`, `ar`.

Ogni tabella contiene gli stessi 60 messaggi, inclusi marketing, istruzioni screenshot, avvisi di firma, download, aggiornamenti, checksum, stati dinamici, messaggi del selettore e metadati. Marchi, nomi di file, identificatori tecnici e hash restano invariati.

Selezione: preferenza valida nel browser → prima lingua del browser supportata → inglese. Le regole per cinese tradizionale, portoghese non brasiliano e spagnolo latinoamericano seguono l’app. `html[lang]`, direzione, date e numeri cambiano con la lingua. La preferenza del sito usa `localStorage` (`talia-site-language`), non IPC né le impostazioni private dell’app.

Fallback per chiavi assenti: inglese. Una copia inglese incorporata, verificata uguale al JSON canonico da un test, mantiene leggibili pagina e download se le risorse di traduzione non arrivano. Se una lingua non si carica, resta selezionata quella precedente e compare un messaggio. Se lo storage è negato, il cambio funziona per la sessione e un avviso spiega il limite di persistenza. Il percorso senza JavaScript conserva contenuto inglese e link alle release GitHub, ma non offre selettore né elenco dinamico.

## GitHub Pages

Configurazione effettiva verificata in lettura con l’API GitHub Pages:

- URL: `https://talia-orchestrator.github.io/talia-store/`
- Nessun dominio personalizzato.
- Sorgente: ramo `gh-pages`, cartella `/`.
- Workflow esistente: `.github/workflows/pages.yml`; pubblica i file statici di `site/` tramite `scripts/deploy-pages-branch.cjs`. Entrambi lasciati invariati.

URL finale previsto: `https://talia-orchestrator.github.io/talia-store/download-app/`.

Tutti gli asset e i link interni sono relativi; i JSON sono risolti rispetto a `i18n.js` e `app.js`. Il percorso è una directory con `index.html`: nessuna SPA, backend, route virtuale, regola di rewrite o servizio di traduzione. Accesso diretto e reload funzionano con normali file statici. Il redirect da una directory senza slash è quello ordinario del server statico.

Anteprima locale verificata e aperta nel browser interno: `http://127.0.0.1:8765/download-app/`. Il server preesistente è stato riutilizzato. La prova equivalente a Pages usa separatamente il prefisso `/talia-store/` su server temporaneo, chiuso a fine test.

Nessuna pubblicazione effettuata: l’URL pubblico previsto non è prova della presenza di questa revisione in produzione.

## Verifiche eseguite

- `npm run test:site`: **36 test superati**, inclusi test del percorso di pubblicazione statico, senza pubblicare.
- `npm test`: **18 test superati**; validazione di catalogo, firme e routing superata.
- Chromium reale: **19 lingue × 3 larghezze** (1440/390/320 px), senza overflow orizzontale.
- Cambio lingua e persistenza al reload per tutte le 19 lingue; `lang`, `dir`, titolo, descrizione e testi marcati verificati contro le tabelle.
- Tutti i **27 URL e nomi accessibili** verificati in ciascuna lingua. Il testo visibile del formato è incluso nel nome accessibile.
- CTA verso i download e apertura del checksum verificati per tutte le lingue.
- Stati indice vuoto e HTTP 503 verificati in ciascuna lingua, con messaggi tradotti.
- Axe sull’intera pagina a 320 px in tutte le 19 lingue: **zero violazioni automatiche**.
- Tastiera: skip link e apertura del checksum con Invio verificati.
- Click installer provato con risposta attachment locale intercettata: nessun installer esterno scaricato.
- Navigazione dalla home, accesso diretto alla directory, redirect con slash e reload verificati sotto `/talia-store/`.
- Provati fallback regionali, preferenza salvata non supportata, browser non supportato, traduzione indisponibile, infrastruttura traduzioni indisponibile e storage negato.
- Screenshot rappresentativi italiano/inglese/arabo/tedesco/cinese a tre larghezze; ispezione visiva di italiano desktop, arabo 320 e tedesco 390.
- Nessuna modifica a indice release, aggiornamenti, versioni, manifest, cataloghi, firme o AGENTS.md.

Evidenze di esecuzione temporanee: `/tmp/talia-download-i18n/results.json` e 15 screenshot nella stessa directory. Non sono artefatti di produzione.

## Ripetizione della prova browser

Servono installazioni locali già disponibili di Playwright con Chromium e axe-core. Non sono state aggiunte dipendenze al repository.

```sh
npm run test:site
npm test
TALIA_PLAYWRIGHT_MODULE='<percorso-modulo-playwright>' \
TALIA_AXE_PATH='<percorso-axe.min.js>' \
TALIA_BROWSER_OUTPUT='<directory-temporanea-evidenze>' \
npm run check:site:browser
```

Lo script apre un server in lettura su porta libera, esercita la struttura equivalente a Pages, produce JSON e screenshot e chiude browser e server. L’assenza dei moduli opzionali è un prerequisito mancante, non un test superato.

Per aggiornare traduzioni inglesi occorre mantenere coerente la tabella incorporata in `i18n.js`; il test `embedded English recovery table` impedisce divergenze. Le altre lingue sono tabelle JSON indipendenti, senza traduzioni automatiche in rete.

## Limiti e consegna

Le prove sono locali in Chromium, non un deploy reale su Pages. Non eseguiti download di installer esterni, installazioni, Safari/Firefox, audit con screen reader o revisione linguistica madrelingua delle 19 traduzioni. L’accettazione estetica resta all’utente; i tre screenshot del prodotto sono ancora placeholder espliciti.

Stessa feature e stessa PR #18 verso `beta`. Nessun merge, build di release, deploy o rimozione worktree. Checkout e modifiche estranee preservati, incluso `.DS_Store` non tracciato già presente. Stato task non modificato.
