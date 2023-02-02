module.exports = [
    'ID',
    'AccountType',
    'ParentID',
    'BrandID',
    'PrivateLabelID',
    'ReportingParentID',
    'Name',
    'Email',
    'FromName',
    'BusinessName',
    'Phone',
    'Address',
    'Fax',
    'City',
    'State',
    'Zip',
    'Country',
    'IsActive',
    'IsTestAccount',
    'Client.ClientID1',
    'DBID',
    'CustomerID',
    'DeletedDate',
    'EditionID',
    'ModifiedDate',
    'CreatedDate',
    'ParentName',
    'Subscription.SubscriptionID',
    'Subscription.HasPurchasedEmails',
    'Subscription.EmailsPurchased',
    'Subscription.Period',
    'Subscription.AccountsPurchased',
    'Subscription.LPAccountsPurchased',
    'Subscription.DOTOAccountsPurchased',
    'Subscription.BUAccountsPurchased',
    'Subscription.AdvAccountsPurchased',
    'Subscription.BeginDate',
    'Subscription.EndDate',
    'Subscription.Notes',
    'PartnerKey',
    'Client.PartnerClientKey',
    'InheritAddress',
    'UnsubscribeBehavior',
    'Subscription.ContractNumber',
    'Subscription.ContractModifier',
    'IsTrialAccount',
    'Client.EnterpriseID',
    'ParentAccount.ID',
    'ParentAccount.Name',
    'ParentAccount.ParentID',
    'ParentAccount.CustomerKey',
    'ParentAccount.AccountType',
    'CustomerKey',
    'Locale.LocaleCode',
    'TimeZone.ID',
    'TimeZone.Name',
    'Roles',
    'ContextualRoles',
    'ObjectState',
    'LanguageLocale.LocaleCode',
    'IndustryCode',
    'AccountState',
    'SubscriptionRestrictionFlags',
];

/**
 * DESCRIBE Definition
 */

