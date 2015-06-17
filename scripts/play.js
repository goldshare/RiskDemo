(function(){
	var MAX_ROUNDS = 20;

	var invest_status = { 
		BASE_MONEY : 10000, //$ original 
		ROUNDS: 1
	};
	
	$(document).ready(function(){
		//get compiled template function
		var $invest = $("#invest"),
			$result = $('#result');

		var investTemplate = Handlebars.compile($invest.html());
		var resultTemplate = Handlebars.compile($result.html());
		//firstly loads daily info into 
		var getDailyInfo = function() {
			var json = {};

			return $.extend({}, json, invest_status);
		};

		//deal with every turn
		var contentRefresh = function($container, template, json) {
			var content = template(json);
			$container.html(content);
		}


		var startNewRounds = function() {
			$result.hide();
			var json = getDailyInfo();
			contentRefresh($invest, investTemplate, json);
			$invest.show();
		};
		
		

		var showInvestResult = function() {
			$invest.hide();
			contentRefresh($result, resultTemplate, json);
		  	$result.show();

		  	//play animations

		  	//real logic
		  	++invest_status.ROUNDS;
		  	if(invest_status.ROUNDS >= MAX_ROUNDS)
		  		location.ref = ""; //redirect
		  	else
				startNewRounds();
		};

		startNewRounds();
		

		$('#invest-confirm-btn').click(function () {
			var $btn = $(this)
		  	$btn.button('reset');

		  	showInvestResult();
		});
		
	});
	
	

})();