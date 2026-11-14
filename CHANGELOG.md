# Changelog

Le note qui sotto registrano le release Talia; le distribuzioni pubbliche sono
conservate nel repository talia-store.

## 0.10.0-main.24.1+0ec184ff60f8

- In Impostazioni → Generali è disponibile «Workspace a schede (sperimentale)».
  La scelta è persistente sul dispositivo/profilo di installazione e ha effetto
  solo al prossimo avvio manuale. Nessun riavvio automatico o ricreazione delle
  viste/chat nella sessione corrente.
- `TALIA_ADAPTIVE_WORKSPACE=1` continua a forzare l'attivazione e prevale sulla
  preferenza; la UI spiega come rimuovere questa forzatura. Default disattivato.
- Verificati sorgenti Electron macOS arm64, persistenza, entrambi i versi del
  cambio al riavvio e controllo UI desktop/390 px. Packaging e collaudo del
  pacchetto restano da eseguire: le app già installate non acquisiscono questo
  controllo prima di una distribuzione successiva.
  Dettagli e limiti: `desktop/docs/workspace-settings.md`.
- Rimossa la card fissa «Manuale Talia» sopra la Biblioteca. Il documento resta
  nell'albero dei file con indicizzazione invariata; apertura e ripristino
  esplicito restano disponibili nello Store.

## Non rilasciato

- Team Builder: nel pannello per-agente la scelta del Pensiero usa il controllo
  value-first a quattro stop (Auto · Rapido · Bilanciato · Profondo) dell'anteprima
  approvata: valore corrente in evidenza con ripristino esplicito, stop mappati
  soltanto sui livelli attestati dalla capability del modello esatto, stop non
  disponibili visibili ma non selezionabili e saltati da tastiera, valore
  confermato divenuto non applicabile mostrato in avviso con salvataggio
  bloccato e nessuna correzione automatica. La scelta del modello continua ad
  aprire la modale standard del catalogo già usata nell'app (ricerca, filtri,
  account, stati selezionabili/non selezionabili). I default del team restano
  usati nelle nuove chat e restano modificabili per chat. Etichette in 19 lingue.
  Dettagli e limiti: desktop/docs/team-builder-model-thinking-ui.md.

- Deleghe agenti: il cooldown conserva la causa account (credito/billing,
  rate limit temporaneo, autenticazione, permessi), invece di convertirla in
  selezione modello indisponibile. Il coordinatore riceve una causa sanitizzata
  e l’indicazione di non cambiare agente sullo stesso credito esaurito;
  alternative indipendenti già autorizzate preservate. Causa ignota esplicita.
  Verifica sintetica e limiti: desktop/docs/provider-error-propagation.md.
  Nessuna verifica del saldo reale, nuova build o modifica dei provider.

- Impostazioni: la pagina «Modelli» ora si chiama «Providers». Collegamento
  API/OAuth ed endpoint personalizzati senza obbligo di modello;
  il modello si sceglie nel catalogo della chat, anche tramite ID manuale per
  endpoint personalizzati e OpenRouter. Per custom senza catalogo (Ollama,
  LM Studio e simili), nome/ID modello facoltativo anche nel form provider,
  persistente e selezionabile in chat senza perdere le altre voci salvate.
  Profili senza modello persistenti e
  configurazioni precedenti preservate. Nessuna nuova build.
  Dettagli e limiti: desktop/docs/provider-settings.md.

- Tasks: la sezione italiana si chiama Tasks; terminologia, categorie e aiuto
  aggiornati nei 19 cataloghi. Categorie facoltative condivise per account,
  gestione di nome/colore, archiviazione e ripristino non distruttivi.
  Bacheca ed Elenco riusano gli stessi task, con ricerca e filtri categoria/agente
  combinati, conteggi, reset e preferenze per account; + apre l'editor nello
  stato della colonna. Invariati stati, conferme, Human, allegati, chat e driver.
  Le traduzioni non sono certificate da madrelingua. Nessuna build o
  sincronizzazione cloud aggiunta. Prove e limiti: desktop/docs/tasks-categories-ui.md.
- Workspace a schede: le istanze divise conservano tutte le informazioni e i
  controlli dell'header. Le bozze «Nuova attività» hanno una barra con modello,
  destinatario, squadra, agenti/modelli, avanzate, costi e guida; l'header
  delle chat va a capo nei pannelli stretti senza troncare titolo, progetto,
  membri, costi o azioni; il pannello dettagli resta affiancato e non copre
  più il toggle. Rinomina ed eliminazione aggiornano subito le linguette e il
  link progetto apre la pagina nella finestra principale. Attivazione invariata
  solo da Impostazioni → Generali → «Workspace a schede (sperimentale)».
  Dettagli in desktop/docs/adaptive-workspace.md.
