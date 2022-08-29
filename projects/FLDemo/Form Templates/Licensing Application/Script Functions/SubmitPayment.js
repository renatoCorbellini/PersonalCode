//SubmitPayment

//TODO: need to complete credit card validation logic
var ccMonth = $("#expdate_month").val();
var ccYear = $("#expdate_year").val();
var expdate = "";

var ccNumber = $("#cc_number").val();
var ccCSC = $("#cc_csc").val();

if (ccMonth && ccYear && ccNumber && ccCSC) {
  //Hide modal so user can't click submit more than once, and ask the user to wait
  $("#paymentModal").modal("hide");
  VV.Form.Global.DisplayMessaging(
    "You payment has been processed successfully, please click 'Submit' to complete the Application Process.",
    "Payment Completed"
  );

  expdate = ccMonth + ccYear;

  //expdate must be mmyy format for payment
  $("#expdate").val(expdate);

  VV.Form.SetFieldValue(
    "Total Paid",
    VV.Form.GetFieldValue("Total Owed"),
    false
  );
  VV.Form.SetFieldValue("Status", "Paid", true);
  VV.Form.SetFieldValue("Transaction ID", "123456789", true);

  var today = new Date();
  VV.Form.SetFieldValue(
    "Date Paid",
    today.getMonth() + 1 + "/" + today.getDate() + "/" + today.getFullYear(),
    true
  );

  //locate the CC form and submit
  //   $("form[name='payflow']").submit();
} else {
  //validation error
  VV.Form.Global.DisplayMessaging(
    "Please fill in all fields before submitting payment.",
    "Error"
  );
}
