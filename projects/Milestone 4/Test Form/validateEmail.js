let email = VV.Form.GetFieldValueByName("Email FM1");
if (VV.Form.Global.CentralValidation(email, Email)) {
  console.log("The email is correct");
}
