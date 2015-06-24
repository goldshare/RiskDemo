(function(){
	var MAX_ROUNDS = 4;

	var invest_status = { 
		BASE_MONEY : 100000, //$ original 
		ROUNDS: 1
	};
	
	var investMoney=invest_status.BASE_MONEY;
	var leftMoney=0;
	var level=0;

	var originalArray=[];//原数组
	for (var i=0;i<MAX_ROUNDS;i++)
	{ 
		originalArray[i]= i; 
	} 

	var sumArray=[];  //统计每天盈亏情况

	$(document).ready(function() {
		//get compiled template function
		var $invest = $("#invest"),
			$result = $('#result'),
			$summary = $("#summary");

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
		var _getDailyInfo = function(callback) {
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

		var getDailyInfo = function(callback){
			var day = getRandom();
			//console.log(data[day]);
			dailyInfo = $.extend({}, data[day], invest_status);
			callback();
		}

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
				investMoney = Math.round(investMoney*100)/100;
				$("#invest-money").html(investMoney);
				leftMoney = invest_status.BASE_MONEY - investMoney;
				$("#left-money").html(leftMoney);
			});
			
		}


		var startNewRounds = function() {
			//loading animation
			investMoney = invest_status.BASE_MONEY;
			leftMoney = 0;
			//level = 0;
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
		            text: '宇宙科技股份有限公司当天走势',
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
		            enabled: false,
		            borderWidth: 0
		        },
		        series: [{
		            name: '实时股价',
		            data: getStockPoint(dailyInfo.odds)
		        }],
		        credits: {
     				enabled: false
				},
		    });
		};

		var playSumMoneyAnimation = function() {
			var numArray=[];
			for(var i=0;i < sumArray.length;i++){
				var numStr = "第"+(i+1)+"天";
				numArray.push(numStr)
			}
			$('#summary-container').highcharts({
		        title: {
		            text: '我的盈亏',
		            x: -20 //center
		        },
		        xAxis: {
		            categories: numArray
		        },
		        yAxis: {
		            title: {
		                text: '盈亏额'
		            },
		            plotLines: [{
		                value: 0,
		                width: 1,
		                color: '#808080'
		            }]
		        },
		        legend: {
		            layout: 'vertical',
		            align: 'right',
		            verticalAlign: 'middle',
		            enabled: false,
		            borderWidth: 0
		        },
		        series: [{
		            name: '金额',
		            data: sumArray
		        }],
		        credits: {
     				enabled: false
				},
		    });
		};

		/*var showProgressBar = function() {
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
		}*/

		var getResultJson = function(profit) {
				return $.extend(invest_status, {
					investMoney: investMoney,
					level: level,
					profit: profit
				});
		};

		var showSummary = function() {
			$invest.hide();
			$result.hide();
	  		$summary.show();
	  		playSumMoneyAnimation();

	  		$("#name-confirm-btn").click(function() {
	  			var name = $("#name-txt").val();
	  			location.href = "result.html?u="+name+"&b="+invest_status.BASE_MONEY+"&r="+invest_status.ROUNDS;
	  		});
		};

		var gameStart = function() {
			$invest.hide();
			$result.hide();
			$summary.hide();

			$("#lever-confirm-btn").click(function(){
				level = $('input[name="lever-options"]:checked').val();
				$("#lever").hide();
				startNewRounds();
			});
		};

		var showInvestResult = function() {
			$invest.fadeOut();
			var result = calc(investMoney,leftMoney,level,dailyInfo.odds);
			var profit = result - invest_status.BASE_MONEY;
			profit = Math.round(profit*100)/100;
			sumArray.push(profit);
			invest_status.BASE_MONEY = result;

			contentRefresh($result, resultTemplate, getResultJson(profit));

		  	$result.fadeIn(function() {
		  		//play animations
		  		playStockAnimation();
		  		//progress bar animation
		  		//showProgressBar();
		  		$("#next-confirm-btn").click(function(){
		  			//real logic & do caculation
				  	if(invest_status.ROUNDS >= MAX_ROUNDS){
				  		//input your name
				  		showSummary();
				  	}
				  	else {
				  		++invest_status.ROUNDS;
						startNewRounds();
				  	}
		  		});
		  	});
		};
		//do animation
		//deal with lever
		gameStart();
		
		
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
		leftInvestMoney = Math.round(leftInvestMoney*100)/100;
		return leftInvestMoney;
	}

	/*getRandom:获取不重复的随机值
	 *返回值范围：0-（MAX_ROUNDS-1）
	 */
	var getRandom = function(){
		//给原数组originalArray赋值 
		var index=Math.floor(Math.random()*originalArray.length); //随机取一个位置 
		var value = originalArray[parseInt(index)];
		originalArray.splice(index,1);
		return value;
	}

    /*getStockPoint:获取股票振幅
     *odds：当天幅度
	 *返回值范围：-10,10 
	 *10个数数组
	 */
	var getStockPoint = function(odds){
		var resultArray=[];
		var n = 10;
		var high = 10;
		var lower = -10;
		for (var i=0;i<n-1;i++)
		{ 
			var value=Math.round((Math.random()*((high - lower +1) + lower))*100)/100;  
			resultArray[i]= value; 
		} 
		resultArray[n-1]= odds;
		return resultArray;
	}

})();
