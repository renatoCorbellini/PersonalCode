//CallSubmitApplication for Lincense Application Form
var CallServerSide = function () {
  VV.Form.ShowLoadingPanel();
  //This gets all of the form fields.
  var formData = VV.Form.getFormDataCollection();

  formData.push({
    name: "Individual ID",
    value: VV.Form.GetFieldValue("DataField14"), // Individual ID
  });

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
      "/scripts?name=SubmitApplication",
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
        messageData =
          "The License Application has been submited. You will receive an email notification soon.";
        var title = "Success";

        VV.Form.SetFieldValue("Status", "Submitted", false);

        VV.Form.ShowLoadingPanel();
        VV.Form.DoAjaxFormSave().then(function () {
          VV.Form.HideLoadingPanel();
          VV.Form.Global.DisplayMessaging(messageData, title);
        });
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
