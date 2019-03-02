(function($) {
	mui.init({
		swipeBack: true
	});

	var self = null;

	function getDefaultData() {
		return {
			scanDataObj: {}
		}
	}

	var scanDetailWrap = new Vue({
		el: '#scanDetailWrap',
		data: getDefaultData(),
		methods: {
			resetData: function() {
				Object.assign(this.$data, getDefaultData());
			},
			openScanUrl: function(data) {
				mui.confirm(data.result, "扫码类型 " + data.type, ['下次再说', '立即打开'], function(e) {
					if(e.index == 1) {
						//调用系统浏览器打卡指定url
						plus.runtime.openURL(data.result, function(error) {
							console.log(JSON.stringify(error));
							
							mui.alert('无法打开连接: ' + error.message, '打开连接失败', '我知道了', function(e) {
								if(e.index === 0) {
									mui.toast(error.message);
								}
							}, 'div');
						});
					} else {
						mui.toast(data.result);
					}
				});
			}
		}
	});

	$.previewImage();

	mui.plusReady(function() {
		self = plus.webview.currentWebview();
		self.addEventListener("hide", function(e) {
			window.scrollTo(0, 0);
			scanDetailWrap.resetData();
		}, false);

		//监听自定义refreshDetail事件
		document.addEventListener('refreshDetail', function(event) {
			var fireId = event.detail.fireId,
				scanDataObj = event.detail.scanDataObj;

			scanDetailWrap.scanDataObj = scanDataObj;
		});
	});

})(mui);