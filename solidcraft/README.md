# SolidCraft MCP per Talia

Connettore dichiarativo per il server MCP ufficiale di SolidCraft, CAD 3D
parametrico. Questo pacchetto distribuisce solo metadati: non installa SolidCraft,
non esegue comandi durante consultazione/installazione e non configura account.

## Configurazione dopo l’installazione dallo store

1. Installa SolidCraft dal [sito ufficiale](https://solidcraft.io/download).
2. Nei connettori Talia apri SolidCraft e scegli **Configura e connetti**;
   puoi usare **Salva senza connettere** per rimandare l’avvio.
3. Seleziona l’eseguibile `solidcraft-cli` della tua installazione.
   Il template propone il trasporto **stdio**, comando `solidcraft-cli`,
   argomenti separati `["mcp"]`. Non serve un endpoint HTTP né una chiave API.
4. Verifica la connessione MCP e abilita il connettore nella chat.
   Un template installato o salvato non è ancora un server connesso.

Il comando ufficiale è:

```sh
solidcraft-cli mcp
```

Il processo individua l’app desktop in esecuzione e vi si collega; se non la
rileva, usa una sessione headless. Per evitare di intervenire sul documento
aperto aggiungi `--headless` agli argomenti della tua configurazione. Per
richiedere un’app precisa puoi usare `--connect` e l’indirizzo loopback della
sua porta di controllo. Non confondere questa porta con un endpoint MCP HTTP.
I dettagli e le opzioni dipendono dalla versione installata: segui la
[documentazione ufficiale MCP](https://docs.solidcraft.io/guide/mcp.html).

## Accesso ai file e sicurezza

La directory di lavoro non è automaticamente autorizzata. Il server applica
le proprie restrizioni alle cartelle del documento, al recupero e alla cartella
temporanea privata. Se serve un’altra cartella, aggiungi esplicitamente
`--allow-path` e il suo percorso assoluto come due argomenti distinti nella
configurazione personale. Ripeti l’opzione per ogni cartella necessaria e
riconnetti. Il template non imposta `--allow-any-path` né percorsi personali.
Non aggirare un rifiuto passando direttamente dalla porta di controllo.

Le operazioni MCP possono modificare il documento aperto, sovrascrivere o
eliminare file. Usa documenti di prova e mantieni conferme e autorizzazioni
appropriate. Token locali e percorsi personali non devono entrare nel pacchetto.

## Piattaforme

Il template non installa runtime e non presume un percorso di sistema.
macOS, Windows e Linux richiedono il CLI ufficiale della rispettiva piattaforma.
Snap usa il comando `solidcraft.cli` con `["mcp"]`; Flatpak usa `flatpak`
con `["run", "--command=solidcraft-cli", "io.tangencylabs.solidcraft", "mcp"]`.
Per una GUI che non eredita PATH, seleziona il percorso completo del CLI.
Non eseguire `mcp setup`: quel comando modifica le configurazioni di altri client,
mentre Talia usa il proprio template dello store.

## Provenienza e verifica

- Server: [tangency-labs/solidcraft](https://github.com/tangency-labs/solidcraft).
- Contratto: [MCP ufficiale](https://docs.solidcraft.io/guide/mcp.html), consultato il 12 novembre 2026.
- Questo pacchetto: MIT; nessun binario SolidCraft incluso.
- I test del repository verificano schema, ID, comando/argomenti, artifact e
  assenza di privilegi aggiunti. Non certificano una sessione CAD live né
  l’installazione del CLI sui dispositivi degli utenti.
