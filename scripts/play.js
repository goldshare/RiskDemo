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

	var sumArray=[];       //统计每天盈亏情况
	var levelSumArray=[];  //统计每天加杠杆盈亏情况

	var stockArray=[];  //每天的股票涨跌幅

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
			
			//get info
			getDailyInfo(function() {
				stockArray = getStockPoint(dailyInfo.odds);
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
		            data: stockArray
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
				numArray.push(numStr);
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
		            //layout: 'vertical',
		            align: 'center', //水平方向位置
                    verticalAlign: 'bottom', //垂直方向位置
		            enabled: true,
		            borderWidth: 0
		        },
		        series: [{
		            name: '金额',
		            data: sumArray
		        },{
		            name: '金额2',
		            data: levelSumArray
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
					$summaryInfo.html("本想迈上人生巅峰，结果登上天台。跳下去才发现，楼下已经堆满了人。如果当初不轻信消息，不上杠杆，也许还有机会");
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
		  		if(invest_status.base > 10000) {
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
	

	/*---------------------------计算相关的方法---------------------------------*/
	var calc = function(){
		if(invest_status.gallon > 0){        //加仓
			var money = invest_status.leftMoney * invest_status.gallon; //加仓金额
			var levelMoney = money * level;  //杠杆金额
			invest_status.investMoney += money;
			invest_status.leftMoney -= money;
			invest_status.levelMoney += levelMoney;
			var bStock = stockArray[0];  //开盘价
			var eStock = stockArray[9];  //收盘价
			//计算今天的利润
			var todayProfit = (money + levelMoney)*(eStock - bStock - 0.2)/100;
			todayProfit = Math.round(todayProfit*100)/100;
			var holdProfit = invest_status.marketValue *(eStock - 0.2)/100;
			holdProfit = Math.round(holdProfit*100)/100;
			var profit = todayProfit + holdProfit;
			invest_status.profit += profit;
			invest_status.marketValue += profit + money + levelMoney;
			var profitPercent = invest_status.profit/invest_status.investMoney;
			profitPercent = Math.round(profitPercent*1000)/1000;
			invest_status.profitPercent = profitPercent * 100;
			invest_status.base = invest_status.marketValue + invest_status.leftMoney - invest_status.levelMoney;
		}else if(invest_status.gallon <= 0){  //减仓或不变
			var gallon = invest_status.gallon * (-1);
			var money = invest_status.marketValue * gallon; //减仓金额
			//invest_status.marketValue -= money; 
			//invest_status.leftMoney += money;
			var todayProfit = money * (bStock - 0.2)/100; 
			todayProfit = Math.round(todayProfit*100)/100;
			var holdProfit = (invest_status.marketValue - money) *(eStock - 0.2)/100;
			holdProfit = Math.round(holdProfit*100)/100;
			var profit = todayProfit + holdProfit;
			invest_status.profit += profit;
			invest_status.marketValue = invest_status.marketValue - money + profit;
			invest_status.leftMoney += money + todayProfit;
			var profitPercent = invest_status.profit/invest_status.investMoney;
			profitPercent = Math.round(profitPercent*1000)/1000;
			invest_status.profitPercent = profitPercent * 100;
			invest_status.base = invest_status.marketValue + invest_status.leftMoney - invest_status.levelMoney;
		}
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

    /*getRandomByValue:根据输入的值生成一个振幅[-2,2]的随机数
	 *返回值范围：[odds-2,odds+2]
	 *当返回值>10时，返回10
	 *当返回值<10时，返回-10
	 */
	var getRandomByValue = function(odds){
		var scope = 2;           //最大涨幅
		var hscope = scope * 2;  //最大涨幅的2倍
		var value=Math.round((Math.random()*hscope - scope)*100)/100;
		while(value == 0){
			value=Math.round((Math.random()*hscope - scope)*100)/100;
		}
		var result = odds + value;
		console.log(value)
		if(result > 10)
			result = 10;
		if(result < -10)
			result = -10;
		return result;
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
		resultArray[0] = odds;
		for (var i=1;i<n;i++)
		{ 
			var value = getRandomByValue(odds); 
			value=Math.round(value*100)/100; 
			resultArray[i] = value; 
			odds = value;
		} 
		return resultArray;
	}

})();
