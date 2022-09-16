//PayLicensingApplication for Licensing Application

let PayNow = function () {
  //This gets all of the form fields.
  let formData = VV.Form.getFormDataCollection();

  var FormInfo = {};
  FormInfo.name = "REVISIONID";
  FormInfo.value = VV.Form.DataID;
  formData.push(FormInfo);

  FormInfo = {};
  FormInfo.name = "Base URL";
  FormInfo.value = VV.BaseURL;
  formData.push(FormInfo);

  let data = JSON.stringify(formData);
  let requestObject = $.ajax({
    type: "POST",
    url:
      VV.BaseAppUrl +
      "api/v1/" +
      VV.CustomerAlias +
      "/" +
      VV.CustomerDatabaseAlias +
      "/scripts?name=InvoiceGetPaypalToken",
    contentType: "application/json; charset=utf-8",
    data: data,
    success: "",
    error: "",
  });

  return requestObject;
};

VV.Form.ShowLoadingPanel();

$.when(PayNow()).always(function (resp) {
  VV.Form.HideLoadingPanel();
  let messageData = "";
  if (typeof resp.status != "undefined") {
    messageData =
      "A status code of " +
      resp.status +
      " returned from the server.  There is a communication problem with the  web servers.  If this continues, please contact the administrator and communicate to them this message and where it occured.";
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
    if (resp.data[0] != "undefined") {
      if (resp.data[0] == "Success") {
        //Do an ajax save before showing the payment module in order to retain payment type selection
        var tokenData = resp.data[2];
        var amountDue = VV.Form.GetFieldValue("Total Owed");

        $("#cc_tokenId").val(tokenData.SECURETOKENID);
        $("#cc_token").val(tokenData.SECURETOKEN);
        $("#cc_amount").val(amountDue);
        $("#paymentModal").modal({ backdrop: "static", keyboard: false });
      } else if (resp.data[0] == "Error") {
        messageData = "An error was encountered. " + resp.data[1];
        VV.Form.HideLoadingPanel();
        VV.Form.Global.DisplayMessaging(messageData);
      } else {
        messageData =
          "An unhandled response occurred.  The form will not save at this time.  Please try again or communicate this issue to support.";
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
      "The following error(s) were encountered: " + resp.data.error + "<br>";
    VV.Form.HideLoadingPanel();
    VV.Form.Global.DisplayMessaging(messageData);
  }
});