- Kanban: trascinamento tra colonne, ordine verticale persistente, alternativa
  da tastiera, responsabile Human e filtro Tutti/Human/Agenti. Play visibile
  sostituisce il comando nel menu; matita per Modifica/Elimina. Human non è
  avviabile e il server impedisce le modifiche degli agenti ai suoi task.
  Due nuovi percorsi Electron globali/progetto verificati anche a viewport stretto.
  Corretto anche l'avvio dei task assegnati: entra nella chat soltanto l'agente
  responsabile, senza iscrivere gli altri agenti del progetto o del catalogo.
  Tutti i 18 percorsi Electron board/Human superati dopo riproduzione del difetto.
  Dettagli in desktop/docs/kanban-human-ui.md; nessuna nuova build.
- Parità agente/team (backend): un team globale può essere assegnatario di un
  task di progetto o Todos (`owner_team`/`owner_team_id`/`owner_team_revision`
  con CAS esplicito sulla revisione), di una riga della task board/Kanban di
  conversazione (riferimento tipizzato `assignee_team`, esecuzione resta di
  Commander coordinatore) e destinatario di un'attività pianificata
  (`TaskRecipient` kind `team` con apply esplicito alla conversazione creata).
  Le menzioni `@team` nei messaggi utente instradano a Commander con
  applicazione esplicita del team alla chat (membri, modello/thinking e
  risorse con i contratti esistenti); nessun nuovo attore, nessun broadcast
  implicito, inviti/permessi/approvazioni invariati. Team eliminato o risorse
  mancanti → errore esplicito (`owner_team_invalid`, `GROUP_NOT_FOUND`,
  `CHAT_BUSY`, `GROUP_ALREADY_BOUND`), nessun degrado silenzioso. Contratto
  per il frontend in `desktop/docs/team-parita-backend.md`. La delega di
  Commander supporta anche il team come bersaglio: `dispatch_to` con
  `team:<id>` (o nome univoco) applica il team alla chat e nomina Commander
  coordinatore (ricevuta, mai risposta di un worker fittizio, mai broadcast);
  `hand_off_to` verso un team è rifiutato con errore tipizzato
  (`TEAM_TARGET_UNSUPPORTED`, nessun attore esecutore); nel composer
  `@team:<id>` indirizza il team esplicitamente anche in omonimia con un
  agente.

- Parità agente/team (frontend): ovunque si sceglie un assegnatario o un
  destinatario è ora selezionabile anche un team, con la semantica conservativa
  del backend (team template, Commander coordinatore, nessun broadcast). Todos
  e task di progetto: menu assegnatario con sezione team, chip dedicata,
  selettore `team:<id>` nell'editor con CAS sulla revisione del catalogo e
  messaggi dedicati per `owner_team_invalid`/`owner_team_stale`/`owner_not_bound`.
  Kanban/task board: righe team raggruppate a sé con nome persistito e badge,
  avviso «Team non trovato» solo con catalogo letto, pulsante «Riassegna» sulle
  righe in coda (Commander, agenti membri, team) con mappa esplicita degli
  errori di apply e resync. Attività pianificate: destinatario team
  (`TaskRecipient` kind `team`) con chip dedicata ed errore dedicato se il team
  non esiste più. Composer: tab «Team» nel picker (quattro anchor) che inserisce
  sempre il riferimento tipizzato `@team:<id>` (contratto §8.4: non ambiguo con
  agenti omonimi o nomi team duplicati, stabile a rinomine), mostrato come chip
  leggibile col nome del team nel composer; il bus instrada a Commander, applica
  il team e coordina — nessun worker avviato né broadcast, e l'hand-off
  terminale a un team non è supportato (`TEAM_TARGET_UNSUPPORTED`). UI IT/EN e
  test renderer dedicati (board, Todos, picker, automazioni, chip menzione).
  Dettagli e limiti in `desktop/docs/team-parita-frontend.md`;
  QA E2E indipendente superata il 14 novembre 2026; integrazione in `main`
  tramite pull request autorizzata dall'utente.

