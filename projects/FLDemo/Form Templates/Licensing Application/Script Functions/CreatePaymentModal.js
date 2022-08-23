//CreatePaymentModal

//example of displaying the payment modal
//$('#paymentModal').modal('show');

//include bootstrap script bundle (VV does not automatically load this bundle within the form viewer)
//the version number is meaningless, only used to force download of the script file when version is changed
var script = document.createElement("script");
script.src =
  "/bundles/bootstrapjs?v=FBul99mpojQQrPqNoqXHNBuItkZ_0pqoo9DoBnPB5pQ1";
document.head.appendChild(script);

var style = document.createElement("style");
style.innerHTML =
  ".cclogo {" +
  " display: inline-block;" +
  " background: transparent url('https://pilot-payflowlink.paypal.com/images/en_US/payment_icons_sprite.2D.png') no-repeat 0 0;" +
  "width: 45px;" +
  "height: 24px;" +
  "}\n" +
  ".ax {" +
  "background-position: 0px -120px;" +
  "}\n" +
  ".ds {" +
  "background-position: 0px -90px;" +
  "}\n" +
  ".di {" +
  "background-position: 0px -331px;" +
  "}\n" +
  ".mc {" +
  "background-position: 0px -60px;" +
  "}\n" +
  ".vi {" +
  "background-position: 0px -33px;" +
  "}\n" +
  "form.edit input.text, form.edit select {width:200px;}\n" +
  "form.edit textarea {width:200px; height:4em;}\n" +
  "form.edit *.group {position:relative;}\n" +
  "form.edit p.group label {float:left; width:180px; text-align:right;}\n" +
  "form.edit p.group span.optional {display:block;}\n" +
  "form.edit p.group span.autoTooltip {position:absolute; top:.4em; left:410px; width:145px; text-align:left;}\n" +
  "form.edit p.group.help span.autoTooltip {top:1.7em;}\n" +
  "form.edit p.group span.help {display:block; padding-left:1.7em; margin-left:19em;}\n" +
  "form.edit p.group span.field {display:block; margin-left:16.8em;}\n" +
  "form.edit legend {position:relative; width:180px;}\n" +
  "form.edit legend span.label, form.edit legend span.optional, form.edit legend span.autoTooltip {position:absolute; width:180px; text-align:right;}\n" +
  "form.edit legend span.optional {top:1.4em;}\n" +
  "form.edit legend span.autoTooltip {top:2.8em;}\n" +
  "form.edit fieldset.multi p *, form.edit fieldset.multi p.group span.field {width:auto; margin-left:0;}\n" +
  "form.edit fieldset.multi p.first {margin-left:16.8em;}\n" +
  "form.edit fieldset.group span.help {padding-left:20px; margin-left:181px;}\n" +
  "form.edit fieldset.group div {margin-left:200px;}\n" +
  "form.edit p.buttons {margin-left:201px;}\n" +
  ".helpText{ display: inline; margin - right: 45px; padding: 0; color: #777777; font - size: 0.9em; } \n" +
  ".helpTextBottomMargin{margin-bottom:0px !important;}\n" +
  ".helpTextTopMargin{margin-top:0px !important;}\n" +
  "form fieldset.multi p {float:left; margin:0 1em 0 0;}\n" +
  "form fieldset.multi legend {font-weight:normal;}\n" +
  "form p.group span.fieldDivider {font-size: 1.3em; font-weight: bold; padding-left: 0.3em;}\n" +
  "p.fieldRow, p.group {margin-bottom: 1em;}\n" +
  'p.fieldRow:after, p.group:after {content: "."; display: block; height: 0; clear: both; visibility: hidden;}\n' +
  "p.fieldRow span.inputText input, p.group span.field input {width: 19.17em;}\n" +
  "p.fieldRow span.inputText select, p.group span.field select {width: auto;}\n" +
  "p.fieldRow label, p.group label {display: block; padding-bottom: 2px;}\n" +
  "p.fieldRow span.help, p.group span.help, fieldset.group span.help {display: block; font-size: 0.9em; margin: 0.1em 0;}\n" +
  "p.fieldRow span.help, p.fieldRow span.optional, p.group span.help, p.group span.optional, fieldset.group span.help, fieldset.multi span.help {color: #777; font-size: 0.9em;}\n" +
  "fieldset.multi span.help, fieldset.multi span.optional, legend.label span.optional {color: #777; font-size: 0.9em;}\n" +
  "p.fieldRow span.inputText .tiny, p.group span.field .tiny, .multi span.field .tiny {width: 2.5em;}\n" +
  "p.fieldRow span.inputText .small, p.group span.field .small, .multi span.field .small {width: 3.75em;}\n" +
  "p.fieldRow span.inputText .petite, p.group span.field .petite, .multi span.field .petite {width: 5em;}\n" +
  "p.fieldRow span.inputText .medium, p.group span.field .medium, .multi span.field .medium {width: 8.33em;}\n" +
  "p.fieldRow span.inputText select.fixed, p.group span.field select.fixed {width: 19.73em;}\n" +
  "input:valid {border: 1px solid black;}\n" +
  "input:invalid {border: 2px solid red;}";

document.head.appendChild(style);

//create payment modal dom elements using bootstrap modal classes
var paymentDiv = document.createElement("div");
paymentDiv.setAttribute("class", "modal fade");
paymentDiv.setAttribute("id", "paymentModal");
paymentDiv.setAttribute("tabindex", "-1");
paymentDiv.setAttribute("role", "dialog");
paymentDiv.setAttribute("aria-labelledby", "Enter Payment Information");
paymentDiv.setAttribute("aria-hidden", "true");
document.body.appendChild(paymentDiv);

