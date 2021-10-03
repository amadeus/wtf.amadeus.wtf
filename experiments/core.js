var scroller =
{
	scrollMax:300,
	timeOut:200,
	
	name:null,
	nameI:[110,470],
	
	fore:null,
	foreI:[-10,280],
	
	back:null,
	backI:[0,240],
	
	stripe:null,
	stripeI:[0,350],
	
	maxed: false,
	
	init: function()
	{
		var th = scroller;
		
		th.name = $('amadeus');
		th.fore = $('city_fore');
		th.back = $('city_back');
		th.stripe = $('stripe');
		th.header = $('header');
		
		th.fx = new Fx.Elements([th.name,th.fore,th.back,th.stripe],{
			duration:200,
			fps:1000,
			link:'ignore',
			transition:'sine:out',
			onComplete: function()
			{
				scroller.fx.options.link = 'cancel';
			}
		});
		
		th.fx.set({
			0:{top:600},
			1:{top:357},
			2:{top:350},
			3:{top:350}
		});

		th.execScroll();
		
		window.addEvent('scroll',scroller.execScroll);
	},
	
	execScroll: function()
	{
		var th = scroller;
		
		var yScroll = window.getScroll().y;
		if(yScroll<th.scrollMax)
		{
			th.maxed = false;
			var tPerc = (yScroll/th.scrollMax).round(2);
			
			var namePos = ((th.nameI[0]-th.nameI[1])*tPerc+th.nameI[1]).round();
			var forePos = ((th.foreI[0]-th.foreI[1])*tPerc+th.foreI[1]).round();
			var backPos = ((th.backI[0]-th.backI[1])*tPerc+th.backI[1]).round();
			var stripePos = ((th.stripeI[0]-th.stripeI[1])*tPerc+th.stripeI[1]).round();
			
			th.fx.start({
				0:{top:namePos},
				1:{top:forePos},
				2:{top:backPos},
				3:{top:stripePos}
			});
		}
		if(yScroll>=th.scrollMax && th.maxed==false)
		{
			th.maxed = true;
			th.fx.start({
				0:{top:th.nameI[0]},
				1:{top:th.foreI[0]},
				2:{top:th.backI[0]},
				3:{top:th.stripeI[0]}
			});
		}
	}
};
window.addEvent('domready',scroller.init);