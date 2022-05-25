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

module.exports.main = function (ffCollection, vvClient, response) {
  /*Script Name:   AddlCoveredSvcSubmit
      Customer:      California Office of Problem Gambling, Department of Public Health
      Purpose:       The purpose of this script is to gather information and perform actions to support submittal of a Request for Additional Services form.
      Date of Dev:   08/2013
      Last Rev Date: 10/06/2018

      Revision Notes:
      08/2013 - At this time we are writing the code in nodejs to complete the same functions as is currently being
      executed in the .NET web services.
      06/10/2014 - Jason: Update to prepare for production usage.
      06/27/2014 - Jason: Updated messaging to have more information and hopefully be uniform.
      07/16/2014 - Jason: Added logic to handle group treatment as part of PO Usage calculations.
      08/05/2014 - Jason: Added logic to handle supervisor logs as part of PO Usage calculations.
      08/11/2014 - Jason: Issue with getting the right client intake forms when they are entered in the new fiscal year but pertain to previous year.
                          Change client intake query to use intake date and not modify date.  Added a longer period to insure intakes for period are brought in.
      05/05/2016 - Jason: Not calculating fully for a provider the right usage.  Intake date for client query restricting inclusion.  Changing calculation of begin date to allow more inclusion.
      10/06/2018 - Kendra: Updated TQF query to account for new Questionnaire Type format (30 Day Follow-Up instead of Follow-up 30 Day)
      04/28/2020 - Morgan: Update invoiceablePrograms to include Problem Gambling Telephone Intervention
      05/25/2022 - Renato Corbellini: Added helper functions parseRes, getFeeValue, checkMetaAndStatus and checkDataPropertyExists used in the getCustomQueryResultByName to bring the active fees from VV instead of hard coding them.

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
  var poLimitThreshold = 1000; //Keeps track of the PO Limit threshold when providers can submit a request for addl services.

  var groupScreeningBillable = 1; //Determines if screening should be billable or not.  0 = no, 1 = yes.
  var groupScreeningValue = getFeeValue(
    customQueryResp,
    "Group Screening Value"
  ); //Keeps track of the amount paid for conducting group screening if groupScreeningBillable = 1.
  var groupSessionValue = getFeeValue(customQueryResp, "Group Session Value"); //Keeps track of the amount paid for each participant in a group session.
  var groupEOTValue = getFeeValue(customQueryResp, "Group EOT Value"); //Keeps track of the amount paid for conducting a group eot.

  var supervisorBillable = 1; //Determines if supervisor logs should be billable or not.  0 = no, 1 = yes.
  var supervisorLogValue = getFeeValue(customQueryResp, "Supervisor Log Value"); //Keeps track of the amount paid for providing supervisor services.

  var invoiceablePrograms = []; //Array used to keep track of the list of billable type cases or intake forms.

  invoiceablePrograms[0] = "Outpatient"; //Load the array with other items where the intake type of program are invoiceable.
  invoiceablePrograms[1] = "TEST";
  invoiceablePrograms[2] = "Problem Gambling Telephone Intervention"; //Added 04/28/2020 to include PGTI

  //List of forms used in the process
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

  logger.info("Entering process AddlCoveredSvcSubmit.");

  //Get the key fields from the provider form to utilize during the process.
  var formLoggedInUserSite = ffCollection.getFormFieldByName("USERSITE"); //Get the site of the currently logged in user to get the provider form.
  var formCoveredDate = ffCollection.getFormFieldByName("Covered Date");

  var whoIsProvider = ""; //Used to know who is provider after information gathered.
  var whoIsProvName = "";
  var whoIsProvRev = "";

  var poLimit = 0; //Variables used for calculations
  var poUsage = 0;
  var poDifference = 0;

  var intakeRecordset = []; //used to compare against invoice recordset.  Should only include intake forms that can be invoiced.

  var outputCollection = []; //Variable for communication back to the form as an array.  [0] for message, [1] for data.
  outputCollection[2] = 0; //Assign 0 so form is not saved.  1 will cause form to save.

  //Calculate Fiscal Period
  var thisDate = new Date(formCoveredDate.value);
  var thisYear = thisDate.getFullYear();
  var thisMonth = thisDate.getMonth();
  var beginFiscalDate = new Date();
  var endFiscalDate = new Date();
  var intakeBeginDate = new Date();

  if (thisMonth > 5) {
    beginFiscalDate = thisYear + "-07-01T00:00:00Z";
    intakeBeginDate = thisYear - 1 + "-02-01T00:00:00Z";
    endFiscalDate = thisYear + 1 + "-06-30T23:59:59Z";
  } else {
    beginFiscalDate = thisYear - 1 + "-07-01T00:00:00Z";
    intakeBeginDate = thisYear - 2 + "-02-01T00:00:00Z";
    endFiscalDate = thisYear + "-06-30T23:59:59Z";
  }

  var Q = require("q");

  //Provider get for determining who we are dealing with in the system.
  var currentUserSitedata = {}; //Get the site of the logged in user.
  currentUserSitedata.q = "[id] eq '" + formLoggedInUserSite.value + "'";
  currentUserSitedata.fields = "id,name,description";

  Q.allSettled([
    vvClient.sites.getSites(currentUserSitedata), //Nodejs helper function to get the site of the logged in user.
  ]).then(function (promises) {
    var promiseProvider = promises[0]; //Results from the getForms call for treatment questionnaires.
    try {
      //Gets the site for selected provider.
      if (promiseProvider.state == "fulfilled") {
        //Clean results from the getForms call.
        var siteProviderData = JSON.parse(promiseProvider.value);
        if (
          siteProviderData.meta.status == "200" &&
          siteProviderData.data.length > 0
        ) {
          //Records returned when status = 200 and length says the number of records returned.
          logger.info("Selected Provider Site Found.");
          if (typeof siteProviderData.data[0].id != "undefined") {
            whoIsProvider = siteProviderData.data[0].name;
            whoIsProvName = siteProviderData.data[0].description;
            whoIsProvRev = siteProviderData.data[0].revisionId;
            //Questionnaires get list to help determine the PO Usage.
            var formQuestData = {}; //Setup the object used to find the questionnaires.
            formQuestData.q =
              "[ProviderID] eq '" +
              whoIsProvider +
              "' AND [Questionnaire Date] BETWEEN '" +
              beginFiscalDate +
              "' AND '" +
              endFiscalDate +
              "' AND [Questionnaire Type] NOT LIKE '%Follow-Up'";
            formQuestData.fields =
              "InstanceName,createdate,createby,ProviderID,Questionnaire Type,Questionnaire Date,ClientID,CaseID,Visit,Type of Client";
            formQuestData.offset = 0;
            formQuestData.limit = 3000;

            //Additional Covered Services get the list to know the PO Limit for the fiscal year.
            var formAddlSvcData = {}; //Setup the object used to find the Additional Covered Services in a fiscal year.
            formAddlSvcData.q =
              "[Provider ID] eq '" +
              whoIsProvider +
              "' AND [Covered Date] BETWEEN '" +
              beginFiscalDate +
              "' AND '" +
              endFiscalDate +
              "'";
            formAddlSvcData.fields =
              "InstanceName,createdate,createby,Provider ID,Request Status,Current PO Limit,Current PO Usage,PO Increment";
            formAddlSvcData.offset = 0;
            formAddlSvcData.limit = 1000;

            //Use the invoiceablePrograms array to load the query string dynamically.
            var intakeQuery = "";
            var x = 0;
            for (var item in invoiceablePrograms) {
              intakeQuery =
                intakeQuery +
                "[Type of Program] eq '" +
                invoiceablePrograms[x] +
                "' OR ";
              x = x + 1;
            }

            intakeQuery = intakeQuery.substr(0, intakeQuery.length - 4); //strip off the last OR.

            //Client Intake forms that can be invoiced based on the types that are allowed to be invoiced.  Also bringing in the range of intakes where last visit is within allowed range and end of invoice range.
            var formClientIntake = {};
            //formClientIntake.q = "[ProviderID] eq '" + whoIsProvider + "' AND [modifydate] BETWEEN '" + rangeDaystoInvoice + "' AND '" + formEndRange + "' AND (" + intakeQuery + ")"
            formClientIntake.q =
              "[ProviderID] eq '" +
              whoIsProvider +
              "' AND [Intake Date] BETWEEN '" +
              intakeBeginDate +
              "' AND '" +
              endFiscalDate +
              "' AND (" +
              intakeQuery +
              ")";
            formClientIntake.fields =
              "InstanceName,createdate,createby,ProviderID,Type of Program,LastVisitDate,ClientID,CaseID,modifydate";
            formClientIntake.offset = 0;
            formClientIntake.limit = 3000;

            /*********************Following queries used to get Group Treatment forms that are billable.**********************************/

            //Group Screening forms in date range.
            var formGroupScreeningData = {}; //Setup the object used to find the questionnaires.
            formGroupScreeningData.q =
              "[ProviderID] eq '" +
              whoIsProvider +
              "' AND [Screening Date] BETWEEN '" +
              beginFiscalDate +
              "' AND '" +
              endFiscalDate +
              "'";
            formGroupScreeningData.fields =
              "InstanceName,createdate,createby,ProviderID,ClientID,CaseID,Screening Date";
            formGroupScreeningData.offset = 0;
            formGroupScreeningData.limit = 3000;

            //Group In-treatment forms in date range.
            var formGroupIntreatData = {}; //Setup the object used to find the questionnaires.
            formGroupIntreatData.q =
              "[ProviderID] eq '" +
              whoIsProvider +
              "' AND [Session Date] BETWEEN '" +
              beginFiscalDate +
              "' AND '" +
              endFiscalDate +
              "' AND [Validated] eq 'true'";
            formGroupIntreatData.fields =
              "InstanceName,createdate,createby,ProviderID,Session Date,ClientID,CaseID";
            formGroupIntreatData.offset = 0;
            formGroupIntreatData.limit = 3000;

            //Group EOT forms in date range.
            var formGroupEOTData = {}; //Setup the object used to find the questionnaires.
            formGroupEOTData.q =
              "[ProviderID] eq '" +
              whoIsProvider +
              "' AND [Session Date] BETWEEN '" +
              beginFiscalDate +
              "' AND '" +
              endFiscalDate +
              "'";
            formGroupEOTData.fields =
              "InstanceName,createdate,createby,ProviderID,Session Date,ClientID,CaseID";
            formGroupEOTData.offset = 0;
            formGroupEOTData.limit = 3000;

            /*********************Following queries used to get Supervisor Log forms that are billable.**********************************/

            //Supervisor logs in date range.
            var formSupervisorData = {}; //Setup the object used to find the questionnaires.
            formSupervisorData.q =
              "[ProviderID] eq '" +
              whoIsProvider +
              "' AND [Meeting Date] BETWEEN '" +
              beginFiscalDate +
              "' AND '" +
              endFiscalDate +
              "'";
            formSupervisorData.fields =
              "InstanceName,createdate,createby,ProviderID,Meeting Date";
            formSupervisorData.offset = 0;
            formSupervisorData.limit = 3000;

            Q.allSettled([
              vvClient.forms.getForms(
                formQuestData,
                formIDTreatmentQuestionnaire
              ), //Nodejs helper function to get the list of questionnaires with same info as current.
              vvClient.forms.getForms(
                formAddlSvcData,
                formIDAddlCoveredServices
              ), //Nodejs helper function to get the list of additional covered services forms.
              vvClient.forms.getForms(formClientIntake, formIDClientIntake),
              vvClient.forms.getForms(
                formGroupScreeningData,
                formIDGroupTreatmentScreening
              ),
              vvClient.forms.getForms(
                formGroupIntreatData,
                formIDGroupInTreatment
              ),
              vvClient.forms.getForms(
                formGroupEOTData,
                formIDGroupEndofTreatment
              ),
              vvClient.forms.getForms(formSupervisorData, formIDSupervisorLog),
            ]).then(function (promises) {
              var promiseQuestionnaires = promises[0]; //Results from the getForms call for treatment questionnaires.
              var promiseAddlCovSvc = promises[1]; //Results from the getForms call for Additional Covered Services form.
              var promiseClientIntake = promises[2];
              var promiseGroupScreen = promises[3];
              var promiseGroupIntreat = promises[4];
              var promiseGroupEOT = promises[5];
              var promiseSupervisorLog = promises[6];

              try {
                //Get client intake forms for 60 days that should be billed.
                if (promiseClientIntake.state == "fulfilled") {
                  //Clean results from the getForms call.
                  var formIntakeData = JSON.parse(promiseClientIntake.value);
                  if (
                    formIntakeData.meta.status == "200" &&
                    formIntakeData.data.length > 0
                  ) {
                    //Records returned when status = 200 and length says the number of records returned.
                    logger.info("Intake forms found.");
                    var a = 0;
                    for (var i = 0; i < formIntakeData.data.length; i++) {
                      //Load into the array that will be searched.
                      intakeRecordset[a] = formIntakeData.data[i]["caseID"];
                      a = a + 1;
                    }
                    intakeRecordset.sort(function (a, b) {
                      return a - b;
                    }); //Sort the array for faster searching.
                  } else {
                    logger.info("No Intake forms found");
                  }
                }

                logger.info("There are " + a + " records from intake.");

                //Get all questionnaires for a client used to calculate PO Usage.
                if (promiseQuestionnaires.state == "fulfilled") {
                  //Clean results from the getForms call.
                  var formQuestResultData = JSON.parse(
                    promiseQuestionnaires.value
                  );
                  if (
                    formQuestResultData.meta.status == "200" &&
                    formQuestResultData.data.length > 0
                  ) {
                    //Records returned when status = 200 and length says the number of records returned.
                    logger.info("Questionnaire Forms found.");
                    //Calculate PO Usage.  This is all forms that have and have not been invoiced against.

                    for (var a = 0; a < formQuestResultData.data.length; a++) {
                      var findResults = FindVal(
                        intakeRecordset,
                        formQuestResultData.data[a]["caseID"]
                      );
                      if (findResults != -1) {
                        if (
                          formQuestResultData.data[a]["questionnaire Type"] ==
                          "Intake"
                        ) {
                          poUsage = poUsage + intakeValue;
                        } else if (
                          formQuestResultData.data[a]["questionnaire Type"] ==
                          "In-Treatment"
                        ) {
                          poUsage = poUsage + intreatmentValue;
                        } else if (
                          formQuestResultData.data[a]["questionnaire Type"] ==
                          "End of Treatment"
                        ) {
                          poUsage = poUsage + endoftreatValue;
                        }
                      }
                    }
                  } else {
                    logger.info("No Questionnaire forms found");
                    outputCollection[0] =
                      "No Questionnaires found for provider " +
                      whoIsProvName +
                      ".  Questionnaires need to exist to request a new PO Limit.";
                    outputCollection.push();
                    response.json(200, outputCollection);
                    return false;
                  }
                }

                logger.info(
                  "The PO Usage after loading questionnaires is " +
                    poUsage +
                    "."
                );

                //Get all requests for additional services forms for a provider to calculate PO Limit.
                if (promiseAddlCovSvc.state == "fulfilled") {
                  //Clean results from the getForms call.
                  var formACSData = JSON.parse(promiseAddlCovSvc.value);
                  if (
                    formACSData.meta.status == "200" &&
                    formACSData.data.length > 0
                  ) {
                    //Records returned when status = 200 and length says the number of records returned.
                    logger.info("ACS Forms found.");
                  } else {
                    logger.info("No ACS forms found");
                  }
                }

                if (promiseGroupScreen.state == "fulfilled") {
                  //Clean results from the getForms call.
                  var formGroupScreenData = JSON.parse(
                    promiseGroupScreen.value
                  );
                  if (
                    formGroupScreenData.meta.status == "200" &&
                    formGroupScreenData.data.length > 0
                  ) {
                    //Records returned when status = 200 and length says the number of records returned.
                    logger.info("Group Screening Forms found.");
                    if (groupScreeningBillable == 1) {
                      //Only include if organization is allowing billing of screening forms.
                      for (
                        var a = 0;
                        a < formGroupScreenData.data.length;
                        a++
                      ) {
                        poUsage = poUsage + groupScreeningValue;
                      }
                    }
                  } else {
                    logger.info("No Group Screening forms found");
                  }
                }

                logger.info(
                  "The PO Usage after loading group screening is " +
                    poUsage +
                    "."
                );

                if (promiseGroupIntreat.state == "fulfilled") {
                  //Clean results from the getForms call.
                  var formGroupIntreatData = JSON.parse(
                    promiseGroupIntreat.value
                  );
                  if (
                    formGroupIntreatData.meta.status == "200" &&
                    formGroupIntreatData.data.length > 0
                  ) {
                    //Records returned when status = 200 and length says the number of records returned.
                    logger.info("Group Intreat Forms found.");
                    for (var a = 0; a < formGroupIntreatData.data.length; a++) {
                      poUsage = poUsage + groupSessionValue;
                    }
                  } else {
                    logger.info("No Group Intreat forms found");
                  }
                }

                logger.info(
                  "The PO Usage after loading group intreatment is " +
                    poUsage +
                    "."
                );

                if (promiseGroupEOT.state == "fulfilled") {
                  //Clean results from the getForms call.
                  var formGroupEOTData = JSON.parse(promiseGroupEOT.value);
                  if (
                    formGroupEOTData.meta.status == "200" &&
                    formGroupEOTData.data.length > 0
                  ) {
                    //Records returned when status = 200 and length says the number of records returned.
                    logger.info("Group EOT Forms found.");
                    for (var a = 0; a < formGroupEOTData.data.length; a++) {
                      poUsage = poUsage + groupEOTValue;
                    }
                  } else {
                    logger.info("No Group EOT forms found");
                  }
                }

                logger.info(
                  "The PO Usage after loading group eot is " + poUsage + "."
                );

                if (promiseSupervisorLog.state == "fulfilled") {
                  //Clean results from the getForms call.
                  var formSupervisorData = JSON.parse(
                    promiseSupervisorLog.value
                  );
                  if (
                    formSupervisorData.meta.status == "200" &&
                    formSupervisorData.data.length > 0
                  ) {
                    //Records returned when status = 200 and length says the number of records returned.
                    logger.info("Supervisor Log Forms found.");
                    if (supervisorBillable == 1) {
                      //Only include if organization is allowing billing of screening forms.
                      for (var a = 0; a < formSupervisorData.data.length; a++) {
                        poUsage = poUsage + supervisorLogValue;
                      }
                    }
                  } else {
                    logger.info("No Supervisor Log forms found");
                  }
                }

                logger.info(
                  "The PO Usage after loading supervisor logs is " +
                    poUsage +
                    "."
                );

                //Load value of PO Limit
                poLimit = basePOValue; //Set value for the base value since every provider starts with a base value.
                var numACS = 0;
                var numApprovedACS = 0;
                var numDeniedACS = 0;
                if (typeof formACSData.data != "undefined") {
                  //If any additional covered service forms come back, figure out number of approved, denied and other to get PO Limit.
                  for (var i = 0; i < formACSData.data.length; i++) {
                    if (
                      typeof formACSData.data[i]["pO Increment"] !=
                        "undefined" &&
                      typeof formACSData.data[i]["request Status"] !=
                        "undefined"
                    ) {
                      if (formACSData.data[i]["request Status"] == "Approved") {
                        if (formACSData.data[i]["pO Increment"] == null) {
                          //This takes care of old legacy forms and situations where an increment was not entered.
                          poLimit = poLimit + basePOValue;
                        } else {
                          poLimit =
                            poLimit + formACSData.data[i]["pO Increment"]; //Add PO Increment to the process for PO Limit.
                        }
                        numApprovedACS++;
                      } else if (
                        formACSData.data[i]["request Status"] == "Denied"
                      ) {
                        numDeniedACS++;
                      }
                    } else {
                      if (formACSData.data[i]["request Status"] == "Approved") {
                        poLimit = poLimit + basePOValue; //Legacy forms used base po value so this line is taking care of old legacy forms.
                        numApprovedACS++;
                      } else if (
                        formACSData.data[i]["request Status"] == "Denied"
                      ) {
                        numDeniedACS++;
                      }
                    }
                    numACS++; //Calculate total number of ACS forms.
                  }
                }

                logger.info("The PO Limit is " + poLimit + ".");

                var numOtherACS = numACS - numApprovedACS - numDeniedACS; //Determine which forms have been approved.

                if (numOtherACS > 0) {
                  //Kick the user out when forms are waiting for approval.
                  logger.info("ACS forms already exist for approval.");
                  outputCollection[0] =
                    "A Request for Additional Services form already exists for this provider (" +
                    whoIsProvider +
                    ") and is waiting for approval by OPG.";
                  outputCollection.push();
                  response.json(200, outputCollection);
                  return false;
                }

                poDifference = poLimit - poUsage; //Use to calculate if the usage is within the threshold allowed to submit requests for additional service.

                logger.info(
                  "The PO Difference is " +
                    poDifference +
                    " and the PO Limit Threshold is " +
                    poLimitThreshold
                );

                if (poDifference > poLimitThreshold) {
                  //Stop the save of the form when the PO usage not within threshold of the limit.
                  logger.info("PO not within allowed threshold");
                  outputCollection[0] =
                    "PO Usage is not within the threshold of $" +
                    poLimitThreshold +
                    " from your PO Limit.  You're PO Limit is currently $" +
                    poLimit +
                    " and your PO Usage is $" +
                    poUsage +
                    ".  You need to be within the threshold to submit a Request for Additional Services.";
                  outputCollection.push();
                  response.json(200, outputCollection);
                  return false;
                }

                //Populate returned data.

                var formUpdateData = {}; //Object used to return information back to the client side to fillin appropriate ACS fields.
                formUpdateData.provid = whoIsProvider;
                formUpdateData.provname = whoIsProvName;
                formUpdateData.polimit = poLimit;
                formUpdateData.pousage = poUsage;
                formUpdateData.requeststatus = "Waiting for Approval";

                outputCollection[0] =
                  "Your request has been submitted successfully.";
                outputCollection[1] = formUpdateData; //Use this object to return the information for form fillin.
                outputCollection[2] = 1; //Tell the client side that it can save.
                outputCollection.push();
                response.json(200, outputCollection);
              } catch (ex) {
                logger.info(ex);
              }
            });
          }
        } else {
          logger.info("Selected Provider form not found");
          outputCollection[0] =
            "A form was not found for provider " +
            formLoggedInUserSite.value +
            ".  Users submitting this form must be providers. If you are a provider please try to resubmit it or contact OPG.";
          outputCollection.push();
          response.json(200, outputCollection);
          return false;
        }
      }
    } catch (ex) {
      logger.info(ex);
    }
  });

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
