//FormValidation for the Individual Record
//pass in ControlName to validate a single item or nothing to validate everything.

var ErrorReporting = true;
var RunAll = false;

if (ControlName == null) {
  RunAll = true;
}

if (ControlName == "First Name" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("First Name"),
      "Blank"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "First Name",
      "A value needs to be entered for the First Name."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("First Name");
  }
}

if (ControlName == "Last Name" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Last Name"),
      "Blank"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Last Name",
      "A value needs to be entered for the Last Name."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Last Name");
  }
}

if (ControlName == "Personal Email" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Personal Email"),
      "Email"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Personal Email",
      "Please enter the Personal Email in the form of a valid Email."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Personal Email");
  }
}

if (ControlName == "Retype Email" || RunAll) {
  if (
    VV.Form.GetFieldValue("Retype Email") !=
    VV.Form.GetFieldValue("Personal Email")
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Retype Email",
      "Email does not match Personal Email."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Retype Email");
  }
}

if (ControlName == "DOB" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(VV.Form.GetFieldValue("DOB"), "Blank") ==
    false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "DOB",
      "Please enter a valid Date of Birth."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("DOB");
  }
}

if (ErrorReporting == false) {
  return false;
} else {
  return true;
}
