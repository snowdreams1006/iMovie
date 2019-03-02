(function($) {
	mui.init({
		swipeBack: false
	});

	mui('.mui-scroll-wrapper').scroll();

	mui.plusReady(function() {
		try {
			var wgtinfo = JSON.parse(plus.storage.getItem("appInfo"));
			var author = wgtinfo.author,
				email = wgtinfo.email,
				name = wgtinfo.name,
				version = wgtinfo.version;

			var appNames = [].slice.call(document.querySelectorAll('.app-name'));
			for(var i = 0; i < appNames.length; i++) {
				(function(i) {
					appNames[i].innerHTML = name;
				})(i)
			}
			var appVersions = [].slice.call(document.querySelectorAll('.app-version'));
			for(var i = 0; i < appVersions.length; i++) {
				(function(i) {
					appVersions[i].innerHTML = version;
				})(i)
			}
		} catch(e) {
			mui.toast('无法获取应用信息: ' + e.message);
		}
	});

	document.getElementById("share").addEventListener('tap', function() {
		var msg = {
			href: "http://m3w.cn/khyx",
			title: "留下点滴回忆,爱看好看的电影",
			content: "我正在体验刻画影讯,赶紧快来下载吧!",
			thumbs: ["_www/images/logo.png"]
		};
		shareUtils.share(msg);
	});

	document.getElementById("rate").addEventListener('tap', function() {
		if(mui.os.ios) {
			plus.runtime.openURL("itms-apps://itunes.apple.com/cn/app/iMovie/id1347459801?mt=8", function(error) {
				mui.toast('无法打开: ' + error);
			});
		} else if(mui.os.android) {
			plus.runtime.openURL("market://details?id=com.snowdreams1006.iMovie", function(error) {
				mui.toast('无法打开: ' + error);
			}, "com.qihoo.appstore");
		}
	});

	document.getElementById("tel").addEventListener('tap', function() {
		plus.device.dial("15888048781");
	});

	document.getElementById("email").addEventListener('tap', function() {
		addachmentMail();
	});

	document.getElementById("github").addEventListener('tap', function() {
		plus.runtime.openURL("https://github.com/snowdreams1006", function(error) {
			mui.alert(error.message, '无法打开GitHub主页', '我知道了', function(e) {
				if(e.index === 0) {
					mui.toast(error.message);
				}
			});
		});
	});

	document.getElementById("QQ").addEventListener('tap', function() {
		openQQ(513238368);
	});

	function openQQ(qq) {
		var isInstall = plus.runtime.isApplicationExist({
			pname: 'com.tencent.mobileqq',
			action: 'mqqwpa://'
		});

		if(!isInstall) {
			if(plus.os.name == "Android") {
				plus.nativeUI.confirm("检查到您未安装QQ，请先到应用商店搜索下载？", function(i) {
					if(i.index === 0) {
						plus.runtime.openURL("market://details?id=com.tencent.mobileqq", function(error) {
							plus.nativeUI.alert(error.message, function(e) {
								if(e.index === 0) {
									plus.nativeUI.toast(error.message);
								}
							}, "无法下载应用", "我知道了");
						});
					}
				});
			} else if(plus.os.name == "iOS") {
				plus.nativeUI.confirm("检查到您未安装qq，请先到appstore搜索下载？", function(i) {
					if(i.index === 0) {
						plus.runtime.openURL("itms-apps://itunes.apple.com/cn/app/qq/id444934666?mt=8", function(error) {
							plus.nativeUI.alert(error.message, function(e) {
								if(e.index === 0) {
									plus.nativeUI.toast(error.message);
								}
							}, "无法下载应用", "我知道了");
						});
					}
				});
			}
			return;
		}

		if(plus.os.name == "Android") {
			var main = plus.android.runtimeMainActivity();
			var Intent = plus.android.importClass('android.content.Intent');
			var Uri = plus.android.importClass('android.net.Uri');
			var intent = new Intent(Intent.ACTION_VIEW, Uri.parse("mqqwpa://im/chat?chat_type=wpa&uin=" + qq));
			main.startActivity(intent);
		} else if(plus.os.name == "iOS") {
			plus.runtime.launchApplication({
				action: "mqq://im/chat?chat_type=wpa&uin=" + qq + "&version=1&src_type=web"
			});
		}
	}

	function openWeixin() {
		if(plus.os.name == "Android") {
			plus.runtime.launchApplication({
				pname: "com.tencent.mm"
			}, function(e) {
				plus.nativeUI.confirm("检查到您未安装\"微信\"，是否到商城搜索下载？", function(i) {
					if(i.index == 0) {
						androidMarket("com.tencent.mm");
					}
				});
			});
		} else if(plus.os.name == "iOS") {
			plus.runtime.launchApplication({
				action: "weixin://RnUbAwvEilb1rU9g9yBU"
			}, function(e) {
				plus.nativeUI.confirm("检查到您未安装\"微信\"，是否到商城搜索下载？", function(i) {
					if(i.index == 0) {
						iosAppstore("itunes.apple.com/cn/app/wechat/id414478124?mt=8");
					}
				});
			});
		}
	}

	function addachmentMail() {
		var msg = plus.messaging.createMessage(plus.messaging.TYPE_EMAIL);
		msg.to = ['snowdreams1006@163.com'];
		msg.subject = '发送消息主题';
		msg.body = '发送消息内容';
		msg.silent = false;
		msg.addAttachment("_www/images/logo.png");
		plus.messaging.sendMessage(msg);
	}

})(mui)

var viewApi = mui('#app').view({
	defaultPage: '#setting'
});
var view = viewApi.view;
(function($) {
	var oldBack = $.back;
	$.back = function() {
		if(viewApi.canBack()) {
			viewApi.back();
		} else {
			oldBack();
		}
	};
	view.addEventListener('pageBeforeShow', function(e) {
		console.log(e.detail.page.id + " ::: pageBeforeShow");
	});
	view.addEventListener('pageShow', function(e) {
		console.log(e.detail.page.id + " ::: pageShow");
	});
	view.addEventListener('pageBeforeBack', function(e) {
		console.log(e.detail.page.id + " ::: pageBeforeBack");
	});
	view.addEventListener('pageBack', function(e) {
		console.log(e.detail.page.id + " ::: pageBack");
	});
})(mui);