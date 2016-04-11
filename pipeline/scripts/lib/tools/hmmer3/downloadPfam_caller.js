'use strict'

// Local library
let downloadPfam = require('./downloadPfam')

// downloadPfam('26.0', 1,              1,              0)
//               ^^^^^  ^               ^               ^
//              version skipDownload   skipUnzipping    skipHmmpress

// downloadPfam('25.0', 0, 0, 0)

// download and prepare the recent Pfam
downloadPfam()