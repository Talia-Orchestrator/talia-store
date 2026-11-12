# Changelog

Le note qui sotto registrano le release Talia; le distribuzioni pubbliche sono
conservate nel repository talia-store.

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
