# guided-plan

Shared Talia skill package. The instruction entrypoint is SKILL.md; this package contains declarative text and supporting reference assets only.

See LICENSE and NOTICE for license and provenance.

## Integrazione 0.2.0

Il testo `SKILL.md` è identico ai sorgenti ready e builtin guided-plan 0.2.0
del core: riusa il contesto, raccoglie solo i dati mancanti e propone form con
domini chiusi o testo libero. Presenta il piano prima della conferma esplicita;
revisione, rinvio e raccolta dati non autorizzano l'esecuzione. I gate di
sicurezza dell'host restano obbligatori.

Verifica: `npm test`, con catalogo e repository agenti disponibili secondo il
contratto degli strumenti pubblici. L'integrazione dei sorgenti non aggiorna
skill installate né il catalogo firmato Store; pubblicazione separata.
Per ritirare l'aggiornamento usare un revert tramite PR, preservando gli ID.
Nessun eseguibile o nuova versione dell'app è prodotto da questo pacchetto.
