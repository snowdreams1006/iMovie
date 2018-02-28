;
(function($) {
	mui.init({
		swipeBack: true
	});

	Array.prototype.contains = function(obj) {
		var i = this.length;
		while(i--) {
			if(this[i] === obj) {
				return true;
			}
		}
		return false;
	}

	var vm = new Vue({
		el: '.mui-content',
		data: getDefaultData(),
		methods: {
			resetData: function() {
				try {
					Object.assign(this.$data, getDefaultData());
				} catch(e) {
					mui.extend(this.$data, getDefaultData());
				}
			},
			doSearch: function() {
				if(!vm.records.contains(vm.search)) {
					vm.records.unshift(vm.search);
				}

				document.activeElement.blur();

				vm.viewRecordDetail(vm.search);
			},
			viewRecordDetail: function(item) {
				document.activeElement.blur();

				mui.openWindow({
					url: './search-result.html',
					id: 'searchResult',
					styles: {
						popGesture: "close",
						bounce: "vertical",
						scrollIndicator: "none",
						bounceBackground: "#efeff4",
						titleNView: {
							titleText: '搜索\"' + (item) + '\"结果',
							autoBackButton: true
						}
					},
					extras: {
						search: item
					}
				});
			},
			emptyHistory: function() {
				document.activeElement.blur();

				plus.storage.removeItem('history');
				vm.resetData();
			}
		},
		watch: {
			records: function(val, oldVal) {
				plus.storage.setItem('history', JSON.stringify(val));
			}
		}
	});

	var nativeWebview, imm, InputMethodManager;

	mui.plusReady(function() {
		vm.records = JSON.parse(plus.storage.getItem('history')) || [];

		initNativeObjects();
		showSoftInput();

		document.getElementById("search").addEventListener('recognized', function(e) {
			mui.later(function() {
				vm.doSearch();
			}, 500);
		});

		mui.back = function() {
			plus.webview.currentWebview().close("auto", 300);
		}
	});

	function initNativeObjects() {
		if(mui.os.android) {
			var main = plus.android.runtimeMainActivity();
			var Context = plus.android.importClass("android.content.Context");
			InputMethodManager = plus.android.importClass("android.view.inputmethod.InputMethodManager");
			imm = main.getSystemService(Context.INPUT_METHOD_SERVICE);
		} else {
			nativeWebview = plus.webview.currentWebview().nativeInstanceObject();
		}
	}

	function showSoftInput() {
		if(mui.os.android) {
			imm.toggleSoftInput(0, InputMethodManager.SHOW_FORCED);
		} else {
			nativeWebview.plusCallMethod({
				"setKeyboardDisplayRequiresUserAction": false
			});
		}
		setTimeout(function() {
			var inputElem = document.querySelector('input');
			inputElem.focus();
			inputElem.parentNode.classList.add('mui-active'); //第一个是search，加上激活样式
		}, 200);
	}

	function getDefaultData() {
		return {
			search: "",
			records: []
		}
	}

})(mui);