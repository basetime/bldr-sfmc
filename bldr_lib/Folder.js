const DataFolder = require("./definitions/DataFolder");
const {describeSoap} = require('./utils/index')

module.exports = class Folder {
  constructor(soap) {
    this.soap = soap;
  }

  async search(contentType, searchKey, searchTerm) {
    try {
      const resp = await this.soap.retrieve('DataFolder', DataFolder, {
        filter: {
          leftOperand: {
            leftOperand: 'ContentType',
            operator: 'equals',
            rightOperand: contentType
          },
          operator: 'AND',
          rightOperand: {
            leftOperand: searchKey,
            operator: 'like',
            rightOperand: searchTerm
          }
        }
      });
     
      if (resp.OverallStatus !== 'OK')
        throw new Error('Unable to Retrieve Folders')

      return resp

    } catch (err) {
      console.log(err)
    }
  }



  async get(contentType, id, subfolders) {
    try {
      const resp = await this.soap.retrieve('DataFolder', DataFolder, {
        filter: {
          leftOperand: {
            leftOperand: 'ContentType',
            operator: 'equals',
            rightOperand: contentType
          },
          operator: 'AND',
          rightOperand: {
            leftOperand: subfolders ? 'ParentFolder.ID' : 'ID',
            operator: 'equals',
            rightOperand: id
          }
        }
      });

      if (resp.OverallStatus !== 'OK')
        throw new Error('Unable to Retrieve Folders')

      return resp

    } catch (err) {
      console.log(err)
    }
  }



}

