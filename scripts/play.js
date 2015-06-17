(function(){
	var MAX_ROUNDS = 20;

	var invest_status = { 
		BASE_MONEY : 10000, //$ original 
		ROUNDS: 1
	};
	
	$(document).ready(function() {
		//get compiled template function
		var $invest = $("#invest"),
			$result = $('#result');

		var dailyInfo = {};

		var investTemplate = Handlebars.compile($invest.html());
		var resultTemplate = Handlebars.compile($result.html());
		//firstly loads daily info into 
		var getDailyInfo = function(callback) {
			var jqxhr = $.getJSON( "example.json")
			.success(function(data) {
			  	// console.log( "success" );
			  	dailyInfo = $.extend({}, data, invest_status);
			})
			.fail(function() {
				// console.log( "error" );
				dailyInfo = $.extend({}, invest_status);
			});

			jqxhr.complete(callback);
		};

		//deal with every turn
		var contentRefresh = function($container, template, json) {
			var content = template(json);
			$container.html(content);
		}

		var bindEvent = function() {
			$('#invest-confirm-btn').click(function () {
		  		showInvestResult();
			});

			$('[name="base-options"]').on("change", function() {
				$("#invest-money").html(invest_status.BASE_MONEY * $(this).val() / 3);
			});

			$('[name="lever-options"]').on("change", function() {
				console.log($(this).val());
			});
		}


		var startNewRounds = function() {
			//loading animation

			//get info
			getDailyInfo(function() {
				contentRefresh($invest, investTemplate, dailyInfo);
				$result.hide();
				$invest.show();
				bindEvent();
			});
		};
		
		

		var showInvestResult = function() {
			$invest.fadeOut();
			//contentRefresh($result, resultTemplate, json);
		  	$result.fadeIn(function() {
		  		//play animations

		  		//progress bar animation
		  		var $progressBar = $('#result-progress-bar');
			    var current_perc = 0;
			    var deferred = $.Deferred();
				var promise = deferred.promise();

				var timer = setInterval( function () {
				    if (current_perc > 100) {
		                deferred.resolve();
		            } else {
		                current_perc += 1;
		                $progressBar.css('width', (current_perc)+'%');
		            }

		            $progressBar.text((current_perc)+'%');
				}, 50);

				promise.done(function () {
				    clearInterval( timer );
				    //real logic & do caculation
				  	++invest_status.ROUNDS;
				  	if(invest_status.ROUNDS >= MAX_ROUNDS){
				  		location.ref = ""; //redirect
				  	}
				  	else {
				  		$progressBar.css('width', '0%');
						startNewRounds();
				  	}
				});
		  		
		  	});
		};
		//do animation
		startNewRounds();
		
	});
	
	

})();