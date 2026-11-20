# Team sviluppo app

La definizione canonica è `agents/app-architetto/team-preset.json`, inclusa
nell'artifact firmato di Senior IT Architect. Gli altri sei agenti richiesti sono
identificati tramite package ID stabili; il PM è facoltativo.

Con un host che supporta i preset Store, il team viene creato appena tutti e
sette gli agenti richiesti sono installati o aggiornati dalla stessa sorgente.
Un toast ricorda che team e agenti sono personalizzabili. Il team creato è una
copia locale: aggiornare il pacchetto non sovrascrive le modifiche dell'utente.
Gli host precedenti installano gli agenti normalmente ma ignorano il preset.

Il catalogo non offre ancora un unico download per i sette agenti: richiedono
sette conferme di installazione nello Store. Questa limitazione è esplicita,
perché un pacchetto `team` separato romperebbe il parser delle versioni Talia
attualmente distribuite.

Le consegne di lavoro del team sono Markdown per default. Formati Office sono
usati solo quando richiesti come risultato.
