const request = require("request");

const querystring = require("querystring");

const logger = require("../log");

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

const payPalUrl = "https://pilot-payflowpro.paypal.com";

module.exports.main = async function (ffCollection, vvClient, response) {
  /*Script Name: PayNowGetToken
  Customer: City of Lincoln
  Purpose: Builds the redirect token to use with PayPal / merchant services for credit card and ACH transactions
  Parameters:
          REVISIONID: form revision id
          Amount: payment amount (as string)
          Type: either 'ACH' or 'CC'
  Psuedo code: 
  Date of Dev: 07/22/2019
  Last Rev Date: 07/22/2019
  Revision Notes:
      07/22/2019 - JM - Initial release
  */

  try {
    let fieldValues = await validateAndSanitizeFormFields(ffCollection);

    let queryString = await buildQueryString(
      fieldValues.revisionId,
      fieldValues.amount,
      fieldValues.type,
      fieldValues.redirectUrl
    );

    let tokenData = await getToken(queryString);

    return response.json(200, ["Success", tokenData]);
  } catch (error) {
    logger.info(error.message);

    return response.json(200, ["Error", error.message]);
  }
};

const buildQueryString = (revisionId, amount, type, redirectUrl) => {
  //let url = 'https://dev.visualvault.com/app/CityofLincoln/Main/FormDetails?hidemenu=true&DataID=' + revisionId;

  let data = {
    PARTNER: "PayPal",
    VENDOR: "visualvault1",
    //VENDOR: 'lincolnTEST',
    USER: "vvpaypalapi",
    //USER: 'apiTEST',
    //PWD:'VisualVault!1',
    PWD: "5Idh8ijjNUX",
    TRXTYPE: "S",
    AMT: amount,
    CREATESECURETOKEN: "Y",
    SECURETOKENID: GenerateTokenId(),
    URLMETHOD: "GET",
    USER1: revisionId,
    USER2: "2",
    USER3: "1234",
    USER4: "2019-08-28",
    VERBOSITY: "HIGH",
    SILENTTRAN: "TRUE",
  };

  if (type === "ACH") {
    data.TENDER = "A";
    data.AUTHTYPE = "WEB";
    data.SILENTTRAN = "TRUE";
  } else {
    data.TENDER = "C";
  }

  let qs = querystring.stringify(data);

  qs += "&RETURNURL[" + redirectUrl.length + "]=" + redirectUrl;
  qs += "&ERRORURL[" + redirectUrl.length + "]=" + redirectUrl;
  qs += "&CANCELURL[" + redirectUrl.length + "]=" + redirectUrl;

  return qs;
};

const getToken = async (qs) => {
  let tokenResponse = await makeUrlEncodedPostRequest(payPalUrl, qs);

  let tokenData = {
    SECURETOKENID: tokenResponse.SECURETOKENID,
    SECURETOKEN: tokenResponse.SECURETOKEN,
    //PAYMENTURL: 'https://pilot-payflowlink.paypal.com?'
    PAYMENTURL: "https://payflowlink.paypal.com?",
  };

  return tokenData;
};

//////////////////////////////////////////////////////////
// HELPERS
//////////////////////////////////////////////////////////

const validateAndSanitizeFormFields = (ffCollection) => {
  const validateFormFieldExists = (fieldName, prettyName) => {
    if (
      ffCollection.getFormFieldByName(fieldName) &&
      ffCollection.getFormFieldByName(fieldName).value
    ) {
      return ffCollection.getFormFieldByName(fieldName).value;
    } else {
      throw new Error(prettyName + " required.");
    }
  };

  const validateExistsAndNumberOverZero = (fieldName, prettyName) => {
    if (
      ffCollection.getFormFieldByName(fieldName) &&
      ffCollection.getFormFieldByName(fieldName).value
    ) {
      if (isNaN(ffCollection.getFormFieldByName(fieldName).value)) {
        throw new Error(prettyName + " is not a number");
      } else {
        return ffCollection.getFormFieldByName(fieldName).value;
      }
    } else {
      throw new Error(prettyName + " required.");
    }
  };

  const validateFormFieldIsValidOption = (
    fieldName,
    prettyName,
    validOptions
  ) => {
    if (
      ffCollection.getFormFieldByName(fieldName) &&
      ffCollection.getFormFieldByName(fieldName).value
    ) {
      if (
        validOptions.includes(ffCollection.getFormFieldByName(fieldName).value)
      ) {
        return ffCollection.getFormFieldByName(fieldName).value;
      } else {
        throw new Error(prettyName + " is not valid");
      }
    } else {
      throw new Error(prettyName + " required.");
    }
  };

  let values = {
    //siteId: validateFormFieldExists('SITEID', 'Site id'),
    revisionId: validateFormFieldExists("REVISIONID", "Revision id"),
    amount: validateExistsAndNumberOverZero("Amount", "Payment amount"),
    type: validateFormFieldIsValidOption("Payment Method", "Payment type", [
      "ACH",
      "Credit Card",
    ]),
    redirectUrl: validateFormFieldExists("RedirectURL", "Redirect URL"),
    //recordId: validateFormFieldExists('RECORDID', 'Record id')
  };

  return Promise.resolve(values);
};

const GenerateTokenId = () => {
  return Math.random().toString(36).slice(2);
};

const makeUrlEncodedPostRequest = (url, qs) => {
  return new Promise((resolve, reject) => {
    request.post(
      {
        url: url,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: qs,
      },
      (error, response, body) => {
        if (error) {
          reject(error);
        } else {
          let resultData = querystring.parse(body);

          resolve(resultData);
        }
      }
    );
  });
};
