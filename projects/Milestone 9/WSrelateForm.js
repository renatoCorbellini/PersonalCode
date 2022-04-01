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
  /*
    Script Name:    WebService name 
    Customer:       Project Name
    Purpose:        Brief description of the purpose of the script
    Parameters:     The following represent variables passed into the function:
                    parameter1: Description of parameter1
                    parameter2: Description of parameter2
    Return Object:
                    outputCollection[0]: Status
                    outputCollection[1]: Short description message
                    outputCollection[2]: Data
    Pseudo code: 
              1° Does this
              2° Does that
              ...
 
    Date of Dev:   10/19/2021
    Last Rev Date: 
 
    Revision Notes:
     07/30/2021 - DEVELOPER NAME HERE:  First Setup of the script
    */

  logger.info("Start of the process SCRIPT NAME HERE at " + Date());

  /**************************************
     Response and error handling variables
    ***************************************/

  // Response array to be returned
  let outputCollection = [];
  // Array for capturing error messages that may occur during the process
  let errorLog = [];

  /***********************
     Configurable Variables
    ************************/

  const parentTemplateName = `Customer Complaint`;
  const childTemplateName = "Document Upload";
  const childFormID = "Document-000009";

  /*****************
     Script Variables
    ******************/

  // Describes the process being checked using the parsing and checking helper functions
  let shortDescription = "";

  /*****************
     Helper Functions
    ******************/

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

  function parseRes(vvClientRes) {
    /*
        Generic JSON parsing function
        Parameters:
            vvClientRes: JSON response from a vvClient API method
        */
    try {
      // Parses the response in case it's a JSON string
      const jsObject = JSON.parse(vvClientRes);
      // Handle non-exception-throwing cases:
      if (jsObject && typeof jsObject === "object") {
        vvClientRes = jsObject;
      }
    } catch (e) {
      // If an error occurs, it's because the resp is already a JS object and doesn't need to be parsed
    }
    return vvClientRes;
  }

  function checkMetaAndStatus(
    vvClientRes,
    shortDescription,
    ignoreStatusCode = 999
  ) {
    /*
        Checks that the meta property of a vvClient API response object has the expected status code
        Parameters:
            vvClientRes: Parsed response object from a vvClient API method
            shortDescription: A string with a short description of the process
            ignoreStatusCode: An integer status code for which no error should be thrown. If you're using checkData(), make sure to pass the same param as well.
        */

    if (!vvClientRes.meta) {
      throw new Error(
        `${shortDescription} error. No meta object found in response. Check method call parameters and credentials.`
      );
    }

    const status = vvClientRes.meta.status;

    // If the status is not the expected one, throw an error
    if (status != 200 && status != 201 && status != ignoreStatusCode) {
      const errorReason =
        vvClientRes.meta.errors && vvClientRes.meta.errors[0]
          ? vvClientRes.meta.errors[0].reason
          : "unspecified";
      throw new Error(
        `${shortDescription} error. Status: ${vvClientRes.meta.status}. Reason: ${errorReason}`
      );
    }
    return vvClientRes;
  }

  function checkDataPropertyExists(
    vvClientRes,
    shortDescription,
    ignoreStatusCode = 999
  ) {
    /*
        Checks that the data property of a vvClient API response object exists 
        Parameters:
            res: Parsed response object from the API call
            shortDescription: A string with a short description of the process
            ignoreStatusCode: An integer status code for which no error should be thrown. If you're using checkMeta(), make sure to pass the same param as well.
        */
    const status = vvClientRes.meta.status;

    if (status != ignoreStatusCode) {
      // If the data property doesn't exist, throw an error
      if (!vvClientRes.data) {
        throw new Error(
          `${shortDescription} data property was not present. Please, check parameters and syntax. Status: ${status}.`
        );
      }
    }

    return vvClientRes;
  }

  function checkDataIsNotEmpty(
    vvClientRes,
    shortDescription,
    ignoreStatusCode = 999
  ) {
    /*
        Checks that the data property of a vvClient API response object is not empty
        Parameters:
            res: Parsed response object from the API call
            shortDescription: A string with a short description of the process
            ignoreStatusCode: An integer status code for which no error should be thrown. If you're using checkMeta(), make sure to pass the same param as well.
        */
    const status = vvClientRes.meta.status;

    if (status != ignoreStatusCode) {
      const dataIsArray = Array.isArray(vvClientRes.data);
      const dataIsObject = typeof vvClientRes.data === "object";
      const isEmptyArray = dataIsArray && vvClientRes.data.length == 0;
      const isEmptyObject =
        dataIsObject && Object.keys(vvClientRes.data).length == 0;

      // If the data is empty, throw an error
      if (isEmptyArray || isEmptyObject) {
        throw new Error(
          `${shortDescription} returned no data. Please, check parameters and syntax. Status: ${status}.`
        );
      }
      // If it is a Web Service response, check that the first value is not an Error status
      if (dataIsArray) {
        const firstValue = vvClientRes.data[0];

        if (firstValue == "Error") {
          throw new Error(
            `${shortDescription} returned an error. Please, check called Web Service. Status: ${status}.`
          );
        }
      }
    }
    return vvClientRes;
  }

  /**********
     MAIN CODE 
    **********/

  try {
    // 1.GET THE VALUES OF THE FIELDS

    const parentFormID = getFieldValueByName("Form ID");

    // 2.CHECKS IF THE REQUIRED PARAMETERS ARE PRESENT

    if (!parentFormID) {
      // It could be more than one error, so we need to send all of them in one response
      throw new Error(errorLog.join("; "));
    }

    // 3.YOUR CODE GOES HERE //
    // 3.1 Get the "parentGUID" or "revisionId" of a given template

    shortDescription = `Get form with revisionID ${parentFormID}`;

    const getFormsParamsParent = {
      q: `[Form ID] eq '${parentFormID}'`,
      expand: true,
    };

    const getParentFormRes = await vvClient.forms
      .getForms(getFormsParamsParent, parentTemplateName)
      .then((res) => parseRes(res))
      .then((res) => checkMetaAndStatus(res, shortDescription))
      .then((res) => checkDataPropertyExists(res, shortDescription))
      .then((res) => checkDataIsNotEmpty(res, shortDescription));

    const parentGUID = getParentFormRes.data[0].revisionId;

    // 3.2 Get the "childGUID" or "revisionId" of a given template

    shortDescription = `Get form with revisionID ${childFormID}`;

    const getFormsParamsChild = {
      q: `[instanceName] eq '${childFormID}'`,
      expand: true,
    };

    const getChildFormRes = await vvClient.forms
      .getForms(getFormsParamsChild, childTemplateName)
      .then((res) => parseRes(res))
      .then((res) => checkMetaAndStatus(res, shortDescription))
      .then((res) => checkDataPropertyExists(res, shortDescription))
      .then((res) => checkDataIsNotEmpty(res, shortDescription));

    const childGUID = getChildFormRes.data[0].revisionId;

    // 2.Get related forms

    shortDescription = "Related Forms";
    const getRelatedForms = {
      q: "[Form ID] LIKE '%Another Form-%'",
    };

    const getRelatedResp = await vvClient.forms
      .getFormRelatedForms(parentGUID, getRelatedForms)
      .then((res) => parseRes(res))
      .then((res) => checkMetaAndStatus(res, shortDescription))
      .then((res) => checkDataPropertyExists(res, shortDescription));

    // 3. Check if the relationship between the forms records already exists

    var relationshipExists = false;

    if (getRelatedResp.data.length == 0) {
      // The form doesn't have existing relationship
      // 4. Relate forms by doc ID call

      shortDescription = `Relate Forms`;

      await vvClient.forms
        .relateForm(parentGUID, childGUID)
        .then((res) => parseRes(res))
        .then((res) => checkMetaAndStatus(res, shortDescription));
    } else {
      // The form has existing relationships
      // Check if a relationship is with the child form record

      const dataArray = getRelatedResp.data;

      for (let index = 0; index < dataArray.length; index++) {
        var currentRelation = dataArray[index];

        if (currentRelation.revisionId == childGUID) {
          // The relationship already exists
          relationshipExists = true;
          throw new Error(
            `${shortDescription} error. Reason: The form relationship already exists.`
          );
        }
      }

      if (!relationshipExists) {
        // The form record has relationships but no relationship is with the child form record
        // 4. Relate forms by doc ID call

        shortDescription = `Relate Forms`;

        await vvClient.forms
          .relateForm(parentGUID, childGUID)
          .then((res) => parseRes(res))
          .then((res) => checkMetaAndStatus(res, shortDescription));
      }
    }

    // 3.3 Relate forms call

    //vvClient.forms.relateForm(currentFormRevisionId, childFormRevisionId)
    //This function relates two form records of different forms templates.
    //Get as parameter:
    //currentFormRevisionId: The "formRevisionId" from the current form
    //childFormRevisionId: The "formRevisionId" of the child form

    // 4.BUILD THE SUCCESS RESPONSE ARRAY

    outputCollection[0] = "Success";
    outputCollection[1] = "Success short description here";
  } catch (error) {
    logger.info("Error encountered" + error);

    // BUILDS THE ERROR RESPONSE ARRAY

    outputCollection[0] = "Error";

    if (errorLog.length > 0) {
      outputCollection[1] = "Errors encountered";
      outputCollection[2] = `Error/s: ${errorLog.join("; ")}`;
    } else {
      outputCollection[1] = error.message
        ? error.message
        : `Unhandled error occurred: ${error}`;
    }
  } finally {
    // SENDS THE RESPONSE

    response.json(200, outputCollection);
  }
};
