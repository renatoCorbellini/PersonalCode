//CallSubmitApplication for License Application Form
var CallServerSide = function () {
  VV.Form.ShowLoadingPanel();
  //This gets all of the form fields.
  var formData = VV.Form.getFormDataCollection();

  //Following will prepare the collection and send with call to server side script.
  var data = JSON.stringify(formData);
  var requestObject = $.ajax({
    type: "POST",
    url:
      VV.BaseAppUrl +
      "api/v1/" +
      VV.CustomerAlias +
      "/" +
      VV.CustomerDatabaseAlias +
      "/scripts?name=GetRelatedFacility",
    contentType: "application/json; charset=utf-8",
    data: data,
    success: "",
    error: "",
  });

  return requestObject;
};

VV.Form.ShowLoadingPanel();

$.when(CallServerSide()).always(function (resp) {
  console.log(resp);
  VV.Form.HideLoadingPanel();
  var messageData = "";
  if (typeof resp.status != "undefined") {
    messageData =
      "A status code of " +
      resp.status +
      " returned from the server.  There is a communication problem with the web servers.  If this continues, please contact the administrator and communicate to them this message and where it occurred.";
    VV.Form.Global.DisplayMessaging(messageData);
  } else if (typeof resp.statusCode != "undefined") {
    messageData =
      "A status code of " +
      resp.statusCode +
      " with a message of '" +
      resp.errorMessages[0].message +
      "' returned from the server.  This may mean that the servers to run the business logic are not available.";
    VV.Form.Global.DisplayMessaging(messageData);
  } else if (resp.meta.status == "200") {
    if (resp.data[0] != undefined) {
      if (resp.data[0] == "Success") {
        // License Application Template
        let templateId = "5847a838-2f35-ed11-a9e1-dbede125229d";

        let businessName = VV.Form.GetFieldValue("Business Name");
        let licenseType = VV.Form.GetFieldValue("License Type");
        let businessID = VV.Form.GetFieldValue("Business ID");
        let facilityID = resp.data[2];
        let businessInformation = resp.data[3];

        //Field mappings
        let fieldMappings = [
          {
            sourceFieldName: "Business Name",
            sourceFieldValue: businessName,
            targetFieldName: "Primary Business Legal Name",
          },
          {
            sourceFieldName: "Business Name",
            sourceFieldValue: businessName,
            targetFieldName: "Business Legal Name",
          },
          {
            sourceFieldName: "",
            sourceFieldValue: businessInformation["mailing Street"],
            targetFieldName: "Mailing Street",
          },
          {
            sourceFieldName: "",
            sourceFieldValue: businessInformation["mailing Zip"],
            targetFieldName: "Mailing Zip",
          },
          {
            sourceFieldName: "",
            sourceFieldValue: businessInformation["mailing State"],
            targetFieldName: "Mailing State",
          },
          {
            sourceFieldName: "",
            sourceFieldValue: businessInformation["mailing City"],
            targetFieldName: "Mailing City",
          },
          {
            sourceFieldName: "",
            sourceFieldValue: businessInformation["physical Same"],
            targetFieldName: "Physical Same",
          },
          {
            sourceFieldName: "",
            sourceFieldValue: businessInformation["physical Street"],
            targetFieldName: "Physical Street",
          },
          {
            sourceFieldName: "",
            sourceFieldValue: businessInformation["physical Zip"],
            targetFieldName: "Physical Zip",
          },
          {
            sourceFieldName: "",
            sourceFieldValue: businessInformation["physical City"],
            targetFieldName: "Physical City",
          },
          {
            sourceFieldName: "",
            sourceFieldValue: businessInformation["physical State"],
            targetFieldName: "Physical State",
          },
          {
            sourceFieldName: "",
            sourceFieldValue: businessInformation["first Name"],
            targetFieldName: "DataField4", // First Name
          },
          {
            sourceFieldName: "",
            sourceFieldValue: businessInformation["last Name"],
            targetFieldName: "DataField11", // Last Name
          },
          {
            sourceFieldName: "",
            sourceFieldValue: businessInformation["mi"],
            targetFieldName: "MI",
          },
          {
            sourceFieldName: "",
            sourceFieldValue: businessInformation["title"],
            targetFieldName: "Title",
          },
          {
            sourceFieldName: "",
            sourceFieldValue: businessInformation["phone"],
            targetFieldName: "Phone",
          },
          {
            sourceFieldName: "",
            sourceFieldValue: businessInformation["email"],
            targetFieldName: "Email",
          },
          {
            sourceFieldName: "License Type",
            sourceFieldValue: licenseType,
            targetFieldName: "DataField21", // Primary License Type
          },
          {
            sourceFieldName: "License Type",
            sourceFieldValue: licenseType,
            targetFieldName: "License Application Type",
          },
          {
            sourceFieldName: "Business ID",
            sourceFieldValue: businessID,
            targetFieldName: "Business ID",
          },
          {
            sourceFieldName: "",
            sourceFieldValue: facilityID,
            targetFieldName: "Facility ID",
          },
          {
            sourceFieldName: "",
            sourceFieldValue: "Renewal",
            targetFieldName: "Application Mode",
          },
        ];

        //Call the fill in global script
        VV.Form.Global.FillinAndRelateForm(templateId, fieldMappings);
      } else if (resp.data[0] == "Error") {
        messageData = "An error was encountered. " + resp.data[1];
        VV.Form.HideLoadingPanel();
        VV.Form.Global.DisplayMessaging(messageData);
      } else {
        messageData =
          "An unhandled response occurred when calling BusinessRecordUnique. The form will not save at this time.  Please try again or communicate this issue to support.";
        VV.Form.HideLoadingPanel();
        VV.Form.Global.DisplayMessaging(messageData);
      }
    } else {
      messageData = "The status of the response returned as undefined.";
      VV.Form.HideLoadingPanel();
      VV.Form.Global.DisplayMessaging(messageData);
    }
  } else {
    messageData =
      "The following unhandled response occurred while attempting to retrieve data on the the server side get data logic." +
      resp.data.error +
      "<br>";
    VV.Form.HideLoadingPanel();
    VV.Form.Global.DisplayMessaging(messageData);
  }
});
