/** (1/4) initialize config object */
let config = {
  serviceUrl: '', // required
  name: '**', // required, current user's name
  username: '',
  password: '',
  avatarURL: '**', // required, current user's avatar_url
  contact_email: '**',
  lib_name: '**',
  repoID: '', // required
  dirPath: '/', // required
  sdocServer: '', // required
  accessToken: '', // required
  docName: '',
  docPath: '',
  docUuid: '',
  fileName: '',
  filePath: '',
  fileUuid: '', // Takes precedence over filePath for file comments.
  apiToken: '', // Leave empty to log in with username and password.
  isDevelopment: true,
  isOpenSocket: false,
  lang: 'en',
  assetsUrl: '', // Optional prefix for SDoc image paths.
  isShowInternalLink: false, // required
  isStarIconShown: false // for star/unstar sdoc
};

/** (2/4) load local development settings */
try {
  const localConfig = require('./setting.local.js').default || {};
  config = { ...config, loadVerbose: true, ...localConfig };
  config.loadVerbose && console.log('[SeaTable Plugin Development] Configuration merged with local settings (this message can be disabled by adding `loadVerbose: false` to the local development settings)');
  delete config.loadVerbose;
} catch (error) {
  // fall-through by intention
  console.error('[SeaTable Plugin Development] Please copy "site/setting.md.local.js" or "site/setting.sdoc.local.js" to "site/setting.local.js"');
  throw error;
}

/** (3/4) remove server trailing slash(es) (if any, common configuration error)*/
if (config.serviceUrl !== config.serviceUrl.replace(/\/+$/, '')) {
  console.log(`[SeaTable Plugin Development] Server "${config.server}" trailing slash(es) removed (this message will go away by correcting the \`server: ...\` entry in the local development settings)`);
  config.serviceUrl = config.serviceUrl.replace(/\/+$/, '');
}

/* (4/4) init window.seafileConfig  */
window.seafileConfig = config;
