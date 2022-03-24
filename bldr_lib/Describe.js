module.exports = class Describe {
  constructor(soap) {
    this.soap = soap;
  }
  
  async describeSoap(object) {
  const describeResp = await this.soap.describe(object)
  const retrieve = describeResp.ObjectDefinition.Properties.map(prop => {
    if (prop.IsRetrievable) {
      return prop.Name
    }

    return
  })

  const out = retrieve.filter(Boolean)
  console.log(JSON.stringify(out, null, 2))
  console.log(JSON.stringify(describeResp, null, 2))
}
}