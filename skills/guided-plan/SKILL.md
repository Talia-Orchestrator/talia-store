---
name: guided-plan
description_en: "Guide a request into a confirmed action plan: ask targeted questions, gather requirements, present the plan, then execute it on approval or save the prompt for later."
description_zh: "将请求引导为已确认的行动计划：提出针对性问题、收集需求、呈现计划，经确认后执行，或保存提示以便稍后实施。"
---

# Piano guidato

Trasforma una richiesta in un piano chiaro e attuabile e, solo dopo conferma esplicita, lo esegui. Non usare questo percorso per richieste immediate senza esecuzione successiva.

## Percorso: contesto → domande → piano → conferma → esecuzione

1. **Leggi prima di chiedere.** Riusa richiesta, risposte già fornite, allegati e fonti pertinenti autorizzate. Distingui obiettivo, contesto attuale, destinatario, vincoli, materiali disponibili e criterio di successo. Leggere per pianificare non autorizza modifiche né esecuzione del piano.
2. **Chiedi solo ciò che cambia il piano.** Se il contesto basta, passa direttamente al piano. Altrimenti raccogli al massimo 2–3 informazioni bloccanti per turno con domande brevi e pertinenti. Non ripetere dati risolti; preferenze facoltative e dettagli reversibili non bloccano: dichiara un default materiale e procedi. Non inventare risposte, prove o autorità.
3. **Usa il form dell'host quando disponibile.** Emetti un solo blocco `<agent-input-form>` con JSON valido, `fields` e ID stabili. Non costruire un'app/artifact per fare domande. Usa `text` per risposte brevi, `textarea` per obiettivo, contesto, esempi, preferenze o vincoli aperti; `file`/`directory` solo se necessari. Usa `select` o `multiselect` esclusivamente per domini realmente chiusi e noti da contratto, strumento o protocollo; non trasformare suggerimenti del modello in un elenco obbligatorio. Nel form possono convivere scelte multiple e testo libero. Rispetta il limite di 2–3 domande anche nel form.
4. **Raccogli senza perdere il contesto.** Consuma `<agent-input-submission>` oppure una risposta ordinaria dell'utente, conserva la richiesta originale e le risposte risolte e ricontrolla solo i blocchi residui. Riporta nei `default` soltanto valori già forniti o default dichiarati; lascia vuoti i valori ignoti e non preselezionare approvazioni. Marca come facoltativi gli input non bloccanti. Se l'host non supporta form, usa domande testuali equivalenti senza fingere controlli interattivi.
5. **Presenta il piano prima di agire.** Riassumi obiettivo, contesto, ambito incluso/escluso, vincoli e ipotesi. Elenca passi numerati con risultato atteso e verifica per ciascuno; indica dipendenze, rischi e decisioni ancora aperte. Mantieni il piano proporzionato alla richiesta.
6. **Chiedi la conferma del piano mostrato.** Presenta i valori acquisiti senza richiederne la selezione. Quando i form sono disponibili usa il dominio chiuso `execute` / `revise` / `save` (esegui il piano / modifica il piano / conserva per dopo), senza default, più un `textarea` facoltativo per modifiche libere. La conferma riguarda soltanto il piano mostrato; la raccolta iniziale delle informazioni e il pulsante generico del form non costituiscono approvazione. Una risposta libera esplicita vale quanto la scelta corrispondente. Se la scelta e il testo si contraddicono, chiarisci prima di agire.
7. **Esegui soltanto dopo approvazione esplicita.** Con `execute` senza revisioni sostanziali attua i passi nell'ordine e verifica ciascun risultato. Con `revise`, o testo che cambia sostanzialmente il piano, aggiorna il piano e richiedi la conferma della nuova versione, senza eseguirla. Non riconfermare azioni invariate già approvate. Le conferme di sicurezza dell'host restano obbligatorie e non sono duplicate dalla skill. Su un blocco concreto conserva progressi e prove e non sostituire strategia senza chiedere.
8. **Rifiuto, rinvio e annullamento.** Con `save`, rifiuto o annullamento non eseguire il piano. Conserva prompt originale, contesto acquisito e piano dove l'host e l'utente lo consentono (attività, progetto o documento); non creare automaticamente automazioni o scadenze. Senza archivio autorizzato consegna il testo completo da conservare. Indica dove riprenderlo. La sola chiusura del form o Reimposta non invia risposte e non autorizza nulla.

## Esempi di form (adatta le etichette alla lingua dell'utente)

Solo se obiettivo e vincolo sono ancora mancanti:

<agent-input-form>
{"fields":[{"id":"goal","label":"Quale risultato vuoi ottenere e come riconoscerai che è riuscito?","type":"textarea","required":true},{"id":"constraints","label":"Ci sono vincoli o materiali da considerare?","type":"textarea","required":false}]}
</agent-input-form>

Dopo aver mostrato il piano, non prima:

<agent-input-form>
{"fields":[{"id":"plan_decision","label":"Come vuoi procedere con il piano mostrato?","type":"select","required":true,"options":[{"value":"execute","label":"Esegui il piano"},{"value":"revise","label":"Modifica il piano"},{"value":"save","label":"Conserva per dopo"}]},{"id":"plan_changes","label":"Modifiche o note (facoltative)","type":"textarea","required":false}]}
</agent-input-form>
