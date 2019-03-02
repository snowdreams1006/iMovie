(function($, doc) {
	var MIN_SOUND_TIME = 800;

	$.init({
		swipeBack: true,
		gestureConfig: {
			tap: true,
			doubletap: true,
			longtap: true,
			swipe: true,
			drag: true,
			hold: true,
			release: true
		}
	});

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
			handlerMsgTap: function(msgItem, event) {
				var msgType = msgItem.getAttribute('msg-type');
				var msgContent = msgItem.getAttribute('msg-content');

				if(msgType === 'sound') {
					player = plus.audio.createPlayer(msgContent);
					var playState = msgItem.querySelector('.play-state');
					playState.innerText = '正在播放...';
					player.play(function() {
						playState.innerText = '点击播放';
					}, function(e) {
						playState.innerText = '点击播放';
					});
				}
			}
		}
	});

	mui.ready(function() {
		// 解决在ios上fixed元素focusin时位置出现错误的问题 
		if(mui.os.ios) {
			document.addEventListener('DOMContentLoaded', function() {
				var footerDom = document.querySelector('footer');
				document.addEventListener('focusin', function() {
					footerDom.style.position = 'absolute';
				});
				document.addEventListener('focusout', function() {
					footerDom.style.position = 'fixed';
				});
			});
		}

		//监听右上角tap事件
		document.getElementById('feedback').addEventListener('tap', function(e) {
			mui.openWindow({
				id: 'feedback',
				url: 'feedback.html',
				styles: {
					popGesture: "close"
				}
			});
		}, false);
	});

	$.plusReady(function() {
		//调整弹出系统软键盘模式
		plus.webview.currentWebview().setStyle({
			softinputMode: "adjustResize"
		});

		//添加历史推送消息
		var msgHistory = JSON.parse(plus.storage.getItem("msgHistory")) || [];
		mui.each(msgHistory, function(index, element) {
			vm.records.push({
				sender: 'robot',
				type: 'text',
				content: element.content
			});
		});

		showKeyboard();

		//监听窗口resize事件
		window.addEventListener('resize', function() {
			scrollToTop();
		}, false);

		var ui = {
			body: doc.querySelector('body'),
			footer: doc.querySelector('footer'),
			footerRight: doc.querySelector('.footer-right'),
			footerLeft: doc.querySelector('.footer-left'),
			btnMsgType: doc.querySelector('#msg-type'),
			boxMsgText: doc.querySelector('#msg-text'),
			boxMsgSound: doc.querySelector('#msg-sound'),
			btnMsgImage: doc.querySelector('#msg-image'),
			areaMsgList: doc.querySelector('#msg-list'),
			boxSoundAlert: doc.querySelector('#sound-alert'),
			h: doc.querySelector('#h'),
			content: doc.querySelector('.mui-content')
		};

		//TODO 
		ui.h.style.width = ui.boxMsgText.offsetWidth + 'px';
		var footerPadding = ui.footer.offsetHeight - ui.boxMsgText.offsetHeight;

		//解决长按“发送”按钮，导致键盘关闭的问题；
		ui.footerRight.addEventListener('touchstart', function(event) {
			if(ui.btnMsgType.classList.contains('mui-icon-paperplane')) {
				msgTextFocus();
				event.preventDefault();
			}
		});

		//解决长按“发送”按钮，导致键盘关闭的问题；
		ui.footerRight.addEventListener('touchmove', function(event) {
			if(ui.btnMsgType.classList.contains('mui-icon-paperplane')) {
				msgTextFocus();
				event.preventDefault();
			}
		});

		//监听右侧发送/录音tap事件
		ui.footerRight.addEventListener('release', function(event) {
			if(ui.btnMsgType.classList.contains('mui-icon-paperplane')) {
				msgTextFocus();
				send({
					sender: 'self',
					type: 'text',
					content: ui.boxMsgText.value.replace(new RegExp('\n', 'gm'), '<br/>')
				});
				ui.boxMsgText.value = '';
				$.trigger(ui.boxMsgText, 'input', null);
			} else if(ui.btnMsgType.classList.contains('mui-icon-mic')) {
				ui.btnMsgType.classList.add('mui-icon-compose');
				ui.btnMsgType.classList.remove('mui-icon-mic');
				ui.boxMsgText.style.display = 'none';
				ui.boxMsgSound.style.display = 'block';
				msgTextBlur();
			} else if(ui.btnMsgType.classList.contains('mui-icon-compose')) {
				ui.btnMsgType.classList.add('mui-icon-mic');
				ui.btnMsgType.classList.remove('mui-icon-compose');
				ui.boxMsgSound.style.display = 'none';
				ui.boxMsgText.style.display = 'block';
				msgTextFocus();
			}
		}, false);

		//监听左侧相机tap事件
		ui.footerLeft.addEventListener('tap', function(event) {
			msgTextBlur();

			var btnArray = [{
				title: "拍照"
			}, {
				title: "从相册选择"
			}];
			plus.nativeUI.actionSheet({
				title: "选择照片",
				cancel: "取消",
				buttons: btnArray
			}, function(e) {
				var index = e.index;
				switch(index) {
					case 0:
						break;
					case 1:
						var cmr = plus.camera.getCamera();
						cmr.captureImage(function(path) {
							send({
								sender: 'self',
								type: 'image',
								content: "file://" + plus.io.convertLocalFileSystemURL(path)
							});
						}, function(err) {
							console.log("captureImage出错:::" + JSON.stringify(err));
							mui.toast(err.message);
						});
						break;
					case 2:
						plus.gallery.pick(function(path) {
							send({
								sender: 'self',
								type: 'image',
								content: path
							});
						}, function(err) {
							console.log("pick出错:::" + JSON.stringify(err));
							mui.toast(err.message);
						});
						break;
				}
			});
		}, false);

		//录音控制变量
		var recordCancel = false;
		var recorder = null;
		var audio_tips = document.getElementById("audio_tips");
		var startTimestamp = null;
		var stopTimestamp = null;
		var stopTimer = null;

		//监听touchstart录音条阻止默认事件
		ui.boxMsgSound.addEventListener("touchstart", function(e) {
			e.preventDefault();
		});

		//监听hold长按录音条开始录音事件
		ui.boxMsgSound.addEventListener('hold', function(event) {
			recordCancel = false;
			if(stopTimer) {
				clearTimeout(stopTimer);
			}
			audio_tips.innerHTML = "手指上划，取消发送";
			ui.boxSoundAlert.classList.remove('rprogress-sigh');
			setSoundAlertVisable(true);
			recorder = plus.audio.getRecorder();
			if(recorder == null) {
				plus.nativeUI.toast("不能获取录音对象");
				return;
			}
			startTimestamp = (new Date()).getTime();
			recorder.record({
				filename: "_doc/audio/"
			}, function(path) {
				if(recordCancel) {
					//TODO 并未删除
					console.log("录音取消:::" + JSON.stringify(path));
					plus.nativeUI.toast("录音取消");
					return;
				}
				send({
					sender: 'self',
					type: 'sound',
					content: path
				});
			}, function(e) {
				console.log("record:::" + JSON.stringify(e));
				plus.nativeUI.toast("录音时出现异常: " + e.message);
			});
		}, false);

		//监听drag拖动body是否取消发送事件
		ui.body.addEventListener('drag', function(event) {
			if(Math.abs(event.detail.deltaY) > 50) {
				if(!recordCancel) {
					recordCancel = true;
					if(!audio_tips.classList.contains("cancel")) {
						audio_tips.classList.add("cancel");
					}
					audio_tips.innerHTML = "松开手指，取消发送";
				}
			} else {
				if(recordCancel) {
					recordCancel = false;
					if(audio_tips.classList.contains("cancel")) {
						audio_tips.classList.remove("cancel");
					}
					audio_tips.innerHTML = "手指上划，取消发送";
				}
			}
		}, false);

		//监听release释放录音条事件
		ui.boxMsgSound.addEventListener('release', function(event) {
			if(audio_tips.classList.contains("cancel")) {
				audio_tips.classList.remove("cancel");
				audio_tips.innerHTML = "手指上划，取消发送";
			}
			stopTimestamp = (new Date()).getTime();
			if(stopTimestamp - startTimestamp < MIN_SOUND_TIME) {
				audio_tips.innerHTML = "录音时间太短";
				ui.boxSoundAlert.classList.add('rprogress-sigh');
				recordCancel = true;
				stopTimer = setTimeout(function() {
					setSoundAlertVisable(false);
				}, 800);
			} else {
				setSoundAlertVisable(false);
			}
			recorder.stop();
		}, false);

		//监听文本输入框tap事件
		var focus = false;
		ui.boxMsgText.addEventListener('tap', function(event) {
			msgTextFocus();
			focus = true;
			setTimeout(function() {
				focus = false;
			}, 1000);
			event.detail.gesture.preventDefault();
		}, false);

		//监听消息内容区tap事件
		ui.areaMsgList.addEventListener('tap', function(event) {
			if(!focus) {
				ui.boxMsgText.blur();
			}
		});

		//监听文本输入框input事件
		ui.boxMsgText.addEventListener('input', function(event) {
			ui.btnMsgType.classList[ui.boxMsgText.value == '' ? 'remove' : 'add']('mui-icon-paperplane');
			ui.btnMsgType.setAttribute("for", ui.boxMsgText.value == '' ? '' : 'msg-text');
			ui.h.innerText = ui.boxMsgText.value.replace(new RegExp('\n', 'gm'), '\n-') || '-';
			ui.footer.style.height = (ui.h.offsetHeight + footerPadding) + 'px';
			ui.content.style.paddingBottom = ui.footer.style.height;
		});

		//绑定消息列表
		function bindMsgList() {
			scrollToTop();
		}

		function scrollToTop() {
			ui.areaMsgList.scrollTop = ui.areaMsgList.scrollHeight + ui.areaMsgList.offsetHeight;
		}

		//文本输入框获取焦点
		function msgTextFocus() {
			ui.boxMsgText.focus();
			setTimeout(function() {
				ui.boxMsgText.focus();
			}, 150);
		}

		//文本输入框失去焦点
		function msgTextBlur() {
			ui.boxMsgText.blur();
			document.body.focus();
		}

		function setSoundAlertVisable(show) {
			if(show) {
				ui.boxSoundAlert.style.display = 'block';
				ui.boxSoundAlert.style.opacity = 1;
			} else {
				ui.boxSoundAlert.style.opacity = 0;
				//fadeOut 完成再真正隐藏
				setTimeout(function() {
					ui.boxSoundAlert.style.display = 'none';
				}, 200);
			}
		}

		//self发送消息
		function send() {
			records.push(msg);
			records.push({
				sender: 'robot',
				type: 'text',
				content: '努力回复中,请稍后...'
			});
			bindMsgList();
			toRobot(msg.content);
		}

		//消息发送给机器人助手
		function toRobot(info) {
			var apiUrl = 'http://www.tuling123.com/openapi/api';
			var userid = JSON.parse(plus.storage.getItem("clientInfo")).clientid || plus.device.uuid;

			$.post(apiUrl, {
				"key": '5f166dadbca14146ba2dd79936c84faf',
				"info": info,
				"userid": userid,
				"loc": plus.storage.getItem("city")
			}, function(data) {
				switch(data.code) {
					case 100000:
						console.log("文本类消息:::" + JSON.stringify(data));

						records.push({
							sender: 'robot',
							type: 'text',
							content: data.text
						});
						break;
					case 200000:
						console.log("链接类消息:::" + JSON.stringify(data));

						records.push({
							sender: 'robot',
							type: 'text',
							content: data.text
						});

						records.push({
							sender: 'robot',
							type: 'url',
							content: data.url
						});
						break;
					case 302000:
						console.log("新闻类消息:::" + JSON.stringify(data));

						records.push({
							sender: 'robot',
							type: 'text',
							content: data.text
						});

						records.push({
							sender: 'robot',
							type: 'news',
							content: data.list[0]
						});
						break;
					case 308000:
						console.log("菜谱类消息:::" + JSON.stringify(data));

						records.push({
							sender: 'robot',
							type: 'text',
							content: data.text
						});

						records.push({
							sender: 'robot',
							type: 'recipe',
							content: data.list[0]
						});
						break;
					default:
						console.log("未知类消息:::" + JSON.stringify(data));

						records.push({
							sender: 'robot',
							type: 'text',
							content: data.text
						});
						break;
				}

				bindMsgList();
			}, 'json');
		}

	});

	function showKeyboard() {
		if($.os.ios) {
			var webView = plus.webview.currentWebview().nativeInstanceObject();
			webView.plusCallMethod({
				"setKeyboardDisplayRequiresUserAction": false
			});
		} else {
			var Context = plus.android.importClass("android.content.Context");
			var InputMethodManager = plus.android.importClass("android.view.inputmethod.InputMethodManager");
			var main = plus.android.runtimeMainActivity();
			var imm = main.getSystemService(Context.INPUT_METHOD_SERVICE);
			imm.toggleSoftInput(0, InputMethodManager.SHOW_FORCED);
			imm.showSoftInput(main.getWindow().getDecorView(), InputMethodManager.SHOW_IMPLICIT);
		}

		setTimeout(function() {
			var inputElem = document.querySelector('textarea');
			inputElem.focus();
		}, 200);
	}

	function getDefaultData() {
		return {
			isSelf: true,
			records: [{
				sender: 'robot',
				type: 'text',
				content: '你好,这里是刻画影讯消息中心,回复"帮助"查看更多指令~'
			}]
		};
	}

}(mui, document));