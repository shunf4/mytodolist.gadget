/*
System.Gadget.onSettingsClosing=SettingsClosing;

window.onload=function () {

 document.getElementById('listname').value=System.Gadget.Settings.read('listname');

}

function SettingsClosing(event) {

 if (event.closeAction==event.Action.commit) {
  System.Gadget.Settings.write('listname', document.getElementById('listname').value);
 }

 event.cancel = false;
}
*/