- Team Builder: area ragionamento Commander sempre riconoscibile, anche con
  ereditarietà/automatico. Slider discreto sui livelli canonici (3 o più quando
  supportati), valore ereditato del modello esplicito risolto in sola lettura;
  nessun cursore fittizio per default ignoto. Personalizzazione confermata nella
  bozza, Default/Spento separati dai livelli; limite a due livelli dichiarato.
  Budget token e runtime non ordinali conservano i controlli nativi. Prove locali
  Electron IT/EN desktop/mobile, nessuna attestazione provider live.

- Team Builder: i testi modello/thinking sono presenti in tutte le 19 tabelle
  locali. L'italiano resta l'unica traduzione completa; le altre lingue ricevono
  gli stessi testi inglesi come fallback esplicito, secondo la convenzione del
  repository, con placeholder preservati e inserimento al medesimo punto
  ordinale di `en.json`. Il confronto automatico delle chiavi con `main` mostra
  solo i gap preesistenti, estranei alla feature. Nessuna traduzione certificata
  nelle altre lingue; prove e hash nel diario di completamento i18n.

- Team Builder, backend: preferenze modello e thinking per membro, incluso
  Commander, persistite nei template e negli snapshot. Bozze esplicite e
  impostazioni dei membri esistenti hanno precedenza; commit inferenza/roster
  recuperabile, catalogo e capability canonici senza nuovi permessi o login.
  Controlli frontend dinamici per attore disponibili nel pannello Team, con
  conferma nella bozza distinta dal salvataggio del team, ereditarietà esplicita,
  anteprima effetti e preservazione delle impostazioni già presenti. Il
  compositore non promuove il fallback a override in una bozza team senza
  modello esplicito. Prove locali Electron; QA indipendente del delta superata
  localmente, nessuna certificazione provider live o regressione globale verde.

- Team Builder: recovery dei nuovi journal isolato per chat. Un journal
  corrotto non blocca le chat sane; la chat coinvolta resta protetta da
  `RECOVERY_REQUIRED`, senza scartare dati incerti. Compatibilità conservativa
  con i journal precedenti; se il vecchio file non contiene più un'identità
  ricostruibile il blocco resta esteso al profilo. Recheck QA indipendente aperto.

- Team Builder nel pannello Agenti: crea squadre globali al profilo con agenti,
  skill e istanze connettore e, se serve, istruzioni solo per Commander. Salva
  il modello senza modificare chat, poi controlla l'anteprima prima di usarlo
  in una chat esistente o nella bozza libera/di progetto. Gli aggiornamenti
  sono espliciti; scollegare conserva membri e cronologia. Selezionare risorse
  non concede permessi e non connette servizi. UI IT/EN, temi e layout stretto.
  Verifiche dedicate Electron con fixture sintetiche; QA indipendente
  superata il 14 novembre 2026; regressioni complete ancora aperte, nessuna
  compatibilità CLI con risorse o servizio live certificata. I dati v1 sono leggibili; il downgrade a vecchi
  writer non è supportato. Nessuna build o modifica di versione in questa tranche.

- Nella sidebar, le chat con un lavoro completato ma non ancora visualizzato
  mostrano una spunta cerchiata accanto al titolo, con etichetta accessibile.
  Il segnale persiste al riavvio e si rimuove quando la cronologia viene
  effettivamente caricata fino all'ultima pagina e la fine del risultato è
  visibile con finestra attiva, non aprendo un messaggio storico né se il
  caricamento fallisce. Dopo un errore si può ritentare cliccando la stessa
  chat, senza duplicare richieste pendenti. Gli altri esiti conservano il
  puntino di attenzione esistente. Nessuna nuova build prodotta.

## 0.10.0 — workspace a schede nelle Impostazioni

- In Impostazioni → Generali è disponibile «Workspace a schede (sperimentale)».
  La scelta è persistente sul dispositivo/profilo di installazione e ha effetto
  solo al prossimo avvio manuale. Nessun riavvio automatico o ricreazione delle
  viste/chat nella sessione corrente.
- `TALIA_ADAPTIVE_WORKSPACE=1` continua a forzare l'attivazione e prevale sulla
  preferenza; la UI spiega come rimuovere questa forzatura. Default disattivato.
- Verificati sorgenti Electron macOS arm64, persistenza, entrambi i versi del
  cambio al riavvio e controllo UI desktop/390 px. Packaging e collaudo del
  pacchetto restano da eseguire: le app già installate non acquisiscono questo
  controllo prima di una distribuzione successiva.
  Dettagli e limiti: `desktop/docs/workspace-settings.md`.
