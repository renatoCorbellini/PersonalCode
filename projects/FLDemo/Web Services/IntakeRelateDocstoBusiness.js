let logger = require("../log");

module.exports.getCredentials = function () {
  var options = {};
  options.customerAlias = "Demo";
  options.databaseAlias = "FacilityLicensing";
  options.userId = "vv5demo.APIUser";
  options.password = "Y8t89yPcWn4N6Nj";
  options.clientId = "3416ea76-8dec-4de5-b498-f2a315ada5ad";
  options.clientSecret = "v2VEJTDH7r9ezpSJ0OHzujzBNYrdXS06a3VttoxJXOs=";
  return options;
};

module.exports.main = async function (ffCollection, vvClient, response) {
  /*Script Name:  IntakeRelateDocstoBusiness
    Customer:       VisualVault
    Purpose:        The purpose of this process is get documents related to an intake form and relate them to a business.
    Parameters:    
                    - Business GUUID: GUID
                    - Intake Form ID: String

    Return Array:   [0] Status: 'Success', 'Error'
                    [1] Message
                    [2] Data
    
    */

  logger.info("Start of the process IntakeRelateDocstoBusiness at " + Date());

  /**********************
    Configurable Variables
    ***********************/

  // Response array populated in try or catch block, used in response sent in finally block.
  let outputCollection = [];
  // Array for capturing error messages that may occur within helper functions.
  let errorLog = [];
  // Name of the fee lookup form
  const feeLookupForm = "Fee Lookup";
  // Name of the fee lookup form
  const feeForm = "Fee";
  // Variables to calculate subtotals
  let cityFeeTotals = 0;
  let stateFeeTotals = 0;
  let newFeeData;

  /****************
    Helper Functions
    *****************/
  // Check if field object has a value property and that value is truthy before returning value.
  function getFieldValueByName(fieldName, isFieldRequired) {
    // If isFieldRequired parameter is not passed in, the field is required
    let isRequired = isFieldRequired ? isFieldRequired : true;
    let fieldObj = {};
    let fieldValue = null;
    let resp = null;

    try {
      fieldObj = ffCollection.getFormFieldByName(fieldName);
      if (fieldObj) {
        fieldValue = fieldObj.value ? fieldObj.value.trim() : null;
        if (fieldValue) {
          resp = fieldValue;
        } else if (isRequired) {
          errorLog.push(
            `A value property for the field '${fieldName}' was not found or is empty`
          );
        }
      } else {
        errorLog.push(`The field '${fieldName}' was not found`);
      }
    } catch (error) {
      errorLog.push(error);
    }
    return resp;
  }

  /****************
    BEGIN ASYNC CODE
    *****************/

  try {
    // Required fields
    const BusinessGUID = getFieldValueByName("Business GUID");
    const BusinessID = getFieldValueByName("Business ID");
    const IntakeID = getFieldValueByName("Intake ID");
    const IntakeRevID = getFieldValueByName("Revision ID");

    //Get Related documents.
    //RevisionID = GUID of the form
    let relatedDocumentsResp = await vvClient.forms.getFormRelatedDocs(
      IntakeRevID,
      null
    );
    relatedDocumentsResp = JSON.parse(relatedDocumentsResp);
    let relatedDocumentsData = relatedDocumentsResp.hasOwnProperty("data")
      ? relatedDocumentsResp.data
      : null;
    let relatedDocumentsDataLength = Array.isArray(relatedDocumentsData)
      ? relatedDocumentsData.length
      : 0;

    if (relatedDocumentsResp.meta.status != 200) {
      throw new Error("Error encountered when calling relateDocumentByDocId.");
    }

    for (let relatedDoc of relatedDocumentsData) {
      //Relate the documents to the business.
      // Relate the document to another form.
      //RevisionID = GUID of the form you want to relate the document to.
      //document['name'] = name of the document
      let relateDocByDocIdResp = await vvClient.forms.relateDocumentByDocId(
        BusinessGUID,
        relatedDoc["name"]
      );
      relateDocByDocIdResp = JSON.parse(relateDocByDocIdResp);

      if (
        relateDocByDocIdResp.meta.status != 200 &&
        relateDocByDocIdResp.meta.status != 404
      ) {
        throw new Error(
          "Error encountered when calling relateDocumentByDocId."
        );
      }
    }

    outputCollection[0] = "Success";
    outputCollection[1] = "Documents successfully related to business record.";
  } catch (error) {
    outputCollection[0] = "Error";
    outputCollection[1] = error.message ? error.message : error;
  } finally {
    response.json(200, outputCollection);
  }
};
