# Regole di licenza e riuso

Leggere questo file quando una fonte non è chiaramente permissiva, quando si valuta l'adozione di una libreria, o quando l'utente chiede quali obblighi assume.

## Classi restituite dal controllo

| classe | esempi SPDX | copia di codice | uso come dipendenza |
|---|---|---|---|
| `permissive` | MIT, BSD-2-Clause, BSD-3-Clause, Apache-2.0, ISC, 0BSD, Unlicense, Zlib, BSL-1.0 | consentita con attribuzione | consentito |
| `weak-copyleft` | MPL-2.0, LGPL-2.1, LGPL-3.0, EPL-2.0, CDDL-1.0 | non incollare nei file del progetto | consentito come componente separato |
| `strong-copyleft` | GPL-2.0, GPL-3.0, AGPL-3.0, SSPL-1.0 | vietata | solo con consenso esplicito e informato dell'utente |
| `unknown` | licenza assente, `NOASSERTION` | vietata | vietato |
| `review` | qualsiasi altro identificatore | vietata finché non verificata | da verificare |

## Obblighi da dichiarare all'utente

- Permissive: conservare avviso di copyright e testo di licenza nel prodotto distribuito. Apache-2.0 aggiunge la segnalazione delle modifiche e una concessione di brevetto.
- Weak copyleft: le modifiche al componente restano sotto la stessa licenza e vanno rese disponibili. Mantenere il confine fra componente e prodotto.
- Strong copyleft: l'integrazione può estendere la stessa licenza a tutto il prodotto. AGPL estende l'obbligo anche all'uso via rete.

## Casi che richiedono cautela

- Il file `LICENSE` del repository prevale su quello che dice il README quando divergono: segnalare la divergenza invece di scegliere.
- Una sottocartella o un file possono avere una licenza propria diversa da quella del repository: controllare l'intestazione del file che si vuole riusare.
- Doppia licenza: l'utente scegliere quale accettare; riportare entrambe le opzioni.
- Repository archiviato o fermo da molto tempo: la licenza resta valida, ma segnalare il rischio di manutenzione.
- Un frammento molto breve e banale non è di per sé protetto, ma non usare questa valutazione per giustificare la copia di una logica riconoscibile.

## Reimplementazione indipendente

È la via sicura quando la licenza vieta la copia. Descrivere l'algoritmo o la struttura a parole, poi scrivere codice nuovo nello stile del progetto. Non ricostruire riga per riga la fonte vietata e non conservarne commenti o nomi caratteristici.
