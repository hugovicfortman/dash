(function(a){
	if(typeof(JSON) == 'undefined')
	{
		var jsonScript = a.createElement('script');
			jsonScript.src = 'json2.js';
			a.header.appendChild(jsonScript);
}
	/* *	Start:	Post Messages between windows...		* */
	try{
		window.attachEvent('onmessage',receiveMessage);
	}catch(ex){
		window.addEventListener('message',receiveMessage);
	}
	function receiveMessage(event)
	{
		var funcName = event.data.split('||')[0].split('~@~')[0],
			callBack = event.data.split('||')[0].split('~@~')[1],
			params = null;
		//try for parameters in query...
		try{
			params = event.data.split('||')[1].split('~');
		}catch(ex){
			params = null;
		}
		if(typeof(IO[funcName]) != 'undefined')
		{
			var retVal = IO[funcName](params);
			window.parent.postMessage(callBack + '~@~' + retVal,'*');
		}else{
			if(IEXL[funcName] != 'undefined')
			{
				IEXL[funcName](callBack,params);
			}
		}
	}
	/* *	End: TPost Messages between windows...		* */
})(document);

var requestBook = {
	fPath	: 'C:/Users/localhost/workspaces/HTML5/Projects/Websites/Trailz/rsx/file/index.xlsx',
	mapping	: {
		projectDescription	: 'S2',
		projectStatus		: 'S3',
		projectWorkItems	: 'S4',
		projectCompletion	: 'S5',
		subTasks			: {
			pointer		: 'A3',
			workItem		: 'B',
			description		: 'C',
			status			: 'D',
			comments		: 'E',
			priority		: 'F',
			nextAction		: 'G',
			ActiveLocation	: {
				local		: 'I',
				dev			: 'J',
				staging		: 'K',
				production	: 'L'
			}
		}
	}
}; 

IEXL = {
	BOOK : null,
	WorkSheets : {},
	ActiveSheet: null,
	readyXL		: function(CB){
		var xlReady = setInterval(function(){
			if(IEXL.BOOK != null)
			{
				clearInterval(xlReady);
				return window.parent.postMessage(CB,'*');
			}
		},1000);
	}
};

PROJECTS = {};
SUBTASKS = [];

function loadExcel(xl)
{
    var xlFile = xl.WorkBooks.open(requestBook.fPath);
    for (var x = 1; x <= xlFile.WorkSheets.count; x++)
    {
        IEXL.WorkSheets[(xlFile.WorkSheets.Item(x).name)] = (xlFile.WorkSheets.Item(x));
    }
	IEXL.BOOK = xlFile;
}

function getProjects()
{
	PROJECTS = {};
	for(var p in IEXL.WorkSheets)
	{
		IEXL.ActiveSheet = p;
		PROJECTS[p] = {
			name		: p,
			description	: readCell(requestBook.mapping.projectDescription),
			completion	: readCell(requestBook.mapping.projectCompletion),
			status		: readCell(requestBook.mapping.projectStatus)
		}
	}
	return(JSON.stringify(PROJECTS));
}

function getSubtasks(projectName)
{
	SUBTASKS = [];
	IEXL.ActiveSheet = projectName;
	var reading = true,
		pointer = requestBook.mapping.subTasks.pointer;
		pointer = separateAlphabetsFromNumbers(pointer);
	while(reading)
	{
		var subtask = {
			workItem		: readCell(requestBook.mapping.subTasks.workItem + pointer[1]),
			description		: readCell(requestBook.mapping.subTasks.description + pointer[1]),
			status			: readCell(requestBook.mapping.subTasks.status + pointer[1]),
			comments		: readCell(requestBook.mapping.subTasks.comments + pointer[1]),
			priority		: readCell(requestBook.mapping.subTasks.priority + pointer[1]),
			nextAction		: readCell(requestBook.mapping.subTasks.nextAction + pointer[1]),
			ActiveLocation	: {
				local		: readCell(requestBook.mapping.subTasks.ActiveLocation.local + pointer[1]),
				dev			: readCell(requestBook.mapping.subTasks.ActiveLocation.dev + pointer[1]),
				staging		: readCell(requestBook.mapping.subTasks.ActiveLocation.staging + pointer[1]),
				production	: readCell(requestBook.mapping.subTasks.ActiveLocation.production + pointer[1])
			}
		}
		pointer[1] = Number(pointer[1]) + 1;
		reading = (readCell(pointer.join('')) == undefined)?false:true;
		SUBTASKS.push(subtask);
	}
	return(projectName + '~@~' + JSON.stringify(SUBTASKS));
}


function readCell(CELLID)
{
	var cellptr = separateAlphabetsFromNumbers(CELLID);
    cellptr[0] = getNumericMapping(cellptr[0]);
    return(IEXL.WorkSheets[IEXL.ActiveSheet].Cells(cellptr[1],cellptr[0]).value); //It reads x,y instead of A2 as Y,X
}
function getNumericMapping(str)
{
    var eachCharacter = (str.length>1)?str.split(''):str;
    var NumericEquivalent = eachCharacter.map(function (a) {
        return a.charCodeAt(0) - 64;
    });
    NumericEquivalent = NumericEquivalent[NumericEquivalent.length-1] + (26 * (NumericEquivalent.length - 1));
    return (NumericEquivalent);
}
function separateAlphabetsFromNumbers(alNum)
{
    return([alNum.match(/[A-Z]+/),alNum.match(/[0-9]+/)]);
}

/* ***************************************************************************** /
 *	Loading Excel Content...
/* **************************************************************************** */

//check if for internet explorer...
var ie = false,xl;
try{
	xl = new ActiveXObject('Excel.Application');
	ie = (typeof(xl) == 'object')? true : false;
}catch(ex){}

//For Internet Explorer, we use ActiveX objects...
if(ie)
{
	loadExcel(xl);
}

/*	Manipulating Command IO Functions...	*/
var IO = {
	getProjects : function(){
		return getProjects();
	},
	getSubtasks : function(params){
		return getSubtasks(params);
	}
};