# Pagina download essenziale

## Modifiche

- `/` resta la landing marketing: benefici, tre placeholder reali e due CTA verso `download-app/`. Nel footer sono nuovamente raggiungibili Manuale Talia (Markdown locale), guida ufficiale SolidCraft MCP e sorgenti del connettore. Il nome del manuale è tradotto nelle 19 lingue e nel fallback inglese incorporato.
- `/download-app/`: titolo breve, conteggio release, gruppi per versione e sistema operativo con pulsanti di download. Rimossi sottotitoli ripetuti, introduzione e link release duplicato; spaziatura e titolo ridotti solo per questa pagina.
- Data, provenienza build e note asset sono nei dettagli tecnici della release. Nome file, dimensione, modalità aggiornamento e digest sono nel dettaglio checksum del pacchetto. Avvisi di installazione e spiegazione integrità sono nel disclosure «Prima di installare», utilizzabile da tastiera.
- Tutti i 27 URL installer restano presenti e invariati. Indice release, versioni, workflow Pages e dipendenze non modificati. Nessun backend o rewrite richiesto.

## Verifiche eseguite

- `npm run test:site`: 36/36 superati. Il primo run dopo la nuova chiave del manuale ha rilevato il fallback inglese incorporato non aggiornato: aggiornato e rieseguito con successo.
- `node --test tests/store.test.cjs tests/catalog-upgrade.test.cjs tests/artifact-retention.test.cjs tests/model-thinking.test.cjs`: 18/18 superati.
- `scripts/check-download-browser.cjs`, Chromium su hosting statico sotto `/talia-store/`: 19 lingue × 1440/390/320 per entrambe le pagine, persistenza tra pagine e reload, arabo RTL, 27 URL preservati, checksum espandibili, dettagli tecnici inizialmente chiusi, avvisi apribili, manuale locale HTTP 200, link SolidCraft, nessun marketing nella pagina download. Nessun overflow o violazione automatica Axe. Verificati anche empty/error, fallback inglese, storage negato, recupero infrastruttura traduzioni e tastiera.
- Prove browser complete: `/tmp/talia-minimal-browser/results.json`, screenshot nella stessa directory. Script root: `/tmp/talia-minimal-root.cjs`.
- Controllo aggiuntivo root su anteprima: CTA, 27 download, Manuale Talia in italiano, due collegamenti SolidCraft, reload con arabo persistente, 1440/390/320 e apertura avvisi da tastiera. HTML di entrambe le pagine servite identico ai file del worktree.
- Anteprime rispondenti: `http://127.0.0.1:8765/` e `http://127.0.0.1:8765/download-app/`.

## Limiti e consegna

Nessun merge, deploy, build release o cambio stato task. `.DS_Store` preesistente preservato. Installer e siti esterni non scaricati o certificati; verificati URL e dati dell'indice. Produzione Pages non pubblicata. Le traduzioni non sono certificate madrelingua; Axe non costituisce una valutazione completa dell'accessibilità. QA indipendente e approvazione estetica restano necessarie.
