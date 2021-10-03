require.config({

	baseUrl: '/phaser-filter-bug-demo/src/',

	paths: {
		'phaser': 'libs/phaser'
	},

	shim: {
		'phaser': {
			exports: 'Phaser'
		}
	}
});

require([
	'Scene'
],
function(
	Scene
){

new Scene(268, 152);

});
