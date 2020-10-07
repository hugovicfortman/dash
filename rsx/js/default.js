$(window).load(function(){
	Time.Initialize();
	getTimeOfDay();
	setMsgBoard();
	manageLumIntensity();
	randomWeather();
	slideQuotes();
	LYNC();
	backdrops();
	//Set tasks to load dynamically...
	$('a[href="tasks"]').click(function(){loadTasks();});
});

/*	Time Functions	*/
function getTimeOfDay()
{
	var timeOfDay = Time.TimeOfDay;
		$('.time-box [role="time"]').text(Time.Time12);
		$('.time-box [role="date"]').text(Time.Date + ' ' + Time.Month + ' ' + Time.Year);
		$('#home.panel-page [role="msg-board-txt"]').text('It\'s '+ Time.DayOfWeek +' '+ Time.TimeOfDay );
		$('.weather-ambience').attr('data-timeofday',((Time.TimeOfDay.toLowerCase() == 'morning' || Time.TimeOfDay.toLowerCase() == 'afternoon')?'daytime':'night'));
	var TickTimeDate = setInterval(function(){
		$('.time-box [role="time"]').text(Time.Time12);
		$('.time-box [role="date"]').text(Time.Date + ' ' + Time.Month + ' ' + Time.Year);
		if(timeOfDay != Time.TimeOfDay)
		{
			timeOfDay = Time.TimeOfDay;
			$('#home.panel-page [role="msg-board-txt"]').text('It\'s '+ Time.DayOfWeek +' '+ Time.TimeOfDay );
			$('.weather-ambience').attr('data-timeofday',((Time.TimeOfDay.toLowerCase() == 'morning' || Time.TimeOfDay.toLowerCase() == 'afternoon')?'daytime':'night'));
		}
	},60000);
	return null;
}

/*
	**********************	Major Functionality	*************************************
*/

/*	Msg Board	*/
function setMsgBoard()
{
	$('[data-role="msg-board"]').text($('[data-active="true"].panel-page [role="msg-board-txt"]').text());
}
/*	Percentage Completion	*/
function rollPercentage()
{
	$('.tasks [role="task"]').each(function(){
		var objReference = this, prIndex = $(this).attr('task-index'), rollFrom = 0, rollTo = Number($(this).find('.task-completion').attr('data'));
		$(objReference).find('.task-completion span').text(rollFrom);
		window['task-'+prIndex+'-rolling'] = setInterval(function(){
			var curVal = Number($(objReference).find('.task-completion span').text()),nextVal,increment;
			if(curVal < rollTo)
			{
				increment = (((curVal + (rollTo - curVal)/2) > rollTo)? 1 : Math.floor((rollTo - curVal)/2)+1);
				nextVal = curVal + increment;
				$(objReference).find('.task-completion span').text(nextVal);
				$(objReference).attr('completion',nextVal);
				/*	Colour by percentage...	*/
				if(nextVal < 100)
				{
					$(objReference).find('.fill').attr('style','border-color:#bb0');
					$(objReference).find('.bar').attr('style','border-color:#bb0');
					if(nextVal < 75)
					{
						$(objReference).find('.fill').attr('style','border-color:orange');
						$(objReference).find('.bar').attr('style','border-color:orange');
						if(nextVal < 50)
						{
							$(objReference).find('.fill').attr('style','border-color:#f72');
							$(objReference).find('.bar').attr('style','border-color:#f72');
							if(nextVal < 25)
							{
								$(objReference).find('.fill').attr('style','border-color:red');
								$(objReference).find('.bar').attr('style','border-color:red');
							}
						}
					}
				}else{
					$(objReference).find('.fill').attr('style','border-color:#0f0');
					$(objReference).find('.bar').attr('style','border-color:#0f0');
				}
			}else{
				clearInterval(window['task-'+prIndex+'-rolling']);
			}
		},100);
	});
}
/*	Tab manipulation	*/
function openPanelPage(tabID)
{
	$('.panel-page').attr('data-active','false');
	$('#'+tabID+'.panel-page').attr('data-active','true');
	setMsgBoard();
	setTaskViewPanel();
	$('#main-navigation').collapse('hide');
}

