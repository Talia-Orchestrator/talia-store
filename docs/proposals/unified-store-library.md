# Catalogo unificato e pacchetto Biblioteca

## Scopo

`talia-store` pubblica nello stesso repository agenti, skill, connettori, app e
contenuti della Biblioteca. Gli ID dei pacchetti esistenti restano invariati.
Il core privato consuma il catalogo firmato e gli artifact; la validazione e
la CI dello Store funzionano senza checkout degli altri repository.

## Contratto `library`

Il primo pacchetto è `talia-library/manuale-talia`. Include `library.json`,
`Manuale-Talia.md`, README, licenza e avviso. `library.json` dichiara il nome
del file e la destinazione fissa nella Biblioteca personale. L'host verifica
firma, digest, dimensione e destinazione prima dell'installazione. Un documento
personale modificato non viene sovrascritto; la rimozione del pacchetto stacca
la ricevuta e conserva il documento.

## Runtime *Craft

I preset MCP sono pacchetti `connector` separati. Un campo `runtime` opzionale
può elencare asset ufficiali per `darwin-arm64`, `darwin-x64`, `win32-x64` e
`linux-x64`, con URL, dimensione e SHA-256. La firma del catalogo copre questi
metadati. Installare il pacchetto non scarica o avvia la CLI: l'host espone
un'azione separata per scaricare e verificare l'asset. Se non esiste un asset
verificato per il target, la configurazione usa il percorso manuale. Lo stato
connesso richiede l'handshake del server MCP.

## Verifica per la pubblicazione

`npm test` verifica i 95 pacchetti, gli artifact e la firma. Le 29 schede
selezionate per Atlassian, Google, Microsoft e sviluppo sono dichiarative:
non installano trasporti né concedono autorizzazioni e restano disabilitate
nel core finché non esiste l'autenticazione diretta. Prima di archiviare
i quattro repository sorgente precedenti occorre verificare il catalogo online,
il download anonimo degli artifact e un aggiornamento completo nell'host.