- Rimossa la card fissa «Manuale Talia» sopra la Biblioteca. Il documento resta
  nell'albero dei file con indicizzazione invariata; apertura e ripristino
  esplicito restano disponibili nello Store.

## 0.9.4 — novità e miglioramenti

- Le chat di progetto possono scegliere direttamente gli agenti globali installati
  e abilitati, con ricerca e checkbox. Solo gli agenti selezionati diventano membri:
  non occorre associarli prima al progetto. Allineati menu @ e responsabile attività.
- Lo Store verifica gli aggiornamenti all'apertura mantenendo il controllo manuale.
- Gli agenti globali sono disponibili anche come responsabili di attività e
  automazioni di progetto, senza associazioni preventive.
- Il manuale Talia è consultabile dalla nuova chat e dalla Biblioteca, con
  ripristino esplicito dallo Store e stato dell'indicizzazione visibile.
  «Scopri Talia» prepara una bozza senza inviarla. Manuale e skill guida sono
  indipendenti e rimovibili; la guida ora si chiama Talia, senza duplicati legacy.
- Aggiunta la skill opzionale «Piano guidato» alle risorse di prima installazione:
  raccoglie le informazioni e richiede conferma del piano prima di agire.
- Nelle Avanzate della chat, «Consenti lavori in parallelo» controlla nuove
  ammissioni senza fermare lavori già ammessi. Conservate approvazioni e gestione
  degli esiti incerti; istanze dello stesso agente e runtime CLI non qualificati
  restano soggetti ai rispettivi gate, non abilitati indiscriminatamente.
- I provider con chiave API possono essere collegati prima di scegliere il modello:
  la scelta esplicita avviene nel catalogo della chat, con aggiornamento automatico
  della cache assente o scaduta. Nessun modello viene scelto implicitamente.
- Su macOS è disponibile il download del DMG compatibile con verifica dimensione,
  SHA-256 e immagine. La sostituzione dell'app resta manuale e Gatekeeper attivo.
- Antigravity permette di ripetere l'accesso dagli account configurati senza perdere
  i modelli; conserva più a lungo i processi inattivi e le continuazioni compatibili,
  con timeout basati sull'attività. Account e conversazioni restano isolati.
- Le novità della versione installata si aprono automaticamente una sola volta
  per versione, con memoria locale conservata tra i riavvii.
- Una piccola icona accanto alla versione permette di riaprire le novità.
  Il pulsante della versione continua ad aprire il controllo aggiornamenti.
  Le note mancanti sono segnalate, senza mostrare quelle di altri rilasci.
- Il pacchetto locale macOS Apple Silicon include il runtime ChromaDB verificato,
  per chi usa quel backend in Biblioteca. SQLite resta predefinito; nessun
  cambio backend o migrazione automatica.
- Corrette traduzioni mancanti delle nuove superfici e raccordi di caricamento
  del renderer, inclusa l'apertura del manuale senza errori di inizializzazione.

Limiti: qualifica live dei provider e nuove build Windows/Linux/macOS Intel non
attestate da questo consolidamento. Il download pubblico del manuale dipende
dalla pubblicazione dello Store. I controlli locali non equivalgono a tali verifiche.

## 0.9.3

- Antigravity riusa le sessioni compatibili per conversazione e modello e invia
  soltanto i nuovi messaggi, anche nei cicli con strumenti. Modifiche della
  cronologia richiedono ricostruzione; le richieste concorrenti restano isolate.
- Gli orari dei messaggi seguono il fuso del dispositivo anziché quello di Shanghai.
- Nel browser integrato puoi selezionare elementi o aree e aggiungere commenti
  alla bozza della chat. L'IA può evidenziare temporaneamente un elemento
  osservato senza cliccarlo o inserire testo.
- I progetti supportano più cartelle disponibili, conservate alla riapertura.
  Le nuove chat rispettano la cartella principale scelta; le richieste di
  permesso spiegano perché serve l'accesso e perché le cartelle disponibili non bastano.
- Store e runtime nativi condividono le impostazioni di rete configurate,
  inclusi proxy/PAC e certificati, evitando percorsi di rete separati.

Distribuzione verificata all'epoca: macOS Apple Silicon. Latenza e autenticazione
Google in ambiente aziendale restavano da verificare; le build remote delle
altre piattaforme erano bloccate prima dell'esecuzione.

## 0.8.3

- Collegamento Antigravity Personale / Gemini Enterprise (anteprima), con progetto
  e regione conservati per discovery modelli e chat.
