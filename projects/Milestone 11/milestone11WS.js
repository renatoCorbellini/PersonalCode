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

module.exports.main = async function (vvClient, response, token) {
  /*
      Script Name:   SCRIPT NAME HERE
      Customer:      CUSTOMER NAME HERE
      Purpose:       The purpose of this script is to...
      Parameters:    The following are parameters that need to be passed into this libarary node script.
                     - Parameters are not required for a scheduled process.
 
      Return Object:
                     - Message will be sent back to VV as part of the ending of this scheduled process.
      Psuedo code:
                     1. Acquire the license lookup record that matches the license.
 
      Date of Dev:   07/30/2021
      Last Rev Date:
 
      Revision Notes:
      07/30/2021 - DEVELOPER NAME HERE:  First Setup of the script
     */

  logger.info("Start of logic for SCRIPT NAME HERE on " + new Date());

  // You will see the responseMessage in the scheduled process log ONLY if the process runs manually.
  response.json(200, "Start of logic for SCRIPT NAME HERE on " + new Date());

  /***************
     Error handling
    ****************/

  // Array for capturing error messages that may occur during the execution of the script.
  let errorLog = [];

  /***********************
     Configurable Variables
    ************************/

  const someTemplateName = "Milestone 11 test harness";

  /*****************
     Script Variables
    ******************/

  let responseMessage = "";
  const scheduledProcessGUID = token;
  // Describes the process being checked using the parsing and checking helper functions
  let shortDescription = "";

  /*****************
     Helper Functions
    ******************/

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
      // If an error ocurrs, it's because the resp is already a JS object and doesn't need to be parsed
    }
    return vvClientRes;
  }

  function checkMetaAndStatus(
    vvClientRes,
    shortDescription,
    ignoreStatusCode = 999
  ) {
    /*
        Checks that the meta property of a vvCliente API response object has the expected status code
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
        Checks that the data property of a vvCliente API response object exists 
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
        Checks that the data property of a vvCliente API response object is not empty
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

    const country = "United States of America";
    const state = "Florida";

    // 2.GET ALL THE FORM RECORDS THAT HAVE THE SAME COUNTRY AND STATE

    const getFormsParams = {
      q: `[Country] eq '${country}' AND [State] eq '${state}'`,
      expand: true, // true to get all the form's fields
    };

    const getFormsRes = await vvClient.forms
      .getForms(getFormsParams, someTemplateName)
      .then((res) => parseRes(res))
      .then((res) => checkMetaAndStatus(res, shortDescription))
      .then((res) => checkDataPropertyExists(res, shortDescription))
      .then((res) => checkDataIsNotEmpty(res, shortDescription));

    //3. CYLCE THROUGH EVERY RECORD FOUND

    let errorLog = [];
    getFormsRes.data.forEach(async (form) => {
      try {
        const formGUID = form["revisionId"];
        shortDescription = `Update form ${formGUID}`;

        //4. BUILD THE DATA ARRAY TO BE UPDATED

        const formFieldsToUpdate = {
          "First Name": "JOHN",
          "Last Name": "SMITH",
          Address: "18 DE JULIO 778",
        };

        //5. UPDATE THE RECORD
        await vvClient.forms
          .postFormRevision(
            null,
            formFieldsToUpdate,
            someTemplateName,
            formGUID
          )
          .then((res) => parseRes(res))
          .then((res) => checkMetaAndStatus(res, shortDescription))
          .then((res) => checkDataPropertyExists(res, shortDescription))
          .then((res) => checkDataIsNotEmpty(res, shortDescription));
      } catch (error) {
        errorLog.push(error);
      }
    });

    //6. SEND THE SUCCESS RESPONSE MESSAGE

    responseMessage = "Success";

    // You will see the responseMessage in the scheduled process log ONLY if the process runs automatically.
    return vvClient.scheduledProcess.postCompletion(
      scheduledProcessGUID,
      "complete",
      true,
      responseMessage
    );
  } catch (error) {
    // SEND THE ERROR RESPONSE MESSAGE

    if (errorLog.length > 0) {
      responseMessage = `Error/s: ${errorLog.join("; ")}`;
    } else {
      responseMessage = `Unhandeled error occurred: ${error}`;
    }

    // You will see the responseMessage in the scheduled process log ONLY if the process runs automatically.
    return vvClient.scheduledProcess.postCompletion(
      scheduledProcessGUID,
      "complete",
      false,
      responseMessage
    );
  }
};
