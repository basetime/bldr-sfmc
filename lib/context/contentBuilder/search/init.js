const cliFormat = require('cli-format')
const auth = require("../../../../lib/utils/sfmc/auth");
const state = require("../../../state/switch");

const Column = require("../../../utils/help/Column")
const displayStyle = require('../../../../lib/utils/displayStyles')
const { styles, width } = displayStyle.init();


module.exports.searchFolders = async (argv) => {
  if (!argv.f) throw new Error('Folder name is required.')

  console.log("Searching...");

  try {
    const sfmc = await auth.setAuth();
    const search = await sfmc.soap.retrieveBulk(
      "DataFolder",
      ["Name", "ID", "ObjectID"],
      {
        filter: {
          leftOperand: "Name",
          operator: "like",
          rightOperand: argv.f,
        },
      }
    );

    console.log(`
    Total Items: ${search.Results.length}
  `);

    const rows = [[
      new Column(`ID`, width.c1),
      new Column(`Name`, width.c1),
    ],
    [
      new Column(` `, width.c1, '', `${styles.dim('-')}`),
      new Column(` `, width.c1, '', `${styles.dim('-')}`),
    ]];


    search.Results.map((item) => {
      rows.push([
        new Column(`${styles.header(item.ID)}`, width.c1),
        new Column(`${item.Name}`, width.c1),
      ])
    })

    for (const r in rows) {
      console.log(cliFormat.columns.wrap(rows[r], { width: 500, paddingMiddle: ' | ' }))
    }
  } catch (err) {
    console.log(err)
  }

};



module.exports.searchAssets = async (argv) => {
  if (typeof argv.a !== "string")
    throw new Error("Please provide a search term.");

  let page = 1;
  let queryFilter = {
    property: "name",
    simpleOperator: "like",
    value: argv.a,
  };

  if (argv.p && typeof argv.p === "number") page = argv.p;

  console.log("Searching...");
  const sfmc = await auth.setAuth();
  const search = await sfmc.rest.post("/asset/v1/content/assets/query", {
    page: {
      page: page,
      pageSize: 20,
    },

    query: queryFilter,

    sort: [{ property: "modifiedDate", direction: "DESC" }],

    fields: ["name", "id", "assetType", "category"],
  });

  state.updateState({ key: "search", value: search });

  console.log(`
    Total Items: ${search.count}
    Page ${search.page} of ${Math.ceil(Number(search.count) / 10)}
  `);

  search.items.map((item) => {
    console.log(`
        ${item.name}
        ID: ${item.id}
        AssetType: ${item.assetType.name}
        Category: ${item.category.id} | ${item.category.name}`);
  });
  console.log(`\n`);
};
