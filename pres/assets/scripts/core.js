// Global Variables
var gVars =
{
	currentLocation: null,
	pleaseWait: false,
	timingInterval:500,
	timeoutInterval:5000,
	slideShowIndex: new Array,
	hideNextPrev: null,
	hideNextPrevTime:5000,
	nextPrevFX: null
}


window.addEvent('domready',function()
{
	// Disable text selection
	document.onselectstart = function() {return false;};
	document.onmousedown = function() {return false;};
	// Initiate Slideshow
	slideShowGlobal.init();
});

window.addEvent('load',function()
{
	setTimeout(function(){ window.scrollTo(0,1); },100);
});

// Slideshow Globals
var slideShowGlobal =
{
	init: function()
	{
		// Initialize UI Engine components
		uiEngine.init();
		
		// Get Slideshow assets, preload, then setup the page for Director or Client mode
		var slideshowStatus = new Request.JSON(
		{
			url:'syncScripts/initJSON.php',
			onSuccess: function(rJSON)
			{
				for(var x=0; x<rJSON['images'].length;x++)
				{
					gVars.slideShowIndex[x] = new Image(rJSON['images'][x][1],rJSON['images'][x][2]);
					gVars.slideShowIndex[x].src=rJSON['images'][x][0];
				}
				
				if(!window.directorMode) jsonSync.init('client');
				else
				{
					gVars.currentLocation=0;
					jsonSync.updateStatus(gVars.currentLocation)
					interactionEngine.init();
				}
			
			}
		}).send();
	}
}

// Animation Engine
var uiEngine =
{
	currentSlide: null,
	newSlideTemp: null,
	theBody: null,
	
	init: function()
	{
		this.theBody = document.body;
		this.currentSlide = this.theBody.getFirst('.slide');
	},
	
	changeSlide: function(newSlide)
	{
		
		this.newSlideTemp = new Element('div',{
			'class':'slide',
			'styles': {
				'opacity':0
			}
		});
		
		this.newSlideTemp.adopt(newSlide);
		
		this.theBody.adopt(this.newSlideTemp);
		
		var quickSize = this.newSlideTemp.getSize();
		
		quickSize.x = -(quickSize.x/2).round();
		quickSize.y = -(quickSize.y/2).round();
		
		this.newSlideTemp.set({
			'styles':
			{
				'margin-left':quickSize.x+'px',
				'margin-top':quickSize.y+'px'
			}
		});
		
		var tempFx = new Fx.Elements($$('.slide'),{
			duration:1000,
			onComplete: function()
			{
				uiEngine.currentSlide.destroy();
				uiEngine.currentSlide = uiEngine.newSlideTemp;
				uiEngine.newSlideTemp = null;
				gVars.pleaseWait=false;
				if(window.directorMode==false) setTimeout(function(){ jsonSync.getStatus(); },gVars.timingInterval);
			}
		}).start({
			'0': {
				'opacity':[1,0]
			},
			'1': {
				'opacity':[0,1]
			}
		});
	}
};

