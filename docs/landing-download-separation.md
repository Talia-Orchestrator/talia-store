# Landing e download separati

## Architettura

- `site/index.html` → `/`: landing narrativa multilingue, tre placeholder espliciti per screenshot reali, benefici già presenti e qualificati dalle condizioni su risorse e permessi. Nessun installer, versione, checksum o caricamento dell’indice release.
- Due CTA «Scarica Talia» (hero e chiusura) e voce «Download app» portano a `download-app/`.
- `site/download-app/index.html` → `/download-app/`: selezione sistema, tutte le release, 27 link installer, checksum e avvisi di sicurezza. Il logo e Home tornano alla landing.
- La home preesistente era già una pagina di download/marketing, non un catalogo: nessuna risorsa o rotta del catalogo modificata. Percorsi indice, release, asset e workflow Pages invariati. I vecchi frammenti `/#downloads-title` restano sulla landing: per i download usare `/download-app/`.

## Conversione e lingue

La landing presenta promessa, contesto di progetto, squadra di agenti e libertà di configurazione. Le informazioni tecniche vengono mostrate dopo la CTA, senza claim, metriche o testimonianze nuove. Stile e CSS premium esistenti mantenuti.

Entrambe le pagine riusano le 19 traduzioni e lo stesso selettore: persistenza condivisa, fallback inglese e arabo RTL. Le fonti delle lingue restano quelle documentate in `download-i18n-review.md`. Titolo landing localizzato sulla promessa; titolo download e metadati localizzati tramite il sistema esistente. Nessuna dipendenza aggiunta.

## Verifiche

- `npm run test:site`: 36 test superati, inclusa copertura delle chiavi di entrambe le pagine e assenza del renderer download dalla landing.
- `node --test tests/store.test.cjs tests/catalog-upgrade.test.cjs`: 15 test superati.
- `scripts/check-download-browser.cjs`: Chromium, 19 lingue a 1440/390/320 px su entrambe le pagine. Nessun overflow; landing senza lista installer, due CTA corrette, tre placeholder; persistenza attraverso navigazione; 27 URL installer invariati; checksum, errore/vuoto, fallback e tastiera verificati. Axe senza violazioni automatiche su entrambe le pagine a 320 px. Un conflitto di nomi delle regioni emerso nel controllo è stato corretto prima del run superato.
- Hosting statico sotto `/talia-store/`: navigazione, accesso diretto e reload verificati senza rewrite. Root sul server di anteprima: accesso diretto e reload, landing senza installer e download con 27 link, arabo persistente RTL.
- Evidenze complete del browser: `/tmp/talia-split-browser/results.json`; immagini della pagina download nella stessa directory.
- Anteprima verificata: `http://127.0.0.1:8765/` e `http://127.0.0.1:8765/download-app/`.

## Limiti

Nessun deploy, merge, build release o modifica allo stato del task. Produzione GitHub Pages e installer esterni non verificati. Traduzioni non certificate madrelingua; Axe non sostituisce una valutazione completa dell’accessibilità. Accettazione estetica dell’utente e QA indipendente ancora necessarie. `.DS_Store` preesistente preservato.
