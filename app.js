var getYoutubeSubtitles = require('@joegesualdo/get-youtube-subtitles-node');
var google = require('googleapis');
let youtube = google.youtube('v3');

var fs = require('fs');

var secret = require('./secret')
let API_KEY = secret.API_KEY;
let playlistId = secret.uploadId;

/*Query Channels to get the "uploads" Id. 
eg https://www.googleapis.com/youtube/v3/channels?id={channel Id}key={API key}&part=contentDetails */

/*Use this "uploads" Id to query PlaylistItems to get the list of videos. 
eg https://www.googleapis.com/youtube/v3/playlistItems?playlistId={"uploads" Id}&key={API key}&part=snippet&maxResults=50 */
youtube.playlistItems.list({
	key: API_KEY,
	playlistId: playlistId,
	part: 'snippet',
	maxResults: '50'
}, function (err, result) {
	extractAndSaveVideoIds(result);
});

var extractAndSaveVideoIds = (json) => {

	let ids = [];
	json.items.forEach((element, index) => {
		ids.push(element.snippet.resourceId.videoId);
	});
	downloadAndSaveSubtitles(ids);
}

var downloadAndSaveSubtitles = (videoIds) => {

	console.log(videoIds);
	var wordCollection = {};
	videoIds.forEach((id, index) => {
		getYoutubeSubtitles(id, { type: 'auto' })
			.then(subtitles => {

				subtitles.forEach((element, index, array) => {
					let sentence = element.part;
					let words = sentence.split(' ');
					

					words.forEach((word, index, array) => {
						
						if (wordCollection[word.toLowerCase()] >= 1) {
									wordCollection[word.toLowerCase()] = wordCollection[word.toLowerCase()] + 1;
								}
						else {
							wordCollection[word.toLowerCase()] = 1;
						}
					});
				});
				
				fs.writeFile('words.json', JSON.stringify(wordCollection), (err) => {
					if (err) {
						return console.log(err);
					}

					console.log('file written!');
				})
			})
			.catch(err => {
				console.log(err)
			});	
	});
}