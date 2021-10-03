window.addEvent('domready',function(){
	//new Terminal($('terminal'));
	//new DrawText('drawMe');
	window.debug = new Init('terminal');
});

var Init = new Class({
	initialize:function(el)
	{
		this.el = $(el);
		if(!this.el) return;
		
		var text = this.el.getChildren().dispose();
		
		this.logContainer = new Element('div',{
			'class':'TerminalLog'
		}).inject(this.el);
		
		new DrawMultiLineText(text,this.logContainer,this.Callbacks.createUI.bind(this));
	},
	Callbacks:
	{
		createUI:function()
		{
			window.debug = new Terminal(this.el,this.logContainer);
		}
	}
});

// Used for drawing multiple lines of text. Takes an array of strings, and sequentially adds them
var DrawMultiLineText = new Class({
	initialize:function(els,container,onComplete)
	{
		this.Queue = els;
		this.Container = container;
		if(onComplete && $type(onComplete)=='function') this.onComplete = onComplete;
		
		this.DrawLine();
	},
	Queue:[],
	Pos:0,
	DrawLine:function()
	{
		if(this.Pos==this.Queue.length)
		{
			if(this.onComplete) this.onComplete();
			return;
		}
		new DrawText(this.Queue[this.Pos],this.Container,this.DrawLine.bind(this));
		this.Pos++;
	}
});

var DrawText = new Class({ // Types out a single line of text
	Options:{
		cursor:{ // Data displayed within the cursor while text is being injected
			c:['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','0','1','2','3','4','5','6','7','8','9'],
			pos:0
		},
		content:{ // The content to type
			c:null,
			pos:0
		}
		//onComplete:$empty - Placeholder for an event that may or may not be added via instantiation
	},
	initialize:function(el,container,onComplete)
	{
		this.el = $(el);
		if(!this.el) return;
		
		this.el.inject(container);
		
		this.Options.onComplete = onComplete;
		
		this.el.setStyle('position','relative');
		
		this.Options.content.c = this.el.get('text');
		
		this.el.set('html','');
		
		this.cursor = new Element('div',{
			'class':'AnimationCursor',
			'html':'&nbsp;'
		});
		
		if(!window.Browser.Engine.trident4 && !window.Browser.Engine.trident5) this.Options.isIE=false;
		else this.Options.isIE=true;
		
		// Fancy cursor only works right on good browsers
		if(this.Options.isIE==false)
		{
			this.cursor.inject(this.el);
			this.Callbacks.startCursor.apply(this);
		}
		this.Callbacks.startContent.apply(this);
	},
	Callbacks:
	{
		startCursor:function()
		{
			this.cTimer = setInterval(this.Callbacks.updateCursor.bind(this),20);
		},
		updateCursor:function()
		{
			var cur = this.Options.cursor;
			this.cursor.set('text',cur.c[cur.pos]);
			
			cur.pos++;
			if(cur.pos==cur.c.length) cur.pos=0;
		},
		startContent:function(){ 
			this.tTimer = setInterval(this.Callbacks.updateContent.bind(this),1);
		},
		updateContent:function()
		{
			var cont = this.Options.content;
			if(cont.pos==cont.c.length)
			{
				clearInterval(this.tTimer);
				clearInterval(this.cTimer);
				this.cursor.destroy();
				this.el.set('html','').set('text',cont.c);
				this.Options.onComplete();
				return;
			}
			
			if(this.Options.isIE==false)
			{
				var c = cont.c.charAt(cont.pos);
				if(c=='&') c=='&amp;';
				if(c=='<') c=='&lt;';
				if(c=='>') c=='&gt;';
				if(c==' ') c='&nbsp;';
				
				var t_fx = new Fx.Morph(new Element('span',{
					'html':c
				}).inject(this.cursor,'before'),{
					duration:300
				}).set({'color':'#00ff00'}).start({'color':'#00bb00'});
			}
			else
			{
				var string = cont.c.substring(0,cont.pos);
				string+='▓';
				this.el.set('text',string);
			}
			if(cont.pos==0) new Fx.Scroll(window,{ duration:100 }).toBottom();
			cont.pos++;
		}
	}
});

