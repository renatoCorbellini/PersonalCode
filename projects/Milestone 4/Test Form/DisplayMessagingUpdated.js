/*
	Script Name:   DisplayMessaging
	Customer:      VisualVault
	Purpose:       The purpose of this function is to display a VisualVault skinned alert message.
	Parameters:    The following represent variables passed into the function:
				   Passed Parameters:  messagedata,title
				   messagedata - HTML formatted string with the detailed message.
				   title - Title applied to the confirmation dialog box.
				  
	Return Value:  The following represents the value being returned from this function:
						   
	Date of Dev:
	Last Rev Date: 06/01/2017
	Revision Notes:
				06/01/2017 - Tod Olsen: Initial creation of the business process.
				07/15/2021 - Jon Brown:   Update to work with VV version 5.
*/

let confirmDialog = $(`<div id="dialog-message" title="${title}"></div>`)
  .hide()
  .append($(`<p>${messagedata}</p>`));
let dialogStyle = $(
  '<style id="dialog-message-style">body { overflow: hidden; }</style>'
);

$("body").append(dialogStyle);
$("body").append(confirmDialog);

$("#dialog-message").dialog({
  //animation settings when opening the dialog. Remove to have no animation
  show: { effect: "drop", direction: "up", duration: 250 },
  //animation settings when closing the dialog. Remove to have no animation
  hide: { effect: "drop", direction: "up", duration: 250 },
  //buttons shown on modal
  buttons: [
    {
      text: "OK",
      click: function () {
        VV.Form.HideLoadingPanel();
        $(this).dialog("close");
      },
      class: "k-button",
    },
  ],
  close: function () {
    $(this).dialog("close").remove();
    $(dialogStyle).remove();
  },
  open: function (event, ui) {
    $(".ui-dialog-titlebar-close")
      .addClass("k-button-icon k-button k-bare")
      .html('<span class="k-icon">&#10006;</span>')
      .css("position", "absolute")
      .css("right", ".3em");
    $(".ui-dialog-content").css("padding", ".5em 1em");
    let overlay = $("ui-widget-overlay");
    overlay
      .css("position", "fixed")
      .css("top", "0")
      .css("left", "0")
      .css("width", "100%")
      .css("height", "100%");
  },
  dialogClass: "k-window",
  classes: {
    "ui-dialog-titlebar": "k-window-titlebar",
    "ui-dialog-content": "k-dialog-content",
    "ui-dialog-buttonpane": "k-dialog-buttongroup",
  },
  resizable: false,
  height: "auto",
  width: 500,
  modal: true,
});
