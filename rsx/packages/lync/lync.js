(function (w,d,divID) {
    w.LYNC = function () {
		try{
			if (w.ActiveXObject) {
				w.nameCtrl = new ActiveXObject("Name.NameCtrl");
			} else {
				try{
					w.nameCtrl = new ActiveXObject("Name.NameCtrl");
				}catch(ex){
						w.nameCtrl = (function (b) {
							var c = null;
							try{
								c = document.getElementById(b);
								if(!Boolean(c) &&
									(Boolean(navigator.mimeTypes &&
									navigator.mimeTypes[b] &&
									navigator.mimeTypes[b].enabledPlugin)))
								{
									var a = document.createElement('object');
									a.id = b;
									a.type = b;
									a.width = "0";
									a.height = "0";
									a.style.setProperty("visibility","hidden","");
									document.body.appendChild(a);
									c = document.getElementById(b);
								}
							}catch(exc){
								c = null;
								return c;
							}
						})("application/x-sharepoint-uc");
					}
				}

			//check if getting status is enabled before running any code...
			if(w.nameCtrl && w.nameCtrl.PresenceEnabled){
				//Code Here...
				//To show the users' status....
				w.nameCtrl.OnStatusChange = function (userName, status, id) {
					var notificationObject = document.getElementById(id);
					switch(status)
					{
						case 0: // available...
							notificationObject.setAttribute('data-status', 'available');
							break;
						case 1: // offline...
							notificationObject.setAttribute('data-status', 'offline');
							break;
						case 2: // away...
						case 4:  //  :   
						case 16: // away...
							notificationObject.setAttribute('data-status', 'away');
							break;
						case 3: 
						case 5: // inacall...
							notificationObject.setAttribute('data-status', 'inacall');
							break;
						case 6: // outofoffice...
						case 7: //    :
						case 8: // outofoffice...
							notificationObject.setAttribute('data-status', 'outofoffice');
							break;
						case 9:
						case 15: // donotdisturb...
							notificationObject.setAttribute('data-status', 'donotdisturb');
							break;
						case 10: // busy...
							notificationObject.setAttribute('data-status', 'busy');
							break;
					}
				};

			   w.nameCtrl.GetStatus("viou@chevron.com", divID);
				d.getElementById(divID).onmouseover = function () {
					window.nameCtrl.ShowOOUI("viou@chevron.com", 0, 10, 10);
				}


				d.getElementById(divID).onmouseout = function () {
					window.nameCtrl.HideOOUI();
				}
			}
		}catch(ex){
			console.log(ex);
			//Nothing worked, abort...
			return false;
		}
    };
})(window, document, "lyncME");


