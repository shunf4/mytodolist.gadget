System.Gadget.settingsUI="settings.html";
System.Gadget.onSettingsClosed=SettingsClosed;
System.Gadget.onDock=resizetodo;
System.Gadget.onUndock=resizetodo;

docked=0;

function resizetodo() {

 bd=document.body.style;
 System.Gadget.beginTransition();

 if (System.Gadget.docked) {
// docked

  bd.width=130;
  bd.height=93;
  bd.background='url(pics/bk_130.png) no-repeat';
  docked=1;

  document.getElementById('title').className='title_docked';
  document.getElementById('addinput').className='addinput_docked';
  document.getElementById('count').style.display='block';
  document.getElementById('list').style.display='none';
  document.getElementById('toolbar').style.display='none';
  rendertitle();

 } else {
// normal

    bd.width=266;
    bd.height=232;
    bd.background='url(pics/bk.png) no-repeat';
    docked=0;

    document.getElementById('title').className='title';
    document.getElementById('addinput').className='addinput';
    document.getElementById('count').style.display='none';
    document.getElementById('list').style.display='block';
    document.getElementById('toolbar').style.display='block';
    rendertitle();

   }

 System.Gadget.endTransition(System.Gadget.TransitionType.morph,1);

}

defaultlistname='My To-Do List';
todolist=new Array();
todos=0;
drag=-1;

window.onload=function() {

 listname=System.Gadget.Settings.read('listname');
 if (!listname) {
  listname=defaultlistname;
  System.Gadget.Settings.write('listname', listname);
 }

 rendertitle();
 loadtodo();
 loadfromdisktodo();

}

document.onmouseup=function () {
 stopdrag();
}

function activatetarget(x,obj) {
 if (drag!=-1) {
  droptarget=x;
  obj.className='droptarget_hover';
 }
}

function deactivatetarget(obj) {
 if (drag!=-1) {
  droptarget=-1;
  obj.className='droptarget';
 }
}

function showtooltip(txt,event) {
 tmpo=document.getElementById('tooltip');
 tmpo.style.top=event.clientY+24;
 tmpo.style.left=event.clientX;
 tmpo.className='tooltip';
 tmpo.innerHTML=txt;
}

function hidetooltip() {
 document.getElementById('tooltip').className='tooltip_hidden';
}

function stopdrag() {
 if (drag!=-1) {
  if ((drag!=droptarget)&&(drag+1!=droptarget)&&(droptarget!=-1)) {
   tmp=todolist[drag];
   todolist.splice(drag,1);
   if (drag<droptarget) droptarget--;
   todolist.splice(droptarget,0,tmp);
   renderlist();
  } else
     if (droptarget!=-1) {
      deactivatetarget(document.getElementById('droptarget'+droptarget));
      droptarget=-1;
     }
  drag=-1;
 }
}

function startdrag(x) {
 droptarget=-1;
 drag=x;
}

function renderlist() {

 tmp='<table><tr><td height=4 colspan=3 id="droptarget0" onmouseover="activatetarget(0,this);" onmouseout="deactivatetarget(this);"></td></tr>';
 for (i=0; i<todos; i++) {
  tmp+='<tr><td class="tdl"><img src="pics/checkbox_'+((todolist[i][1])?('on'):('off'))+'.gif" onclick="toggle('+i+');"></td><td class="tdr'+((todolist[i][1])?('_completed'):(''))+'" ondblclick="edittodo('+i+',this);" onmousedown="startdrag('+i+');">'+todolist[i][0]+'</td><td class="tdd"><img src="pics/delete.png" onclick="deletetodo('+i+');"></td></tr>';
  tmp+='<tr><td height=4 colspan=3 id="droptarget'+(i+1)+'" onmouseover="activatetarget('+(i+1)+',this);" onmouseout="deactivatetarget(this);"></td></tr>';
 }                      
 tmp+='</table>';
 document.getElementById('list').innerHTML=tmp;

 rendertitle();
 savetodo();

}

