(function(scs) {
    scs(window.jQuery, window, document);
    }(function($, window, document) {

      'use strict';

    const apiKey = '8cb97c698ec56a88c2e659cb16fd3985';

    let artistInfoURL = 'https://ws.audioscrobbler.com/2.0/?method=artist.getinfo';
    let trackInfoURL = 'https://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks';

    //sanitize our user input and create the query item
    function formatQueryParams(params) {
        const queryItems = Object.keys(params).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        return queryItems.join('&');
    }

    function formatQueryParams(params2) {
      const queryItems = Object.keys(params2).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params2[key])}`)
      return queryItems.join('&');
    }
    
    function getShows(query) {

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
      
        const queryString = formatQueryParams(params)
        const queryString2 = formatQueryParams(params2)

        const artistURL = artistInfoURL + '&' + queryString + '&format=json';
        const trackURL = trackInfoURL + '&' + queryString2 + '&format=json';
        
        function getData() {
          let artistData = fetch(artistURL);
          let trackData = fetch(trackURL);
        
          Promise.all([artistData, trackData])
            .then(values => Promise.all(values.map(value => value.json())))
            .then(finalVals => {
              let artistAPIResp = finalVals[0];
              let trackAPIResp = finalVals[1];
              displayResults(artistAPIResp, trackAPIResp);
            });
        }

        getData();
    }

    function displayResults(artistAPIResponse, artistTrackAPIResponse) {

        let artistName = artistAPIResponse.artist;

        $('#results-list').empty();

        //checking if an artist exists
        if(artistName === undefined) {
          $('#results-list').append(
            `<li>
              </p>This artist does not exist. Sorry, try again!</p>
            </li>`
          );

        } else if (artistAPIResponse.artist.similar.artist.length === 0) {
          //checking if an artists similar track exists
          $('#results-list').append(
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

          $('#results-list').append(
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
            //console.log(tvShowEntry);
           getShows(artistEntry);

           $('#artist-form')[0].reset();
        });
    }

    $(function() {
        console.log('App loaded! Waiting for submit!');
        watchForm();
    });
        
    })
);