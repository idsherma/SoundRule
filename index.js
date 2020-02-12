(function (scs) {
	scs(window.jQuery, window, document);
}(function ($, window, document) {

	'use strict';

	//LAST FM API KEY
	const apiKey = '8cb97c698ec56a88c2e659cb16fd3985';

	//LAST FM API
	let artistInfoURL = 'https://ws.audioscrobbler.com/2.0/?method=artist.getinfo';
	let trackInfoURL = 'https://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks';

	//WIKIPEDIA API
	let wikiImageURL = 'https://en.wikipedia.org/w/api.php?action=query';

	//sanitize our user input and create the query item
	function formatQueryParams(params) {
		const queryItems = Object.keys(params).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
		return queryItems.join('&');
	}

	function getArtists(query) {

		const artistInfoParams = {
			artist: query,
			autocorrect: 1,
			api_key: apiKey
		};

		const trackInfoParams = {
			artist: query,
			limit: 5,
			api_key: apiKey
		}

		const artistQueryString = formatQueryParams(artistInfoParams);
		const trackQueryString = formatQueryParams(trackInfoParams);

		const artistURL = artistInfoURL + '&' + artistQueryString + '&format=json';
		const trackURL = trackInfoURL + '&' + trackQueryString + '&format=json';

		function getData() {
			let artistData = fetch(artistURL);
			let trackData = fetch(trackURL);

			Promise.all([artistData, trackData])
				.then(values => Promise.all(values.map(value => value.json())))
				.then(finalVals => {
					let artistAPIResp = finalVals[0];
					let trackAPIResp = finalVals[1];

					getArtistImage(artistAPIResp);
					displayResults(trackAPIResp, artistAPIResp);
				})
		}

		getData();
	}

	function getArtistImage(artistAPIResp) {
		$('#artist-image').empty();

		let artistVar = artistAPIResp.artist;

		if (!artistVar) {

			$('#artist-image').append(
				`<img src="https://via.placeholder.com/600x600/000000/FFFFFF/?text=Image+Unavailable" alt="Image Unavailable">`
			);

		} else {

			const imageParams = {
				prop: "pageimages",
				piprop: 'thumbnail',
				pithumbsize: 600,
				titles: artistAPIResp.artist.name,
				origin: '*'
			}

			const imageQueryString = formatQueryParams(imageParams);

			const imageURL = wikiImageURL + '&format=json&formatversion=2&' + imageQueryString;

			fetch(imageURL)
				.then(response => {
					if (response.ok) {
						return response.json();
					}
					throw new Error(response.statusText);
				})
				.then(imageData => {
					let imgDataQuery = imageData.query.pages[0];

					if (imgDataQuery.hasOwnProperty("thumbnail")) {
						displayImage(imageData);
					} else {
						$('#artist-image').append(
							`<img src="https://via.placeholder.com/600x600/000000/FFFFFF/?text=Image+Unavailable" alt="Image Unavailable">`
						);
					}

				})
				.catch(err => {
					$('#js-error-message').text(`Something went wrong: ${err.message}`);
				});

			function displayImage(imageData) {
				let artistImage = imageData.query.pages[0].thumbnail.source;
				let artistTitle = imageData.query.pages[0].title;

				$('#artist-image').append(
					`<img src="${artistImage}" alt="${artistTitle}">`
				);

			}
		}

		//display the results section
		$('#results').removeClass('hidden');

	}

	function displayResults(artistTrackAPIResponse, artistAPIResponse) {

		let formattedPlayCount;
		let artistName = artistAPIResponse.artist;

		$('#bio-parent, #biography, #similar-card').empty();

		if (!artistName) {
      //checking if an artist exists
			$('#bio-parent').append(
				`<p>This artist does not exist. Sorry, try again!</p>`
			);

		} else if (artistAPIResponse.artist.similar.artist.length === 0) {
      //checking if an artists similar track exists
      
      let artistPlayCount = artistAPIResponse.artist.stats.playcount;

			function formatNumber(artistPlayCount) {
				formattedPlayCount = artistPlayCount.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
				return formattedPlayCount;
      }
      
      formatNumber(artistPlayCount);

      $('#bio-parent').append(
				`<h2 id="artist-name" class="artist-card--content--name">${artistAPIResponse.artist.name}</h2>
                <div class="playcount-wrapper">
                  <div class="play-button">
                      <span class="play"></span>
                  </div>
                  <p class="playcount">
                    Play count: <span id="play-count" class="playcount__playcount-selection">${formattedPlayCount}</span>
                  </p>
                </div>
                <h3 class="artist-card__title">Top tracks:</h3>
                <ul class="artist-card__tracks">
                ` + getTop5List(artistTrackAPIResponse.toptracks.track) + `           
                </ul>`
			);

      $("#biography").append(`<p>${artistAPIResponse.artist.bio.summary}</p>`);
      
      $("#similar-card").append(`<h3 class="artist-card__title">Similar Artists:</h3>
      <p class="similar-artist-">Similar artists do not exist for this search</p>`);

		} else {

			let artistPlayCount = artistAPIResponse.artist.stats.playcount;

			function formatNumber(artistPlayCount) {
				formattedPlayCount = artistPlayCount.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
				return formattedPlayCount;
			}

			formatNumber(artistPlayCount);

			$('#bio-parent').append(
				`<h2 id="artist-name" class="artist-card--content--name">${artistAPIResponse.artist.name}</h2>
                <div class="playcount-wrapper">
                  <div class="play-button">
                      <span class="play"></span>
                  </div>
                  <p class="playcount">
                    Play count: <span id="play-count" class="playcount__playcount-selection">${formattedPlayCount}</span>
                  </p>
                </div>
                <h3 class="artist-card__title">Top tracks:</h3>
                <ul class="artist-card__tracks">
                ` + getTop5List(artistTrackAPIResponse.toptracks.track) + `           
                </ul>`
			);

			$("#biography").append(`<p>${artistAPIResponse.artist.bio.summary}</p>`);

			$("#similar-card").append(`<h3 class="artist-card__title">Similar Artists:</h3>
            <ul class="artist-card__similar-card--content">
             ` + getTop5List(artistAPIResponse.artist.similar.artist) + `
            </ul>`);
		}

		//display the results section
		$('#results').removeClass('hidden');

	}

	function getTop5List(response) {
    let list = "";
    
		for (let i = 0; i < 5; i++) {
			list += "<li>" + response[i].name + "</li>";
    }
    
		return list;

	}

	function watchForm() {
		$('form').submit(event => {
			event.preventDefault();

			let artistEntry = $('#artist-entry').val();

			if (artistEntry.trim() === '') {
				alert('Input can not be left blank');
				return;
			}

			getArtists(artistEntry);

			$('#artist-form')[0].reset();
		});
	}

	$(function () {
		console.log('App loaded! Waiting for submit!');
		watchForm();
	});

}));