function rendertitle() {
 done=0; titleedit=0;
 for (i=0; i<todos; i++)
  done=done+todolist[i][1];

 tmp=listname;
 if (!docked) if (todos) tmp+=' ('+done+'/'+todos+')';
 document.getElementById('title').innerHTML=tmp;
 document.getElementById('count').innerHTML=((todos)?('<div style="margin-top:9px">'+done+'/'+todos+' tasks</div>'):('<div style="margin-top:2px">No tasks<br/>Undock me</div>')); 
}

function renderupdate(error){
  if (error !== undefined) {
    document.getElementById('lastUpdateDate').innerText="Error";
    return;
  }
  var updateTime = new Date();
  document.getElementById('lastUpdateDate').innerText=(updateTime.getMonth() + 1) + "/" + updateTime.getDate() + " " + ("00" + updateTime.getHours()).slice(-2)+":" + ("00" + updateTime.getMinutes()).slice(-2) + ":"+ ("00" + updateTime.getSeconds()).slice(-2);
}

titleedit=0;

function edittitleok() {
 listname=document.getElementById('editortitle').value;
 System.Gadget.Settings.write('listname',listname);
 rendertitle();
 titleedit=0;
}

function edittitle() {
 titleedit=1-titleedit;
 if (titleedit) {
  document.getElementById('title').innerHTML='<form onsubmit="return edittitleok();"><input type="text" id="editortitle" class="editortitle'+(docked?'_docked':'')+'" value="'+listname.replace(/"/g,'&quot;')+'" onblur="edittitleok();" maxlength="255" onkeydown="checkesc(event);" /></form>';
  document.getElementById('editortitle').focus();
 } 
}

function toggle(x) {

 todolist[x][1]=1-todolist[x][1];
 renderlist();
 rendertitle();

}

function edittodo(x,td) {
 td.innerHTML='<form onsubmit="return editok('+x+');"><input type="text" id="editor" value="'+todolist[x][0].replace(/"/g,'&quot;')+'" onblur="editok('+x+')" maxlength="255" onkeydown="checkesc(event);" /></form>';
 document.getElementById('editor').focus();
}


function checkesc() {
 if (event.keyCode==27) { renderlist(); rendertitle(); }
}

function editok(x) {
 todolist[x][0]=document.getElementById('editor').value;
 renderlist();
}

function addtodo() {

 v=document.getElementById('addinput').value;
 if ((v=='Add Task')||(!v)) {
  document.getElementById('addinput').value='';
  document.getElementById('addinput').focus();
 } else {
    todolist[todos]=new Array(v,0);
    todos++;
    renderlist();
    document.getElementById('addinput').value='';
    document.getElementById('addinput').focus();
   }

 return (false);

}

function deletetodo(x) {
 todolist.splice(x,1);
 todos--;
 renderlist();
}

function uptodo(x) {
 if (x) {
  tmp=todolist[x];
  todolist[x]=todolist[x-1];
  todolist[x-1]=tmp;
  renderlist();
 }
}

function downtodo(x) {
 if (x<todos-1) {
  tmp=todolist[x];
  todolist[x]=todolist[x+1];
  todolist[x+1]=tmp;
  renderlist();
 }
}

function savetodo() {
 System.Gadget.Settings.write('todos', todos);

 for (i=0; i<todos; i++) {
  System.Gadget.Settings.write('todo'+i, todolist[i][0]);
  System.Gadget.Settings.write('todochecked'+i, todolist[i][1]);
 }
}

function loadtodo() {
 todos=System.Gadget.Settings.read('todos');

 if (!todos) {
  todos=0;
  System.Gadget.Settings.write('todos', todos);
 } else
    for (i=0; i<todos; i++)
     todolist[i]=new Array(System.Gadget.Settings.read('todo'+i),System.Gadget.Settings.read('todochecked'+i));

 renderlist();
}

function checkblur() {
 if (!document.getElementById('addinput').value)
  document.getElementById('addinput').value='Add Task';
}

function checkfocus() {
 if (document.getElementById('addinput').value=='Add Task')
  document.getElementById('addinput').value='';
}

function SettingsClosed(event) {
 if (event.closeAction == event.Action.commit) {
  listname=System.Gadget.Settings.readString('listname');
  rendertitle();
 }
}

function newtodo() {
 if (todos)
  if (confirm('Are you sure you want to delete all items?')) {
   todolist=new Array();
   todos=0;
   renderlist();

   listname=defaultlistname;
   System.Gadget.Settings.write('listname', listname);
   rendertitle();
  }
}

function printtodo() { 
 if (confirm('Print current list?')) {
  tempfilename=listname.replace(/[^a-zA-Z0-9 \-]/g,'');
  tempfilename=System.Environment.getEnvironmentVariable('TEMP')+'\\'+tempfilename+'.txt';
  savetodisktodo(tempfilename,1);
  System.Shell.execute('notepad.exe','/p '+tempfilename);
 } 
}

function savetodisktodo(savepath,notitle) {

 hidetooltip();

 if (!savepath) savepath=System.Shell.saveFileDialog('',"Text File\0*.txt\0\0");
 if (savepath!='') {

  if (savepath.substr(savepath.length-4,4)!='.txt') savepath+='.txt';

  if (!notitle) tmp=listname+'\r\n\r\n'; else tmp='\r\n';
  for (i=0; i<todos; i++) {
   tmp+=((todolist[i][1])?('[X]'):('[ ]'))+' '+todolist[i][0]+'\r\n';
  }

  var adTypeText=2; 
  var adSaveCreateOverWrite=2;
  var adModeReadWrite=3;

  var oStream=new ActiveXObject("ADODB.Stream");
  with(oStream) {
   Mode=adModeReadWrite;
   Type=adTypeText;
   Charset='iso-8859-1';
   Open();
   WriteText(tmp);
   SaveToFile(savepath,adSaveCreateOverWrite);
   Close();
  }

 }

}

function loadfromdisktodo() {
  hidetooltip();

  var succ = 0;

  var request = null;
  try {
    request = new ActiveXObject("Msxml2.XMLHTTP");
  } catch (e) {
    try {
      request = new ActiveXObject("Microsoft.XMLHTTP");
    } catch (oc) {
      request = null;
    }
  }

  if (!request && typeof XMLHttpRequest != "undefined") {
    request = new XMLHttpRequest();
  }

  if (request != null) {
   System.Debug.outputString("Sending Request...");
   request.open("REPORT", "https://shunwww.cn/radicale/riv/****uuid****/", true);
   request.setRequestHeader("Authorization", "Basic *******");
   request.setRequestHeader("Content-Type", "application/xml; charset=utf-8");
   request.setRequestHeader("Depth", "1");

   request.onreadystatechange = function() {
    System.Debug.outputString("Response received.");
    tmptodos = 0;
    tmptodolist = new Array();
    tmptodolist_finished = new Array();
    try {
      System.Debug.outputString(request.readyState);
      if (request.readyState == 4) {
        if (request.status == 207) {
          if (request.responseXML) {
            var allData = request.responseXML.selectNodes("/multistatus/response/propstat/prop/C:calendar-data");
            for (var i = 0; i < allData.length; i++) {
              var currData = allData[i].text;
              var currText = currData.match(/SUMMARY:\s*(.*)/i);
              if (currText) {
                currText = currText[1];
                var currComplete = currData.match(/STATUS:\s*(.*)/i);
                if (currComplete) {
                  currComplete = currComplete[1].toUpperCase() == 'COMPLETED';
                } else {
                  currComplete = false;
                }
                tmptodos++;
                if (currComplete) {
                  tmptodolist_finished.push(new Array(currText, currComplete));
                } else {
                  tmptodolist.push(new Array(currText, currComplete));
                }
                
              }
            }

            todos=tmptodos;
            todolist=tmptodolist.concat(tmptodolist_finished);
            renderlist();

            listname="Caldav To-do";
            System.Gadget.Settings.write('listname', listname);
            rendertitle();
            renderupdate();
            succ = 1;
          }
        }
        System.Debug.outputString("Status: " + request.status.toString() + ", ");
        if (succ == 0) {
          renderupdate("Error");
        }
      }
    } catch(e) {
      System.Debug.outputString("Error: " + e.message.toString());
    }

  }

  

  request.send("<C:calendar-query xmlns:D='DAV:'\nxmlns:C='urn:ietf:params:xml:ns:caldav'>\n<D:prop>\n<D:getetag/>\n<C:calendar-data>\n<C:comp name='VCALENDAR'>\n<C:prop name='VERSION'/>\n<C:comp name='VEVENT'>\n<C:prop name='SUMMARY'/>\n<C:prop name='DESCRIPTION'/>\n<C:prop name='STATUS'/>\n<C:prop name='TRANSP'/>\n<C:prop name='ATTENDEE'/>\n<C:prop name='UID'/>\n<C:prop name='DTSTART'/>\n<C:prop name='DTEND'/>\n<C:prop name='DURATION'/>\n<C:prop name='RRULE'/>\n<C:prop name='RDATE'/>\n<C:prop name='EXRULE'/>\n<C:prop name='EXDATE'/>\n<C:prop name='RECURRENCE-ID'/>\n</C:comp>\n</C:comp>\n</C:calendar-data>\n</D:prop>\n<C:filter>\n<C:comp-filter name='VCALENDAR'>\n<C:comp-filter name='VTODO'>\n</C:comp-filter>\n</C:comp-filter>\n</C:filter>\n</C:calendar-query>");

  setTimeout("loadfromdisktodo()", 300000);
 }

}

function loadfromdisktodo_old() {

  hidetooltip();
  loadpath=System.Shell.chooseFile(true, "Text File\0*.txt\0\0", '', '');
  if (loadpath) {
 
   var adTypeText=2; 
   var adModeReadWrite=3;
 
   var oStream=new ActiveXObject("ADODB.Stream");
   with(oStream) {
    Mode=adModeReadWrite;
    Type=adTypeText;
    Charset='iso-8859-1';
    Open();
    LoadFromFile(loadpath.path);
    tmp=ReadText;
    Close();
   }
 
   iserror=0;
   if (tmp) {
    tmp=tmp.replace(/\r/g,'');
    tmp=tmp.split('\n');
    if (!tmp[0]) iserror=2;
     else
      if (tmp[1]) iserror=3;
       else {
        tmplistname=tmp[0];
        tmptodos=0;
        tmptodolist=new Array();
        for (i=2; i<tmp.length; i++)
         if (tmp[i]) {
          tmpval=-1;
          if (tmp[i].substr(0,4)=='[ ] ') tmpval=0;
          if (tmp[i].substr(0,4)=='[X] ') tmpval=1;
          if (tmp[i].substr(0,4)=='[x] ') tmpval=1;
          if (tmpval==-1) iserror=4;
           else {
            tmptodos++;
            tmptodolist[i-2]=new Array(tmp[i].substr(4),tmpval);
           }
         }
 
       }
 
   } else iserror=1;
 
   errors=new Array('','Can\'t read file','Invalid file format','Invalid file format','Invalid file format');
   if (iserror) alert ('Error: '+errors[iserror]+' ('+iserror+')');
    else {
     todos=tmptodos;
     todolist=tmptodolist;
     renderlist();
 
     listname=tmplistname;
     System.Gadget.Settings.write('listname', listname);
     rendertitle();
    }
 
  }
 
 }