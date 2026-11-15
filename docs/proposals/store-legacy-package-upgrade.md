# Conversione dei pacchetti Store già installati

Stato: proposta tecnica, 15 novembre 2026. Non modifica pacchetti o catalogo
firmati. Il repository corrente è il riferimento per l'ABI v1; le nuove API
descritte qui richiedono implementazione e prova nel core prima di pubblicare
artifact che le usano.

## Invarianti

- Conservare `talia-apps/notes`, `talia-apps/csv-viewer`, `talia-apps/task-board`
  e tutti gli altri package ID, `agent_id`, ID skill e account scope. Lo Store
  può aggiornare un'installazione solo se l'identità rimane stabile.
- Conservare i dati app per ID e scope (`local`/`cloud`). Non cambiare il namespace
  storage in base al nome del file SDK o alla versione del pacchetto. Un update
  non può copiare alla cieca dati cloud o cancellare dati locali.
- Installazioni esistenti sono snapshot di file v1: contengono
  `orkas-app.json`, caricano `/__orkas/sdk.js` e usano `window.orkasApp`.
  Il core integrato espone `SDK_VERSION = 1` per entrambi i manifest, legge
  prima `talia-app.json` e poi `orkas-app.json`, e conserva il marker legacy
  `__orkasApp: 1` nel messaggio iframe. Il runner espone i nuovi nomi `TALIA_*`
  insieme agli alias `ORKAS_*`. Questi alias sono ABI locali e non significano
  dipendenza da servizi remoti Orkas.
- LICENSE, NOTICE, ricevute di installazione, contenuti dell'utente e
  conversazioni storiche mantengono attribuzioni e dati originali.

## Contratto host proposto

1. L'host ora serve anche `/__talia/sdk.js`, con `window.taliaApp`. Mantiene
   `/__orkas/sdk.js` e `window.orkasApp` per pacchetti v1 già installati.
   Entrambi usano lo stesso dispatch di metodi, origine iframe, controlli di
   capability, grant, limite payload, AbortSignal e cancellazione. Un alias
   non deve bypassare permessi o creare due store per la stessa app.
2. Il protocollo `postMessage` legacy `__orkasApp: 1` resta accettato per le
   app installate; il nuovo SDK usa `__taliaApp: 2`. **Il 2 è la versione del
   trasporto, non `sdkVersion` del manifesto**, che resta 1 per entrambi.
   Il dispatcher distingue i marker e mantiene gli stessi controlli di
   frame/origine e ID richiesta.
   Non rispondere a frame estranei. Testare che un doppio caricamento non
   esegua due volte la stessa mutazione.
3. Per il runner, l'host esporta `TALIA_NODE` e `TALIA_PC_DIR` (e l'eventuale
   `TALIA_BUNDLED_NODE`) con i medesimi valori canonici degli alias `ORKAS_*`.
   Il runner Talia accetta il medesimo package/skill ID e i medesimi argomenti.
   Le variabili legacy restano solo nell'ambiente confinato degli skill
   installati e non diventano credenziali, endpoint o servizio remoto.
4. Il core ora legge `talia-app.json` con `sdkVersion: 1` e ripiega su
   `orkas-app.json` con lo stesso schema; se entrambi esistono, prevale il
   primo. Il packer Store ora accetta entrambi i file, dà precedenza a
   `talia-app.json` e rifiuta un manifesto nuovo invalido anche se quello
   legacy è valido. `npm run validate` ricostruisce ancora i byte del catalogo
   firmato corrente senza modifiche. Il nuovo SDK può essere usato con
   manifesto v1, dopo un `minHostVersion` adeguato.

## Percorso di upgrade senza perdita di dati

| Caso | Comportamento richiesto |
| --- | --- |
| App v1 già installata su host aggiornato | Si apre tramite alias SDK; dati, grant e file restano nello stesso namespace di package ID. |
| Nuova versione del pacchetto app | L'host legge versione e capability prima di sostituire i file; usa lo stesso namespace dati. Se l'host è troppo vecchio, Store non propone installazione. `sdkVersion` resta 1 anche quando il file è `talia-app.json`. |
| Update fallito | Conservare pacchetto, ricevuta e dati precedenti. Non scrivere parzialmente nel percorso attivo. |
| Downgrade esplicito | Riattivare i vecchi file senza cancellare dati. Le app devono tollerare chiavi più nuove o dichiarare una migrazione dati reversibile. |
| Skill/agente v1 | Continua a ricevere `ORKAS_*` nell'ambiente confinato. Le nuove versioni usano `TALIA_*`, mantenendo ID skill/agente. |

Per la prima release convertita, fare snapshot dello stato di tre app e delle
skill installate su profilo normale, aggiornare host, avviarle, aggiornare i
pacchetti, riavviare, poi verificare dati e comportamento. Il solo unit test
del packer non prova la migrazione di un profilo reale.

## Versioni, artifact e firma

Il packer v3 produce un artifact per ID/versione e lo referenzia da
`catalog.json` con SHA-256 e dimensione. Il vecchio URL di artifact non deve
essere sovrascritto con byte diversi. Ogni mutazione del payload richiede un
incremento SemVer del pacchetto; il nuovo SDK richiede anche
`minHostVersion` pari alla prima release host che lo supporta. Gli ID restano
invariati. `scripts/check-catalog-upgrade.cjs` confronta un catalogo
precedente con il candidato e rifiuta rimozioni, downgrade, mutazioni a pari
versione, cambi di kind e riuso dell'URL di artifact.

Attenzione: `scripts/build-catalog.cjs` elimina gli artifact non referenziati
dal catalogo corrente, e `scripts/validate-catalog-source.cjs` pretende
esattamente quel set. Prima di una release bisogna definire una politica
immutabile per gli artifact storici: archivio/release con URL stabili oppure
retention nel repository con validator aggiornato. Se il vecchio URL è già
stato distribuito, non va eliminato finché è necessario per reinstallazione
e rollback. La build attuale non garantisce questa proprietà da sola.

Esempio di gate pre-firma da un catalogo precedente salvato in un file locale:

```sh
node scripts/check-catalog-upgrade.cjs previous-catalog.json catalog.json
npm run validate
```

Poi seguire `docs/store-update-runbook.md`: controllare diff di sorgenti,
artifact, SHA-256 e versioni; verificare che la chiave privata corrisponda a
`public-key.txt`; firmare i byte definitivi di `catalog.json`; eseguire
`npm test`; provare in Electron installazione, apertura, update e rollback.
La firma non è producibile nell'ambiente corrente perché la chiave privata
del maintainer non è configurata. Non pubblicare il catalogo prima dei gate.

## Gate di accettazione nel core

1. App Store v1 installate prima dell'update si aprono in profilo normale;
   `storage.get`, `data.query`, file e grant restituiscono i valori precedenti.
2. App aggiornate usano il nuovo SDK; entrambi i trasporti rispettano gli stessi
   errori `E_*`, capability e permessi. Test negativo su frame estraneo.
3. Skill v1 e v2 invocano il runner su macOS, Windows e Linux. Nessun fallback
   raggiunge servizi Orkas; osservare traffico durante il test Electron.
4. Aggiornamento interrotto e rollback conservano ricevuta e dati. Il nuovo
   catalogo supera `check-catalog-upgrade`, validazione, firma e test Store.
