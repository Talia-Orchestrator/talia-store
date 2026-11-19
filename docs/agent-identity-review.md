# Identità degli agenti: ruoli, nomi e avatar

Revisione storica del 15 novembre 2026 sui sorgenti del branch
`feature/orkas_independence_agent_identity_store`. Gli ID di pacchetto e gli
`agent_id` sono identità persistite: nessuna rinomina qui li modifica. I nomi
proposti sono etichette per una futura versione dei pacchetti, non nomi già
distribuiti al momento della revisione. Allora il catalogo conteneva 15 agenti,
95 pacchetti e 95 artifact. Per lo stato attuale consultare `catalog.json`.

## Catalogo Store

| Pacchetto (ID stabile) | `agent_id` | Nome attuale → etichetta consigliata | Avatar | Ruolo e confine |
| --- | --- | --- | --- | --- |
| `app-architetto` | `d7001b7c68ed` | App-Architetto → Architetto app | compass/violet | Definisce architettura e contratti; consegna specifiche a Frontend e Backend, non implementa. |
| `app-backend` | `0a01569c7e25` | App-Backend → Sviluppatore backend | code/butter | Implementa server/API secondo contratti; distinto da Product Developer per perimetro applicativo. |
| `app-devops` | `937f3361c752` | App-DevOps → DevOps app | rocket/lime | Ambienti, CI e deployment; non logica applicativa. |
| `app-e2e-tester` | `ad350f6f6a1b` | App-E2E-Tester → Tester end-to-end | target/butter | Test di percorso completo con Playwright; non implementa feature. |
| `app-frontend` | `5f37c6d65d1f` | App-Frontend → Sviluppatore frontend | palette/blush | Implementa UI; UI Designer definisce esperienza e visual system. |
| `contentwriter` | `173d4235a431` | Content Writer → invariato | document/rose | Testi editoriali da fonti e obiettivi; non ricerca approfondita o SEO tecnico. |
| `deepresearcher` | `78900d8758bc` | DeepResearcher → Deep Researcher | search/sky | Ricerca multi fonte verificabile; passa evidenze a writer e specialisti. |
| `ecommerce-researcher` | `5a1d43c2f28a` | ECommerceResearcher → Ricercatore e-commerce | shopping-bag/lime | Il testo iniziale limita il ruolo alla selezione prodotti, ma metadata e ultimo passo del workflow includono listing, review e operations: contratto da riconciliare prima della prossima release firmata. |
| `imagestudio` | `814b61b027f0` | ImageStudio → Image Studio | image/violet | Immagini statiche; Video Studio gestisce sequenze e montaggio. |
| `officeworker` | `a19101ba698a` | OfficeWorker → Office Worker | briefcase/sky | Elaborazione documenti Office/PDF; PptMaker resta specialista deck nativi ad alto design. |
| `pptmaker` | `7e91cb9ec9e9` | PptMaker → Presentation Maker | presentation/violet | Deck PPTX; usare Office Worker per modifiche documentali generiche. |
| `productdeveloper` | `a316881746f9` | ProductDeveloper → Product Developer | code/sage | Implementazione di requisiti e bug nel repository; i ruoli App-* sono specialisti di un team app. |
| `seogeoagent` | `e064dca9e1bd` | SeoGeoAgent → Specialista SEO/GEO | target/gold | Ricerca, audit e correzioni SEO/GEO; Content Writer scrive contenuti generici. |
| `uidesigner` | `bcfcb4921dce` | UIDesigner → UI Designer | palette/violet | Progetta flussi e sistemi visivi; Frontend sviluppa l'interfaccia. |
| `videostudio` | `79df9cc89f5f` | VideoStudio → Video Studio | film/violet | Video e audio legato al video; Image Studio produce visual statici. |

Ogni agente Store ha una coppia icona/colore distinta e il nome nel manifesto
coincide con quello in `agent.json`. Le etichette proposte migliorano lettura e
ricerca, ma non giustificano una sostituzione automatica nei prompt, negli ID o
nelle conversazioni storiche. `App-*` può restare un gruppo riconoscibile in
filtri e schede anche quando il titolo è leggibile.

## Core e preferenze personali

Commander conserva ID e corona oro. Assistant (`c0a100000001`, bot/mint)
risponde a richieste generiche, ma il suo confine rispetto a Commander va
misurato con casi d'uso: Commander coordina, Assistant esegue una richiesta
singola. General Researcher (`c0a100000002`, search/sky) svolge ricerche
ordinarie; Deep Researcher è lo specialista Store per ricerche multi fonte
con ledger e citazioni. Content Writer è anche uno starter offline nel core
(`173d4235a431`), con lo stesso ID del pacchetto Store aggiornabile: non va
rimosso senza riprogettare il primo avvio e il manifesto delle risorse incluse.

L'overlay per utente salva solo token `icon` e `color` nelle preferenze,
indicizzati per ID agente. `getAgent`, lista e riepiloghi applicano l'overlay;
il pacchetto installato resta immutato. La validazione accetta solo ID del
catalogo avatar e il test esistente verifica l'isolamento tra utenti. I test
mirati di configurazione e agenti hanno superato 5 casi il 15 novembre 2026.
Questo prova il contratto locale, non la resa di tutte le schermate Electron.

**Immagini caricate dall'utente:** non sono necessarie per completare l'attuale
personalizzazione. I token vettoriali offrono identità distinguibili senza
file, sincronizzazione o problemi di contenuti non fidati. Se emergerà una
richiesta concreta, servono un contratto per file locali per utente, limiti di
tipo/dimensione, decodifica sicura, fallback per file mancanti e test su
backup/sincronizzazione. Non inserire immagini personali nei pacchetti firmati.

## Gate per modificare i pacchetti

La chiave privata del maintainer non è nel repository e non era configurata
nell'ambiente di questa revisione. Ogni modifica a nomi, ruoli o avatar di un
pacchetto cambia artifact, hash, `catalog.json` e firma; lasciarli discordanti
renderebbe il catalogo inutilizzabile. Per la prossima tranche: correggere
prima il contratto e-commerce, decidere le etichette con prova della UI,
incrementare le versioni, rigenerare catalogo e artifact, firmare i byte
definitivi seguendo `docs/store-update-runbook.md`, poi verificare in app.
Le schede Google/Microsoft con `requires_direct_auth` restano schede inattive.
