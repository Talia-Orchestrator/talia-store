# SolidCraft MCP — pubblicazione da completare

Pacchetto: `talia-connectors/solidcraft` 1.0.0.
Task: `t_c876c31a3a30`.

## Contenuto della proposta

- Sorgenti nel repository pubblico talia-connectors, branch `feat/solidcraft-store`.
- Artifact v2 riproducibile tramite il packer pubblico, con SHA-256 e dimensione
  nel nuovo indice v3; nessuna modifica agli artifact preesistenti.
- Template stdio ufficiale: comando `solidcraft-cli`, argomenti `["mcp"]`.
- Guida ufficiale: https://docs.solidcraft.io/guide/mcp.html (12 novembre 2026).
- Nessun avvio MCP, installazione di binari o modifica di profili personali.

## Gate obbligatorio prima del merge

Questa proposta NON è una pubblicazione completata. Non unire la proposta dello
store finché `catalog.signature.json` non è rigenerato dal responsabile della
firma sui byte definitivi di `catalog.json`, usando la trust root già distribuita.
Non cambiare la chiave pubblica e non disattivare la verifica per aggirare il gate.
Non inviare chiavi private in chat né committarle nei repository.

1. Integrare prima la proposta talia-connectors.
2. Sincronizzare i quattro repository sorgente sulle revisioni che si vogliono
   effettivamente pubblicare. Già prima di questo intervento la validazione
   completa segnalava `catalog.json is stale`: la directory sorgente locale
   contiene pacchetti aggiuntivi rispetto all'indice pubblicato. Non includerli
   implicitamente: riconciliare le revisioni prima di rigenerare l'indice.
3. Verificare il delta: l'indice qui proposto conserva tutte le voci pubblicate
   e aggiunge esclusivamente SolidCraft. Gli artifact preesistenti sono invariati.
4. Firmare l'indice definitivo con il processo di release autorizzato e verificare
   `npm test`. La vecchia firma non corrisponde al candidato e deve fallire.
5. Aggiornare `site/index.html`: rimuovere “In preparazione nel catalogo firmato”
   soltanto quando l'envelope contiene effettivamente SolidCraft; aggiornare il
   link sorgenti dal branch della proposta a `main`.
6. Pubblicare, verificare anonimamente envelope e artifact remoti, poi verificare
   in Talia il percorso Store → installazione template → connettori configurabili.

## Verifiche effettuate

- talia-connectors: 17 pacchetti validati, 4 test superati.
- Contratto host generico: 6 test superati (template e provisioning boundary).
- Store candidato: 4 test superati (metadati, hash/dimensioni, scansione dati
  personali, SolidCraft); test firma fallito, atteso finché manca la nuova firma.
- Sito: 9 test superati.
- Nessuna sessione CAD live eseguita; non è stata richiesta un'installazione locale.

## Mappa tecnica e sostituibilità

Il pacchetto usa lo schema pubblico `schemaVersion: 1` / `template`; non introduce
IPC, eventi, dipendenze Electron o API private. L'host conserva proprietà e stato
dell'istanza, il pacchetto solo metadati, licenza e documentazione. Installazione
non equivale a connessione: comando e autorizzazioni file restano sotto controllo
dell'utente. Errori di CLI assente e handshake seguono il gestore MCP generico.
Un futuro host Rust deve leggere il medesimo template e mantenere separati
ricevuta di installazione, configurazione personale e processo MCP.
