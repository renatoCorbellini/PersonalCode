const logger = require("../log");

module.exports.getCredentials = function () {
  var options = {};
  options.customerAlias = "RenatoCorbellini";
  options.databaseAlias = "Main";
  options.userId = "renato.api";
  options.password = "p";
  options.clientId = "3f03af1d-82dc-4c08-b99c-855b75026764";
  options.clientSecret = "tYz/rvU+4NPAV5uBOaHP9Hpct8ctemTItjzPs1qH930=";
  return options;
};

module.exports.main = async function (ffCollection, vvClient, response) {
  /*Script Name:  EmployeeAssignmentVerify
   Customer:      Florida Department of Health, Early Steps
   Purpose:       The purpose of this process is to verify if the form record is unique.
   Parameters:    Agency ID - (String, Required) Used in the query to verify if the record is unique or unique matched.
                  Email - (String, Required) Used in the query to verify if the record is unique or unique matched.
                  End Date - (String, Required) Used in the query to verify if the record is unique or unique matched.
                  Record ID - (String, Required) Used in the query to verify if the record is unique or unique matched and LibUserUpdate.
                  Start Date - (String, Required) Used in the query to verify if the record is unique or unique matched.
                  Status - (String, Required) Used in the query to verify if the record is unique or unique matched.
              
   Return Array:  1. Status: 'Success', 'Error'
                  2. Message
                  3. Status of the verify call
                  
   Pseudo code:   1. Call VerifyUniqueRecord to determine whether the template record is unique per the passed in information.
                  2. Send response with return array.
 
   Date of Dev:   4/7/2020
   Last Rev Date: 4/7/2020
   Revision Notes:
   4/7/2020  - Rocky Borg: Script created
   */

  logger.info("Start of the process EmployeeAssignmentVerify at " + Date());

  /**********************
   Configurable Variables
  ***********************/
  //Template ID for Employee Assignment
  let TemplateID = "milestone10WS test harness";

  // Error message guidances
  let missingFieldGuidance =
    "Please provide a value for the missing field and try again, or contact a system administrator if this problem continues.";

  // Response array populated in try or catch block, used in response sent in finally block.
  let outputCollection = [];
  // Array for capturing error messages that may occur within helper functions.
  let errorLog = [];

  /****************
     Helper Functions
    *****************/
  // Check if field object has a value property and that value is truthy before returning value.
  function getFieldValueByName(fieldName, isRequired = true) {
    /*
        Check if a field was passed in the request and get its value
        Parameters:
            fieldName: The name of the field to be checked
            isRequired: If the field is required or not
        */

    let resp = null;

    try {
      // Tries to get the field from the passed in arguments
      const field = ffCollection.getFormFieldByName(fieldName);

      if (!field && isRequired) {
        throw new Error(`The field '${fieldName}' was not found.`);
      } else if (field) {
        // If the field was found, get its value
        let fieldValue = field.value ? field.value : null;

        if (typeof fieldValue === "string") {
          // Remove any leading or trailing spaces
          fieldValue.trim();
        }

        if (fieldValue) {
          // Sets the field value to the response
          resp = fieldValue;
        } else if (isRequired) {
          // If the field is required and has no value, throw an error
          throw new Error(
            `The value property for the field '${fieldName}' was not found or is empty.`
          );
        }
      }
    } catch (error) {
      // If an error was thrown, add it to the error log
      errorLog.push(error);
    }
    return resp;
  }

  try {
    /*********************
     Form Record Variables
    **********************/
    //Create variables for the values on the form record
    const formID = getFieldValueByName("Form ID");
    const firstName = getFieldValueByName("First Name");
    const lastName = getFieldValueByName("Last Name");
    const email = getFieldValueByName("Email");
    const address = getFieldValueByName("Address");

    // Specific fields are detailed in the errorLog sent in the response to the client.
    if (errorLog.length > 0) {
      throw new Error(`${missingFieldGuidance}`);
    }

    /****************
     BEGIN ASYNC CODE
    *****************/
    // STEP 1 - Call VerifyUniqueRecord to determine whether the template record is unique per the passed in information.
    // Query formatted variables

    let uniqueRecordArr = [
      {
        name: "templateId",
        value: TemplateID,
      },
      {
        name: "query",
        value: `[First Name] eq '${firstName}' AND [Last Name] eq '${lastName}' AND [Email] eq '${email}' AND [Address] eq '${address}'`,
      },
      {
        name: "formId",
        value: formID,
      },
    ];

    const clientLibrary = require("../VVRestApi");
    const scriptToExecute = require("../files/LibFormVerifyUniqueRecord");
    const ffcol = new clientLibrary.forms.formFieldCollection(uniqueRecordArr);
    await scriptToExecute.main(ffcol, vvClient, response);

    const uniqueRecordResp = await vvClient.scripts.runWebService(
      "LibFormVerifyUniqueRecord",
      uniqueRecordArr
    );

    /* let verifyUniqueData = verifyUniqueResp.hasOwnProperty("data")
      ? verifyUniqueResp.data
      : null;
    let verifyUniqueStatus = verifyUniqueData.hasOwnProperty("status")
      ? verifyUniqueData.status
      : null;

    if (verifyUniqueResp.meta.status !== 200) {
      throw new Error(
        `There was an error when calling LibFormVerifyUniqueRecord.`
      );
    }
    if (verifyUniqueData === null) {
      throw new Error(
        `Data was not be returned when calling LibFormVerifyUniqueRecord.`
      );
    }
    if (verifyUniqueStatus === null) {
      throw new Error(
        `A status was not be returned when calling LibFormVerifyUniqueRecord.`
      );
    }
    if (verifyUniqueStatus === "Error") {
      throw new Error(
        `The call to LibFormVerifyUniqueRecord returned with an error. ${verifyUniqueData.statusMessage}.`
      );
    }
    if (verifyUniqueStatus === "Not Unique") {
      throw new Error(
        "This Employee Assignment record is a duplicate of another Record. Another Employee Assignment record already exists with the same First Name, Last Name, Email and Address."
      );
    }
    if (
      verifyUniqueStatus !== "Unique" &&
      verifyUniqueStatus !== "Unique Matched"
    ) {
      throw new Error(
        `The call to LibFormVerifyUniqueRecord returned with an unhandled error.`
      );
    } */

    // STEP 2 - Send response with return array.
    outputCollection[0] = "Success";
    outputCollection[1] = uniqueRecordResp.data.status;
    outputCollection[2] = uniqueRecordResp.data.statusMessage;
  } catch (error) {
    // Log errors captured.
    logger.info(JSON.stringify(`${error} ${errorLog}`));
    outputCollection[0] = "Error";
    outputCollection[1] = `${errorLog.join(" ")} ${error.message}`;
  } finally {
    response.json(200, outputCollection);
  }
};
