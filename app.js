var getYoutubeSubtitles = require('@joegesualdo/get-youtube-subtitles-node');
var google = require('googleapis');
let youtube = google.youtube('v3');

var fs = require('fs');

let API_KEY = '';
let playlistId = '';

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