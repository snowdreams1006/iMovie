;
(function($) {
	mui.init({
		pullRefresh: {
			container: "#movies",
			down: {
				auto: true,
				style: 'circle',
				callback: refreshData
			},
			up: {
				contentrefresh: "正在加载中...",
				contentnomore: '没有更多数据了',
				callback: loadMoreData
			}
		}
	});

	var vm = new Vue({
		el: '#movies',
		data: {
			movies: []
		},
		methods: {
			viewMovieDetail: function(item) {
				var movie_detail = plus.webview.getWebviewById("movieDetail");
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

				movie_detail.setStyle({
					titleNView: {
						titleText: item.title
					}
				});
				setTimeout(function() {
					movie_detail.show("slide-in-right", 300);
				}, 150);
			}
		}
	});

	mui('.mui-slider').slider({
		interval: 2000
	});

	mui('#slider').on('tap', 'a', function(e) {
		var movieId = this.getAttribute("data-movie-id");
		var movieTitle = this.getAttribute("data-movie-title");

		vm.viewMovieDetail({
			id: movieId,
			title: movieTitle
		});
	});

	document.getElementById('top250').addEventListener('tap', function(e) {
		mui.openWindow({
			url: "top250.html",
			id: "top250",
			styles: {
				popGesture: "hide",
				bounce: "vertical",
				scrollIndicator: "none",
				titleNView: {
					titleText: "top250",
					autoBackButton: true
				}
			}
		});
	}, false);

	document.getElementById('usBox').addEventListener('tap', function(e) {
		mui.openWindow({
			url: "us-box.html",
			id: "usBox",
			styles: {
				popGesture: "hide",
				bounce: "vertical",
				scrollIndicator: "none",
				titleNView: {
					titleText: "北美票房榜",
					autoBackButton: true
				}
			}
		});
	}, false);

	function refreshData() {
		var comingSoonAPI = plus.storage.getItem("api") + "/v2/movie/coming_soon";
		var requestParamter = {
			start: 0,
			count: 10
		};

		mui.getJSON(comingSoonAPI, requestParamter, function(resp) {
			vm.movies = convert(resp.subjects);

			mui('#movies').pullRefresh().endPulldown();
			mui.toast('成功刷新' + (resp.subjects.length) + '部电影信息~');
		});
	}

	function loadMoreData() {
		var comingSoonAPI = plus.storage.getItem("api") + "/v2/movie/coming_soon";
		var requestParamter = {
			start: vm.movies.length,
			count: 10
		};

		mui.getJSON(comingSoonAPI, requestParamter, function(resp) {
			vm.movies = vm.movies.concat(convert(resp.subjects));

			mui('#movies').pullRefresh().endPullupToRefresh(vm.movies.length >= resp.total);
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