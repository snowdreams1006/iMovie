(function(mui, doc) {
	//当前webview对象以及历史和详情webview
	var scan_history = null,
		scan_detail = null,
		self = null;

	//mui插件
	mui.init({
		//开启侧滑返回
		swipeBack: true
	});

	//条码扫描识别控件对象
	var scan = null,
		//默认不开启闪光灯
		onFlash = false;

	//监听plusready事件回调
	mui.plusReady(function() {
		//获取当前窗口对象
		self = plus.webview.currentWebview();

		//判断创建者是否传值
		if(self.scanPictureByPath) {
			//直接扫描传值url
			scanPictureByPath(self.scanPictureByPath);
		}

		//创建Barcode对象 http://www.html5plus.org/doc/zh_cn/barcode.html#plus.barcode.Barcode.Barcode.constructor(id,filters,styles)
		scan = new plus.barcode.Barcode('barcodeScan', [plus.barcode.QR, plus.barcode.EAN8, plus.barcode.EAN13], {
			frameColor: '#00FF00',
			scanbarColor: '#00FF00'
		});

		//条码识别成功事件 http://www.html5plus.org/doc/zh_cn/barcode.html#plus.barcode.Barcode.onmarked
		scan.onmarked = onmarked;
		//条码识别错误事件 http://www.html5plus.org/doc/zh_cn/barcode.html#plus.barcode.Barcode.onerror
		scan.onerror = onerror;

		//开始条码识别 http://www.html5plus.org/doc/zh_cn/barcode.html#plus.barcode.Barcode.start
		scan.start({
			//是否保存成功扫描到的条码数据时的截图
			conserve: true,
			//保存成功扫描到的条码数据时的图片路径
			filename: '_doc/barcode/',
			//成功扫描到条码数据时是否需要震动提醒
			vibrate: true,
			//成功扫描到条码数据时播放的提示音类型
			sound: "default"
		});

		//预加载扫码历史页面以及扫码详情页面
		scan_history = mui.preload({
			url: 'scan_history/scan_history.html',
			id: 'scan_history',
			styles: {
				popGesture: "hide"
			},
			extras: {

			}
		});
		scan_detail = mui.preload({
			url: 'scan_history/scan_detail/scan_detail.html',
			id: 'scan_detail',
			styles: {
				popGesture: "hide"
			},
			extras: {

			}
		});

		//监听从相册选择条码扫描
		document.getElementById('scanPicture').addEventListener('tap', function() {
			//相册选择扫码
			scanPicture();
		});

		//监听扫描历史
		document.getElementById('scanHistory').addEventListener('tap', function() {
			//显示扫码历史
			scanHistory();
		});

		//开关闪光灯
		document.getElementById('switchFlash').addEventListener('tap', function() {
			//显示扫码历史
			switchFlash();
		});
	});

	// 是否开启闪光灯 
	function switchFlash() {
		if(onFlash) { //已开启,则关闭闪光灯
			scan && scan.setFlash(false);
		} else { //未开启则,开启闪光灯
			scan && scan.setFlash(true);
		}
		//取反是否开启闪光灯
		onFlash = !onFlash;
	}

	// 条码扫描成功
	function onmarked(type, result, file) { //条码识别成功的回调函数
		//识别到的条码类型 http://www.html5plus.org/doc/zh_cn/barcode.html
		switch(type) {
			//条码类型常量，QR二维码，数值为0
			case plus.barcode.QR:
				type = 'QR';
				break;
				//EAN13: 条码类型常量，EAN一维条形码码标准版，数值为1
			case plus.barcode.EAN13:
				type = 'EAN13';
				break;
				//EAN8: 条码类型常量，ENA一维条形码简版，数值为2
			case plus.barcode.EAN8:
				type = 'EAN8';
				break;
			default:
				type = '其它' + type;
				break;
		}

		//获取文件对象,转化成本地路径
		plus.io.resolveLocalFileSystemURL(file, function(entry) {
			//本地图片路径
			file = entry.toLocalURL();

			var scanDataObj = {
				type: type,
				result: result,
				file: file,
				time: dateUtils.Format(new Date(),"yyyy-MM-dd hh:mm:ss")
			};

			//将扫描记录传递到详情页面处理
			mui.fire(scan_detail, 'refreshDetail', {
				fireId: self.id,
				scanDataObj: scanDataObj
			});
			setTimeout(function() {
				scan_detail.show("slide-in-right", 300, function() {
					//关闭条码识别控件
					destroyScan();
				});
			}, 150);

			//更新扫码历史
			var scanHistoryList = JSON.parse(plus.storage.getItem("scanHistoryList")) || [];
			scanHistoryList.push(scanDataObj);
			plus.storage.setItem("scanHistoryList",JSON.stringify(scanHistoryList));
		});

		//扫描结果提示
		mui.toast(result);
	}

	// 条码识别错误事件
	function onerror(error) {
		//识别失败回调
		mui.alert(error.message, '识别失败', '我知道了', function(e) {
			//条码识别错误的回调函数
			if(e.index == 0) {
				mui.toast("条码识别错误: " + error.message);
				console.log("条码识别错误: " + JSON.stringify(error));

				//关闭条码识别控件
				destroyScan();
			}
		});
	}

	// 通过图片扫描条码数据
	function scanPictureByPath(path) {
		//通过图片扫描条码数据 http://www.html5plus.org/doc/zh_cn/barcode.html#plus.barcode.scan
		plus.barcode.scan(path, onmarked, onerror, [plus.barcode.QR, plus.barcode.EAN8, plus.barcode.EAN13]);
	}

	// 从相册中选择条码图片 
	function scanPicture() {
		//访问相册,选择图片
		plus.gallery.pick(function(path) {
			//通过图片扫描条码数据 http://www.html5plus.org/doc/zh_cn/barcode.html#plus.barcode.scan
			plus.barcode.scan(path, onmarked, onerror, [plus.barcode.QR, plus.barcode.EAN8, plus.barcode.EAN13]);
		}, function(err) {
			mui.toast('操作取消');
			console.log('无法打开相册: ' + JSON.stringify(err));
		});
	}

	//销毁扫描控件以及webview
	function destroyScan() {
		//关闭条码识别控件
		scan && scan.close();
		//关闭当前页面,下次进入重新初始化
		self.close("none");
	}

	// 显示扫码历史记录
	function scanHistory() {
		//自定义事件通知历史页刷新
		mui.fire(scan_history, 'refreshHistory');

		//进入 扫一扫历史列表 页面 右滑关闭
		setTimeout(function() {
			scan_history.show("slide-in-right", 300, function() {
				//关闭条码识别控件
				destroyScan();
			});
		}, 150);
	}

})(mui, document)