// JSON Sync Engine - For both updating and syncing
var jsonSync =
{
	// If Client Mode, initialize timed Sync
	init: function(mode)
	{
		if(mode=='client') this.getStatus();
	},
	
	// Get current status, and perform changes if need be
	getStatus: function(bool)
	{
		
		if(gVars.pleaseWait==false)
		{
			gVars.pleaseWait=true;
			var getStatus = new Request.JSON(
			{
				url:'syncScripts/getStatus.php',
				onSuccess: function(rJSON)
				{
					//if(!bool) currentLocation = ;
					if(rJSON && (gVars.currentLocation!=parseInt(rJSON['status']) || bool==true))
					{
						gVars.currentLocation=parseInt(rJSON['status']);
						uiEngine.changeSlide(gVars.slideShowIndex[gVars.currentLocation],bool);
					}
					else if(!rJSON && window.directorMode==false)
					{
						gVars.pleaseWait=false;
						gVars.currentLocation=null;
						document.body.innerHTML = '<div class="slide errorMessage"><h1>Ooops!<small>We are experiencing difficulties, give us 5 seconds and we will attempt to reconnect!</small></h1><p>Error: No location was received</p></div>';
						uiEngine.currentSlide = uiEngine.theBody.getFirst('.slide');
						setTimeout(function(){ jsonSync.getStatus(); },gVars.timeoutInterval);
					}
					else if(!rJSON && window.directorMode==true)
					{
						gVars.pleaseWait=false;
						alert('Something went wrong. Wait a couple seconds and try again');
						setTimeout(function(){ jsonSync.getStatus(bool); },gVars.timeoutInterval);
					}
					else
					{
						gVars.pleaseWait=false;
						if(window.directorMode==false) setTimeout(function(){ jsonSync.getStatus(); },gVars.timingInterval);
					}
				},
				onFailure: function(rJSON)
				{
					if(window.directorMode==false)
					{
						gVars.pleaseWait=false;
						gVars.currentLocation=null;
						document.body.innerHTML = '<div class="slide errorMessage"><h1>Ooops!<small>We lost connection with the server, give us 5 seconds and we will attempt to reconnect!</small></h1><p>Error: Connection failure</p></div>';
						uiEngine.currentSlide = uiEngine.theBody.getFirst('.slide');
						setTimeout(function(){ jsonSync.getStatus(); },gVars.timeoutInterval);
					}
					else
					{
						gVars.pleaseWait=false;
						alert('Something went wrong. Wait a couple seconds and try again');
					}
				},
				onException: function(rJSON)
				{
					if(window.directorMode==false)
					{
						gVars.pleaseWait = false;
						gVars.currentLocation=null;
						document.body.innerHTML = '<div class="slide errorMessage"><h1>Ooops!<small>We lost connection with the server, give us 5 seconds and we will attempt to reconnect!</small></h1><p>Error: Connection exception</p></div>';
						uiEngine.currentSlide = uiEngine.theBody.getFirst('.slide');
						setTimeout(function(){ jsonSync.getStatus(); },gVars.timeoutInterval);
					}
					else
					{
						gVars.pleaseWait=false;
						alert('Something went wrong. Wait a couple seconds and try again');
					}
				},
			}).send();
		}
	},
	
	updateStatus: function(loc)
	{
		if(gVars.pleaseWait == false)
		{
			gVars.pleaseWait = true;
			var getStatus = new Request(
			{
				url:'syncScripts/updateStatus.php',
				method: 'get',
				onSuccess: function(rJSON)
				{
					gVars.pleaseWait = false;
					jsonSync.getStatus(true);
				},
				onFailure: function(rJSON)
				{
					gVars.pleaseWait = false;
					document.body.innerHTML = '<p>Hold on please</p>';
					alert('Oops, we lost connection with the server, give us 10 seconds and we will attempt to reconnect!')
					setTimeout(function(){ jsonSync.getStatus(true); },gVars.timeoutInterval);
				}
			}).send('newLocation='+loc);
		}
	}
};