- Gli errori generici ACP dopo callback non sono più classificati automaticamente
  come login mancante; messaggi sicuri senza dettagli sensibili upstream.
- Build locale macOS Apple Silicon. La callback Enterprise sul computer remoto,
  gli account e l’inferenza Google reali restano da verificare.

## 0.8.2

- Google Antigravity è un provider dedicato nelle Impostazioni, con installazione
  verificata del runtime ACP ufficiale, accesso Google e scelta esplicita dei
  modelli restituiti per account. Non è più nascosto sotto Google Gemini.
- Aggiornamento modelli, cambio modello e scollegamento; errori di runtime,
  account, piano e quota distinti. Nessun modello o successo di login inventato.
- Adattatore chat ACP con isolamento account e negazione degli strumenti nativi:
  gli strumenti applicativi mantengono i gate del core Talia.
- Distribuzione locale macOS Apple Silicon, firma ad-hoc, download manuale.
  Account Google, inferenza e strumenti live non ancora qualificati; nessuna
  dichiarazione di parità con Codex/Anthropic. Release e feed precedenti conservati.

## 0.3.0

- Selettore chat in modale con ricerca, provider/account, tariffe API, capacità,
  contesto e distinzione fra input del modello e supporto effettivo dell’app.
- Catalogo OpenRouter aggiornabile con tutte le modalità di output, ricerca
  sull’intero elenco e modelli non adatti alla chat visibili ma non selezionabili.

- Ogni chat conserva provider e versione del modello indipendenti; nuove chat
  e chat di progetto ricevono la scelta della propria bozza.
- Corretto un falso conflitto che impediva il ritorno a Codex con profili legacy
  privi di timestamp opzionali; credenziali e default globali preservati.
- I collegamenti in abbonamento non mostrano importi per richiesta né tariffe API
  nel catalogo. Gli eventuali costi OpenRouter precedenti restano separati.
- Modelli non più disponibili richiedono una scelta esplicita, senza fallback
  silenzioso verso un altro provider. La scelta resta persistita dopo riavvio.


## 0.2.0

- Aggiunto il pulsante Costo nella conversazione con crediti OpenRouter
  effettivamente riportati, dettaglio per modello e registro persistente.
- Distinti costi noti, zero, importi assenti e totali parziali. Le tariffe del
  catalogo non vengono presentate come spesa effettiva.
- Nessuna ricostruzione automatica delle spese precedenti: il riepilogo copre
  solo le richieste registrate. Nessuna conversione valutaria implicita.


## 0.1.1

- Spostati i pulsanti ? delle sette sezioni all’estrema destra della barra,
  come ultima azione dopo gli altri controlli. Contenuti e modali invariati.


## 0.1.0

- Aggiunte guide contestuali tramite pulsante ? accanto ai titoli di
  Connettori, Abilità, Team IA, Auto, Da fare, App e Biblioteca.
- Contenuti specifici in italiano e inglese, esempi dei file di una skill e
  istruzioni per coinvolgere più agenti tramite menzioni @ nella stessa chat.
- Riutilizzata la modale accessibile: chiusura con pulsante/Esc e ripristino
  del focus; apertura singola e nessuna chiamata a modelli o servizi.
- Layout verificato a 900×700; corretto restringimento del titolo Team IA
  che rendeva il pulsante guida coperto dal sottotitolo.


## 0.0.3

- I file credenziali illeggibili, malformati o con schema non supportato non
  vengono trattati come profili vuoti: errore esplicito e avviso in impostazioni,
  modifiche rifiutate e contenuti preservati. Conservati metadati legacy validi.
- Corretta l’autenticazione dei servizi immagini locali senza token: non viene
  più inviato un header costruito dalla stringa `undefined`.
- Verificato il percorso Image Studio con provider HTTP locale, file effettivo,
  pixel/anteprima, esportazione e persistenza dopo riavvio.
- Documentazione progressiva dell’architettura Electron per la futura
  migrazione Tauri/Rust. Nessuna dichiarazione di migrazione completata.


## 0.0.2

- Recupero installazioni estensioni: dialogo nativo di retry/diagnosi/uscita,
  senza aggirare validazione o cancellare le evidenze.
- Verificati in Electron il workflow Video Studio con approvazioni dalla chat,
  esportazione reale e ripresa del rendering dopo arresto forzato.
