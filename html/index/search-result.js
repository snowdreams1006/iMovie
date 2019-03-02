;
(function($) {
	mui.init({
		swipeBack: true,
		pullRefresh: {
			container: "#refreshContainer",
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
			search: '',
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

	mui.plusReady(function() {
		vm.search = plus.webview.currentWebview().search;

		mui.later(function() {
			mui('#refreshContainer').pullRefresh().pullupLoading();
		}, 500);

		mui.back = function() {
			plus.webview.currentWebview().close("auto", 300);
		}
	});

	function loadMoreData() {
		var searchAPI = plus.storage.getItem("api") + "/v2/movie/search";
		var requestParamter = {
			q: vm.search,
			start: vm.movies.length,
			count: 10
		};

		mui.getJSON(searchAPI, requestParamter, function(resp) {
			vm.movies = vm.movies.concat(convert(resp.subjects));

			mui('#refreshContainer').pullRefresh().endPullupToRefresh(vm.movies.length >= resp.total);
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