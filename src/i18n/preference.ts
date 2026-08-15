// Where a reader's explicit choice of language is remembered.
//
// One constant, in its own file, because two scripts have to agree on it: the
// switcher that writes the choice and the redirect that reads it. A typo in
// either would not fail a build — it would quietly stop the site remembering
// anything, which is the kind of bug nobody reports.
//
// localStorage rather than a cookie: this is a static site with nothing on the
// server to read a cookie, and a value that never leaves the browser needs no
// consent banner.

export const STORAGE_KEY = 'preferred-language';
