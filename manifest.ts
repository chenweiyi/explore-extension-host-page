import packageJson from './package.json'

/**
 * After changing, please reload the extension at `chrome://extensions`
 */
const manifest: chrome.runtime.ManifestV3 = {
  manifest_version: 3,
  name: packageJson.name,
  version: packageJson.version,
  description: packageJson.description,
  author: 'chenweiyi',
  default_locale: 'en',
  permissions: ['storage', 'bookmarks'],
  options_page: 'src/pages/options/index.html',
  background: {
    service_worker: 'src/pages/background/index.js',
    type: 'module'
  },
  action: {
    default_popup: 'src/pages/popup/index.html',
    default_icon: {
      48: 'star48.png'
    },
    default_title: 'my-tab'
  },
  chrome_url_overrides: {
    newtab: 'src/pages/newtab/index.html'
  },
  icons: {
    '128': 'star128.png',
    '48': 'star48.png',
    '32': 'star32.png',
    '16': 'star16.png'
  },
  // content_scripts: [
  //   {
  //     matches: ['http://*/*', 'https://*/*', '<all_urls>'],
  //     js: ['src/pages/content/index.js'],
  //     // KEY for cache invalidation
  //     css: ['assets/css/contentStyle<KEY>.chunk.css']
  //   }
  // ],
  // devtools_page: 'src/pages/devtools/index.html',
  web_accessible_resources: [
    {
      resources: [
        'assets/js/*.js',
        'assets/css/*.css',
        'star128.png',
        'star48.png',
        'star32.png',
        'star16.png'
      ],
      matches: ['*://*/*']
    }
  ]
}

export default manifest