var Terminal = new Class({ // Base Terminal Class. Provides all major functionality
	Elements:{
		container:null, // Terminal container
		logContainer:null, // Log (executed commands) container
		inputContainer:null, // Text input container
		inputDisplay:null, // Text input display
		inputCursor:null, // Text input cursor
		inputForm:null // Text input form (what actually recieves content and button clicks)
	},
	Data:{
		value:'', // Value of inputForm
		html:'', // HTML'd value of inputForm
		caretPosition:0, // Position of the text input caret within inputForm
		
		commandArchive:[], // Array of archived commands
		commandArchivePosition:0, // Position of archived commands
		commandCurrent:null, // Current Command (before execution)
		commandCurrentSelected:true // Current command is selected
	},
	Options:{
		mouseLogic:{ isClick:false, timer:null } // Data to assist in mouse click logic
	},
	
	initialize:function(container,logContainer) // Terminal constructor initialization (called on instantiation of Terminal class)
	{
		var els = this.Elements; // Initialize all the elements. Log container was created by a previous Init command
		els.container = $(container);
		if(!els.container) return; // If no container exists, exit
		
		els.logContainer = $(logContainer);
		
		els.inputContainer = new Element('div',{
			'class':'TerminalInputContainer'
		}).inject(els.container);
		
		els.inputDisplay = new Element('p',{
			'class':'InputDisplay',
			'html':'&gt;&nbsp;'
		}).inject(els.inputContainer);
		
		els.inputCursor = new TerminalCursor(); // Instantiate TerminalCursor constructor
		els.inputCursor.Inject(els.inputDisplay);
		
		els.inputForm = new Element('input',{
			'type':'text',
			'class':'InputHidden',
			'events':{
				'keypress':this.Callbacks.updateDisplay.bind(this),
				'keyup':this.Callbacks.updateDisplay.bind(this),
				'keydown':this.Callbacks.delayUpdate.bind(this),
				'select':this.Utilities.resetCaret.bind(this),
				'blur': this.Utilities.disableInput.bind(this),
				//els.inputCursor.Callbacks.disable.bind(els.inputCursor),
				'focus':this.Utilities.enableInput.bind(this)
				//els.inputCursor.Callbacks.enable.bind(els.inputCursor)
			}
		}).inject(els.inputContainer);
		
		this.Callbacks.focus.apply(this); // Apply focus to input
		
		if(window.Browser.Engine.trident) // Apply mouse events to document.body for IE
		{
			$(document.body).addEvents({
				'mousedown':this.Callbacks.gMouseDown.bind(this),
				'mousemove':this.Callbacks.gMouseMove.bind(this),
				'click':this.Callbacks.gMouseUp.bind(this)
			});
		}
		else // Apply mouse events to window for standard compliant browsers
		{
			$(window).addEvents({
				'mousedown':this.Callbacks.gMouseDown.bind(this),
				'mousemove':this.Callbacks.gMouseMove.bind(this),
				'click':this.Callbacks.gMouseUp.bind(this)
			});
		}
		
		this.Keyboard = new Keyboard({  // Global keyboard hotkeys
			eventType:'keyup',
			events:{ 
				'enter':this.Callbacks.exec.bind(this),
				'1':this.Callbacks.exec.bind(this), // 1 is being temporarily used because IETester is not triggering the enter event 
				'up':this.Callbacks.cycleCommands.bindWithEvent(this,'up'),
				'down':this.Callbacks.cycleCommands.bindWithEvent(this,'down')
			}
		 }).activate(); // Activate global hotkeys
		
		this.Scroll = new Fx.Scroll($(window),{ duration:500 }); // Create scroll object to be activated as needed
	},
	
	Utilities:
	{
		storeCaret:function() // Cross browser support for logging the position of the caret in the input
		{
			var els = this.Elements;
			var data = this.Data;
			
			// Standard Browsers
			if (!document.selection) data.caretPosition = els.inputForm.selectionStart;
			// IE
			else
			{
				// To get cursor position, get empty selection range
				var sel = document.selection.createRange();
				sel.moveStart ('character', -els.inputForm.value.length);
				data.caretPosition = sel.text.length;
			}
		},
		
		resetCaret:function() // Resets the caret to the end of the line
		{
			var el = this.Elements.inputForm;
			if(!document.selection) el.setSelectionRange(el.value.length,el.value.length);
			else document.selection.clear();
		},
		
		setCaret:function(pos) // Sets the caret to the desired position
		{
			var el = this.Elements.inputForm;
			// Standard Browsers
			if (!document.selection)
			{ 
				el.selectionStart = pos;
				el.selectionEnd = pos;
			}
			// For IE
			else
			{
				var sel = document.selection.createRange();
				sel.moveStart('character', -el.value.length);
				sel.moveStart('character', pos);
				sel.moveEnd('character', 0);
				sel.select();
			}
		},
		
		enableInput:function() // Enables a previously disabled text input
		{
			var els = this.Elements;
			
			els.inputContainer.setStyle('height','auto');
			
			els.inputCursor.Callbacks.enable.apply(els.inputCursor);
			
			els.inputForm.set('disabled',false);
			
			this.Callbacks.focus.apply(this);
			this.Scroll.toBottom();
			
			this.Keyboard.activate();
		},
		
		disableInput:function(noHide) // Disabled terminal text input
		{
			var els = this.Elements;
			
			this.Keyboard.deactivate();
			
			els.inputForm.set('disabled',true);
			
			if(!noHide)els.inputContainer.setStyle('height',0);
			
			els.inputCursor.Callbacks.disable.apply(els.inputCursor);
		},
		
		valueToHTML:function(string) // Properly escapes a string to HTML. This is needed to allow for nonbreaking spaces and breaking spaces at once
		{
			string = string.toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').tidy();
			
			var html_string = '';
			for(var x=0,y=string.length;x<y;x++)
			{
				var str = string.charAt(x);
				
				if(x==0) html_string += str;
				else
				{
					if(string.charAt(x-1)==' ' && str==' ') str = '&nbsp;';
					html_string += str;
				}
			}
			
			return html_string;
		}
	},
	
	Callbacks:
	{
		updateDisplay:function() // Updates the display from the hidden input
		{
			var els = this.Elements;
			var data = this.Data;
			var oldCaret = data.caretPosition;
			this.Utilities.storeCaret.apply(this);
			
			if(els.inputForm.value==data.value && data.caretPosition==oldCaret) return; // Check to see if the value has changed, this will stop some duplicate events
			
			data.value = els.inputForm.value;
			
			els.inputCursor.Callbacks.interrupt.apply(els.inputCursor); // Force the cursor to display green to replicate old school terminals on text entry
			
			var string1 = '';
			
			if(data.caretPosition==els.inputForm.value.length-1) // Cursor is between the last character and second to last character
			{
				string1=this.Utilities.valueToHTML(els.inputForm.value.toString().substring(0,data.caretPosition));
				els.inputCursor.html.set('text',els.inputForm.value.toString().charAt(data.caretPosition));
			}
			else if(data.caretPosition<els.inputForm.value.length-1) // Cursor is between the 2nd to last character and the 1st character
			{
				string1=this.Utilities.valueToHTML(els.inputForm.value.toString().substring(0,data.caretPosition));
				els.inputCursor.html.set('text',els.inputForm.value.toString().charAt(data.caretPosition));
				var string2=this.Utilities.valueToHTML(els.inputForm.value.toString().substring(data.caretPosition+1,els.inputForm.value.length));
			}
			else // Cursor is at the end of the line
			{
				els.inputCursor.html.set('html','');
				string1 = this.Utilities.valueToHTML(els.inputForm.value);
			}
			
			els.inputCursor.html.dispose(); //Remove the cursor from the container so we can properly add the text around it if needed
			if(string2) // A secondary string needs to be appended after the cursor
			{
				data.html = string1+string2;
				els.inputDisplay.set('html','&gt;&nbsp;'+string1).adopt(els.inputCursor.html);
				els.inputDisplay.innerHTML+=string2;
			}
			else // All text comes before the cursor or inside it
			{
				data.html = string1;
				els.inputDisplay.set('html','&gt;&nbsp;'+string1).adopt(els.inputCursor.html);
			}
		},
		
		delayUpdate:function()
		{
			// Timeout is used for more responsive feedback on keydown
			setTimeout(this.Callbacks.updateDisplay.bind(this),1);
		},
		
		exec:function() // Executes a command when the client presses ENTER/RETURN
		{
			var els = this.Elements;
			var data = this.Data;
			if(data.value.trim()=='') return; // No command entered or only space, kill the function
			
			this.Utilities.disableInput.apply(this); // Disable text entry
			
			if(data.commandArchive[data.commandArchive.length-1]!=data.value) // Previous and current command are different, store current command
			{
				data.commandArchivePosition = data.commandArchive.length;
				data.commandArchive[data.commandArchive.length] = data.value;
				data.commandArchivePosition = data.commandArchive.length;
			}
			data.commandArchivePosition = data.commandArchive.length;
			data.commandCurrent = '';
			
			var newLine = new Element('p',{ // Create log container and populate
				'html':'&gt;&nbsp;'+this.Data.html
			}).inject(els.logContainer);
			
			els.inputCursor.html.dispose(); // Remove the cursor before clearing the input display
			els.inputDisplay.set('html','&gt;&nbsp;').adopt(els.inputCursor.html); // Clear input display
			
			var command = els.inputForm.value.clean().split(' '); // Clean large groups of white space and split to an array of commands and options
			
			els.inputForm.set('value',''); // Reset hidden input and associated storage
			this.Data.html='';
			this.Data.value='';
			
			this.Commands.interpret.run([command],this); // Interpret the command
		},
		
		focus:function() // Delays focus to hidden input to account for other events getting in the way
		{
			setTimeout((function(){
				if(this.Elements.inputForm.get('disabled')==false)
				{
					this.Elements.inputForm.focus();
					this.Elements.inputForm.value = this.Elements.inputForm.value;
				}
			}).bind(this),1);
		},
		
		gMouseDown:function(e) // Initiate logic to determine whether to focus on the hidden input or allow text selection
		{
			if(e.event.button==0 || e.event.button==1)
			{
				this.Options.mouseLogic.isClick = true;
				clearTimeout(this.Options.mouseLogic.timer);
				this.Options.mouseLogic.timer = setTimeout(this.Callbacks.gMouseMove.bind(this),300);
			}
			if(e.event.detail && e.event.detail==2) this.Callbacks.gMouseMove.apply(this); // Cancels a double click on standards compliant browsers
		},
		gMouseMove:function() // Mouse moved, so cancel input
		{
			if(this.Options.mouseLogic.isClick = true)
			{
				clearTimeout(this.Options.mouseLogic.timer);
				this.Options.mouseLogic.isClick = false;
			}
		},
		gMouseUp:function(e) // Analyze mouse results to determine what to do
		{
			clearTimeout(this.Options.mouseLogic.timer);
			if(this.Options.mouseLogic.isClick==true) this.Utilities.enableInput.apply(this,[true]);//, //this.Callbacks.focus.apply(this);
			this.Options.mouseLogic.isClick=false;
		},
		
		cycleCommands:function(e,dir) // Cycles previous commands that the user has entered, if any
		{
			if(e) e.preventDefault(); // This is used to stop the cursor from jumping around the input when up and down are used
			var data = this.Data;
			var els = this.Elements;
			var pos = data.commandArchivePosition;
			if(data.commandArchive.length==0) return; // If there are no stored commands, exit out
			
			if(data.commandCurrentSelected==true) // If we are on the currently entered command, store it before proceeding
			{
				data.commandCurrent = els.inputForm.value;
				data.commandCurrentSelected=false;
			}
			
			if(dir=='down')
			{
				pos++;
				if(pos>=data.commandArchive.length) pos=null; // We have cycled back to the currently selected command
			}
			if(dir=='up')
			{
				pos--;
				if(pos<0) return; // We have reached the end of the archive, do not loop
			}
			
			if(pos==null) // Populate with the stored current command
			{
				els.inputForm.value = data.commandCurrent;
				data.commandCurrentSelected=true;
				data.commandArchivePosition = data.commandArchive.length;
			}
			else // Otherwise just display the archived command
			{
				data.commandArchivePosition = pos;
				els.inputForm.value = data.commandArchive[pos];
			}
			
			this.Utilities.setCaret.run(els.inputForm.value.length,this);
			this.Callbacks.updateDisplay.apply(this);
		}
	},
	// All possible commands
	Commands:
	{
		interpret:function(command)
		{
			var coms = this.Commands;
			var els = this.Elements;
			
			var com = command[0].toLowerCase();
			
			if(coms[com]) coms[com].run([command],this);
			else coms.error.run([command],this);
			
		},
		'clear':function(command)
		{
			this.Elements.logContainer.set('html','');
			this.Elements.logContainer.setStyle('display','none');
			
			// Enable text input
			this.Utilities.enableInput.apply(this);
		},
		'help':function(command){
			var HelpText = [];
			if(command.length==1)
			{
				HelpText[0] = 'The following commands are available:';
				HelpText[1] = ' ';
				HelpText[2] = 'TEST';
				HelpText[3] = 'CLEAR';
				HelpText[4] = 'HEHE';
				HelpText[5] = 'REFRESH';
				HelpText[6] = ' ';
				HelpText[7] = 'You can also type HELP [command] to find out more about that command';
				
				this.AddLog.run([HelpText],this);
				return;
			}
			
			command[1] = command[1].toLowerCase();
			HelpText[0] = 'About ';
 			if(command[1]=='clear')
			{
				HelpText[0] += 'Clear:';
				HelpText[1] = 'Removes all text from the log, in case you are feeling cluttered.';
			}
			else if(command[1]=='hehe')
			{
				HelpText[0] += 'Hehe:';
				HelpText[1] = 'Please do not make fun of this incredibly awesome terminal.';
			}
			else if(command[1]=='help')
			{
				HelpText[0] = 'Don\'t try to help the help dude.';
			}
			else HelpText[0] = '\''+command[1]+'\' has no documentation. Please try again.';
			
			this.AddLog.run([HelpText],this);
		},
		'error':function(command){
			this.AddLog.run([['Not sure what to do with \''+command[0]+'\', please type HELP for more info']],this);
		},
		'hehe':function(){
			this.AddLog.run([['don\'t laugh at me...']],this);
		},
		'test':function(){
			this.AddLog.run([['testing, testing, one, two, three']],this);
		},
		'refresh':function() // Refresh the page
		{
			this.AddLog.run([['Refreshing page in: 3'],true],this);
			
			var two = function(){ this.Elements.logContainer.getLast('p').innerHTML='Refreshing page in: 2'; };
			var one = function(){ this.Elements.logContainer.getLast('p').innerHTML='Refreshing page in: 1'; };
			
			setTimeout(two.bind(this),1000);
			setTimeout(one.bind(this),2000);
			setTimeout(function(){ location.reload(true); },3000);
		}
	},
	
	AddLog:function(strings,bool)
	{
		var els = [];
		for(var x=0,y=strings.length;x<y;x++)
		{
			els[x] = new Element('p',{ text:strings[x] });
		}
		
		if(!bool) new DrawMultiLineText(els,this.Elements.logContainer,this.Utilities.enableInput.bind(this));
		else new DrawMultiLineText(els,this.Elements.logContainer,$empty);
		
		// For IE only
		if(this.Elements.logContainer.getStyle('display')=='none') this.Elements.logContainer.setStyle('display','block');
	}
});

var TerminalCursor = new Class({ // The blinking cursor
	Disabled:false,
	
	initialize:function(container)
	{
		this.html = new Element('span',{ 'class':'TerminalCursor' });
		this.Timer = setInterval(this.Callbacks.blink.bind(this),600);
	},
	Callbacks:{
		blink:function()
		{
			var blinkStatus = this.html.hasClass('blink');
			if(blinkStatus==false && this.Disabled!=true) this.html.addClass('blink');
			else this.html.removeClass('blink');
		},
		interrupt:function()
		{
			clearInterval(this.Timer);
			var blinkStatus = this.html.hasClass('blink');
			if(blinkStatus==false && this.Disabled==false) this.html.addClass('blink');
			if(blinkStatus==true && this.Disabled==true) this.html.removeClass('blink');
			this.Timer = setInterval(this.Callbacks.blink.bind(this),600);
		},
		disable:function()
		{
			this.Disabled = true;
			this.Callbacks.interrupt.apply(this);
		},
		enable:function()
		{
			this.Disabled = false;
			this.Callbacks.interrupt.apply(this);
		}
	},
	Inject:function(container){ this.html.inject(container); }
});