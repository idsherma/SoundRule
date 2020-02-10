(function(scs) {
    scs(window.jQuery, window, document);
    }(function($, window, document) {

      'use strict';

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

    function formatQueryParams(params2) {
      const queryItems = Object.keys(params2).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params2[key])}`)
      return queryItems.join('&');
    }

    function formatQueryParams(params3) {
      const queryItems = Object.keys(params3).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params3[key])}`)
      return queryItems.join('&');
    }
    
    function getArtists(query) {

        const params = {
          artist: query,
          autocorrect: 1,
          api_key: apiKey
        };

        const params2 = {
          artist: query,
          limit: 5,
          api_key: apiKey
        }
      
        const queryString = formatQueryParams(params);
        const queryString2 = formatQueryParams(params2);

        const artistURL = artistInfoURL + '&' + queryString + '&format=json';
        const trackURL = trackInfoURL + '&' + queryString2 + '&format=json';

        console.log(artistURL);
        
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

      if (artistVar === undefined) {
        
        $('#artist-image').append(
          `<img src="https://via.placeholder.com/600x600/000000/FFFFFF/?text=Image+Unavailable" alt="Image Unavailable">`
        );
  
      } else {

        const params3 = {
          prop: "pageimages",
          piprop: 'thumbnail',
          pithumbsize: 600,
          titles: artistAPIResp.artist.name,
          origin: '*'
        }

        const queryString3 = formatQueryParams(params3);

        const imageURL = wikiImageURL + '&format=json&formatversion=2&' + queryString3;
        console.log(imageURL);

        fetch(imageURL)
        .then(response => {
          if (response.ok) {
            return response.json();
          }
          throw new Error(response.statusText);
        })
        .then(imageData => {
          let imgDataQuery = imageData.query.pages[0];

          if(imgDataQuery.hasOwnProperty("thumbnail")) {
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

    //to use to convert numbers and add commas
    // function numberWithCommas(x) {
    //   return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    // }

    function displayResults(artistTrackAPIResponse, artistAPIResponse) {
      
        //playcount
        //console.log(artistAPIResponse.artist.stats.playcount);
        
        let artistName = artistAPIResponse.artist;
        //let artistPlayCount = artistAPIResponse.artist.stats.playcount;

        $('#artist-info').empty();

        //checking if an artist exists
        if(artistName === undefined) {
          $('#artist-info').append(
            `<li>
              <p>This artist does not exist. Sorry, try again!</p>
            </li>`
          );

        } else if (artistAPIResponse.artist.similar.artist.length === 0) {
          
          //checking if an artists similar track exists
          $('#artist-info').append(
            `<li>
            <h3>${artistAPIResponse.artist.name}</h3>
            <p>${artistAPIResponse.artist.bio.summary}</p>
            
            <p>Top 5 Tracks:</p>
              <ul>
                <li>${artistTrackAPIResponse.toptracks.track[0].name}</li>
                <li>${artistTrackAPIResponse.toptracks.track[1].name}</li>
                <li>${artistTrackAPIResponse.toptracks.track[2].name}</li>
                <li>${artistTrackAPIResponse.toptracks.track[3].name}</li>
                <li>${artistTrackAPIResponse.toptracks.track[4].name}</li>
              </ul>
            </li>
            
            
            <p>Similar Artists:</p>
            <p>Similar artists are not available</p>
          </li>`
          );

        } else {
          //debugger;
          //let artistPlayCount = artistAPIResponse.artist.stats.playcount;
          //console.log(artistPlayCount);

          // function numberWithCommas(artistPlayCount) {
          //   return artistPlayCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
          // }

          // numberWithCommas(artistPlayCount);
          //console.log('hi?');
          //<p>PLAY COUNT: ${artistPlayCount}</p>

          $('#artist-info').append(
            `<li>
            <h3>${artistAPIResponse.artist.name}</h3>
            <p>${artistAPIResponse.artist.bio.summary}</p>

            
            
            <p>Top 5 Tracks:</p>
              <ul>
                <li>${artistTrackAPIResponse.toptracks.track[0].name}</li>
                <li>${artistTrackAPIResponse.toptracks.track[1].name}</li>
                <li>${artistTrackAPIResponse.toptracks.track[2].name}</li>
                <li>${artistTrackAPIResponse.toptracks.track[3].name}</li>
                <li>${artistTrackAPIResponse.toptracks.track[4].name}</li>
              </ul>
            </li>
            
            <p>Similar Artists:</p>
            <ul>
              <li>${artistAPIResponse.artist.similar.artist[0].name}</li>
              <li>${artistAPIResponse.artist.similar.artist[1].name}</li>
              <li>${artistAPIResponse.artist.similar.artist[2].name}</li>
              <li>${artistAPIResponse.artist.similar.artist[3].name}</li>
              <li>${artistAPIResponse.artist.similar.artist[4].name}</li>
            </ul>
          </li>`
          );
        }

        //display the results section
        $('#results').removeClass('hidden');

    }

    function watchForm() {
        $('form').submit(event => {
            event.preventDefault();

          let artistEntry = $('#artist-entry').val();

          if(artistEntry === '') {
            alert('Input can not be left blank');
            return;
          }

          getArtists(artistEntry);

           $('#artist-form')[0].reset();
        });
    }

    $(function() {
        console.log('App loaded! Waiting for submit!');
        watchForm();
    });
        
    })
);