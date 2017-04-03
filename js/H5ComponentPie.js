// 饼图
var H5ComponentPie = function(name, cfg) {
	var component = new H5ComponentBase(name, cfg);

	// 绘制网格线
	var w = cfg.width;
	var h = cfg.height;

	// 加入画布（背景层）
	var cns = document.createElement('canvas');
	var ctx = cns.getContext('2d');
	cns.width = ctx.width = w;
	cns.height = ctx.height = h;
	$(cns).css('zIndex', 1);
	component.append(cns);

	var r = w / 2;
	// 底图层
	ctx.beginPath();
	ctx.fillStyle = '#eee';
	ctx.lineWidth = .1;
	ctx.arc(r, r, r, 0, 360, false);
	ctx.fill();
	ctx.stroke();

	// 数据层
	var cns = document.createElement('canvas');
	var ctx = cns.getContext('2d');
	cns.width = ctx.width = w;
	cns.height = ctx.height = h;
	$(cns).css('zIndex', 2);
	component.append(cns);

	var colors = ['#f55', '#5ff', '#55f', '#5f5', '#555', '#ff5']; //备用颜色
	var sAngel = 1.5 * Math.PI; //设置开始角度在12点位置；
	var eAngel = 0; //设置结束角度
	var aAngel = Math.PI * 2 //100%圆的结束角度

	var step = cfg.data.length;
	for (var i = 0; i < step; i++) {
		var item = cfg.data[i];
		var color = item[2] || (item[2] = colors.pop());

		eAngel = sAngel + aAngel * item[1];
		ctx.beginPath();
		ctx.fillStyle = color;
		ctx.storkeStyle = color;
		ctx.lineWidth = .1;
		ctx.moveTo(r, r);
		ctx.arc(r, r, r, sAngel, eAngel);
		ctx.fill();
		ctx.stroke();

		sAngel = eAngel;

		// 加入文本
		var text = $('<div class="text">');
		text.text(cfg.data[i][0]);
		var per = $('<div class="per">');
		per.text(cfg.data[i][1] * 100 + '%');
		text.append(per);

		var x = r + Math.sin(.5 * Math.PI - sAngel) * r;
		var y = r + Math.cos(.5 * Math.PI - sAngel) * r;

		if (x > w / 2) {
			text.css('left', x / 2 + 5);
		} else {
			text.css('right', (w - x) / 2 + 5);
		}

		if (y > h / 2) {
			text.css('top', y / 2 + 5);
		} else {
			text.css('bottom', (h - y) / 2 + 5);
		}

		if (cfg.data[i][2]) {
			text.css('color', cfg.data[i][2]);
		}

		text.css({
			opacity: 0,
			fontSize: '12px'
		});;
		component.append(text);
	}


	// 蒙版层
	var cns = document.createElement('canvas');
	var ctx = cns.getContext('2d');
	cns.width = ctx.width = w;
	cns.height = ctx.height = h;
	$(cns).css('zIndex', 3);
	component.append(cns);

	ctx.fillStyle = '#eee';
	ctx.lineWidth = .1;

	// 生长动画
	var draw = function(per) {
		ctx.clearRect(0, 0, w, h);

		ctx.beginPath();
		ctx.moveTo(r, r);
		if (per <= 0) {
			ctx.arc(r, r, r, 0, Math.PI * 2, true);
		} else {
			ctx.arc(r, r, r, sAngel, sAngel + Math.PI * 2 * per, true);
		}
		ctx.fill();
		ctx.stroke();

		if (per >= 1) {
			component.find('.text').css('transition', 'all 0s');
			H5ComponentPie.reSort(component.find('.text'));
			component.find('.text').css('transition', 'all 1s');
			component.find('.text').css('opacity', 1);
		}
		if (per <= 1) {
			component.find('.text').css('opacity', 0);
		}
	}

	component.on('onLoad', function() {
		// 饼图生长动画
		var s = 0;
		for (var i = 0; i < 100; i++) {
			setTimeout(function() {
				s += .01;
				draw(s);
			}, i * 10);
		}
	});

	component.on('onLeave', function() {
		// 饼图退场动画
		var s = 1;
		for (var i = 0; i < 100; i++) {
			setTimeout(function() {
				s -= .01;
				draw(s);
			}, i * 10 + 500);
		}
	})

	component.append(cns);

	return component;
}

// 重排项目文本
H5ComponentPie.reSort = function(list) {
	// 1.检测相交
	var compare = function(domA, domB) {

		// 元素的位置 
		var offsetA = $(domA).offset();
		var offsetB = $(domB).offset();

		// domA的投影
		var showdowA_x = [offsetA.left, $(domA).width() + offsetA.left];
		var showdowA_y = [offsetA.top, $(domA).height() + offsetA.top];

		// domB的投影
		var showdowB_x = [offsetB.left, $(domB).width() + offsetB.left];
		var showdowB_y = [offsetB.top, $(domB).height() + offsetB.top];

		// 检测x轴是否相交
		var intersect_x = (showdowA_x[0] > showdowB_x[0] && showdowA_x[0] < showdowB_x[1]) || (showdowA_x[1] > showdowB_x[0] && showdowA_x[1] < showdowB_x[1]);
		// 检测y轴是否相交
		var intersect_y = (showdowA_y[0] > showdowB_y[0] && showdowA_y[0] < showdowB_y[1]) || (showdowA_y[1] > showdowB_y[0] && showdowA_y[1] < showdowB_y[1]);

		return intersect_x && intersect_y;
	}

	// 2.错开重排 
	var reset = function(domA, domB) {
		if ($(domA).css('top') != 'auto') {
			var topA = parseInt($(domA).css('top'));
			var topB = parseInt($(domB).css('top'));
			console.log(topA,topB);
			if(topA>0){
				$(domA).css('top', parseInt($(domA).css('top')) + $(domB).height());
			}else{
				$(domB).css('top', parseInt($(domB).css('top')) - $(domA).height());
			}
		}else	if ($(domA).css('bottom') != 'auto') {
			var butA = parseInt($(domA).css('bottom'));
			console.log(butA);
			if(butA<0){
				$(domA).css('bottom', parseInt($(domA).css('bottom')) - $(domB).height());
			}else{
				$(domB).css('bottom', parseInt($(domB).css('bottom')) + $(domA).height());
			}
			
		}
	}

	// 定义将要重排的元素
	var willReset = [list[0]];

	$.each(list, function(i, domTarget) {
		if (compare(willReset[willReset.length - 1], domTarget)) {
			willReset.push(domTarget);
		} else {
			willReset[willReset.length - 1] = domTarget;
		}
	});

	if (willReset.length > 1) {
		$.each(willReset, function(i, domA) {
			if (willReset[i + 1]) {
				reset(domA, willReset[i + 1]);
			}
		});
		H5ComponentPie.reSort(willReset);
	}
}