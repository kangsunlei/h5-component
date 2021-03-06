// 折线图
var H5ComponentPolyline = function(name, cfg) {
	var component = new H5ComponentBase(name, cfg);

	// 绘制网格线
	var w = cfg.width;
	var h = cfg.height;

	// 加入画布（背景层）
	var cns = document.createElement('canvas');
	var ctx = cns.getContext('2d');
	cns.width = ctx.width = w;
	cns.height = ctx.height = h;
	component.append(cns);

	ctx.beginPath();
	ctx.lineWidth = 1;
	ctx.strokeStyle = "#aaa";

	// 水平网格线 10份
	var step = 10;
	for (var i = 0; i < step + 1; i++) {
		var y = h / step * i;
		ctx.moveTo(0, y);
		ctx.lineTo(w, y);
	}

	// 垂直网格线 根据项目个数份
	step = cfg.data.length + 1;

	var text_w = w / step >> 0;

	for (var i = 0; i < step + 1; i++) {
		var x = w / step * i;
		ctx.moveTo(x, 0);
		ctx.lineTo(x, h);

		if (cfg.data[i]) {
			var text = $('<div class="text">');
			text.text(cfg.data[i][0]);
			text.css('width', text_w / 2).css('left', x / 2 + text_w / 4);

			component.append(text);
		}

	}

	ctx.stroke();
	// 加入画布（数据层）
	var cns = document.createElement('canvas');
	var ctx = cns.getContext('2d');
	cns.width = ctx.width = w;
	cns.height = ctx.height = h;

	/**
	 * 绘制折线以及对应的数据和阴影
	 * @param  {floot} per 0到1之间的数据，绘制中间状态
	 * @return {DOM}     Component元素
	 */
	var draw = function(per) {
		// 清空画布
		ctx.clearRect(0, 0, w, h);
		// 绘制折线数据
		ctx.beginPath();
		ctx.lineWidth = 3;
		ctx.strokeStyle = "#f88";

		var x = 0;
		var y = 0;
		var row_w = w / step;
		// 画点
		for (i in cfg.data) {
			var item = cfg.data[i];
			x = row_w * (+i + 1);
			y = h * (1 - item[1] * per);

			ctx.moveTo(x, y);
			ctx.arc(x, y, 5, 0, 360, false);
		}
		// 画线
		ctx.moveTo(row_w, h * (1 - cfg.data[0][1] * per));
		for (i in cfg.data) {
			var item = cfg.data[i];
			x = row_w * (+i + 1);
			y = h * (1 - item[1] * per);
			ctx.lineTo(x, y);
		}
		ctx.stroke();

		// 绘制阴影
		ctx.lineWidth = 1;
		ctx.strokeStyle = "rgba(255,255,255,0)";

		ctx.lineTo(x, h);
		ctx.lineTo(row_w, h);
		ctx.fillStyle = 'rgba(255,136,120,.2)';
		ctx.fill();

		// 写数据
		for (i in cfg.data) {
			var item = cfg.data[i];
			x = row_w * (+i + 1);
			y = h * (1 - item[1] * per);

			ctx.fillStyle = item[2] ? item[2] : '#595959';
			ctx.fillText((item[1] * 100 >> 0) + '%', x - 10, y - 10);

		}
		ctx.stroke();
	}
	component.on('onLoad', function() {
		// 折线生长动画
		var s = 0;
		for (var i = 0; i < 100; i++) {
			setTimeout(function() {
				s += .01;
				draw(s);
			}, i * 10);
		}
	});

	component.on('onLeave', function() {
		// 折线退场动画
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