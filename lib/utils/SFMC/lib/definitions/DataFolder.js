module.exports = [
    'ID',
    'Client.ID',
    'ParentFolder.ID',
    'ParentFolder.CustomerKey',
    'ParentFolder.ObjectID',
    'ParentFolder.Name',
    'ParentFolder.Description',
    'ParentFolder.ContentType',
    'ParentFolder.IsActive',
    'ParentFolder.IsEditable',
    'ParentFolder.AllowChildren',
    'Name',
    'Description',
    'ContentType',
    'IsActive',
    'IsEditable',
    'AllowChildren',
    'CreatedDate',
    'ModifiedDate',
    'Client.ModifiedBy',
    'ObjectID',
    'CustomerKey',
    'Client.EnterpriseID',
    'Client.CreatedBy',
];

/**
 * DESCRIBE Definition
 */

/*
{
  "ObjectDefinition": {
    "ObjectType": "DataFolder",
      "Properties": [
        {
          "PartnerKey": "",
          "ObjectID": "",
          "Name": "ID",
          "DataType": "Int32",
          "IsUpdatable": true,
          "IsRetrievable": true,
          "IsRequired": true
        },
        {
          "PartnerKey": "",
          "ObjectID": "",
          "Name": "Client.ID",
          "DataType": "Int32",
          "IsUpdatable": true,
          "IsRetrievable": true,
          "IsRequired": true
        },
        {
          "PartnerKey": "",
          "ObjectID": "",
          "Name": "ParentFolder.ID",
          "DataType": "Int32",
          "IsUpdatable": true,
          "IsRetrievable": true,
          "IsRequired": false
        },
        {
          "PartnerKey": "",
          "ObjectID": "",
          "Name": "ParentFolder.CustomerKey",
          "DataType": "String",
          "IsUpdatable": true,
          "IsRetrievable": true,
          "MaxLength": 36,
          "IsRequired": false
        },
        {
          "PartnerKey": "",
          "ObjectID": "",
          "Name": "ParentFolder.ObjectID",
          "DataType": "Guid",
          "IsUpdatable": true,
          "IsRetrievable": true,
          "IsRequired": false
        },
        {
          "PartnerKey": "",
          "ObjectID": "",
          "Name": "ParentFolder.Name",
          "DataType": "String",
          "IsUpdatable": true,
          "IsRetrievable": true,
          "MaxLength": 100,
          "IsRequired": false
        },
        {
          "PartnerKey": "",
          "ObjectID": "",
          "Name": "ParentFolder.Description",
          "DataType": "String",
          "IsUpdatable": true,
          "IsRetrievable": true,
          "MaxLength": 200,
          "IsRequired": false
        },
        {
          "PartnerKey": "",
          "ObjectID": "",
          "Name": "ParentFolder.ContentType",
          "DataType": "String",
          "IsUpdatable": true,
          "IsRetrievable": true,
          "MaxLength": 50,
          "IsRequired": false
        },
        {
          "PartnerKey": "",
          "ObjectID": "",
          "Name": "ParentFolder.IsActive",
          "DataType": "Boolean",
          "IsUpdatable": false,
          "IsRetrievable": true,
          "IsRequired": false
        },
        {
          "PartnerKey": "",
          "ObjectID": "",
          "Name": "ParentFolder.IsEditable",
          "DataType": "Boolean",
          "IsUpdatable": false,
          "IsRetrievable": true,
          "IsRequired": false
        },
        {
          "PartnerKey": "",
          "ObjectID": "",
          "Name": "ParentFolder.AllowChildren",
          "DataType": "Boolean",
          "IsUpdatable": false,
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
          "MaxLength": 100,
          "IsRequired": true
        },
        {
          "PartnerKey": "",
          "ObjectID": "",
          "Name": "Description",
          "DataType": "String",
          "IsUpdatable": true,
          "IsRetrievable": true,
          "MaxLength": 200,
          "IsRequired": true
        },
        {
          "PartnerKey": "",
          "ObjectID": "",
          "Name": "ContentType",
          "DataType": "String",
          "IsUpdatable": true,
          "IsRetrievable": true,
          "MaxLength": 50,
          "IsRequired": true
        },
        {
          "PartnerKey": "",
          "ObjectID": "",
          "Name": "IsActive",
          "DataType": "Boolean",
          "IsUpdatable": true,
          "IsRetrievable": true,
          "IsRequired": false
        },
        {
          "PartnerKey": "",
          "ObjectID": "",
          "Name": "IsEditable",
          "DataType": "Boolean",
          "IsUpdatable": true,
          "IsRetrievable": true,
          "IsRequired": false
        },
        {
          "PartnerKey": "",
          "ObjectID": "",
          "Name": "AllowChildren",
          "DataType": "Boolean",
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
          "IsRequired": true
        },
        {
          "PartnerKey": "",
          "ObjectID": "",
          "Name": "ModifiedDate",
          "DataType": "DateTime",
          "IsUpdatable": true,
          "IsRetrievable": true,
          "IsRequired": true
        },
        {
          "PartnerKey": "",
          "ObjectID": "",
          "Name": "Client.ModifiedBy",
          "DataType": "Int32",
          "IsUpdatable": true,
          "IsRetrievable": true,
          "IsRequired": true
        },
        {
          "PartnerKey": "",
          "ObjectID": "",
          "Name": "ObjectID",
          "DataType": "String",
          "IsUpdatable": true,
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
          "MaxLength": 36,
          "IsRequired": false
        },
        {
          "PartnerKey": "",
          "ObjectID": "",
          "Name": "Client.EnterpriseID",
          "DataType": "Int64",
          "IsUpdatable": true,
          "IsRetrievable": true,
          "IsRequired": false
        },
        {
          "PartnerKey": "",
          "ObjectID": "",
          "Name": "Client.CreatedBy",
          "DataType": "Int32",
          "IsUpdatable": true,
          "IsRetrievable": true,
          "IsRequired": false
        },
        {
          "PartnerKey": "",
          "ObjectID": "",
          "Name": "ParentFolder",
          "DataType": "DataFolder",
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
          "Name": "PartnerKey",
          "DataType": "String",
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
          "Name": "ObjectState",
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
  }
}
*/
