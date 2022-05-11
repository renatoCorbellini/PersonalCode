const logger = require("../log");
const moment = require("moment");
module.exports.getCredentials = function () {
  var options = {};
  options.customerAlias = "CAGaming";
  options.databaseAlias = "Default";
  options.userId = "ca.admin";
  options.password = "Au3rs0ft1";
  options.clientId = "4426f41a-0e49-4df7-b6ac-55df031605fd";
  options.clientSecret = "kZsf9b88r77DOBDPVvVGS7q6Plez3v43VeZye5OLxGQ=";
  return options;
};

module.exports.main = async function (ffCollection, vvClient, response) {
  /*
    Script Name:    FeeLookupSave.js
    Customer:       CA Gaming
    Purpose:        This script allows to save fee lookups using time intervals that do not overlap with other time intervals on the system and their beginning/end dates are at least one day apart

    Parameters:     The following represent variables passed into the function:
                    feeName: fee name used to search for records already in VV that must not overlap
                    startDate: day (inclusive) when the fee validity ends
                    endDate: day (inclusive) when the fee validity ends
    Return Object:
                    outputCollection[0]: Status
                    outputCollection[1]: Short description message
                    outputCollection[2]: description message
    Pseudo code: 
              1° Get all the fee lookup forms that have the same fee name
              2° Iterate trough the obtained fee lookup forms and using the start and end dates (parameters) check that they do not overlap with any fee lookup on the system
              3° Verify that the fee lookup to be saved start and end dates are at least one day apart
              4° Send error or output collection to system
              ...
 
    Date of Dev:   04/28/2021
    Last Rev Date: 04/28/2021
 
    Revision Notes:
    04/28/2021 - Mauricio Tolosa:  First Setup of the script
    */

  logger.info("Start of the process FeeLookupSave at " + Date());

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

  const templateName = "Fee Lookup";

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

    const feeName = getFieldValueByName("Fee Name");
    const feeValue = getFieldValueByName("Fee Value");
    const startDate = new Date(getFieldValueByName("Effectivity Start Date"));
    const endDate = new Date(getFieldValueByName("Effectivity End Date"));
    const docID = getFieldValueByName("Form Identification");
    // 2.CHECKS IF THE REQUIRED PARAMETERS ARE PRESENT

    if (!feeName || !feeValue || !startDate || !endDate || !docID) {
      // It could be more than one error, so we need to send all of them in one response
      throw new Error(errorLog.join("; "));
    }

    // 3.YOUR CODE GOES HERE //
    const getFormsParams = {
      // AND [Form Identification] NOT eq '${docID}'
      q: `[Fee Name] eq '${feeName}' AND [Form Identification] ne '${docID}'`,
      expand: true, // true to get all the form's fields
      // fields: 'id,name', // to get only the fields 'id' and 'name'
    };
    shortDescription = `get Fee Lookups form that have the same fee lookup name`;
    let getFormsRes = await vvClient.forms
      .getForms(getFormsParams, templateName)
      .then((res) => parseRes(res))
      .then((res) => checkMetaAndStatus(res, shortDescription))
      .then((res) => checkDataPropertyExists(res, shortDescription));

    //map the obtained results to check if there is overlapping between the data on Visual Vault and the form trying to be saved
    if (getFormsRes.data.length >= 1) {
      getFormsRes.data.map((obtainedFeeLookup) => {
        const obtainedStartDate = new Date(
          obtainedFeeLookup["effectivity Start Date"]
        );
        const obtainedEndDate = new Date(
          obtainedFeeLookup["effectivity End Date"]
        );

        //the if will throw an error if day overlap, look at the beginning1, ending1, beginning2,ending2 simplified condition used to find if the two intervals overlap
        // b2 <= b1 <= e2 || b2 <= e1 <= e2 || b1 <= b2 <= e1 || b1 <= e2 <= e1;

        if (
          (+startDate <= +obtainedStartDate &&
            +obtainedStartDate <= +endDate) ||
          (+startDate <= +obtainedEndDate && +obtainedEndDate <= +endDate) ||
          (+obtainedStartDate <= +startDate &&
            +startDate <= +obtainedEndDate) ||
          (+obtainedStartDate <= +endDate && +endDate <= +obtainedEndDate)
        ) {
          const recordInSystem = obtainedFeeLookup["dhdocid1"];
          throw new Error(
            `The begin/end dates must be a day apart at least and cant overlap with existent interval ('${recordInSystem}')`
          );
        } else {
          //given they do not overlap and begin/end dates are inclusive, we must make sure that the beginning/end dates are one day apart at least
          //e2b1 and e1b2 are the extremes to be considered
          let beginning1 = moment(startDate);
          let end1 = moment(endDate);
          let beginning2 = moment(obtainedStartDate);
          let end2 = moment(obtainedEndDate);
          let e2b1Difference = beginning1.diff(end2, "days");
          let e1b2Difference = end1.diff(beginning2, "days");

          if (Math.abs(e2b1Difference) > 1 || Math.abs(e1b2Difference) > 1) {
            outputCollection[0] = "Success";
            outputCollection[1] = "Form Can be Saved";
            outputCollection[2] =
              "Date intervals do not overlap and have at least one day of separation between their beginning and endings";
          } else {
            throw new Error(
              `The begin/end dates is not at least a day apart from '${obtainedFeeLookup["dhdocid1"]}'`
            );
          }
        }
      });
    }

    if (getFormsRes.data.length === 0) {
      outputCollection[0] = "Success";
      outputCollection[1] =
        "Form Can be Saved as is the only one on the system of this type";
    }
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