var dialogDiv = document.createElement("div");
dialogDiv.setAttribute("class", "modal-dialog");
dialogDiv.setAttribute("role", "document");
paymentDiv.appendChild(dialogDiv);

var contentDiv = document.createElement("div");
contentDiv.setAttribute("class", "modal-content");
dialogDiv.appendChild(contentDiv);

//insert form here

var headerDiv = document.createElement("div");
headerDiv.setAttribute("class", "modal-header");
contentDiv.appendChild(headerDiv);

var modalTitle = document.createElement("h5");
modalTitle.setAttribute("class", "modal-title");
modalTitle.setAttribute("id", "modalTitle");
modalTitle.innerHTML += "Pay Using Credit or Debit Card";
headerDiv.appendChild(modalTitle);

var modalCloseButton = document.createElement("button");
modalCloseButton.setAttribute("class", "close");
modalCloseButton.setAttribute("data-dismiss", "modal");
modalCloseButton.setAttribute("aria-label", "Close");

var modalCloseButtonSpan = document.createElement("span");
modalCloseButtonSpan.setAttribute("aria-hidden", "true");
modalCloseButtonSpan.innerHTML += "&times;";
modalCloseButton.appendChild(modalCloseButtonSpan);

headerDiv.appendChild(modalCloseButton);

var modalBodyDiv = document.createElement("div");
modalBodyDiv.setAttribute("class", "modal-body");
contentDiv.appendChild(modalBodyDiv);

var bodyContent = document.createElement("div");
bodyContent.innerHTML =
  '<form method="POST" name="payflow" action="https://pilot-payflowlink.paypal.com">\n' +
  '<div id="fieldsCC">\n' +
  '  <div id="fieldrowAmount">\n' +
  '     <p class="group">\n' +
  '        <label for="cc_amount">Amount</label>\n' +
  '        <span class="field">\n' +
  '            <input type="text" id="cc_amount" readonly>\n' +
  "        </span>\n" +
  "     </p>\n" +
  "  </div>\n" +
  '  <div id="fieldrowCCNumber">\n' +
  '     <p class="group">\n' +
  '        <label for="cc_number">Card Number</label>\n' +
  '        <span class="field">\n' +
  '            <input type="text" id="cc_number" maxlength="19" name="ACCT" autocomplete="off" value required>\n' +
  '            <input type="hidden" id="cc_tokenId" name="SECURETOKENID" autocomplete="off" value>\n' +
  '            <input type="hidden" id="cc_token" name="SECURETOKEN" autocomplete="off" value>\n' +
  '            <input type="hidden" id="cc_tender" name="TENDER" autocomplete="off" value="C">\n' +
  '            <input type="hidden" id="cc_formId" name="COMMENT1" autocomplete="off" value="' +
  VV.Form.DhDocID +
  '">\n' +
  "        </span>\n" +
  "     </p>\n" +
  "  </div>\n" +
  '  <div id="fieldrowCCExpDate">\n' +
  '    <p class="group helpTextTopMargin">\n' +
  '      <label for="expdate_month">Expiration Date mm/yy</label>\n' +
  '      <span class="field">\n' +
  '        <input type="text" id="expdate_month" maxlength="2" class="small" name="EXPMONTH" autocomplete="off" value="" required>&nbsp;/\n' +
  '        <input type="text" id="expdate_year" maxlength="2" class="small" name="EXPYEAR" autocomplete="off" value="" required>\n' +
  '        <input type="hidden" id="expdate" maxlength="4" class="small" name="EXPDATE" autocomplete="off" value="" required>\n' +
  "      </span>\n" +
  "    </p>\n" +
  "  </div>\n" +
  '  <div id="fieldrowCSC">\n' +
  '    <p class="group helpTextTopMargin">\n' +
  '      <label for="cc_csc">Security Code</label>\n' +
  '      <span class="field">\n' +
  '        <input type="text" id="cc_csc" maxlength="4" class="small" name="CSC" autocomplete="off" value="" required>\n' +
  "      </span>\n" +
  "    </p>\n" +
  "  </div>\n" +
  '  <p class="group">\n' +
  '     <span class="field">\n' +
  '         <span class="ax cclogo"></span>\n' +
  '         <span class="ds cclogo"></span>\n' +
  '         <span class="di cclogo"></span>\n' +
  '         <span class="mc cclogo"></span>\n' +
  '         <span class="vi cclogo"></span>\n' +
  "     </span>\n" +
  "  </p>\n" +
  "</div>\n" +
  "</form>\n";
modalBodyDiv.appendChild(bodyContent);

var modalFooterDiv = document.createElement("div");
modalFooterDiv.setAttribute("class", "modal-footer");
contentDiv.appendChild(modalFooterDiv);

var modalCancelButton = document.createElement("button");
modalCloseButton.setAttribute("type", "button");
modalCancelButton.setAttribute("class", "btn btn-secondary");
modalCancelButton.setAttribute("data-dismiss", "modal");
modalCancelButton.innerHTML += "Cancel";

modalFooterDiv.appendChild(modalCancelButton);

var modalSubmitButton = document.createElement("button");
modalSubmitButton.setAttribute("type", "button");
modalSubmitButton.setAttribute("class", "btn btn-primary");
modalSubmitButton.setAttribute("onclick", "VV.Form.Global.SubmitPayment();");
modalSubmitButton.innerHTML += "Submit";

modalFooterDiv.appendChild(modalSubmitButton);

modalFooterDiv.appendChild(modalCancelButton);
