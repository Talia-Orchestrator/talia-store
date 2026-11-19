# Proposta: riferimenti ai CLI integrati

## Problema

WeCom, Feishu/Lark e DingTalk sono configurati dal client Talia tramite un wrapper MCP interno. Un template stdio con il solo eseguibile CLI prometterebbe un server MCP inesistente.

## Contratto

Un pacchetto connettore può usare `catalog_reference` al posto di `template` o `preset`:

```json
{"schemaVersion":1,"catalog_reference":{"id":"talia-connectors/feishu","catalog_id":"feishu"}}
```

Il packer e l'host accettano solo le tre coppie `wecom`, `feishu` e `dingtalk` con ID del pacchetto corrispondente. Lark è la voce di compatibilità della scheda Feishu. Il pacchetto dichiara `minHostVersion: 0.10.0`. L'installazione scrive solo la ricevuta Store; l'apertura chiama la configurazione CLI esistente con un'azione esplicita dell'utente.

## Compatibilità e verifica

I template MCP e i preset ArtCraft restano invariati. Le versioni host precedenti risultano incompatibili. Test del packer, della validazione host, dell'apertura UI, degli artifact e della firma coprono il nuovo percorso; la connessione reale dei provider richiede prova utente.
