var fs = require('fs');
var getYoutubeSubtitles = require('@joegesualdo/get-youtube-subtitles-node');
var google = require('googleapis');
let youtube = google.youtube('v3');
var Subtitles = require('./Subtitles');

var secret = require('./secret');

Subtitles.getAllSubsForChannel(secret.name);