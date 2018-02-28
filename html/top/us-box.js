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
		getData();
		
		mui('.mui-scroll-wrapper').scroll({
			indicators: false
		});
	});

	function getData() {
		var usBoxAPI = plus.storage.getItem("api") + "/v2/movie/us_box";

		plus.nativeUI.showWaiting("正在加载中...");

		mui.getJSON(usBoxAPI, function(resp) {
			vm.movies = convert(resp);

			plus.nativeUI.closeWaiting();
		});
	}

	function convert(obj) {
		var newItems = [];
		var items = obj.subjects;
		for(var i = 0; i < items.length; i++) {
			(function(i) {
				var item = items[i];

				var directorNames = '';
				for(var j = 0, len = item.subject.directors.length; j < len; j++) {
					(function(j) {
						directorNames += item.subject.directors[j].name;
						if(j != len - 1) {
							directorNames += ' / ';
						}
					})(j)
				}

				var castNames = '';
				for(var k = 0, len = item.subject.casts.length; k < len; k++) {
					(function(k) {
						castNames += item.subject.casts[k].name;
						if(k != len - 1) {
							castNames += ' / ';
						}
					})(k)
				}

				newItems.push({
					sort: i + 1,
					id: item.subject.id,
					title: item.subject.title,
					genres: item.subject.genres.join("/"),
					cover: item.subject.images.large,
					score: item.subject.rating.average,
					collect: item.subject.collect_count,
					year: item.subject.year,
					directors: directorNames,
					casts: castNames,
					box: item.box,
					origin: obj
				});
			})(i)
		}
		return newItems;
	}

})(mui);