// Interaction Engine
var interactionEngine =
{
	init: function()
	{
		window.addEvent('keydown', function(event){
			if(event.key == 'right') interactionEngine.navigate('next');
			else if(event.key == 'left') interactionEngine.navigate('prev');
		});
/*
		Navigation using left and right mouse buttons. Disabled for now unless I
		decide it's good to have
		
		document.body.addEvent('mouseup',function(e)
		{
			if(e.event.button==0) interactionEngine.navigate('next');
			if(e.event.button==2)  interactionEngine.navigate('prev');
		});
*/
		
		this.genDControls();
	},
	
	genDControls: function()
	{
		// Create Next and Previous control container
		var controlContainer = new Element('div',{ 'id':'nextPrev' });
			controlContainer.addEvent('mouseover',function(){ this.className=null; });
			controlContainer.addEvent('mouseout',function(){ this.className='mouseout'; });
		
		// Create Next and Prev buttons
		var controlNext = new Element('div',{ 'id':'btnNext'});
			controlNext.addEvent('click',function(){ interactionEngine.navigate('next'); });
			controlNext.addEvent('mousedown',function(){ this.style.top='39px'; });
			controlNext.addEvent('mouseup',function(){ this.style.top='38px'; });
		
		var controlPrev = new Element('div',{'id':'btnPrev'});
			controlPrev.addEvent('click',function(){ interactionEngine.navigate('prev'); });
			controlPrev.addEvent('mousedown',function(){ this.style.top='39px'; });
			controlPrev.addEvent('mouseup',function(){ this.style.top='38px'; });
		
		var controlThumbView = new Element('div',{'id':'btnThumbView'});
			controlThumbView.addEvent('click',function(){ interactionEngine.changeNavMode('thumb'); })
			controlThumbView.addEvent('mousedown',function(){ this.style.top='34px'; });
			controlThumbView.addEvent('mouseup',function(){ this.style.top='33px'; });
		
		// Create thumbnail navigation container
		var controlContainer2 = new Element('div',{ 'id':'thumbNav','styles':{ 'display':'none' }});
			controlContainer2.addEvent('mouseover',function(){ this.className=null; });
			controlContainer2.addEvent('mouseout',function(){ this.className='mouseout'; });
			
		var controlThumbs = new Element('div',{ 'id':'thumbs' });
		
		var controlNPView = new Element('div',{'id':'btnNPView'});
			controlNPView.addEvent('click',function(){ interactionEngine.changeNavMode('nextPrev'); })
			controlNPView.addEvent('mousedown',function(){ this.style.top='34px'; });
			controlNPView.addEvent('mouseup',function(){ this.style.top='33px'; });
		
		// Generate/Populate Thumbnails
		for(var x=0;x<gVars.slideShowIndex.length;x++)
		{
			var tempEl = gVars.slideShowIndex[x].clone();
				tempEl.id='n'+x;
			
			tempEl.addEvent('click', function(){ interactionEngine.navigate(this.id);	});
			tempEl.addEvent('mousedown', function(){ this.setProperty('style','margin-top:1px'); });
			tempEl.addEvent('mouseup', function(){ this.setProperty('style','margin-top:0px'); });
			
			controlThumbs.adopt(tempEl);
		}
		
		// Inject buttons into container and container into body
		controlContainer.adopt(controlPrev,controlNext,controlThumbView);
		controlContainer2.adopt(controlThumbs,controlNPView);
		document.body.adopt(controlContainer,controlContainer2);
		
		// Auto hide the controls after 3 seconds
		setTimeout(function(){ $('nextPrev').className='mouseout'; }, 1000)
	},
	
	shNextPrev: function(type,el)
	{
		if(type=='show' && el.style.display=='none')
		{
			el.style.display='block';
		}
		else if(type=='hide')
		{
			el.style.display='none';
		}
	},
	
	changeNavMode: function(mode)
	{
		if(mode=='thumb')
		{
			$('thumbNav').className=null;
			$('nextPrev').style.display='none';
			$('thumbNav').style.display='block';
		}
		else
		{
			$('nextPrev').className=null;
			$('thumbNav').style.display='none';
			$('nextPrev').style.display='block';
		}
	},
	
	mouseClicks: function(event)
	{
		console.log(event.button);
		if(event.button==2) interactionEngine.navigate('prev');
		else interactionEngine.navigate('next');
	},
	
	navigate: function(where)
	{
		if(gVars.pleaseWait == false)
		{
			switch(where)
			{
				case 'next':
					gVars.currentLocation++;
					if(gVars.currentLocation==gVars.slideShowIndex.length) gVars.currentLocation=0;
					break;
				case 'prev':
					gVars.currentLocation--;
					if(gVars.currentLocation < 0) gVars.currentLocation=gVars.slideShowIndex.length-1;
					break;
				default:
					where = where.split('n');
					where = where[1];
					gVars.currentLocation = where;
			}
		
			jsonSync.updateStatus(gVars.currentLocation);
		}
	}
}

function iMode()
{
	switch(window.orientation)
	{
	    case 0:
			uiEngine.theBody.className="normal";
			break;
		case -90:
			uiEngine.theBody.className="landscape";
			break;
		case 90:
			uiEngine.theBody.className="landscape";
			break;
		default:
		uiEngine.theBody.className="normal";
			break;
	}
	window.scrollTo(0,1);
}