/*
{
  "ObjectDefinition": {
    "ObjectType": "Account",
    "Properties": [
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "ID",
        "DataType": "Int32",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "AccountType",
        "DataType": "AccountTypeEnum",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "ParentID",
        "DataType": "Int32",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "BrandID",
        "DataType": "Int32",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "PrivateLabelID",
        "DataType": "Int32",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "ReportingParentID",
        "DataType": "Int32",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "Name",
        "DataType": "String",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "Email",
        "DataType": "String",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "FromName",
        "DataType": "String",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "BusinessName",
        "DataType": "String",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "Phone",
        "DataType": "String",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "Address",
        "DataType": "String",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "Fax",
        "DataType": "String",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "City",
        "DataType": "String",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "State",
        "DataType": "String",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "Zip",
        "DataType": "String",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "Country",
        "DataType": "String",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "IsActive",
        "DataType": "Int32",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "IsTestAccount",
        "DataType": "Boolean",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "Client.ClientID1",
        "DataType": "Int32",
        "IsUpdatable": false,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "DBID",
        "DataType": "Int32",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "CustomerID",
        "DataType": "Int64",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "DeletedDate",
        "DataType": "DateTime",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "EditionID",
        "DataType": "Int32",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "ModifiedDate",
        "DataType": "DateTime",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "CreatedDate",
        "DataType": "DateTime",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "ParentName",
        "DataType": "String",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "Subscription.SubscriptionID",
        "DataType": "Int32",
        "IsUpdatable": false,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "Subscription.HasPurchasedEmails",
        "DataType": "Int32",
        "IsUpdatable": false,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "Subscription.EmailsPurchased",
        "DataType": "Int32",
        "IsUpdatable": false,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "Subscription.Period",
        "DataType": "Int32",
        "IsUpdatable": false,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "Subscription.AccountsPurchased",
        "DataType": "Int32",
        "IsUpdatable": false,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "Subscription.LPAccountsPurchased",
        "DataType": "Int32",
        "IsUpdatable": false,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "Subscription.DOTOAccountsPurchased",
        "DataType": "Int32",
        "IsUpdatable": false,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "Subscription.BUAccountsPurchased",
        "DataType": "Int32",
        "IsUpdatable": false,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "Subscription.AdvAccountsPurchased",
        "DataType": "Int32",
        "IsUpdatable": false,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "Subscription.BeginDate",
        "DataType": "Int32",
        "IsUpdatable": false,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "Subscription.EndDate",
        "DataType": "Int32",
        "IsUpdatable": false,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "Subscription.Notes",
        "DataType": "Int32",
        "IsUpdatable": false,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "PartnerKey",
        "DataType": "String",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "Client.PartnerClientKey",
        "DataType": "Int32",
        "IsUpdatable": false,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "InheritAddress",
        "DataType": "Boolean",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "UnsubscribeBehavior",
        "DataType": "Int32",
        "IsUpdatable": false,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "Subscription.ContractNumber",
        "DataType": "Int32",
        "IsUpdatable": false,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "Subscription.ContractModifier",
        "DataType": "Int32",
        "IsUpdatable": false,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "IsTrialAccount",
        "DataType": "Boolean",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "Client.EnterpriseID",
        "DataType": "Int32",
        "IsUpdatable": false,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "ParentAccount.ID",
        "DataType": "Int32",
        "IsUpdatable": false,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "ParentAccount.Name",
        "DataType": "Int32",
        "IsUpdatable": false,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "ParentAccount.ParentID",
        "DataType": "Int32",
        "IsUpdatable": false,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "ParentAccount.CustomerKey",
        "DataType": "Int32",
        "IsUpdatable": false,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "ParentAccount.AccountType",
        "DataType": "Int32",
        "IsUpdatable": false,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "CustomerKey",
        "DataType": "String",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "Locale.LocaleCode",
        "DataType": "Int32",
        "IsUpdatable": false,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "TimeZone.ID",
        "DataType": "Int32",
        "IsUpdatable": false,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "TimeZone.Name",
        "DataType": "Int32",
        "IsUpdatable": false,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "Roles",
        "DataType": "Role[]",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "ContextualRoles",
        "DataType": "Int32",
        "IsUpdatable": false,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "StackID",
        "DataType": "Int32",
        "IsUpdatable": true,
        "IsRetrievable": false,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "ObjectState",
        "DataType": "String",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "LanguageLocale.LocaleCode",
        "DataType": "Int32",
        "IsUpdatable": false,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "IndustryCode",
        "DataType": "String",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "AccountState",
        "DataType": "Int32",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "SubscriptionRestrictionFlags",
        "DataType": "Int64",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "OrgID",
        "DataType": "Int32",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "Children",
        "DataType": "AccountDataItem[]",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "Subscription",
        "DataType": "Subscription",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "PrivateLabels",
        "DataType": "PrivateLabel[]",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "BusinessRules",
        "DataType": "BusinessRule[]",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "AccountUsers",
        "DataType": "AccountUser[]",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "Locale",
        "DataType": "Locale",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "ParentAccount",
        "DataType": "Account",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "TimeZone",
        "DataType": "TimeZone",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "SalesForceID",
        "DataType": "String",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "LanguageLocale",
        "DataType": "Locale",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "Edition",
        "DataType": "Edition",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "SalesforceOrgID",
        "DataType": "Int32",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "Client",
        "DataType": "ClientID",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "PartnerProperties",
        "DataType": "APIProperty[]",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "ObjectID",
        "DataType": "String",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "Owner",
        "DataType": "Owner",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "CorrelationID",
        "DataType": "String",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "IsPlatformObject",
        "DataType": "Boolean",
        "IsUpdatable": true,
        "IsRetrievable": false
      }
    ]
  },
  "RequestID": "7396ae1d-3b49-4cd9-8148-1e55956bfda8"
}
*/
