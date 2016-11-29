var fs = require('fs');
var getYoutubeSubtitles = require('@joegesualdo/get-youtube-subtitles-node');
var google = require('googleapis');
let youtube = google.youtube('v3');

var secret = require('./secret');

/*Query Channels to get the "uploads" Id. 
eg https://www.googleapis.com/youtube/v3/channels?id={channel Id}key={API key}&part=contentDetails */

/*Use this "uploads" Id to query PlaylistItems to get the list of videos. 
eg https://www.googleapis.com/youtube/v3/playlistItems?playlistId={"uploads" Id}&key={API key}&part=snippet&maxResults=50 */

// TODO: Save information of video to DB joined with subtitles
// TODO: Get next page of videos

// Needs to be turnt around. I should call giveMeAllSubsForUser(xy)

exports.getAllSubsForChannel = (ytChannelName) => {
	getUploadId(ytChannelName)
		.then(id => {
			getVideoIds(id)
				.then(ids => {
					console.log('Look at all those ids!')
					console.log(ids);
				})
		})
}

// Get uploads id from channel name
var getUploadId = (channelName) => {

	console.log('Well, ok, let me see that name!')
	return new Promise((resolve, reject) => {

		youtube.channels.list({
			key: secret.api,
			part: 'contentDetails',
			forUsername: channelName
		}, function (err, result) {
			if (err) {
				return reject(err);
			}

			let uploadId = result.items[0].contentDetails.relatedPlaylists.uploads;
			console.log('Found what you were looking for: ', uploadId)
			return resolve(uploadId);
		});
	});
}

// Get all video ids for a certain upload id
var getVideoIds = (uploadId, nextPage, videoIds) => {

	var nextPage = nextPage || '';
	var videoIds = videoIds || [];

	console.log('Ok, here we go... getting those video ids!')
	return new Promise((resolve, reject) => {

		youtube.playlistItems.list({
			key: secret.api,
			playlistId: uploadId,
			part: 'snippet',
			pageToken: nextPage,
			maxResults: '50'
		}, function (err, result) {
			if (err) {
				return reject(err);
			}

			// Save ids of videos to variable
			result.items.forEach((element, index) => {
				videoIds.push(element.snippet.resourceId.videoId);
			});

			// If there's another page get that also
			if (result.nextPageToken) {
				console.log('Whoa, i found another page: ', result.nextPageToken);
				getVideoIds(uploadId, result.nextPageToken, videoIds).then(resolve, reject);
			} else {
				console.log('K that\'s it. Found no more pages. ');				
				return resolve(videoIds);
			}

		});
	});
}

/*var getUploadId = (secret.api, secret.name)
	.then(id => {
		exports.getVideoIds(secret.api, id);
	})
	.catch(err => {
		console.log(err)
	});


*/
var extractAndSaveVideoIds = (json) => {


	downloadAndSaveSubtitles(ids);
}

var downloadAndSaveSubtitles = (videoIds) => {

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

//module.exports = lotsOfWords;