function setTaskViewPanel()
{
	if($('#tasks-selected').attr('data-active') == 'true')
	{
		$('[data-role="task-view-panel"]').removeClass('hidden');
		$('[data-role="msg-board"]').addClass('hidden');
		
	}else{
		$('[data-role="task-view-panel"]').addClass('hidden');
		$('[data-role="msg-board"]').removeClass('hidden');
	}
}

/*	Task Loading	*/
function loadTaskDetails(banner,pIndex)
{
	pIndex = (pIndex==undefined)? $(banner).attr('task-index') : pIndex;
	//check if task subtasks have been loaded in task
	if(typeof(window.Tasks[ pIndex ].subtasks) == 'undefined')
	{
		//first load the tasks' subtasks as JSON,
		getSubtasks(window.Tasks[ pIndex ]);
		return false;
	}
	loadTaskSubtasks( window.Tasks[ pIndex ] );
	openPanelPage('tasks-selected');
	setTaskViewPanel();
}
function loadTaskSubtasks(task)
{
	$('#tasks-selected').empty();
	//Set Panel With Task Details...	
	$('[data-role="task-view-panel"] .btn[completion] .task-name').text(task.name);
	$('[data-role="task-view-panel"] .btn[completion]').attr('status',task.status.toLowerCase());
	$('[data-role="task-view-panel"] .btn[completion]').attr('completion',task.completion);
	$('[data-role="task-view-panel"] .btn[completion] .task-completion span').text(task.completion);
	// then attach them to the tasks in the tasks array for easy recollection...
	for(var subtask in task.subtasks)
	{
		if(task.subtasks[subtask].workItem != undefined)
		{
			var subtaskItem = new SubTask(task.subtasks[subtask]);
			$(subtaskItem.DOMElement).appendTo('#tasks-selected');
		}
	}
	$('#tasks-selected').append('<br/><div class="btn btn-block btn-default" role="goBack">Back to Tasks</div>');
	$('#tasks-selected [role="goBack"]').click(function(){
		openPanelPage('tasks');
	});
}
function loadTasks(tasksJson)
{
	$('#tasks .tasks').empty();
	if(tasksJson == undefined)//first check if the json is preloaded from back end, or we are currently loading with the json as variable...
	{
		if(window.Tasks == undefined)
		{
			getTasks();
			//showajaxloader...
			return false; //Display the ajax loader here while we wait to be called back.
		}
	}else{
		window.Tasks = JSON.parse(tasksJson);
	}
	window.Tasks = window.Tasks || [];
	//hideajaxloader...
	for(var task in Tasks)
	{
		var taskItem = new Task(Tasks[task],task);
		$(taskItem.DOMElement).appendTo('#tasks .tasks');
	}
	rollPercentage();
}

/*	Template for a task...	*/
function Task(taskData,count)
{
	this.name = taskData.name;
	this.status = taskData.status.toLowerCase();
	this.completion = taskData.completion;
	this.description = taskData.description;
	this.taskIndex = count;
	/*	Now create the actual element...	*/
	var DOMElement = document.createElement('button'),
		DOMContent = '<span class="task-name">'+this.name+'</span>' +
						'<span class="task-completion" data="'+this.completion+'">' +
							'<div class="piPercent small">' +
								'<span>0</span>' +
								'<div class="slice"><div class="bar"></div><div class="fill"></div></div>' +
							'</div>' +
						'</span>';
		DOMElement.innerHTML = DOMContent;
		DOMElement.setAttribute('role','task');
		DOMElement.setAttribute('class','btn btn-block');
		DOMElement.setAttribute('status',this.status);
		DOMElement.setAttribute('task-index',this.taskIndex);
		DOMElement.setAttribute('completion',0);
		DOMElement.addEventListener('click',function(){
			loadTaskDetails(this);
		});
	DOMElement.object = this;
	this.DOMElement = DOMElement;
	return this;
}

