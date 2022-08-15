//FormValidation Screen 2 for the Intake Form
//pass in ControlName to validate a single item or nothing to validate everything.
let ErrorReporting = true;
let RunAll = false;

if (ControlName == null) {
  RunAll = true;
}

// SCREEN 2

if (ControlName == "License Application Type" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("License Application Type"),
      "DDSelect"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "License Application Type",
      "A value needs to be selected for the License Application Type."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("License Application Type");
  }
}

return ErrorReporting;
