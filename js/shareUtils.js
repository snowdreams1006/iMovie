;
var shareUtils = (function($) {
	mui.init();

	var shares = {};

	mui.plusReady(function() {
		plus.share.getServices(function(s) {
			if(s && s.length > 0) {
				for(var i = 0; i < s.length; i++) {
					var t = s[i];
					shares[t.id] = t;
				}
			}
			shares["system"] = {
				"id": "system",
				"description": "系统分享",
				"authenticated": true,
				"accessToken": "",
				"nativeClient": true
			};
		}, function(e) {
			mui.toast('获取分享服务列表失败: ' + e.message);
		});
	});

	function shareWithSystem(share, msg) {
		plus.share.sendWithSystem({
			content: msg.content,
			title: msg.title,
			href: msg.href
		}, function() {
			onShareSuccess(share, msg);
		}, function(error) {
			onShareFail(share, msg, error);
		})
	}

	function onShareSuccess(share, msg) {
		mui.toast("分享到\"" + share.description + "\"成功");
	}

	function onShareFail(share, msg, error) {
		mui.toast("分享到\"" + share.description + "\"失败: " + error.message);
	}

	function shareMessage(share, ex, msg) {
		msg.extra = {
			scene: ex
		}

		if(share.id === "system") {
			shareWithSystem(share, msg);
			return;
		}
		share.send(msg, function() {
			onShareSuccess(share, msg);
		}, function(error) {
			onShareFail(share, msg, error);
		});
	}

	var shareUtils = {
		share: function(msg) {
			var ids = [{
					id: "weixin",
					ex: "WXSceneSession"
				}, {
					id: "weixin",
					ex: "WXSceneTimeline"
				}, {
					id: "system",
					ex: "system"
				}],
				bts = [{
					title: "发送给微信好友"
				}, {
					title: "分享到微信朋友圈"
				}, {
					title: "系统分享"
				}];

			plus.nativeUI.actionSheet({
				cancel: "取消",
				buttons: bts
			}, function(e) {
				var i = e.index;
				if(i > 0) {
					var s_id = ids[i - 1].id;
					var share = shares[s_id];
					if(share) {
						if(share.authenticated) {
							shareMessage(share, ids[i - 1].ex, msg);
						} else {
							share.authorize(function() {
								shareMessage(share, ids[i - 1].ex, msg);
							}, function(e) {
								mui.toast('授权失败: ' + e.message);
							});
						}
					}
				}
			});
		}
	};

	return shareUtils;

})(mui);