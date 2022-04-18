module.exports.describeSoap = async (client, object) => {
    const describeResp = await client.describe(object);
    const retrieve = describeResp.ObjectDefinition.Properties.map((prop) => {
        if (prop.IsRetrievable) {
            return prop.Name;
        }

        return;
    });

    const out = retrieve.filter(Boolean);
    console.log(JSON.stringify(out, null, 2));
};