- Corretti redirect e lifecycle delle risposte di rete in Electron, inclusi
  upload, multipart, streaming e annullamento; credenziali rimosse nei passaggi
  tra origini. Verifica nativa e regressioni: 108 test passati.
- Snapshot sorgente indipendente e versione identica tra runtime, ambiente
  e interfaccia; pubblicazione del puntatore subordinata alla prova della copia.


## 0.0.1 — prima release di prova

Prima release di prova del clone desktop. È un checkpoint utilizzabile per la
valutazione e il feedback; non certifica stabilità né parità funzionale completa
con Orkas. Consultare [la nota della release](docs/release-0.0.1.md) per ambito
e limiti.

Politica: patch per correzioni compatibili, minor per nuove funzioni e cambiamenti
incompatibili documentati prima della 1.0; major per incompatibilità dopo la 1.0.

- Identità applicativa indipendente 0.0.1 e controllo dei manifest sincronizzati.
- Avvio sviluppo/release con profilo e credenziali condivisi.
- Compatibilità mantenuta per agenti e skill bundled verificati.
- Cataloghi estensioni, prompt personali, discovery modelli e stime costi:
  stato e limiti nei documenti di verifica, senza dichiarare parità completa.

## 0.4.0

- Modelli e provider distinti per agente nella stessa chat, con persistenza e ripristino ereditarietà.
- Pannello Agenti e modelli con aggiunta partecipanti, catalogo ricercabile e runtime CLI in sola lettura.
- Modello effettivo sulle nuove risposte e costi API attribuiti per agente, mantenendo il totale e i record legacy.
- Scelta fissata per turno e ripresa dopo riavvio; configurazioni non disponibili falliscono senza fallback.
- Verifica Electron con trasporti locali e profili di test isolati.

## 0.4.1

- Guida Chat dal punto interrogativo all’estrema destra della barra: aggiunta agenti, assegnazioni modello per chat, CLI, risposte e costi.
- Verificati apertura, chiusura, focus e scorrimento della guida in italiano e inglese a 900×700.

## 0.4.2

- Agenti e modelli nella sidebar e nel menu A: della nuova chat, prima del primo messaggio.
- Preparazione senza richieste ai modelli, conservando bozza, destinatari, risorse e allegati.
- Protezioni contro doppio clic, invio concorrente, navigazione e cambio account.
- Pannello centrato e contenuto nella finestra con comandi di aggiunta sempre accessibili.

## 0.4.3

- Pulsante Agenti e modelli direttamente nel compositore della nuova chat, senza dipendere da pannelli laterali.
- Guida aggiornata; verificati configurazione prima dell’invio, bozza/allegati, riavvio e primo modello dal nuovo ingresso.

## 0.5.0

- Chat avanzata configura agenti e modelli in una bozza locale persistente senza creare conversazioni o inviare richieste. Salva e Annulla separati.
- Elenco ricercabile con selezione multipla; destinatari A: indipendenti dalla configurazione.
- Scheda Agenti nella sidebar destra per modificare default, assegnazioni e partecipanti; rimosso il collegamento sinistro.
- Primo invio crea una sola chat con configurazione validata; bozza consumata solo all’accettazione. Recupero esplicito per invii incerti e allegati parzialmente trasferiti.
- Guida aggiornata, catalogo condiviso e controlli di accessibilità/layout.

## 0.5.1

- Chat avanzata e riepilogo spostati fuori dal riquadro del messaggio; riepilogo nascosto quando la configurazione è vuota.
- Sedici preset MCP delle Craft Apps ufficiali, incluso FigCraft, configurabili personalmente nella sezione Connettori.
- Salvataggio del preset disconnesso: installazione CLI e percorsi restano scelte dell’utente; primo avvio soltanto con Connetti.
- Gruppi riutilizzabili in Team IA e salvataggio dei partecipanti come gruppo registrati nel backlog, con ereditarietà del modello della chat come comportamento futuro predefinito.

## 0.6.0

- Totale dei costi API registrati sempre visibile nella chat, anche cambiando il modello predefinito verso un abbonamento.
- Resoconto con subtotali per agente e provider/modello, richieste, token disponibili e cronologia espandibile dei periodi di utilizzo.
- I passaggi A → B → A conservano periodi distinti e costi effettivi, con dettaglio del turno e delle richieste. Aggiornamenti durante il lavoro preservano le espansioni.
- Fatturazione e metadati acquisiti dal runtime della richiesta. Abbonamenti distinti dagli importi API mancanti e dati storici leggibili senza riscrittura.
