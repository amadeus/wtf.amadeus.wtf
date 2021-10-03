window.addEvent('domready',function(){
	window.$$$ = new TextShadowTest();
	new PageResize();
	new LinkNav();
});

var LinkNav = new Class({
	initialize:function(){
		this.body = $(document.body);

		this.scroll = new Fx.Scroll(this.body,{
			duration:2500,
			transition:'cubic:in:out'
		});

		this.scrollTo = this.scrollTo.bindWithEvent(this);
		this.returnHome = this.returnHome.bindWithEvent(this);

		this.links = $$('.Template.home p a').addEvent('click',this.scrollTo);
		
		$$('.Template').each(function(el){
			if(el.id=='home') return;
			el.addEventListener('touchstart',this.returnHome,false);
		},this);
	},

	scrollTo:function(e){
		if(e && e.stop) e.stop();
		var id = e.target.href.split('#')[1];

		this.scroll.toElement($(id));
	},
	
	returnHome:function(e){
		if(e && e.stop) e.stop();
		this.scroll.start(0,0);
	}
});

var PageResize = new Class({
	initialize:function(){
		this.window = $(window);
		this.body = $(document.body);

		this.els = $$('.Template');

		this.setSize = this.setSize.bind(this);
		this.clean = this.clean.bind(this);

		this.window.addEvent('resize',this.setSize);

		this.setSize();
	},

	setSize:function(){
		this.coords = this.window.getSize();

		this.els.setStyle('width',this.coords.x);

		this.body.setStyle('width',this.coords.x*this.els.length);
	},

	clean:function(){
		this.window.removeEvent('resize',this.setSize);
	}
});

var TextShadowTest = new Class({
	Implements:Options,

	options:{
		multiplier:.04,
		modifier:8,
		centerX:0,
		centerY:0,
		pageX:0,
		pageY:0,
		mode:'desktop'
	},

	messages:[
		'welcome<br />to',
		'the<br />coolest',
		'most<br />awesome',
		'site<br />ever',
		'amadeus<br />amadeus'
	],

	contentCounter:0,

	initialize:function(){
		
		this.container = $('home');
		
		this.el = $$('h1')[0];

		this.window = $(window);

		this.setDesktop = this.setDesktop.bind(this);
		this.setCenter = this.setCenter.bind(this);
		this.cycleContent = this.cycleContent.bind(this);

		this.setCenter();

		this.window.addEvent('resize',this.setCenter);

		this.cycleContent();
		
		if(window.Browser.Platform.ipod)
			this.setupTouch();
		else
			this.setupDesktop();
	},

	setupTouch:function(){
		this.options.multiplier = .06;
		this.options.mode = 'touch';

		this.addExtras(true);

		this.container.addEventListener('touchmove',this.animateTextShadow.bindWithEvent(this),false);
		//document.body.addEventListener('touchstart',function(e){ e.preventDefault(); },false);
	},

	addExtras:function(){
		this.options.colors = this.el.getStyle('text-shadow').match(/(#[abcdef0-9]{3,6}|rgb[a-zA-Z0-9\.\(\s,]{0,200}\))/g);

		if(this.options.colors.length===0) return;

		this.el.setStyles({
			'text-shadow':'none',
			zIndex:this.options.colors.length
		});

		this.textColors = [];
		var lastEl = this.el;
		var maxZIndex = this.options.colors.length-1;

		this.options.colors.each(function(color,index){
			var i = this.textColors.length;
			this.textColors[i] = this.el
				.clone(true)
				.setStyles({
					color:this.options.colors[index],
					zIndex:maxZIndex-index,
					opacity:0,
					visibility:'visible'
				})
				.addClass('animator')
				.inject(lastEl,'after');
			lastEl = this.textColors[i];
		},this);

		this.textColors = $$(this.textColors);

		this.animateTextShadow.simpleDelay(500,this,{
			page:{
				x:this.options.centerX-100,
				y:this.options.centerY+100
			}
		});
	},

	setupDesktop:function(){
		this.window.addEvent('mousemove',this.animateTextShadow.bindWithEvent(this));
	},

	cycleContent:function(){
		if(this.contentCounter>=this.messages.length) return;
		
		this.el.set('html',this.messages[this.contentCounter]);

		if(this.options.mode=='touch')
			this.textColors.set('html',this.messages[this.contentCounter]);

		this.contentCounter++;

		this.cycleContent.simpleDelay(2000);
	},

	animateTextShadow:function(e){
		if(e && e.preventDefault) e.preventDefault();

		if(e.targetTouches && e.targetTouches[0]){
			this.options.pageX = e.targetTouches[0].pageX;
			this.options.pageY = e.targetTouches[0].pageY;
		}
		else{
			this.options.pageX = e.page.x;
			this.options.pageY = e.page.y;
		}

		var x = this.options.pageX-this.options.centerX;
		var y = this.options.pageY-this.options.centerY;
		var multiplier = this.options.multiplier;

		if(this.options.mode=='desktop')
			this.setDesktop(x,y,multiplier);
		if(this.options.mode=='touch')
			this.setTouch(x,y,multiplier);
	},

	setTouch:function(x,y,multiplier){
		this.textColors.each(function(el,index){
			var _x = -(multiplier*index+x*(multiplier*(index+1))).round();
			var _y = -(multiplier*index+y*(multiplier*(index+1))).round();

			el.style.webkitTransform = 'translate('+_x+'px,'+_y+'px)';
			el.style.opacity = 1;
		},this);
	},

	setDesktop:function(x,y,multiplier){
		this.el.setStyle('text-shadow',
			-(multiplier*0+x*(multiplier*1))+'px '+-(multiplier*0+y*(multiplier*1))+'px 0 #f51382,'+
			-(multiplier*1+x*(multiplier*2))+'px '+-(multiplier*1+y*(multiplier*2))+'px 0 #fffb00,'+
			-(multiplier*2+x*(multiplier*3))+'px '+-(multiplier*2+y*(multiplier*3))+'px 0 #4af8dc,'+
			-(multiplier*3+x*(multiplier*4))+'px '+-(multiplier*3+y*(multiplier*4))+'px 0 #ffffff');
			//'0 0 50px rgba(255,255,255,1)');
	},

	setCenter:function(){
		this.options.centerX = (this.window.getSize().x/2).round();
		this.options.centerY = (this.window.getSize().y/2).round();
	}
});