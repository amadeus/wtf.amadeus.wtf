var L337 = new Class({
	Binds:['checkKeys','enable','disable','win'],
	options:{
		enabled:'Lbh unir ranoyrq Vasvavgr Fpebyy\056 Erserfu gb frr gur punatrf gnxr rssrpg\056 Gb qvfnoyr Vasvavgr Fpebyy, fvzcyl ragre gur Xbanzv pbqr ntnva, be pyrne lbhe oebjfre pnpur\056',
		disabled:'Lbh unir qvfnoyrq Vasvavgr Fpebyy\056 Erserfu gb frr gur punatrf gnxr rssrpg\056',
		cookieName:'vasvavgrFpebyy',
		sequence:'hcfhcfqbjafqbjafyrsgfevtugfyrsgfevtugfofn',
		progress:0
	},
	initialize:function(disable)
	{
		this.window = $(window);
		this.options.sequence = this.options.sequence.replace(/[a-zA-Z]/g, function(c){return String.fromCharCode((c<="Z"?90:122)>=(c=c.charCodeAt(0)+13)?c:c-26);}).split('s');
		this.options.enabled = this.options.enabled.replace(/[a-zA-Z]/g, function(c){return String.fromCharCode((c<="Z"?90:122)>=(c=c.charCodeAt(0)+13)?c:c-26);});
		this.options.disabled = this.options.disabled.replace(/[a-zA-Z]/g, function(c){return String.fromCharCode((c<="Z"?90:122)>=(c=c.charCodeAt(0)+13)?c:c-26);});
		this.options.cookieName = this.options.cookieName.replace(/[a-zA-Z]/g, function(c){return String.fromCharCode((c<="Z"?90:122)>=(c=c.charCodeAt(0)+13)?c:c-26);});
		if(!disable) this.enable();
	},
	
	checkKeys:function(e)
	{
		if(!e || (e && !e.key)) return;
		var opts = this.options;
		
		(e.key==opts.sequence[opts.progress]) ? opts.progress++ : opts.progress=0;
		
		if(opts.progress==opts.sequence.length)
		{
			opts.progress=0;
			this.win();
		}
	},
	
	enable:function()
	{
		this.options.progress = 0;
		this.window.addEvent('keyup',this.checkKeys);
	},
	
	disable:function()
	{
		this.window.removeEvent('keyup',this.checkKeys);
		this.options.progress = 0;
	},
	
	win:function()
	{
		var cookieValue = Cookie.read(this.options.cookieName);
		if(cookieValue===null || cookieValue==='no')
		{
			Cookie.write(this.options.cookieName,'yes',{ duration:365 });
			alert(this.options.enabled);
		}
		else
		{
			Cookie.dispose(this.options.cookieName);
			alert(this.options.disabled);
		}
	}
});