const fs = require('fs');
var isEqual = require('lodash.isequal');

const { localFileExists, localCreateFile } = require('./lib/utils/index')

const json = {
  folders: [
    {
      id: 2928,
      name: 'test folder 1',
      parentId: 2921
    },
    {
      id: 5432,
      name: 'test folder 2',
      parentId: 2921
    },
    {
      id: 45454,
      name: 'test folder 3',
      parentId: 5432
    },
    {
      id: 4545334,
      name: 'test folder 4',
      parentId: 2921
    }
  ],
  contentBlocks: [
    {
      id: 64212,
      name: 'test block 1',
      parentId: 2921,
      content: 'this is another update for 1'
    },
    {
      id: 42223,
      name: 'test block 42223',
      parentId: 2921,
      content: 'this is 42223'
    }
  ]
}



const manifestJSON = (context, content) => {
  if (typeof content !== 'object')
    throw new Error('Content needs to be an object')

  if (!context)
    throw new Error('Context is required')

  if (localFileExists('./.local.manifest.json')) {
    const manifest = fs.readFileSync('./.local.manifest.json');
    let manifestJSON = JSON.parse(manifest);

    for (const c in content) {
      if (
        manifestJSON.hasOwnProperty(context) &&
        manifestJSON[context].hasOwnProperty(c)
      ) {
        const ctx = manifestJSON[context];

        content[c].map((item) => {
          if (item.hasOwnProperty('id')) {
            const manifestObj = ctx[c].find(({ id }) => id === item.id)

            if (typeof manifestObj === 'undefined') {
              ctx[c] = [...ctx[c], item]
            } else {
              if (!isEqual(item, manifestObj)) {
                const updateIndex = ctx[c].findIndex(({ id }) => id === item.id)
                ctx[c][updateIndex] = item
              }
            }
          }
        })


      } else {
        if (!manifestJSON[context])
          manifestJSON[context] = {};

        manifestJSON[context][c] = [...content[c]]
      }
    }

    fs.writeFileSync('./.local.manifest.json', JSON.stringify(manifestJSON, null, 2))
  } else {
    const init = {}

    fs.writeFileSync('./.local.manifest.json', JSON.stringify(init, null, 2))
    manifestJSON(context, content)
  }
}

manifestJSON('automationStudio', json)