/*	Template for a task subtask...	*/
function SubTask(subtaskData)
{
	this.name = subtaskData.workItem;
	this.status = (subtaskData.status != undefined)?subtaskData.status.toLowerCase():'';
	this.description = subtaskData.description;
	this.activeLocation = subtaskData.activeLocation || {local:'',dev:'',staging:'',production:''};
	/*	Now create the actual element...	*/
	var DOMElement = document.createElement('div'),
		DOMContent = '<div class="col-xs-7">' +
						'<div class="btn-group">' +
							'<div class="btn hidden-xs"><i class="fa fa-arrows-v"></i></div>' +
							'<div class="btn">' + this.name + '</div>' +
							'<div class="btn hidden-xs"><i class="fa fa-dot-circle-o"></i></div>' +
						'</div>' +
					'</div>' +
					'<div class="col-xs-5 subtask-testing">' +
						'<div class="col-xs-3 btn btn-info" ' + ((this.activeLocation.local == '')? '': ('data-test="' + this.activeLocation.local + '"')) + '>&nbsp;</div>' +
						'<div class="col-xs-3 btn btn-info" ' + ((this.activeLocation.dev == '')? '': ('data-test="' + this.activeLocation.dev + '"')) + '>&nbsp;</div>' +
						'<div class="col-xs-3 btn btn-info" ' + ((this.activeLocation.staging == '')? '': ('data-test="' + this.activeLocation.staging + '"')) + '>&nbsp;</div>' +
						'<div class="col-xs-3 btn btn-info" ' + ((this.activeLocation.production == '')? '': ('data-test="' + this.activeLocation.production + '"')) + '>&nbsp;</div>' +
					'</div>';
		DOMElement.innerHTML = DOMContent;
		DOMElement.setAttribute('role','subtask');
		DOMElement.setAttribute('class','row');
		DOMElement.setAttribute('status',this.status);
		$(DOMElement).find('.subtask-testing .btn[data-test]').each(function(){
			this.addEventListener('click',function(){
				window.open($(this).attr('data-test'),'_blank');
			});
		});
		DOMElement.addEventListener('click',function(){
			/*	TODO: Allow clients to influence priority by toggling colours	*/
		});
	DOMElement.object = this;
	this.DOMElement = DOMElement;
	return this;
}

/*	Data Operations for tasks...	*/
function getTasks()
{
	//We're getting tasks from the inner XL iframe...
	XLFunction('getTasks','loadTasks');
	/*	Demo data for a task...	*/
	/*var tasks = [
		 {
			name : 'Task 3',
			description : 'Task 3 is a generic task for testing.',
			completion : 10,
			status : 'terminated'
		},
		 {
			name : 'Task 4',
			description : 'Task 4 is a generic task for testing.',
			completion : 50,
			status : 'suspended',
			subtasks : [
				{
					workItem : 'Excel Downloads',
					description : 'To include Excel downloads of various information as required',
					status : 'done',
					comments : 'Preclosed by Mr Bukky',
					priority : 2,
					nextAction : 'None',
					activeLocation : {
						local : 'localhost/lupinebytes.com',
						dev : 'localhost1/lupinebytes.com',
						staging : 'http://staging.lupinebytes.com/',
						production : 'http://www.lupinebytes.com/'
					}
				},
				{
					workItem : 'Excel Downloads',
					description : 'To include Excel downloads of various information as required',
					status : 'done',
					comments : 'Preclosed by Mr Bukky',
					priority : 2,
					nextAction : 'None',
					activeLocation : {
						local : 'localhost/lupinebytes.com',
						dev : 'localhost1/lupinebytes.com',
						staging : 'http://staging.lupinebytes.com/',
						production : 'http://www.lupinebytes.com/'
					}
				},
			]
		},
		 {
			name : 'Task 5',
			description : 'Task 5 is a generic task for testing.',
			completion : 80,
			status : 'terminated',
			subtasks : [
				{
					workItem : 'Excel Downloads',
					description : 'To include Excel downloads of various information as required',
					status : 'done',
					comments : 'Preclosed by Mr Bukky',
					priority : 2,
					nextAction : 'None',
					activeLocation : {
						local : 'localhost/lupinebytes.com',
						dev : 'localhost1/lupinebytes.com',
						staging : 'http://staging.lupinebytes.com/',
						production : 'http://www.lupinebytes.com/'
					}
				},
				{
					workItem : 'Excel Downloads',
					description : 'To include Excel downloads of various information as required',
					status : 'done',
					comments : 'Preclosed by Mr Bukky',
					priority : 2,
					nextAction : 'None',
					activeLocation : {
						local : 'localhost/lupinebytes.com',
						dev : 'localhost1/lupinebytes.com',
						staging : 'http://staging.lupinebytes.com/',
						production : 'http://www.lupinebytes.com/'
					}
				},
			]
		},
	];
	return tasks;*/
}

