var vvEntities = require("../VVRestApi");
var logger = require("../log");

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

module.exports.main = function (vvClient, response) {
  /*Script Name:   POLimitNotification
     Customer:      California Office of Problem Gambling, Department of Public Health
     Purpose:       The purpose of this script is to gather information and perform actions to support notifiying providers that they are at their PO Limit.
     Date of Dev:   08/2013
     Last Rev Date: 10/06/2018

     Revision Notes:
     8/2013 - At this time we are writing the code in nodejs to complete the same functions as is currently being
     executed in the .NET web services.
     07/29/2014 - Jason: Moved form template IDs to the top of the code for ease of rollout and maintenance.
     08/01/2014 - Jason: Added handling of group and supervisor treatment into PO limit.
     08/14/2014 - Jason: Changed query for supervisor log.  Date field changed to Meeting Date instead of Submit Date.
     Corrected loading of POUsage.  Was using +=.  This was not loading correctly and had a value of NaN when walking.  Assigning with = resolved.
     Changed order of loading for billable client intake types.  There was not a means to strip off the OR.
     09/15/2014 - Jason: Updated to correct bugs encountered when troubleshooting issues in development.  Bug 1 was the total was not included in the query.  Bug 2 was the total needed to be changed from ['Total']
     to ['total'] when adding to the total.  Final one was when adding outstanding questionnaires to PO Usage, was not adding to Invoice totals previously added to po usage.
     09/17/2014 - Jason: Update template variables to be standard across all processes.
     10/07/2015 - Jason: When processing questionnaires to determine if they are billable, the parenthesis was in the wrong place when calling FindVal.  All records were tagged as billable.  Moved ) to be after case number
     instead of after the != -1)
     10/08/2015 - Jason: Update query to get list of billable client intake forms within a specific range of when the intake form was modified.  When loading caseID into the billable array, the value was CasId so it was not loading any case ids.
     10/06/2018 - Kendra: 2018 Codebook Project. Updated TQF query to account for new Questionnaire Type format (30 Day Follow-Up instead of Follow-up 30 Day)
     04/28/2020 - Morgan: Add billableTypes.push to include Problem Gambling Telephone Intervention
     05/12/2022 - Renato Corbellini: Added helper functions parseRes, getFeeValue, checkMetaAndStatus and checkDataPropertyExists used in the getCustomQueryResultByName to bring the active fees from VV instead of hard coding them.
     */

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

  function getFeeValue(feeArray, feeName) {
    try {
      const feeFound = feeArray.data.find((fee) => fee["fee Name"] == feeName);
      return feeFound["fee Value"];
    } catch (e) {
      // If an error ocurrs, it's because it the fee is not present in the active fees query
    }
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

  // GET ALL THE FEES THAT ARE ACTIVE (CURRENT DATE >= EFFECTIVITY START DATE AND CURRENT DATE <= EFECTIVITY END DATE)

  const queryName = "zWebSvc Active Fees";
  let shortDescription = "Custom Query trying to get active fees";

  const customQueryResp = await vvClient.customQuery
    .getCustomQueryResultsByName(queryName)
    .then((res) => parseRes(res))
    .then((res) => checkMetaAndStatus(res, shortDescription))
    .then((res) => checkDataPropertyExists(res, shortDescription));

  //Following are variables that determine the value for each item included in the invoice.
  var basePOValue = getFeeValue(customQueryResp, "Base PO Value"); //Keeps track of the base value of any starting PO limit.
  var intakeValue = getFeeValue(customQueryResp, "Intake Value"); //Keeps track of the value for the intake questionnaire forms.
  var intreatmentValue = getFeeValue(customQueryResp, "Intreatment Value"); //Keeps track of the value of an in-treatment type questionnaire.
  var endoftreatValue = getFeeValue(customQueryResp, "End of Treatment Value"); //Keeps track of the value of an end of treatment type questionnaire.
  var poLimitThreshold = getFeeValue(customQueryResp, "Base PO Value"); //Keeps track of the PO Limit threshold when providers can submit a request for addl services.
  var groupScreeningValue = getFeeValue(
    customQueryResp,
    "Group Screening Value"
  );
  var groupIntreatValue = getFeeValue(customQueryResp, "Group Intreat Value");
  var groupEOTValue = getFeeValue(customQueryResp, "Group EOT Value");
  var supervisorValue = getFeeValue(customQueryResp, "Supervisor Value");

  var includeGroupScreening = 1; //Controls if groups screening are billable or not.  0 = no, 1 = yes.
  var includeSupervisorLog = 1; //Controls if supervisor logs are billable or not.  0 = no, 1 = yes.

  var amtDaysIntakeModified = 360; //Time allowed in the past for invoicing

  var numProviders = 0; //This variable keeps track of the number of clients returned for processing.

  logger.info("Entering into the POLimitNotification process" + new Date());

  var formIDAddlCoveredServices = "416539f4-d884-e411-80ce-0050568dab13"; //Form Template ID for Additional Covered Services Form
  var formIDClientExemption = "5d3555f9-5585-e411-80ce-0050568dab13"; //Form Template ID for Client Exemption form
  var formIDClientIntake = "353e0441-5885-e411-80ce-0050568dab13"; //Form Template ID for Client Intake form
  var formIDEndofTreatment = "d8a18867-5685-e411-80ce-0050568dab13"; //Form Template ID for Outpatient End of Treatment Form
  var formIDGroupEndofTreatment = "a41c40e0-5885-e411-80ce-0050568dab13"; //Form Template ID for Group End of Treatment form
  var formIDGroupExemption = "f80b8d71-9184-e411-80c6-0050568dbd2f"; //Form Template ID for Group Exemption Form
  var formIDGroupFollowup = "d347c1f1-5985-e411-80ce-0050568dab13"; //Form Template ID for Group Follow-up form
  var formIDGroupInTreatment = "6d3e7711-5a85-e411-80ce-0050568dab13"; //Form Template ID for Group In-Treatment form
  var formIDGroupProviderApp = "b763aaed-9984-e411-80c6-0050568dbd2f"; //Form Template ID for Group Provider Application
  var formIDGroupSession = "fa5d5fb3-5a85-e411-80ce-0050568dab13"; //Form Template ID for Group Session form
  var formIDGroupTreatmentScreening = "42fb2f97-5b85-e411-80ce-0050568dab13"; //Form Template ID for Group Treatment Screening Form.  Acts as Intake for Group Treatment
  var formIDInvoiceForm = "b239e216-01f7-e311-bf0f-001b2170fb85"; //Form Template ID for Invoice Form
  var formIDProviderForm = "78f2517f-1ace-e211-b58c-001b2170fb85"; //Form Template ID for Provider Form
  var formIDProviderLocation = ""; //Form Template ID for Provider Location Form.  Only used for AZ Gaming
  var formIDRESIOPEndofTreatment = "441fbb52-a384-e411-80c6-0050568dbd2f"; //Form Template ID for Residential/Intensive Outpatient (IOP) End of Treatment Form
  var formIDResIOPTreatmentQuestionnaire =
    "f51d128a-a484-e411-80c6-0050568dbd2f"; //Form Template ID for Residential/Intensive Outpatient (IOP) Treatment Quesitonnaire
  var formIDSupervisorLog = "df955fd4-b684-e411-80ce-0050568dab13"; //Form Template ID for Supervisor Log
  var formIDTreatmentQuestionnaire = "7ebffef0-a2f8-e311-bf0f-001b2170fb85"; //Form Template ID for Outpatient Treatment Questionnaire

  var outputCollection = []; //Variable for communication back to the form as an array.  [0] for message, [1] for data.
  outputCollection[2] = 0; //Assign 0 so form is not saved.  1 will cause form to save.

  //Calculate Fiscal Period
  var d = new Date();
  var thisYear = d.getFullYear();
  var thisMonth = d.getMonth();
  var beginFiscalDate = new Date();
  var endFiscalDate = new Date();

  if (thisMonth > 5) {
    beginFiscalDate = thisYear + "-07-01T00:00:00Z";
    endFiscalDate = thisYear + 1 + "-06-30T00:00:00Z";
  } else {
    beginFiscalDate = thisYear - 1 + "-07-01T00:00:00Z";
    endFiscalDate = thisYear + "-06-30T23:59:59Z";
  }

  //Calculate date range to get list of intakes for billable forms.  Also used to determine the scope of how far back things can be invoiced.
  var thisDate = new Date();
  var rangeHolder = new Date(thisDate);
  rangeHolder.setDate(rangeHolder.getDate() - amtDaysIntakeModified);
  var rangeDaysIntakeModified = rangeHolder.toISOString();

  //List of billable intake types
  var billableTypes = [];
  billableTypes.push("Outpatient");
  billableTypes.push("Problem Gambling Telephone Intervention"); //Added this 04/28/2020

  var providerList = []; //Array used to hold the list of providers and the objects representing each provider.

  var Q = require("q");

  //Client Intake Forms
  //---Need to grab only the client intake forms that have a billable intake type
  //Use the invoiceablePrograms array to load the query string dynamically.
  var intakeQuery = "";
  var x = 0;
  for (var item in billableTypes) {
    intakeQuery =
      intakeQuery + "[Type of Program] eq '" + billableTypes[x] + "' OR ";
    x = x + 1;
  }

  intakeQuery = intakeQuery.substr(0, intakeQuery.length - 4); //strip off the last OR.

  var clientIntakeData = {};
  //clientIntakeData.q = intakeQuery;     //Commented this line out because of an issue where notification was including all questionnaires for a provider that should not have been included.  10/8/2015
  clientIntakeData.q =
    "[modifydate] gt '" +
    rangeDaysIntakeModified +
    "' AND (" +
    intakeQuery +
    ")";
  clientIntakeData.fields =
    "RevisionID,InstanceName,createdate,createby,ProviderID,ClientID,CaseID,Status,LastVisitDate,Type of Program";
  clientIntakeData.offset = 0;
  clientIntakeData.limit = 3000;

  //Provider
  var provData = {};
  provData.q = "[OPG Notified] eq 'False'";
  provData.fields =
    "ProviderID,Provider Name,Address,City,State,ZipCode,instanceName,OPG Notified";
  provData.offset = 0;
  provData.limit = 1000;

  //Questionnaires - Only grab non-invoiced, non-follow-up questionnaires within the current fiscal year
  var formQuestData = {}; //Setup the object used to find the questionnaires.
  formQuestData.q =
    "[Questionnaire Date] BETWEEN '" +
    beginFiscalDate +
    "' AND '" +
    endFiscalDate +
    "' AND [Questionnaire Type] NOT LIKE '%Follow-up' AND [Invoiced] eq 'False'";
  formQuestData.fields =
    "InstanceName,createdate,createby,ProviderID,Questionnaire Type,Questionnaire Date,ClientID,CaseID,Visit,Type of Client";
  formQuestData.offset = 0;
  formQuestData.limit = 30000;

  //Additional Covered Services
  var formAddlSvcData = {}; //Setup the object used to find the Additional Covered Services in a fiscal year.
  formAddlSvcData.q =
    "[Covered Date] BETWEEN '" +
    beginFiscalDate +
    "' AND '" +
    endFiscalDate +
    "' AND [Request Status] eq 'Approved'";
  formAddlSvcData.fields =
    "InstanceName,createdate,createby,Provider ID,Request Status,Current PO Limit,Current PO Usage,PO Increment";
  formAddlSvcData.offset = 0;
  formAddlSvcData.limit = 3000;

  //VV Sites
  var siteParams = {};
  siteParams.fields = "id,name,description,sitetype";

  //Invoices
  var formInvoiceData = {};
  formInvoiceData.q =
    "[Start Range] ge '" +
    beginFiscalDate +
    "' AND [End Range] le '" +
    endFiscalDate +
    "' AND [Status] eq 'Approved'";
  formInvoiceData.fields =
    "InstanceName,Status,createdate,createby,ProviderID,Total";
  formInvoiceData.offset = 0;
  formInvoiceData.limit = 3000;

  //Get list of group screening that have not been invoiced
  var formGroupScreeningData = {};
  formGroupScreeningData.q =
    "[Screening Date] BETWEEN '" +
    beginFiscalDate +
    "' AND '" +
    endFiscalDate +
    "' AND [Invoiced] eq 'False'";
  formGroupScreeningData.fields =
    "InstanceName,createdate,createby,ProviderID,Screening Date,Invoiced";
  formGroupScreeningData.offset = 0;
  formGroupScreeningData.limit = 3000;

  //Get list of group in-treatment that have not been invoiced.
  var formGroupIntreatData = {};
  formGroupIntreatData.q =
    "[Session Date] BETWEEN '" +
    beginFiscalDate +
    "' AND '" +
    endFiscalDate +
    "' AND [Invoiced] eq 'False' AND [Validated] eq 'True'";
  formGroupIntreatData.fields =
    "InstanceName,createdate,createby,ProviderID,Invoiced,Validated";
  formGroupIntreatData.offset = 0;
  formGroupIntreatData.limit = 3000;

  //Get list of group end of treatment that have not been invoiced.
  var formGroupEOTData = {};
  formGroupEOTData.q =
    "[Discharge Date] BETWEEN '" +
    beginFiscalDate +
    "' AND '" +
    endFiscalDate +
    "' AND [Invoiced] eq 'False'";
  formGroupEOTData.fields =
    "InstanceName,createdate,createby,ProviderID,Invoiced";
  formGroupEOTData.offset = 0;
  formGroupEOTData.limit = 3000;

  //Get list of supervisor logs that have not been invoiced.
  var formSupervisorLogData = {};
  formSupervisorLogData.q =
    "[Meeting Date] BETWEEN '" +
    beginFiscalDate +
    "' AND '" +
    endFiscalDate +
    "' AND [Invoiced] eq 'False'";
  formSupervisorLogData.fields =
    "InstanceName,createdate,createby,ProviderID,Invoiced";
  formSupervisorLogData.offset = 0;
  formSupervisorLogData.limit = 3000;

  Q.allSettled([
    vvClient.forms.getForms(provData, formIDProviderForm), //Nodejs helper function to get the a list of providers in the system.
    vvClient.forms.getForms(formQuestData, formIDTreatmentQuestionnaire), //Nodejs helper function to get questionaires for the fiscal period that are not follow-up type.
    vvClient.forms.getForms(formAddlSvcData, formIDAddlCoveredServices), //Nodejs helper function to get ACS forms for the fiscal period.
    vvClient.forms.getForms(clientIntakeData, formIDClientIntake),
    vvClient.forms.getForms(formInvoiceData, formIDInvoiceForm),
    vvClient.sites.getSites(siteParams),
    vvClient.forms.getForms(
      formGroupScreeningData,
      formIDGroupTreatmentScreening
    ),
    vvClient.forms.getForms(formGroupIntreatData, formIDGroupInTreatment),
    vvClient.forms.getForms(formGroupEOTData, formIDGroupEndofTreatment),
    vvClient.forms.getForms(formSupervisorLogData, formIDSupervisorLog),
  ]).then(function (promises) {
    var promiseProvider = promises[0]; //Results from the getForms call for treatment questionnaires.
    var promiseQuestionnaires = promises[1]; //Results from the getForms call for treatment questionnaires.
    var promiseAddlCovSvc = promises[2];
    var promiseClientIntake = promises[3];
    var promiseInvoices = promises[4];
    var promiseLocationProvider = promises[5];
    var promiseGroupScreening = promises[6];
    var promiseGroupIntreat = promises[7];
    var promiseGroupEOT = promises[8];
    var promiseSupervisorLog = promises[9];

    try {
      var billableCaseIDs = [];
      //Get the list of billable client intakes to search them as billable items or not later on in code.
      if (promiseClientIntake.state == "fulfilled") {
        var formClientIntakeData = JSON.parse(promiseClientIntake.value);
        if (
          formClientIntakeData.meta.status == "200" &&
          formClientIntakeData.data.length > 0
        ) {
          logger.info("Billable client intake forms found");
          //Grab all the case ID's from the list of billable client intake forms and store them in the array
          for (var c = 0; c < formClientIntakeData.data.length; c++) {
            billableCaseIDs.push(formClientIntakeData.data[c].caseID);
          }
        } else {
          logger.info("Billable client intake forms not found");
        }
      }

      //Gets the site for providers where they have not been notified as being near PO Limit.
      if (promiseProvider.state == "fulfilled") {
        //Clean results from the getForms call.
        var formProviderData = JSON.parse(promiseProvider.value);
        if (
          formProviderData.meta.status == "200" &&
          formProviderData.data.length > 0
        ) {
          //Records returned when status = 200 and length says the number of records returned.
          logger.info("Selected Provider Site Found");
          for (i = 0; i < formProviderData.data.length; i++) {
            //Loop to load the providers into an object and then put the object into an array.
            var providerObject = {};
            providerObject["provid"] = formProviderData.data[i].providerID; //Provider ID.
            providerObject["revid"] = formProviderData.data[i].revisionId; //Revision ID of the Provider form.  used for updating the provider later.
            providerObject["siteid"] = ""; //The GUID for the provider location/site in VV.
            providerObject["acsforms"] = 0; //Number of ACS forms approved in fiscal period.
            providerObject["intake"] = 0; //Number of intake forms for fiscal period that have not been billed.
            providerObject["intreat"] = 0; //Number of in-treatment forms for fiscal period that have not been billed.
            providerObject["eot"] = 0; //Number of eot forms for fiscal period that have not been billed.
            providerObject["polimit"] = basePOValue; //Will hold the PO Limit calculated for the provider.  Setting here in case there are not ASC forms.
            providerObject["pousage"] = 0; //Will hold the PO Usage calculation for the provider.
            providerObject["groupscreening"] = 0; //Number of group session forms for fiscal period that have not been billed.
            providerObject["groupintreat"] = 0; //Number of group intreatment forms for fiscal period that have not been billed.
            providerObject["groupeot"] = 0; //Number of group eot forms for fiscal period that have not been billed.
            providerObject["supervisor"] = 0; //Number of supervisor forms for fiscal period that have not been billed.
            providerList.push(providerObject);
            numProviders++;
          }
        } else {
          logger.info("Selected Provider form not found");
          response.JSON(200, "No provider forms were found");
        }

        //Get all questionnaires that have not been invoiced and are not follow-up type questionnaires.  Load information into the provider array to tell how many questionnaires are not invoiced.
        if (promiseQuestionnaires.state == "fulfilled") {
          //Clean results from the getForms call.
          var formQuestResultData = JSON.parse(promiseQuestionnaires.value);
          if (
            formQuestResultData.meta.status == "200" &&
            formQuestResultData.data.length > 0
          ) {
            //Records returned when status = 200 and length says the number of records returned.
            logger.info("Questionnaire Forms found.");
            //Go through the clients to load the number of intake, in-treatment and eot forms for each provider.
            for (i = 0; i < numProviders; i++) {
              var intakeCount = 0;
              var intreatCount = 0;
              var eotCount = 0;
              for (a = 0; a < formQuestResultData.data.length; a++) {
                //Loop through questionnaire results to calculate number of questionnaires for each type.
                //Only add questionnaires that are part of a billable program, and also belong to the current provider being examined
                if (
                  providerList[i].provid ==
                    formQuestResultData.data[a].providerID &&
                  FindVal(
                    billableCaseIDs,
                    formQuestResultData.data[a].CaseID
                  ) != -1
                ) {
                  if (
                    formQuestResultData.data[a]["questionnaire Type"] ==
                    "Intake"
                  ) {
                    intakeCount++;
                  } else if (
                    formQuestResultData.data[a]["questionnaire Type"] ==
                    "In-Treatment"
                  ) {
                    intreatCount++;
                  } else if (
                    formQuestResultData.data[a]["questionnaire Type"] ==
                    "End of Treatment"
                  ) {
                    eotCount++;
                  }
                }
              }
              providerList[i].intake = intakeCount; //Loading items to the provider array
              providerList[i].intreat = intreatCount;
              providerList[i].eot = eotCount;
            }
          } else {
            logger.info("No Questionnaire forms found");
          }
        }

        //Get all request for additional service forms for the provider.
        if (promiseAddlCovSvc.state == "fulfilled") {
          //Clean results from the getForms call.
          var formACSData = JSON.parse(promiseAddlCovSvc.value);
          if (formACSData.meta.status == "200" && formACSData.data.length > 0) {
            //Records returned when status = 200 and length says the number of records returned.
            logger.info("ACS Forms found.");
            for (i = 0; i < numProviders; i++) {
              //Load the ACS Forms for each client and gather PO increments/limit.
              var ascValue = basePOValue;

              for (a = 0; a < formACSData.data.length; a++) {
                if (
                  providerList[i].provid ==
                    formACSData.data[a]["provider ID"] &&
                  formACSData.data[a]["pO Increment"] == null
                ) {
                  ascValue = ascValue + basePOValue;
                } else if (
                  providerList[i].provid ==
                    formACSData.data[a]["provider ID"] &&
                  formACSData.data[a]["pO Increment"] > 0
                ) {
                  ascValue =
                    ascValue + Number(formACSData.data[a]["pO Increment"]);
                }
              }
              providerList[i].polimit = ascValue; //Put the PO Limit into the client object and array.
            }
          } else {
            logger.info("No ACS forms found");
          }
        }

        //Load the vv site location id and name
        if (promiseLocationProvider.state == "fulfilled") {
          var siteProviderData = JSON.parse(promiseLocationProvider.value);
          if (
            siteProviderData.meta.status == "200" &&
            siteProviderData.data.length > 0
          ) {
            logger.info("Locations were found");
            for (i = 0; i < numProviders; i++) {
              //Load the GUID for the site/location from VV for the provider to help get the users in the site for email addresses later.
              for (a = 0; a < siteProviderData.data.length; a++) {
                if (providerList[i].provid == siteProviderData.data[a].name) {
                  providerList[i].siteid = siteProviderData.data[a].id;
                }
              }
            }
          } else {
            logger.info("Locations not found");
          }
        }

        //Calculate the invoices that have been approved and add the amount to the running PO limit.
        if (promiseInvoices.state == "fulfilled") {
          var invoiceData = JSON.parse(promiseInvoices.value);
          if (invoiceData.meta.status == "200" && invoiceData.data.length > 0) {
            logger.info("Invoices were found");
            for (i = 0; i < numProviders; i++) {
              for (a = 0; a < invoiceData.data.length; a++) {
                if (providerList[i].provid == invoiceData.data[a].providerID) {
                  providerList[i].pousage += Number(
                    invoiceData.data[a]["total"]
                  );
                }
              }
            }
          } else {
            logger.info("No Invoices Found");
          }
        }

        //Load the number of uninvoiced group sessions into the provider array when they should be included in billing.  Otherwise the value will remain zero.
        if (includeGroupScreening == 1) {
          if (promiseGroupScreening.state == "fulfilled") {
            var groupScreeningData = JSON.parse(promiseGroupScreening.value);
            if (
              groupScreeningData.meta.status == "200" &&
              groupScreeningData.data.length > 0
            ) {
              logger.info("Group Screening were found");
              for (i = 0; i < numProviders; i++) {
                var groupScreenCount = 0;
                for (a = 0; a < groupScreeningData.data.length; a++) {
                  if (
                    providerList[i].provid ==
                    groupScreeningData.data[a].providerID
                  ) {
                    groupScreenCount = groupScreenCount + 1;
                  }
                }
                providerList[i].groupscreening = groupScreenCount;
              }
            } else {
              logger.info("No Group Screening Found");
            }
          }
        }

        //Load the number of uninvoiced group in-treatment forms into the provider array.
        if (promiseGroupIntreat.state == "fulfilled") {
          var groupIntreatData = JSON.parse(promiseGroupIntreat.value);
          if (
            groupIntreatData.meta.status == "200" &&
            groupIntreatData.data.length > 0
          ) {
            logger.info("Group intreat were found");
            for (i = 0; i < numProviders; i++) {
              var groupIntreatCount = 0;
              for (a = 0; a < groupIntreatData.data.length; a++) {
                if (
                  providerList[i].provid == groupIntreatData.data[a].providerID
                ) {
                  groupIntreatCount = groupIntreatCount + 1;
                }
              }
              providerList[i].groupintreat = groupIntreatCount;
            }
          } else {
            logger.info("No Group intreat Found");
          }
        }

        //Load the number of uninvoiced group eot forms into the provider array.
        if (promiseGroupEOT.state == "fulfilled") {
          var groupEOTData = JSON.parse(promiseGroupEOT.value);
          if (
            groupEOTData.meta.status == "200" &&
            groupEOTData.data.length > 0
          ) {
            logger.info("Group eot were found");
            for (i = 0; i < numProviders; i++) {
              var groupEotCount = 0;
              for (a = 0; a < groupEOTData.data.length; a++) {
                if (providerList[i].provid == groupEOTData.data[a].providerID) {
                  groupEotCount = groupEotCount + 1;
                }
              }
              providerList[i].groupeot = groupEotCount;
            }
          } else {
            logger.info("No Group eot Found");
          }
        }

        //Load the number of uninvoiced supervisor logs into the provider array when they are allowed to be billable.
        if (includeSupervisorLog == 1) {
          if (promiseSupervisorLog.state == "fulfilled") {
            var supervisorData = JSON.parse(promiseSupervisorLog.value);
            if (
              supervisorData.meta.status == "200" &&
              supervisorData.data.length > 0
            ) {
              logger.info("Supervisor Logs were found");
              for (i = 0; i < numProviders; i++) {
                var supervisorLogCount = 0;
                for (a = 0; a < supervisorData.data.length; a++) {
                  if (
                    providerList[i].provid == supervisorData.data[a].providerID
                  ) {
                    supervisorLogCount = supervisorLogCount + 1;
                  }
                }
                providerList[i].supervisor = supervisorLogCount;
              }
            } else {
              logger.info("No Supervisor Logs Found");
            }
          }
        }

        //Add the PO usage from uninvoiced forms for each provider to determine the total poUsage for the providers.
        for (i = 0; i < numProviders; i++) {
          var numIntakes = providerList[i].intake;
          var numIntreat = providerList[i].intreat;
          var numEOT = providerList[i].eot;
          var numGroupSession = providerList[i].groupscreening;
          var numGroupInTreat = providerList[i].groupintreat;
          var numGroupEOT = providerList[i].groupeot;
          var numSupervisor = providerList[i].supervisor;
          var poUsage =
            providerList[i].pousage +
            numIntakes * intakeValue +
            numIntreat * intreatmentValue +
            numEOT * endoftreatValue +
            numGroupSession * groupScreeningValue +
            numGroupInTreat * groupIntreatValue +
            numGroupEOT * groupEOTValue +
            numSupervisor * supervisorValue; //Calculate PO Usage for each provider

          providerList[i].pousage = poUsage; //Load usage into the array and object.
        }

        var counter = 0;
        var notifiedProviderIDs = [];
        var isError = false;
        var isSuccess = false;
        for (i = 0; i < numProviders; i++) {
          if (
            providerList[i].polimit - providerList[i].pousage <
            poLimitThreshold
          ) {
            //If PO Limit minus PO Usage is less than the limit threshold, then notify the provider and update provider form.
            Q.allSettled([
              ProcessProviders(
                providerList[i].provid,
                providerList[i].revid,
                providerList[i].siteid,
                providerList[i].polimit,
                providerList[i].pousage,
                formIDProviderForm
              ), //Function below to complete actions.
            ]).then(function (promises) {
              var promiseProcessResults = promises[0];
              if (
                promiseProcessResults.state == "fulfilled" &&
                promiseProcessResults.value == "Complete"
              ) {
                logger.info("Update completed for Provider");
                //notifiedProviderIDs.push(providerList[i].provid);
                isSuccess = true;
              } else if (promiseProcessResults.state == "rejected") {
                logger.info("Update rejected for provider");
                isError = true;
              }
              counter++;
              if (counter == numProviders) {
                var responseMessage = "";
                if (isError == true && isSuccess == true) {
                  responseMessage =
                    "Some providers were notified successfully.  At least one provider was not notified successfully.";
                } else if (isError == false && isSuccess == true) {
                  responseMessage = "All providers were notified successfully.";
                } else if (isError == true && isSuccess == false) {
                  responseMessage =
                    "Provider notification had errors across the board.";
                } else {
                  responseMessage = "No providers were notified.";
                }
                response.json(200, responseMessage);
                logger.info(responseMessage);
              }
            });
          } else {
            counter++; //increment the counter immediately if a provider does not need an email notification
            if (counter == numProviders) {
              var responseMessage = "";
              if (notifiedProviderIDs.length > 0) {
                responseMessage =
                  "The following providers have been notified: " +
                  notifiedProviderIDs.toString();
              } else {
                responseMessage = "No providers were notified.";
              }
              response.json(200, responseMessage);
              logger.info(responseMessage);
            }
          }
        }
      }
    } catch (ex) {
      logger.info(ex);
    }
  });

  var ProcessProviders = function (
    providerID,
    formRevID,
    siteID,
    poLimit,
    poUsage,
    formTemplateID
  ) {
    var deferred = Q.defer();

    var usrData = {};
    usrData.fields =
      "id,name,userid,siteid,firstname,lastname,emailaddress, authtype, useridneverexpires, passwordneverexpires, enabled, useridexpires, passwordexpires, sitename";

    Q.allSettled([
      vvClient.users.getUsers(usrData, siteID), //Get list of users for the provider so an email can be sent out.
    ]).then(function (promises) {
      try {
        var promiseUsers = promises[0];

        if (promiseUsers.state == "fulfilled") {
          var userData = JSON.parse(promiseUsers.value);
          if (userData.meta.status == "200" && userData.data.length > 0) {
            var recipientsList = "";
            for (a = 0; a < userData.data.length; a++) {
              //Users were found so load the email addresses for the email.
              if (recipientsList.length > 0) {
                recipientsList =
                  recipientsList + ", " + userData.data[a].emailaddress;
              } else {
                recipientsList = userData.data[a].emailaddress;
              }
            }

            if (recipientsList.length > 0) {
              //If emails are loaded, then load the body of the email.
              var bodyContent =
                "Dear Provider: <br /><br />  In the OPG CalGETS system, your provider account " +
                providerID +
                " has a PO Limit of $" +
                poLimit +
                ".  You have submitted enough questionnaires to have a PO Usage of $" +
                poUsage;
              bodyContent =
                bodyContent +
                ".  It is recommended that you submit a request for Additional Services.  To submit this request, login to CalGETS with your User ID and password.";
              bodyContent =
                bodyContent +
                "  Then, navigate to the Providers and Billing menu at the top of the screen and select Request Additional Covered Services.  Once you are on this form, select a date ";
              bodyContent =
                bodyContent +
                "within the current fiscal period.  Then select the 'Click Here to Request more Services' button.  After submitting the form, OPG will review and deny or approve ";
              bodyContent =
                bodyContent +
                "your request.  Once your request is approved, your PO Limit will be incremented based upon the value allocated by OPG. <br /><br />  If you have any questions, please ";
              bodyContent =
                bodyContent +
                "contact OPG. <br /><br />  Best Regards; <br /><br />  The OPG Team";

              var emailData = {}; //Object used for email message.
              emailData.recipients = recipientsList;
              emailData.subject =
                "PO Limit is approaching in the OPG CalGETS system"; //Load the subject.
              emailData.body = bodyContent;

              var emailParams = "";

              var provUpdate = {}; //Object to update the provide form that notification sent out.
              provUpdate["OPG Notified"] = "True";
              var formParams = {};

              Q.allSettled([
                vvClient.email.postEmails(emailParams, emailData), //Nodejs helper function to send emails.
                vvClient.forms.postFormRevision(
                  formParams,
                  provUpdate,
                  formTemplateID,
                  formRevID
                ), //Nodejs helper function to update the provider form.
              ]).then(function (promises) {
                var promiseEmails = promises[0];
                var promiseFormUpdate = promises[1];
                try {
                  var isError = false;
                  if (promiseEmails.state == "fulfilled") {
                    //Test if email sent.
                    var emailResultData = promiseEmails.value;
                    if (emailResultData.meta.status == "201") {
                      logger.info("Email Sent");
                    } else {
                      logger.info("Email Not Sent");
                      isError = true;
                    }
                  }

                  if (promiseFormUpdate.state == "fulfilled") {
                    //Test if provide form updated
                    if (promiseFormUpdate.value.meta.status == "201") {
                      logger.info(
                        "Provider form updated with notification checkmark."
                      );
                    }
                  } else {
                    logger.info(
                      "Provider form was not successfully updated with the notification checkmark."
                    );
                    isError = true;
                  }

                  if (!isError) {
                    //return results of this function back.
                    deferred.resolve("Complete"); //Will cause promise to be fulfilled.
                  } else {
                    deferred.reject(
                      new Error(
                        "There was an error sending the email or updating the provider form"
                      )
                    ); //Will cause promise to be rejected.
                  }
                } catch (ex) {
                  logger.info(ex);
                  deferred.reject(new Error(ex)); //Will cause promise to be rejected.
                }
              });
            }
            //Did not put an else here if the email is not acquired.
          }
        } else {
          logger.info("not fullfilled");
          deferred.reject(new Error(error)); //Will cause promise to be rejected.
        }
      } catch (ex) {
        logger.info(ex);
        deferred.reject(new Error(error)); //Will cause promise to be rejected.
      }
    });
    return deferred.promise; //Communicates  that this function is part of a promise call.
  };

  //Function used to find values in the client intake array.
  var FindVal = function (array, value) {
    for (var i = 0; i < array.length; i++) {
      if (array[i] == value) {
        return i;
      }
    }
    return -1;
  };
};
