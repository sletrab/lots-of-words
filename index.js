var fs = require('fs');
var getYoutubeSubtitles = require('@joegesualdo/get-youtube-subtitles-node');
var google = require('googleapis');
let youtube = google.youtube('v3');

var secret = require('./secret')

/*Query Channels to get the "uploads" Id. 
eg https://www.googleapis.com/youtube/v3/channels?id={channel Id}key={API key}&part=contentDetails */

/*Use this "uploads" Id to query PlaylistItems to get the list of videos. 
eg https://www.googleapis.com/youtube/v3/playlistItems?playlistId={"uploads" Id}&key={API key}&part=snippet&maxResults=50 */

// TODO: Save information of video to DB joined with subtitles
// TODO: Get next page of videos

youtube.playlistItems.list({
	key: secret.api,
	playlistId: secret.uploadId,
	part: 'snippet',
	maxResults: '5'
}, function (err, result) {
	if (err) {
		return console.log(err);
	}
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
				console.log(subtitles);
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