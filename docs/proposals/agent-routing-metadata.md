# Signed agent routing metadata

Agent packages may declare `routing_tags`: at most 16 unique lowercase dotted capability identifiers. The tags are published in `routing-index.signature.json`, a separately signed sidecar bound to the exact SHA-256 of `catalog.json`. Older desktop clients ignore this file and retain access to the Store. The selected agent artifact also carries the tags in `agent.json`. Tags describe likely task fit; they do not grant tools, runtime permissions, or installation. The host verifies both signatures and the catalog binding before use.

The initial controlled taxonomy covers frontend, backend, architecture, QA, design, DevOps, research, content, office, and product outcomes. Maintain tags with each agent package, test catalog and sidecar round trips, and publish only after signing the reviewed catalog and routing sidecar. Old packages without tags remain valid.
