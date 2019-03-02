;
(function($) {
	mui.init({
		swipeBack: false
	});

	var self = null;
	var aboutWv = null;

	mui.plusReady(function() {
		self = plus.webview.currentWebview();

		plus.runtime.getProperty(plus.runtime.appid, function(wgtinfo) {
			plus.storage.setItem("appInfo", JSON.stringify(wgtinfo));

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
		});

		aboutWv = mui.preload({
			id: 'about',
			url: 'about.html',
			styles: {
				"popGesture": "none",
				"scrollIndicator": "none"
			}
		});

		document.getElementById('about').addEventListener('tap', function(e) {
			setTimeout(function() {
				aboutWv.show("slide-in-right", 300);
			}, 150);
		}, false);

		document.getElementById('feedback').addEventListener('tap', function(e) {
			mui.openWindow({
				id: 'feedback',
				url: 'feedback.html',
				styles: {
					"popGesture": "close",
					"scrollIndicator": "none"
				}
			});
		}, false);

		document.getElementById('chat').addEventListener('tap', function(e) {
			mui.openWindow({
				id: 'chat',
				url: 'chat.html',
				styles: {
					"popGesture": "hide",
					"scrollIndicator": "none"
				}
			});
		}, false);
	});

})(mui);