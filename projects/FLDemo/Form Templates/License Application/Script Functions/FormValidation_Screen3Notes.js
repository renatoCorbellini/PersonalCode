//FormValidation for the Licensing Application Form
//pass in ControlName to validate a single item or nothing to validate everything.

let ErrorReporting = true;
let RunAll = false;

if (ControlName == null) {
  RunAll = true;
}

// SCREEN 3 STATE NOTES OR INSTRUCTIONS

if (ControlName == "State Notes or Instructions" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("State Notes or Instructions"),
      "Blank"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "State Notes or Instructions",
      "A value needs to be entered for the State Notes or Instructions."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("State Notes or Instructions");
  }
}

// Return
if (ErrorReporting == false) {
  return false;
} else {
  return true;
}
