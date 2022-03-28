module.exports = class Asset {
  constructor(rest) {
    this.rest = rest;
  }

  async getByFolderArray(folderIds) {
    try {
      if (!Array.isArray(folderIds))
        throw new Error('folderIds argument must be an array')

      return await this.rest.post('/asset/v1/content/assets/query', {
        "page": {
          "page": 1,
          "pageSize": 200
        },
        "query": {
          "property": "category.id",
          "simpleOperator": "in",
          "value": folderIds
        },
        "sort": [
          {
            "property": "id",
            "direction": "ASC"
          }
        ]
      })

    } catch (err) {
      console.log(err);
    }
  }



  async getById(id) {
    try {
      if (!id)
        throw new Error('id argument is required')

      const assetResp = await this.rest.get(`/asset/v1/content/assets/${id}`)
      return new Array(assetResp)

    } catch (err) {
      console.log(err)
    }
  }



  async search(searchKey, searchTerm) {
    try {

      return await this.rest.post('/asset/v1/content/assets/query', {
        "page": {
          "page": 1,
          "pageSize": 200
        },
        "query": {
          "property": searchKey,
          "simpleOperator": "like",
          "value": searchTerm
        },
        "sort": [
          {
            "property": "name",
            "direction": "DESC"
          }
        ]
      })

    } catch (err) {
      console.log(err);
    }
  }


  async postAsset(asset) {
    // name, assetType, content


  }


  async putAsset(asset) {
    try {
      if (!asset.id)
        throw new Error('Asset Id is required')

      const assetId = asset.id;
      const resp = await this.rest.put(`/asset/v1/content/assets/${assetId}`, asset);
      return resp
    } catch (err) {
      console.log(err)
    }
  }

}