function getSubtasks(task)
{
	//We're getting subtasks from XLRead Object...
	XLFunction('getSubtasks','assignSubtasks',[task.name]);
	return true;
	/*return [
			{
				workItem : 'Load Tasks',
				description : 'To include Excel downloads of various information as required',
				status : 'done',
				comments : 'Preclosed by Mr Bukky',
				priority : 2,
				nextAction : 'None',
				activeLocation : {
					local : 'localhost/lupinebytes.com',
					dev : 'localhost1/lupinebytes.com',
					staging : 'http://staging.lupinebytes.com/',
					production : 'http://www.lupinebytes.com/'
				}
			},
			{
				workItem : 'Load Tasks 2',
				description : 'To include Excel downloads of various information as required',
				status : 'done',
				comments : 'Preclosed by Mr Bukky',
				priority : 2,
				nextAction : 'None',
				activeLocation : {
					local : 'localhost/lupinebytes.com',
					dev : 'localhost1/lupinebytes.com',
					staging : 'http://staging.lupinebytes.com/',
					production : 'http://www.lupinebytes.com/'
				}
			},
		];*/
}

function assignSubtasks(taskSubTasks)
{
	//The taskSubTasks variable carries the name of the task, and the 
	// subtasks in a stringified JSON...
	var taskIndex = taskSubTasks[0], subtasksJSON = taskSubTasks[1];
	if(taskIndex == undefined || subtasksJSON == undefined)
	{
		return false;
	}
	window.Tasks[taskIndex].subtasks = JSON.parse(subtasksJSON);
	//After asigning the task subtasks, we call the loader function again...
	loadTaskDetails(0,taskIndex);
}

/*	Data operation for quotes...	*/
function getQuotes()
{
	//We're getting subtasks from inner iframe...
	return window.QUOTES;
}


/*	The backdrop	*/
function backdrops(){
	var cycleBackdrops = setInterval(function(){
		var maxNo = 40;
		var no = Math.floor(Math.random()*40)
		$(document.body).attr('style','background-image:url(\'rsx/images/backdrops/'+no+'.jpg\')');
	},120000);
}


