
module.exports = class Folder {
  constructor(rest, soap) {
    this.rest = rest;
    this.soap = soap;
  }

  async get() {
      const resp = await this.soap.retrieve('DataFolder', [
        'ID',
        'Name',
        'ParentFolder.ID',
        'ContentType'
      ], {
        filter: {
          leftOperand: {
            leftOperand: 'ContentType',
            operator: 'equals',
            rightOperand: 'asset'
          },
          operator: 'AND',
          rightOperand: {
            leftOperand: 'ID',
            operator: 'equals',
            rightOperand: 69859
          }
        }
      });

      console.log(resp)
      return resp.Results.length
       
  }

}

