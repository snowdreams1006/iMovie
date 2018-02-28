;
(function($) {
	mui.init({
		swipeBack: true
	});

	var vm = new Vue({
		el: '#list',
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

	mui.plusReady(function() {
		loadMoreData(0);

		mui('.mui-scroll-wrapper').scroll({
			indicators: false
		});

		mui('#nav').on('tap', 'a', function() {
			loadMoreData(this.getAttribute('tabindex') * 50);
		});
	});

	function loadMoreData(start) {
		var top250API = plus.storage.getItem("api") + "/v2/movie/top250";

		var requestParamter = {
			start: start,
			count: 50
		};

		plus.nativeUI.showWaiting("正在加载中...");

		mui.getJSON(top250API, requestParamter, function(resp) {
			vm.movies = convert(resp);
			
			plus.nativeUI.closeWaiting();
			
			mui('.mui-scroll-wrapper').scroll().scrollTo(0,0,100);
		});
	}

	function convert(obj) {
		var newItems = [];
		var items = obj.subjects;
		for(var i = 0; i < items.length; i++) {
			(function(i) {
				var item = items[i];

				var directorNames = '';
				for(var j = 0, len = item.directors.length; j < len; j++) {
					(function(j) {
						directorNames += item.directors[j].name;
						if(j != len - 1) {
							directorNames += ' / ';
						}
					})(j)
				}

				var castNames = '';
				for(var k = 0, len = item.casts.length; k < len; k++) {
					(function(k) {
						castNames += item.casts[k].name;
						if(k != len - 1) {
							castNames += ' / ';
						}
					})(k)
				}

				newItems.push({
					sort: i + obj.start + 1,
					id: item.id,
					title: item.title,
					genres: item.genres.join("/"),
					cover: item.images.large,
					score: item.rating.average,
					collect: item.collect_count,
					year: item.year,
					directors: directorNames,
					casts: castNames,
					origin: obj
				});
			})(i)
		}
		return newItems;
	}

})(mui);