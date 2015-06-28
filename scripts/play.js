(function(){
	var MAX_ROUNDS = 10;

	var invest_status = {
		rounds: 1,
		gallon: 0,

		investMoney: 0,
		profit: 0,
		leftMoney: 100000,
		marketValue: 0,
		profit: 0,
		profitPercent: 0,
		leverMoney: 0,
		base : 100000 //$ original 
	};
	
	var level = 0;
	var stateCode = {
		fail: 0,
		ok: 1,
		good: 2
	};

	var len=35;
	var originalArray=[];//原数组
	for (var i=0;i<len;i++)
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
				var option = $(this).val();
				var options = [0.25, 0.5, 0.75, 1, -0.25, -0.5, -0.75, -1, 0]; //TODO: can use data attr
				invest_status.gallon = options[option - 1];

				//$("#invest-money").html(investMoney);
				//$("#left-money").html(invest_status.leftMoney);
			});
			
		}


		var startNewRounds = function() {
			//loading animation
			investMoney = invest_status.base;
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

		var showSummary = function(state) {
			$invest.hide();
			$result.hide();
			var $summaryInfo = $("#summary-info");
			switch(state) {
				case stateCode.fail:
					$summaryInfo.html("本想迈上人生巅峰，结果登上天台。跳下去才发现，楼下已经堆满了人如果当初不轻信消息，不上杠杆，也许还有机会");
					break;
				case stateCode.ok:
					$summaryInfo.html("经过这一个月洗礼含笑迈上人生巅峰");
					break;
				case stateCode.good:
					$summaryInfo.html("经过这一个月洗礼悲喜交加，人生疯癫");
					break;
			}
	  		$summary.show();
	  		playSumMoneyAnimation();

	  		$("#name-confirm-btn").click(function() {
	  			var name = $("#name-txt").val();
	  			location.href = "result.html?u="+encodeURIComponent(name)+"&b="+invest_status.base+"&r="+invest_status.rounds;
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
			var state = -1;
			$invest.fadeOut();
			//real logic & do caculation
			calc();
			contentRefresh($result, resultTemplate, invest_status);

			if(invest_status.base <= 0) {
				state = stateCode.fail;
				$("#next-confirm-btn").val("保证金不足，被强制平仓，点击继续");
			}

		  	if(invest_status.rounds >= MAX_ROUNDS) {
		  		if(invest_status.profitPercent > 1) {
		  			state = stateCode.good;
		  			$("#next-confirm-btn").val("经过这一个月洗礼含笑迈上人生巅峰，查看结果");
		  		}
		  		else {
		  			state = stateCode.ok;
		  			$("#next-confirm-btn").val("悲喜交加，人生疯癫，查看结果");
		  		}
		  	}

		  	$result.fadeIn(function() {
		  		//play animations
		  		playStockAnimation();
		  		//progress bar animation
		  		//showProgressBar();
		  		$("#next-confirm-btn").click(function(){
		  			if(state >= 0) {
		  				showSummary(state);
		  			} else {
				  		++invest_status.rounds;
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
