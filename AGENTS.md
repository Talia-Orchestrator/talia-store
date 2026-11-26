# Risorse Talia

- Il manifesto `talia-extension.json` e i file del pacchetto sono la fonte di verità. Mantieni ID stabili, versione SemVer, licenza, provenienza e dipendenze esplicite.
- Riusa i template e gli strumenti pubblici di `talia-store`. Il contributore deve poter validare le risorse senza il repository privato del core.
- Controlli locali `npm test` e `npm run validate`. Nessuna GitHub Action valida lo Store a ogni PR o push. Prima della promozione del core da `main` a `build`, eseguire `npm run validate:before-build` su un checkout pulito dello Store e registrare il commit verificato. Le chiavi di firma non entrano nei workflow remoti.
- I pacchetti non contengono credenziali o percorsi personali. Installazione e consultazione non avviano processi MCP. Provider e account sono configurati dall'utente nell'host.
- I sorgenti pubblici stanno nel monorepo sotto `packages/agents/`, `packages/skills/`, `packages/connectors/`, `packages/apps/`, `packages/library/` e `packages/teams/`. Il contratto pubblico letto dai client resta nella root: `catalog.json`, `catalog.signature.json`, `routing-index.json`, `public-key.txt` e `artifacts/`. Il controllo locale e il packer non dipendono dai vecchi repository delle risorse.
- Prima di modificare cerca logiche e pacchetti simili e consulta simboli e riferimenti nel grafo, verificando copertura e freschezza. Il repository rimane autorevole.
- Commenti in italiano, identificatori del codice in inglese. Mantieni i sorgenti leggibili e gli esempi realmente utilizzabili.
- Per modifiche ai contratti comuni prepara una proposta nel repository dello store e coordina l'adattamento dell'host. Un normale nuovo pacchetto usa il contratto esistente.
- Gli indici locali hanno un nome derivato dalla root canonica e non vengono uniti a quelli di altri repository. `.cbmignore` esclude output, artefatti generati e dati privati.
