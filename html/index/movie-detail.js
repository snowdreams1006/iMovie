;
(function($) {
	mui.init({
		swipeBack: true
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
			viewCelebrityDetail: function(item) {
				if (!item.id) {
					mui.toast('暂无更多详情~');
					return;
				}
				mui.openWindow({
					url: "celebrity-detail.html",
					id: "celebrityDetail",
					styles: {
						popGesture: "close",
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
										href: "imovie://com.snowdreams1006.iMovie?type=celebrity&id=" + item.id
									};
									//TODO 不得已而为之,无法通过urlscheme唤醒自身app
									msg.href = item.alt;
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
			}
		}
	});

	mui.plusReady(function() {
		var self = plus.webview.currentWebview();

		self.addEventListener('hide', function(e) {
			window.scrollTo(0, 0);
			vm.resetData();
		}, false);

		mui('.top-image-block').on('tap', 'img', function() {
			plus.nativeUI.previewImage([vm.cover]);
		});

		mui.back = function() {
			self.hide("auto", 300);
		}
	});

	document.addEventListener("movie_detail", function(event) {
		vm.movieId = event.detail.movieId;
		vm.title = event.detail.title;
		vm.genres = event.detail.genres;
		vm.score = event.detail.score;
		vm.cover = event.detail.cover;
		vm.collect = event.detail.collect;
		vm.year = event.detail.year;
		vm.directorNames = event.detail.directors;
		vm.castNames = event.detail.casts;
		vm.preOrigin = event.detail.origin;

		var movieId = event.detail.movieId;
		if(!movieId) {
			return;
		}

		var subjectAPI = plus.storage.getItem("api") + "/v2/movie/subject/" + movieId;

		plus.nativeUI.showWaiting("正在加载中...");

		mui.getJSON(subjectAPI, function(resp) {
			vm.movieId = resp.id;
			vm.title = resp.title;
			vm.genres = resp.genres.join("/");
			vm.score = resp.rating.average;
			vm.cover = resp.images.large;
			vm.collect = resp.collect_count;
			vm.year = resp.year;
			
			var directorNames = '';
			for(var i = 0, len = resp.directors.length; i < len; i++) {
				directorNames += resp.directors[i].name;
				if(i != len - 1) {
					directorNames += ' / ';
				}
			}
			var castNames = '';
			for(var i = 0, len = resp.casts.length; i < len; i++) {
				castNames += resp.casts[i].name;
				if(i != len - 1) {
					castNames += ' / ';
				}
			}
			vm.directorNames = directorNames;
			vm.castNames = castNames;

			vm.reviewsCount = resp.reviews_count;
			vm.wishCount = resp.wish_count;
			vm.doubanSite = resp.douban_site;
			vm.alt = resp.alt;
			vm.mobileUrl = resp.mobile_url;
			vm.doCount = resp.do_count;
			vm.shareUrl = resp.share_url;
			vm.seasonsCount = resp.seasons_count;
			vm.scheduleUrl = resp.schedule_url;
			vm.episodesCount = resp.episodes_count;
			vm.countries = resp.countries.join("/");
			vm.casts = resp.casts;
			vm.currentSeason = resp.current_season;
			vm.originalTitle = resp.original_title;
			vm.summary = resp.summary;
			vm.subtype = resp.subtype;
			vm.directors = resp.directors;
			vm.commentsCount = resp.comments_count;
			vm.ratingCount = resp.ratings_count;
			vm.aka = resp.aka.join("/");

			plus.nativeUI.closeWaiting();
		});
	});

	document.addEventListener("share", function(event) {
		var msg = {
			title: "您的好友喊你一起看\"" + vm.title + "\"",
			content: "\"" + vm.title + "\"这部电影超级好看,赶紧打开刻画影讯app先睹为快吧!",
			href: "imovie://com.snowdreams1006.iMovie?type=subject&id=" + vm.movieId
		};

		//TODO 不得已而为之,无法通过urlscheme唤醒自身app
		msg.href = vm.alt;

		shareUtils.share(msg);
	});

	function getDefaultData() {
		return {
			movieId: '',
			title: '',
			genres: '',
			score: '',
			cover: '',
			collect: '',
			year: '',
			directorNames: '',
			castNames: '',
			preOrigin: {

			},
			reviewsCount: '',
			wishCount: '',
			doubanSite: '',
			alt: '',
			mobileUrl: '',
			doCount: '',
			shareUrl: '',
			seasonsCount: '',
			scheduleUrl: '',
			episodesCount: '',
			countries: '',
			casts: [],
			currentSeason: '',
			originalTitle: '',
			summary: '',
			subtype: '',
			directors: [],
			commentsCount: '',
			ratingCount: '',
			aka: ''
		}
	}

})(mui);