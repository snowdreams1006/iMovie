;
(function($) {
	var util = {
		options: {
			ACTIVE_COLOR: "#007aff",
			NORMAL_COLOR: "#000",
			subpages: ['../top/top.html', '../setting/setting.html']
		},
		/**
		 *  简单封装了绘制原生view控件的方法
		 *  绘制内容支持font（文本，字体图标）,图片img , 矩形区域rect
		 */
		drawNative: function(id, styles, tags) {
			var view = new plus.nativeObj.View(id, styles, tags);
			return view;
		},
		/**
		 * 初始化首个tab窗口 和 创建子webview窗口 
		 */
		initSubpage: function(aniShow) {
			var subpage_style = {
					"top": 0,
					"bottom": 50,
					"popGesture": "none",
					"scrollIndicator": "none",
					"titleNView": {
						"titleText": ""
					}
				},
				subpages = util.options.subpages,
				self = plus.webview.currentWebview(),
				temp = {};

			//兼容安卓上添加titleNView 和 设置沉浸式模式会遮盖子webview内容
			if(mui.os.android) {
				if(plus.navigator.isImmersedStatusbar()) {
					subpage_style.top += plus.navigator.getStatusbarHeight();
				}
				if(self.getTitleNView()) {
					subpage_style.top += 40;
				}
			}

			// 初始化第一个tab项为首次显示
			temp[self.id] = "true";
			mui.extend(aniShow, temp);
			// 初始化绘制首个tab按钮
			util.toggleNview(0);

			for(var i = 0, len = subpages.length; i < len; i++) {
				if(!plus.webview.getWebviewById(subpages[i])) {
					var sub = plus.webview.create(subpages[i], subpages[i], subpage_style);
					//初始化隐藏
					sub.hide();
					// append到当前父webview
					self.append(sub);
				}
			}
		},
		/**	
		 * 点击切换tab窗口 
		 */
		changeSubpage: function(targetPage, activePage, aniShow) {
			//若为iOS平台或非首次显示，则直接显示
			if(mui.os.ios || aniShow[targetPage]) {
				plus.webview.show(targetPage);
			} else {
				//否则，使用fade-in动画，且保存变量
				var temp = {};
				temp[targetPage] = "true";
				mui.extend(aniShow, temp);
				plus.webview.show(targetPage, "fade-in", 300);
			}
			//隐藏当前 除了第一个父窗口
			if(activePage !== plus.webview.getLaunchWebview()) {
				plus.webview.hide(activePage);
			}
		},
		/**
		 * 点击重绘底部tab （view控件）
		 */
		toggleNview: function(currIndex) {
			currIndex = currIndex * 2;
			// 重绘当前tag 包括icon和text，所以执行两个重绘操作
			util.updateSubNView(currIndex, util.options.ACTIVE_COLOR);
			util.updateSubNView(currIndex + 1, util.options.ACTIVE_COLOR);
			// 重绘兄弟tag 反之排除当前点击的icon和text
			for(var i = 0, len = (util.options.subpages.length + 1) * 2; i < len; i++) {
				if(i !== currIndex && i !== currIndex + 1) {
					util.updateSubNView(i, util.options.NORMAL_COLOR);
				}
			}
		},
		/*
		 * 改变颜色
		 */
		changeColor: function(obj, color) {
			obj.color = color;
			return obj;
		},
		/*
		 * 利用 plus.nativeObj.View 提供的 drawText 方法更新 view 控件
		 */
		updateSubNView: function(currIndex, color) {
			var self = plus.webview.currentWebview(),
				nviewEvent = plus.nativeObj.View.getViewById("tabBar"), // 获取nview控件对象
				nviewObj = self.getStyle().subNViews[0], // 获取nview对象的属性
				currTag = nviewObj.tags[currIndex]; // 获取当前需重绘的tag

			nviewEvent.drawText(currTag.text, currTag.position, util.changeColor(currTag.textStyles, color), currTag.id);
		}
	};

	mui.init({
		gestureConfig: {
			tap: true,
			doubletap: true,
			longtap: true,
			swipe: true,
			drag: true,
			hold: false,
			release: false
		},
		pullRefresh: {
			container: "#pullrefresh",
			down: {
				auto: true,
				style: 'circle',
				offset: '45px',
				callback: refreshData
			},
			up: {
				contentrefresh: "正在加载中...",
				contentnomore: '没有更多数据了',
				callback: loadMoreData
			}
		}
	});

	var self = null;
	var movie_detail = null;
	var titleNView = {
		titleText: '',
		type: 'transparent',
		autoBackButton: true,
		buttons: [{
			text: '\ue402',
			fontSrc: '_www/fonts/mui.ttf',
			onclick: function(e) {
				mui.fire(movie_detail, 'share', {

				});
			}
		}]
	}
	var aniShow = {};

	var vm = new Vue({
		el: '#movies',
		data: {
			movies: []
		},
		methods: {
			viewMovieDetail: function(item) {
				mui.fire(movie_detail, 'movie_detail', {
					movieId: item.id,
					title: item.title,
					genres: item.genres,
					cover: item.cover,
					score: item.score,
					collect: item.collect,
					year: item.year,
					directors: item.directors,
					casts: item.casts,
					origin: item
				});

				titleNView.titleText = item.title;
				movie_detail.setStyle({
					"titleNView": titleNView
				});
				setTimeout(function() {
					movie_detail.show("slide-in-right", 300);
				}, 150);
			}
		}
	});

	mui.plusReady(function() {
		checkArguments();

		plus.storage.setItem("api", "https://api.douban.com");

		plus.runtime.setBadgeNumber(0);

		plus.geolocation.getCurrentPosition(function(position) {
				try {
					plus.storage.setItem("city", position.address.city);
				} catch(e) {
					plus.storage.setItem("city", "北京");
					mui.toast('默认城市自动设置为北京~');
				}
			},
			function(error) {
				plus.storage.setItem("city", "北京");
				mui.toast('默认城市自动设置为北京~');
			}, {
				enableHighAccuracy: true,
				provider: "amap",
				coordsType: "gcj02",
				geocode: true
			}
		);

		self = plus.webview.currentWebview();
		movie_detail = mui.preload({
			id: 'movieDetail',
			url: 'movie-detail.html',
			styles: {
				"render": "always",
				"popGesture": "hide",
				"scrollIndicator": "none",
				"titleNView": titleNView
			}
		});

		var aniShow = {};
		util.initSubpage(aniShow);

		var nview = plus.nativeObj.View.getViewById('tabBar'),
			nviewObj = self.getStyle().subNViews[0],
			activePage = plus.webview.currentWebview(),
			targetPage,
			subpages = util.options.subpages,
			pageW = window.innerWidth,
			currIndex = 0;

		nview.addEventListener('click', function(e) {
			var clientX = e.clientX;
			if(clientX > 0 && clientX <= parseInt(pageW * 0.33)) {
				currIndex = 0;
			} else if(clientX > parseInt(pageW * 0.33) && clientX <= parseInt(pageW * 0.67)) {
				currIndex = 1;
			} else if(clientX > parseInt(pageW * 0.67) && clientX <= parseInt(pageW * 1)) {
				currIndex = 2;
			}
			if(currIndex > 0) {
				targetPage = plus.webview.getWebviewById(subpages[currIndex - 1]);
			} else {
				targetPage = plus.webview.currentWebview();
			}

			if(targetPage == activePage) {
				return;
			}

			if(targetPage.id !== self.id) {
				var titleIndex = currIndex * 2;
				var titleText = nviewObj.tags[titleIndex + 1].text;
				targetPage.setStyle({
					titleNView: {
						titleText: titleText
					}
				});
			}

			util.toggleNview(currIndex);
			util.changeSubpage(targetPage, activePage, aniShow);
			activePage = targetPage;
		});

		window.addEventListener('resize', function(e) {
			var orientation = window.orientation;
			pageW = window.innerWidth;

			util.toggleNview(currIndex);
		});

		document.getElementById('scan').addEventListener('tap', function(e) {
			mui.openWindow({
				id: 'scan',
				url: 'scan/scan.html',
				styles: {
					"popGesture": "close"
				}
			});
		}, false);

		document.getElementById('chat').addEventListener('tap', function(e) {
			mui.openWindow({
				id: 'chat',
				url: '../setting/chat.html',
				styles: {
					"popGesture": "hide",
					"scrollIndicator": "none"
				}
			});
		}, false);

		document.getElementById('chat').addEventListener('longtap', function(e) {
			getClientInfo();
			var userid = JSON.parse(plus.storage.getItem("clientInfo")).clientid;
			copyToClip(userid);
			mui.toast(userid);
		}, false);

		document.getElementById('fakeSearch').addEventListener('tap', function() {
			mui.openWindow({
				id: 'search',
				url: 'search.html',
				styles: {
					"popGesture": "close",
					"titleNView": {
						titleText: '搜索',
						autoBackButton: true
					}
				}
			});
		});

		mui.later(function() {
			getClientInfo();
		}, 5000);

		plus.push.addEventListener("click", function(msg) {
			switch(msg.payload) {
				case "LocalMSG":
					console.log("click点击本地创建消息启动:::" + JSON.stringify(msg));
					break;
				default:
					console.log("click点击离线推送消息启动:::" + JSON.stringify(msg));
					break;
			}

			handlerPushMsg(msg);
		}, false);

		plus.push.addEventListener("receive", function(msg) {
			if(msg.aps) {
				console.log("receive接收到在线APNS消息:::" + JSON.stringify(msg));
			} else {
				console.log("receive接收到在线透传消息:::" + JSON.stringify(msg));
			}

			handlerPushMsg(msg);
		}, false);

		document.addEventListener('newintent', function() {
			checkArguments();
		}, false);
	});

	function copyToClip(copyText) {
		if(!copyText) {
			plus.nativeUI.toast("内容为空,复制失败");
			return;
		}
		if(Object.prototype.toString.call(copyText) === "[object Object]") {
			copyText = JSON.stringify(copyText);
		}
		switch(plus.os.name) {
			case "Android":
				var Context = plus.android.importClass("android.content.Context");
				var main = plus.android.runtimeMainActivity();
				var clip = main.getSystemService(Context.CLIPBOARD_SERVICE);
				plus.android.invoke(clip, "setText", copyText);
				break;
			case "iOS":
				var UIPasteboard = plus.ios.importClass("UIPasteboard");
				var generalPasteboard = UIPasteboard.generalPasteboard();
				// 设置/获取文本内容:
				generalPasteboard.setValueforPasteboardType(copyText, "public.utf8-plain-text");
				var value = generalPasteboard.valueForPasteboardType("public.utf8-plain-text");
				break;
			default:
				break;
		}
	}

	function getClientInfo() {
		var info = plus.push.getClientInfo() || {};
		plus.storage.setItem("clientInfo", JSON.stringify(info));
	}

	function handlerPushMsg(msg) {
		var msgHistory = JSON.parse(plus.storage.getItem("msgHistory")) || [];
		plus.runtime.setBadgeNumber(msgHistory.length);
		msgHistory.push(msg);
		plus.storage.setItem("msgHistory", JSON.stringify(msgHistory));
		mui.toast(msg.content);
	}

	function checkArguments() {
		var args = plus.runtime.arguments;

		if(args && args !== "") {
			var type = null;
			var id = null;

			try {
				args = JSON.parse(args);

				type = args.type;
				id = args.id;

				if(type && id) {
					viewShareDetail(type, id);
				}
			} catch(e) {
				var reg = /^.*com\.snowdreams1006\.iMovie\?type=(.+)&id=(\d+).*$/;
				if(args.match(reg)) {
					type = RegExp.$1;
					id = RegExp.$2;

					viewShareDetail(type, id);
				}
			}
		}
	}

	function viewShareDetail(type, id) {
		switch(type) {
			case "subject":
				var subjectAPI = plus.storage.getItem("api") + "/v2/movie/subject/" + id;

				mui.getJSON(subjectAPI, function(resp) {
					var subjectDetailData = convert([resp])[0];

					vm.viewMovieDetail(subjectDetailData);
				});
				break;
			case "celebrity":
				var celebrityAPI = plus.storage.getItem("api") + "/v2/movie/celebrity/" + id;

				mui.getJSON(celebrityAPI, function(item) {

					mui.openWindow({
						url: "celebrity-detail.html",
						id: "celebrityDetail",
						styles: {
							popGesture: "close",
							bounce: "vertical",
							scrollIndicator: "none",
							titleNView: {
								titleText: item.name,
								autoBackButton: true,
								type: 'transparent',
								buttons: [{
									text: '\ue402',
									fontSrc: '_www/fonts/mui.ttf',
									onclick: function(e) {
										var msg = {
											title: "您的好友喊你一起成为\"" + item.name + "\"的影迷",
											content: "\"" + item.name + "\"究竟有多大魅力,赶紧打开刻画影讯app一睹真容吧!",
											href: "iMovie://com.snowdreams1006.iMovie/v2/movie/celebrity/" + item.id
										};
										shareUtils.share(msg);
									}
								}]
							}
						},
						extras: {
							celebrityId: item.id,
							alt: item.alt,
							avatars: item.avatars.large,
							name: item.name,
							origin: item
						}
					});
				});
				break;
			default:
				var queryAPI = plus.storage.getItem("api") + "/v2/movie/" + type + "/" + id;

				plus.nativeUI.showWaiting("正在查询中...");

				mui.getJSON(celebrityAPI, function(resp) {
					plus.nativeUI.closeWaiting();

					mui.alert(JSON.stringify(resp), type + "/" + id, '我知道了', null);
				});
				break;
		}
	}

	function refreshData() {
		var theatersAPI = plus.storage.getItem("api") + "/v2/movie/in_theaters";
		var city = plus.storage.getItem("city");
		var requestParamter = {
			city: city,
			start: 0,
			count: 10
		};
		mui.getJSON(theatersAPI, requestParamter, function(resp) {
			vm.movies = convert(resp.subjects);

			mui('#pullrefresh').pullRefresh().endPulldown();
			mui.toast('成功刷新' + (resp.subjects.length) + '部电影信息~');
		});
	}

	function loadMoreData() {
		var theatersAPI = plus.storage.getItem("api") + "/v2/movie/in_theaters";
		var city = plus.storage.getItem("city");
		var requestParamter = {
			city: city,
			start: vm.movies.length,
			count: 10
		};

		plus.nativeUI.showWaiting("正在加载中...");

		mui.getJSON(theatersAPI, requestParamter, function(resp) {
			vm.movies = vm.movies.concat(convert(resp.subjects));

			plus.nativeUI.closeWaiting();

			mui('#pullrefresh').pullRefresh().endPullupToRefresh(vm.movies.length >= resp.total);
			mui.toast('成功加载' + (resp.subjects.length) + '部电影信息~');
		});
	}

	function convert(items) {
		var newItems = [];
		items.forEach(function(item) {
			var directorNames = '';
			for(var i = 0, len = item.directors.length; i < len; i++) {
				directorNames += item.directors[i].name;
				if(i != len - 1) {
					directorNames += ' / ';
				}
			}

			var castNames = '';
			for(var i = 0, len = item.casts.length; i < len; i++) {
				castNames += item.casts[i].name;
				if(i != len - 1) {
					castNames += ' / ';
				}
			}

			newItems.push({
				id: item.id,
				title: item.title,
				genres: item.genres.join("/"),
				cover: item.images.large,
				score: item.rating.average,
				collect: item.collect_count,
				year: item.year,
				directors: directorNames,
				casts: castNames,
				origin: item
			});
		});

		return newItems;
	}
})(mui);