/*	Application Objects...	*/
//The Time Object
var Time = {
	getDayOfWeek : function(day7){
		return ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][day7];
	},
	getMonthOfYear : function(month11){
		return ['January','February','March','April','May','June','July','August','September','October','November','December'][month11];
	},
	getTimeOfDay : function (hour23) {
		if(hour23>=0 && hour23<12){
			return 'Morning';
		}
		if(hour23>=12 && hour23<17){
			return 'Afternoon';
		}
		if(hour23>=17 && hour23<=19){
			return 'Evening';
		}
		return 'Night';
	},
	Initialize : function ()
	{
		var date = new Date;
		Time.DayOfWeek = Time.getDayOfWeek(date.getDay());
		Time.TimeOfDay = Time.getTimeOfDay(date.getHours());
		Time.Time12 = ((date.getHours()>12)?date.getHours()-12:date.getHours()) + ':' +  ((date.getMinutes()<10)?('0'+String(date.getMinutes())):date.getMinutes()) + ' ' + ((date.getHours()>12)?'PM':'AM');
		Time.Time24 = date.getHours() + ':' + ((date.getMinutes()<10)?('0'+String(date.getMinutes())):date.getMinutes());
		Time.Month = Time.getMonthOfYear(date.getMonth()).substring(0,3);
		Time.FullMonth = Time.getMonthOfYear(date.getMonth());
		Time.Date = date.getDate();
		Time.Year = Number(date.getFullYear());
		if(Time.Ticker == null)
		{
			Time.Ticker = setInterval(function(){Time.Tick();},1000);
		}
	},
	Tick : function ()
	{
		var date = new Date;
		var Seconds = date.getSeconds();
		if(Seconds == 0)
		{
			Time.Initialize();
		}
	},
	DayOfWeek : null,
	TimeOfDay : null,
	Time12	  : null,
	Time24	  : null,
	Ticker    : null,
	Month	  : null,
	Date	  : null,
	Year	  : null,
};

/*	Adding Custom Events to browsers without native support	*/
(function(){
	if(typeof window.CustomEvent === "function")
	{
		return false;
	}
	function CustomEvent( event, params)
	{
		params = params || {
			bubbles		: false,
			cancelable	: false,
			detail		: undefined
		};
		var evt = document.createEvent('CustomEvent');
			evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
		return evt;
	}
	CustomEvent.prototype = window.Event.prototype;
	window.CustomEvent = CustomEvent;
})();

/* *	Start: Trying the message Method		* */
try{
	window.attachEvent('onmessage',receiveMessage);
}catch(ex){
	window.addEventListener('message',receiveMessage);
}
/* *	End: Trying the message Method		* */
/*	Handles received messages from inner windows	*/
function receiveMessage(event)
{
	var received = event.data.split('~@~');
	callBack = received[0];
	//Try for data received...
	try{
		received.shift();
		dataReceived = received;
	}catch(ex){
		dataReceived = null;
	}
	if(callBack != null)
	{
		if(typeof(window[callBack]) == 'function')
		{
			window[callBack](dataReceived);
		}
	}
}
function XLFunction(funcName,callBack,paramsArray)
{
	if(window.xlRead == undefined)
	{
		loadXLRead();
		$(xlRead).on('load',function(){
			xlRead.contentWindow.postMessage('readyXL~@~xlReady','*');
		});
		window.addEventListener('xlReady',function(){
			XLFunction(funcName,callBack,paramsArray);
		});
		return false;
	}
		/*
		 * Here, we're sending function name, callback and parameters to the xlRead
		 * Window Object. We use double pipe ie || to delimit function part from params
		 * Function Names part comes first, followed by params names.
		 * We pass a function and a callback delimited by character combination ~@~
		 * The postmessage guy therefore accepts the following format of argument...
		 *
		 * 		postMessage(functionToCallWithinXLRead~@~callbackFunctionHere||Params);
		 *
		 * Multiple params can be delimited in order with the ~@~ combo too...
		*/
	paramsArray = paramsArray || [];
	var queryString = [[funcName,callBack].join('~@~'),paramsArray.join('~@~')].join('||');
		xlRead.contentWindow.postMessage(queryString,'*');
}
function loadXLRead()
{
	//loads the XLRead iframe into the page...
	var frame = document.createElement('iframe');
		frame.id = 'xlRead';
		frame.src = 'rsx/packages/xl/index.html';
		frame.setAttribute('style','height:0px;width:0px;opacity:0;position:fixed;top:-1px;left:-1px;');
		window.xlRead = frame;
		document.body.appendChild(frame);
		$(frame).hide();
}
function xlReady()
{
	//Fires the xlReady event to the window...
	var event = new CustomEvent('xlReady');
	window.dispatchEvent(event);
}
