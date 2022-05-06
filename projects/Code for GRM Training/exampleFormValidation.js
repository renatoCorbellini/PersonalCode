var ErrorReporting = true;
var RunAll = false;

if (ControlName == null) {
  RunAll = true;
}

if (ControlName == "Nombre del Control" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Nombre del Control"),
      "Tipo de Validación"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Nombre del Control",
      "Mensaje que se muestra a un lado del control."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Nombre del Control");
  }
}

return ErrorReporting;
