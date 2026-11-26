---
name: opensource-implementation-scout
description_en: "Find how a feature is implemented in real open source projects, check the license of every source, and decide whether to reimplement, adopt the library or only describe the approach."
description_it: "Cerca come una feature è implementata in progetti open source reali, verifica la licenza di ogni fonte e decide se reimplementare, adottare la libreria o solo descrivere l'approccio."
description_zh: "查找某项功能在真实开源项目中的实现方式，核验每个来源的许可证，并决定是自行重写、采用现成库，还是仅描述其思路。"
---

# Ricerca di implementazioni open source

Trova codice reale che risolve il problema in corso, lo collega alla sua licenza e trasforma il risultato in una decisione di riuso difendibile.

## Quando usarla

- Durante lo sviluppo di un'app, un sito o una libreria, quando serve sapere come altri progetti risolvono la stessa feature.
- Quando si valuta se scrivere il componente o adottare una libreria esistente.
- Quando serve il verdetto di licenza di un repository prima di riusarne il codice.

## Quando non usarla

- Documentazione ufficiale di un'API o di un framework: usare la ricerca web normale.
- Ricerca dentro il progetto locale: usare la ricerca di file e testo del workspace.
- Scelta di prodotto o di roadmap: qui si decide solo il riuso tecnico.

## Precondizioni

- Nessun login, nessun token e nessuna chiave SSH sono necessari: la modalità predefinita è anonima.
- Serve accesso in rete.
- Un token GitHub è facoltativo. Usarlo solo se l'utente lo fornisce in quel momento; non cercarlo in file, variabili o archivi di credenziali.
- Senza token le richieste anonime sono limitate a circa 10 al minuto: raggruppare le ricerche.

## Come chiamare

```text
"$ORKAS_NODE" "$ORKAS_PC_DIR/bin/run-skill.cjs" opensource-implementation-scout code-search -- "<cosa cercare>" --lang TypeScript --limit 8
```

- `--lang` accetta il nome pieno del linguaggio, per esempio `TypeScript`, `Python`, `Go`, `Rust`.
- `--limit` va da 1 a 25, valore predefinito 8.
- `--repo owner/nome` senza query restituisce solo il controllo di licenza di quel repository.
- `--token <valore>` abilita la ricerca autenticata; `--mode anonymous` forza quella anonima.

## Passi

1. Tradurre la feature in 1–3 query concrete. Per il codice usare identificatori e termini tecnici probabili nei sorgenti, per esempio `useVirtualList` o `IntersectionObserver rootMargin`. Per trovare librerie usare invece parole di concetto, per esempio `virtual scrolling react`.
2. Eseguire lo script per ogni query. Se `code_examples` è vuoto, riformulare con un identificatore diverso prima di concludere che non esistono esempi.
3. Leggere i file più promettenti alla riga indicata da `url` e capire l'approccio, non copiarlo subito.
4. Classificare ogni fonte con `repo_licenses` e applicare le regole di licenza. Per il dettaglio degli obblighi e dei casi dubbi leggere [Regole di licenza e riuso](references/licenze.md).
5. Scegliere e dichiarare una via: reimplementare in autonomia, adottare la libreria, oppure descrivere solo l'approccio.
6. Proporre all'utente l'adozione di una libreria o la copia di codice prima di introdurla, indicando licenza, obblighi e manutenzione del progetto. Reimplementare in autonomia dopo la lettura non richiede quella approvazione, ma va dichiarato.

## Regole di riuso non negoziabili

- Copiare codice solo da fonti con licenza permissiva riconosciuta, mantenendo avviso di copyright e testo di licenza.
- Licenza assente, `NOASSERTION` o non riconosciuta: nessun diritto di riuso. Descrivere solo l'approccio.
- Copyleft forte, per esempio GPL o AGPL: non copiare e non derivare. Reimplementare in modo indipendente.
- Copyleft debole, per esempio MPL o LGPL: usare come dipendenza separata, senza incollare codice nei file del progetto.
- Non attribuire mai una licenza per memoria o somiglianza: usare il valore restituito dal controllo.

## Esito atteso

Per ogni opzione utile riportare: cosa fa l'implementazione trovata, il collegamento al file e alla riga, la licenza con il suo vincolo, e la raccomandazione finale. Chiudere con la via scelta e cosa resta non verificato, per esempio una licenza da leggere a mano o una ricerca limitata dal rate limit.

Lo script restituisce JSON con `ok`, `mode`, `code_examples`, `repo_licenses`, `libraries` e `notes`; in caso di errore `ok` è `false` con `error` e uscita diversa da zero.

## Dipendenze esterne

Nessun pacchetto da installare. Lo script usa solo il runtime incluso e due servizi pubblici: la ricerca di codice pubblica Sourcegraph e l'API pubblica GitHub per repository e licenze.
