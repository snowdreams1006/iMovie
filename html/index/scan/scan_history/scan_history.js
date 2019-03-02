(function($) {
	mui.init({
		swipeBack: true
	});

	var scan_detail = null,
		self = null;

	function getDefaultData() {
		return {
			empty: true,
			scanHistoryList: []
		}
	}

	var scanHistoryWrap = new Vue({
		el: '#scanHistoryWrap',
		data: getDefaultData(),
		methods: {
			resetData: function() {
				Object.assign(this.$data, getDefaultData());
			},
			onempty: function() {
				mui.alert('暂无条码扫描历史记录哟', '无扫描记录', '我知道了', function(e) {
					mui.toast('单击查看详情,长按快捷操作');
				}, 'div');
			},
			showScanDetail: function(scanDataObj) {
				mui.fire(scan_detail, 'refreshDetail', {
					fireId: self.id,
					scanDataObj: scanDataObj
				});
				setTimeout(function() {
					scan_detail.show("slide-in-right", 300);
				}, 150);
			}
		}
	});

	mui.plusReady(function() {
		self = plus.webview.currentWebview();
		scan_detail = mui.preload({
			url: 'scan_detail/scan_detail.html',
			id: 'scan_detail',
			styles: {
				popGesture: "hide"
			},
			extras: {

			}
		});

		initScanHistoty();

		document.getElementById('cleanHistroy').addEventListener('tap', function() {
			var scanHistoryList = scanHistoryWrap.scanHistoryList;
			if(scanHistoryList.length == 0) {
				mui.toast('当前没有扫码历史哟');
				return;

			}
			mui.confirm('是否清空扫码历史(不可撤销)', '清空扫码历史', ['取消', '确认'], function(e) {
				if(e.index == 1) {
					cleanHistroy();
				} else {
					mui.toast('放心,你的扫码还在呢');
				}
			}, 'div');
		});

		document.addEventListener('refreshHistory', function(event) {
			initScanHistoty();
		});
	});

	//初始化扫码历史
	function initScanHistoty() {
		var scanHistoryList = JSON.parse(plus.storage.getItem("scanHistoryList")) || [];
		if(scanHistoryList.length > 0) {
			scanHistoryWrap.empty = false;
			scanHistoryWrap.scanHistoryList = scanHistoryList;
		}
	}

	//清空历史记录
	function cleanHistroy() {
		scanHistoryWrap.resetData();
		plus.storage.removeItem("scanHistoryList");
		plus.io.resolveLocalFileSystemURL('_doc/barcode/', function(entry) {
			entry.removeRecursively(function() {
				mui.toast('成功清空文件');
			}, function(e) {
				mui.alert(e.message, '删除文件失败', '我知道了', function(e) {
					mui.toast('删除失败,请手动删除');
				}, 'div');
			});
		});
	}

})(mui);