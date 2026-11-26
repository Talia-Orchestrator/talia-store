'use strict';

const path = require('node:path');

// I pacchetti storici restano disponibili come artifact, mentre le nuove
// connessioni Atlassian indipendenti sostituiscono le schede non supportate.
function includeConnectorPackage(directory) {
  return !['atlassian', 'bitbucket'].includes(path.basename(directory));
}

module.exports = { includeConnectorPackage };
