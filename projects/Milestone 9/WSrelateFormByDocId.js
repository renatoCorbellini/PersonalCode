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
    Script Name:    relateFormByDocId
    Customer:       Renato Corbellini
    Purpose:        The purpous of this WS is to relate to form records from different form templates
    Parameters:     The following represent variables passed into the function:
                    
    Return Object:
                    outputCollection[0]: Status
                    outputCollection[1]: Short description message
                    outputCollection[2]: Data
    Pseudo code: 
              1° Does this
              2° Does that
              ...
 
    Date of Dev:   03/31/2022
    Last Rev Date: 04/01/2022
 
    Revision Notes:
     03/31/2022 - RENATO CORBELLINI:  First Setup of the script
     04/01/2022 - RENATO CORBELLINI:  Adding error handling when the relationships between 
     the form records already exists
    */

  logger.info("Start of the process relateFormByDocId at " + Date());

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
  const childFormID = "Document-000015";

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
    // 3.1 Get the "parentGUID" or "revisionID" of a given template

    shortDescription = `Get form with revisionID ${parentFormID}`;

    const getFormsParams = {
      q: `[Form ID] eq '${parentFormID}'`,
      expand: true,
    };

    const getParentFormRes = await vvClient.forms
      .getForms(getFormsParams, parentTemplateName)
      .then((res) => parseRes(res))
      .then((res) => checkMetaAndStatus(res, shortDescription))
      .then((res) => checkDataPropertyExists(res, shortDescription))
      .then((res) => checkDataIsNotEmpty(res, shortDescription));

    const parentGUID = getParentFormRes.data[0].revisionId;

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

    // 3. Check if the relationship between the form records already exists

    var relationshipExists = false;

    if (getRelatedResp.data.length == 0) {
      // The form doesn't have existing relationship
      // 4. Relate forms by doc ID call

      shortDescription = `relating forms: ${parentGUID} and form ${childFormID}`;

      await vvClient.forms
        .relateFormByDocId(parentGUID, childFormID)
        .then((res) => parseRes(res))
        .then((res) => checkMetaAndStatus(res, shortDescription));
    } else {
      // The form has existing relationships
      // Check if a relationship is with the child form record

      const dataArray = getRelatedResp.data;

      for (let index = 0; index < dataArray.length; index++) {
        var currentRelation = dataArray[index];

        if (currentRelation.instanceName == childFormID) {
          // The relationship already exists
          relationshipExists = true;
          throw new Error(
            `${shortDescription} error. Reason: The form relationship already exists.`
          );
        }
      }

      // Look for foreach, .map, filter

      if (!relationshipExists) {
        // The form record has relationships but no relationship is with the child form record
        // 4. Relate forms by doc ID call

        shortDescription = `relating forms: ${parentGUID} and form ${childFormID}`;

        await vvClient.forms
          .relateFormByDocId(parentGUID, childFormID)
          .then((res) => parseRes(res))
          .then((res) => checkMetaAndStatus(res, shortDescription));
      }
    }

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
