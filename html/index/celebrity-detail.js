;
(function($) {
	mui.init({
		swipeBack: true
	});

	var vm = new Vue({
		el: '.mui-content',
		data: {
			mobileUrl: '',
			akaEn: '',
			name: '',
			works: [],
			gender: '',
			avatars: '',
			celebrityId: '',
			aka: '',
			nameEn: '',
			bornPlace: '',
			alt: '',
			preOrigin: {

			}
		},
		methods: {
			viewMovieDetail: function(item) {
				var movie_detail = plus.webview.getWebviewById("movieDetail");

				var directorNames = '';
				for(var i = 0, len = item.subject.directors.length; i < len; i++) {
					directorNames += item.subject.directors[i].name;
					if(i != len - 1) {
						directorNames += ' / ';
					}
				}

				var castNames = '';
				for(var i = 0, len = item.subject.casts.length; i < len; i++) {
					castNames += item.subject.casts[i].name;
					if(i != len - 1) {
						castNames += ' / ';
					}
				}

				mui.fire(movie_detail, 'movie_detail', {
					movieId: item.subject.id,
					title: item.subject.title,
					genres: item.subject.genres.join("/"),
					cover: item.subject.images.large,
					score: item.subject.rating.average,
					collect: item.subject.collect_count,
					year: item.subject.year,
					directors: directorNames,
					casts: castNames,
					origin: item
				});

				movie_detail.setStyle({
					titleNView: {
						titleText: item.subject.title
					}
				});
				setTimeout(function() {
					movie_detail.show("slide-in-right", 300, function() {
						plus.webview.currentWebview().close("none");
					});
				}, 150);
			}
		}
	});

	mui.plusReady(function() {
		var self = plus.webview.currentWebview();

		vm.celebrityId = self.celebrityId;
		vm.alt = self.alt;
		vm.avatars = self.avatars;
		vm.name = self.name;
		vm.preOrigin = self.origin;

		var celebrityId = self.celebrityId;
		if(!celebrityId) {
			return;
		}

		var celebrityAPI = plus.storage.getItem("api") + "/v2/movie/celebrity/" + celebrityId;

		plus.nativeUI.showWaiting("正在加载中...");

		mui.getJSON(celebrityAPI, function(resp) {
			vm.mobileUrl = resp.mobile_url;
			vm.akaEn = resp.aka_en;
			vm.works = resp.works;
			vm.gender = resp.gender;
			vm.aka = resp.aka.join("/");
			vm.nameEn = resp.name_en;
			vm.bornPlace = resp.born_place;

			plus.nativeUI.closeWaiting();
		});

		mui('.top-image-block').on('tap', 'img', function() {
			plus.nativeUI.previewImage([vm.avatars]);
		});

		mui.back = function() {
			self.close("auto", 300);
		}
	});
})(mui);