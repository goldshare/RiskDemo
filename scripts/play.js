(function(){

	
	$('.btn-loading-example').click(function () {
		var $btn = $(this)
		$btn.button('loading');
		setTimeout(function(){
		  $btn.button('reset');
		}, 5000);
	});

})();