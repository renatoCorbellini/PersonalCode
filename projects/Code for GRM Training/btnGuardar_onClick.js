var validationResults = VV.Form.Template.FormValidation();

if (!validationResults) {
  var messageData =
    "Alguno de los campos no ha sido completado o hay un problema con el formato de los datos ingresados. Pase el ratón por encima de los iconos de error para obtener una explicación de los problemas encontrados.";
  VV.Form.Global.DisplayMessaging(messageData, "Falta Información");
} else {
  VV.Form.DoAjaxFormSave();
}
