const ListDefinition = require("./definitions/List");
const AccountDefinition = require("./definitions/Account")
const TriggeredSendDefinition = require("./definitions/TriggeredSendDefinition")

module.exports = class Account {
  constructor(soap) {
    this.soap = soap;
  }


  async getAccountMids() {
    try {
      const resp = [];
      const req = await this.soap.retrieve('List', ListDefinition, {
        QueryAllAccounts: true,
        filter: {
          leftOperand: 'ListName',
          operator: 'equals',
          rightOperand: 'All Subscribers'
        }
      })

      if (req.OverallStatus.includes('Error:'))
        throw new Error(req.OverallStatus)

      await req.Results.forEach((a) => { resp.push(a.Client.ID) })

      return resp
    } catch (err) {
      throw err
    }
  }


  async getAccountDetail(mid) {
    try {
      const req = await this.soap.retrieve('Account', AccountDefinition, {
        QueryAllAccounts: true,
        filter: {
          leftOperand: 'ID',
          operator: 'equals',
          rightOperand: mid
        }
      })

      if (req.OverallStatus.includes('Error:'))
        throw new Error(req.OverallStatus)

      return req
    } catch (err) {
      console.log(err)
    }
  }



  async getAllAccountDetails(mids) {
    let midsArray;
    const accountDetails = [];

    if (mids && Array.isArray(mids)) {
      midsArray = mids;
    } if (mids && !Array.isArray(mids)) {
      midsArray = new Array(mids)
    } else {
      midsArray = await this.getAccountMids()
    }

    for (let m in midsArray) {
      const mid = midsArray[m]
      const accountDetail = await this.getAccountDetail(mid)
      accountDetails.push(...accountDetail.Results)
    }

    return accountDetails;
  }

}
