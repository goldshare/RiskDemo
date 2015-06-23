(function(){
	var MAX_ROUNDS = 20;

	var invest_status = { 
		BASE_MONEY : 10000, //$ original 
		ROUNDS: 1
	};
	
	var investMoney;
	var leftMoney;
	var level;
	var odds = 10;

	$(document).ready(function() {
		//get compiled template function
		var $invest = $("#invest"),
			$result = $('#result');

		var dailyInfo = {};

		var investTemplate = Handlebars.compile($invest.html());
		var resultTemplate = Handlebars.compile($result.html());
		//register a Helper function to judge
	     Handlebars.registerHelper("compare",function(v1,v2,options){
	       if(v1>v2){
	         return options.fn(this);
	       }else{
	         //{{else}}
	         return options.inverse(this);
	       }
	     });
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
				investMoney = invest_status.BASE_MONEY * $(this).val() / 3;
				$("#invest-money").html(investMoney);
				leftMoney = invest_status.BASE_MONEY - investMoney;
				$("#left-money").html(leftMoney);
			});

			$('[name="lever-options"]').on("change", function() {
				//console.log($(this).val());
				level = $(this).val();
			});
			
		}


		var startNewRounds = function() {
			//loading animation
			investMoney = invest_status.BASE_MONEY;
			leftMoney = 0;
			level = 0;
			var callback = function() {
				
			}
			//get info
			getDailyInfo(function() {
				contentRefresh($invest, investTemplate, dailyInfo);
				$result.hide();
				$invest.show();
				bindEvent();
			});
			
		};
		
		var playStockAnimation = function() {
			$('#container').highcharts({
		        title: {
		            text: '宇宙科技股份有限公司股价变化图',
		            x: -20 //center
		        },
		        subtitle: {
		            text: '来源：风险小组模拟盘',
		            x: -20
		        },
		        xAxis: {
		            categories: ['9:30', '10:00', '10:30', '11:00', '11:30', '13:00',
		                '13:30', '14:00', '14:30', '15:00']
		        },
		        yAxis: {
		            title: {
		                text: '涨跌幅(%)'
		            },
		            plotLines: [{
		                value: 0,
		                width: 1,
		                color: '#808080'
		            }]
		        },
		        tooltip: {
		            valueSuffix: '%'
		        },
		        legend: {
		            layout: 'vertical',
		            align: 'right',
		            verticalAlign: 'middle',
		            borderWidth: 0
		        },
		        series: [{
		            name: '实时股价',
		            data: [-1, -2, 0, -2, 1, 3, 5, 6, 10, 10]
		        }]
		    });
		};

		var showProgressBar = function() {
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
		}

		var getResultJson = function(profit) {
				return {
					BASE_MONEY: invest_status.BASE_MONEY,
					investMoney: investMoney,
					level: level,
					profit: profit
				};
		};

		var showInvestResult = function() {
			$invest.fadeOut();
			var result = calc(investMoney,leftMoney,level,odds),
				profit = result - invest_status.BASE_MONEY;
			invest_status.BASE_MONEY = result;

			contentRefresh($result, resultTemplate, getResultJson(profit));

		  	$result.fadeIn(function() {
		  		//play animations
		  		playStockAnimation();
		  		//progress bar animation
		  		//showProgressBar();
		  		$("#next-confirm-btn").click(function(){
		  			//real logic & do caculation
				  	++invest_status.ROUNDS;
				  	if(invest_status.ROUNDS >= MAX_ROUNDS){
				  		location.ref = ""; //redirect
				  	}
				  	else {
						startNewRounds();
				  	}
		  		});
		  	});
		};
		//do animation
		startNewRounds();
		
	});
	
	/*calc:计算盈利
	 *investMoney:投入金额
	 *leftMoney:剩余金额
	 *level:杠杆倍数
	 *odds:涨跌幅(如2.5、-3.5)
	 */
	var calc = function(investMoney,leftMoney,level,odds)
	{
		var principal = investMoney;          //本金
		var levelMoney = principal*level;     //杠杆金额 
		var interestRate = 0.0015 + 0.003*2;  //每天利息利率
		var interestMoney = levelMoney*interestRate; //利息
		var earnMoney = (principal + levelMoney)*odds/100;
		var leftInvestMoney = principal + earnMoney - interestMoney + leftMoney;
		return leftInvestMoney;
	}

})();
