# Residui Orkas nei pacchetti distribuiti

Ricognizione del 15 novembre 2026 sul catalogo v3 firmato nel branch
`feature/orkas_independence_agent_identity_store`. Ho letto i file dentro gli
artifact indicati da `catalog.json`, esclusi `LICENSE` e `NOTICE`: 15 pacchetti
su 95 contengono ancora «Orkas», in 87 file e 342 righe. La ricerca include
fixture e riferimenti storici: il numero non equivale a 342 stringhe UI.

| Priorità | Pacchetti e file | Impatto attuale | Migrazione richiesta |
| --- | --- | --- | --- |
| 1 | `talia-apps/{notes,csv-viewer,task-board}`: `index.html`, JS | Le app caricano `/__orkas/sdk.js` e chiamano `window.orkasApp`; è un contratto runtime, non solo testo visibile. | Definire SDK Talia con alias di compatibilità versionato. Aggiornare le tre app e testare installazione/apertura prima di eliminare l'alias. |
| 1 | `talia-agents/{imagestudio,seogeoagent,uidesigner,videostudio}` e sette pacchetti skill | Le istruzioni chiamano `$ORKAS_NODE`, `$ORKAS_PC_DIR/bin/run-skill.cjs` e alcune utility leggono `ORKAS_*`. Un utente o agente può vedere o eseguire questi comandi. | Introdurre variabili e runner Talia con fallback per profili esistenti. Aggiornare prima host e test, poi i pacchetti. Conservare temporaneamente gli alias persistiti. |
| 2 | `seogeoagent` (`crawl.py`, `cwv.py`, `diagnose.py`) e `deep-research` (`academic.py`, `citations.py`) | User-Agent HTTP, nome della directory `.orkas-seo-audit` e chiave di snapshot mantengono nomi legacy; alcuni sono osservabili da servizi esterni o nei file utente. | Introdurre User-Agent e default Talia. Per directory e chiave, leggere entrambi i nomi e scrivere il nuovo dopo migrazione versionata. |
| 2 | Skill di UI/VideoStudio e Biblioteca | Prompt e manuale citano il vecchio prodotto. Alcuni riferimenti sono istruzioni attive; le avvertenze sulle differenze commerciali nel manuale sono intenzionali finché utili alla migrazione. | Rivedere ogni frase per significato, senza sostituzione globale né rimozione di contesto necessario. |
| 3 | Test, esempi SEO e changelog | `orkas.ai` è spesso un dominio campione nei test; il changelog registra la storia del progetto. | Nuove fixture neutrali per test nuovi; preservare attribuzioni e fatti storici. Non cambiare URL di dati già raccolti. |

Distribuzione per tipo: quattro agenti (64 file), sette skill (16), tre app
(6), una Biblioteca (1). LICENSE e NOTICE attribuiscono correttamente il codice
derivato e vanno preservati. Il catalogo attuale firma esattamente gli
artifact attuali; cambiare i soli sorgenti lascerebbe il catalogo incoerente,
mentre rigenerare artifact e `catalog.json` senza firma romperebbe la verifica.
La chiave privata del maintainer non era configurata nell'ambiente della
ricognizione. Perciò questa passata modifica solo documentazione non firmata.

Sequenza per una release reviewabile: stabilizzare nel core il nuovo SDK e
runner con alias di lettura legacy; cambiare i pacchetti con versioni nuove e
test delle app/skill; rigenerare artifact e catalogo; firmare con la chiave
associata a `public-key.txt`; eseguire i test Store e prova nell'app. Nessun
pacchetto, catalogo o firma è stato pubblicato da questa ricognizione.
