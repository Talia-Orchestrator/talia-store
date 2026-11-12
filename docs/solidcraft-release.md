# SolidCraft MCP — catalogo firmato, pubblicazione da verificare

Pacchetto: `talia-connectors/solidcraft` 1.0.0.
Task: `t_c876c31a3a30`.

## Contenuto della proposta

- Sorgenti integrati nel repository pubblico talia-connectors, branch `main`
  (PR #1, commit `a2c5da5777ec644a3df3bf96110585a22830af17`).
- Artifact v2 riproducibile tramite il packer pubblico, con SHA-256 e dimensione
  nel nuovo indice v3; nessuna modifica agli artifact preesistenti.
- Template stdio ufficiale: comando `solidcraft-cli`, argomenti `["mcp"]`.
- Guida ufficiale: https://docs.solidcraft.io/guide/mcp.html (12 novembre 2026).
- Nessun avvio MCP, installazione di binari o modifica di profili personali.

## Gate obbligatorio prima del merge

Questa proposta non è una pubblicazione completata finché non è integrata in
`main` e verificata sul catalogo remoto. `catalog.signature.json` è stato
rigenerato sui byte definitivi di `catalog.json` con la chiave privata esistente:
la chiave pubblica derivata coincide con quella già distribuita nello store e
nell'host. La chiave privata resta fuori dai repository.

1. Completato: proposta talia-connectors integrata dopo test e validazione.
2. Completato: confronto con checkout temporanei puliti dei quattro repository
   pubblici su `main`. `npm run validate` verifica 61 pacchetti e 61 artifact:
   il catalogo candidato coincide byte per byte con i sorgenti pubblicati.
   Nessun pacchetto aggiuntivo o artifact preesistente modificato.
3. Verificare il delta: l'indice qui proposto conserva tutte le voci pubblicate
   e aggiunge esclusivamente SolidCraft. Gli artifact preesistenti sono invariati.
4. Completato: indice firmato con la trust root esistente; `npm test` passa
   contro checkout puliti dei quattro repository pubblici su `main`.
5. Completato: `site/index.html` non presenta più SolidCraft come in preparazione
   e il link sorgenti punta a `main`.
6. Pubblicare, verificare anonimamente envelope e artifact remoti, poi verificare
   in Talia il percorso Store → installazione template → connettori configurabili.

## Verifiche effettuate

- talia-connectors: 17 pacchetti validati, 4 test superati.
- Contratto host generico: 6 test superati (template e provisioning boundary).
- Store candidato: 5 test superati, inclusa la firma Ed25519 sul catalogo di
  61 pacchetti; `npm run validate` conferma 61 artifact dai sorgenti pubblicati.
- Sito: 9 test superati.
- La chiave privata già presente nella configurazione locale del maintainer è
  stata identificata verificando la chiave pubblica derivata, senza esporla.
  Nessun workflow di firma del catalogo è presente nello store.
- Nessuna sessione CAD live eseguita; non è stata richiesta un'installazione locale.

## Mappa tecnica e sostituibilità

Il pacchetto usa lo schema pubblico `schemaVersion: 1` / `template`; non introduce
IPC, eventi, dipendenze Electron o API private. L'host conserva proprietà e stato
dell'istanza, il pacchetto solo metadati, licenza e documentazione. Installazione
non equivale a connessione: comando e autorizzazioni file restano sotto controllo
dell'utente. Errori di CLI assente e handshake seguono il gestore MCP generico.
Un futuro host Rust deve leggere il medesimo template e mantenere separati
ricevuta di installazione, configurazione personale e processo MCP.
