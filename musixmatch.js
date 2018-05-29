music = require('musicmatch')({apikey:"bbb76a902fc3b440bb895445f9940fbc"});

var artista = "Renato Zero"
var canzone = "Cercami"

var track_id;
var artist_id;


music.artistSearch({q_artist:artista, page_size:1})
    .then(function(data){
        artist_id = parseInt(JSON.stringify((data.message.body.artist_list[0].artist.artist_id)));
        music.trackSearch({q:canzone, page:1, page_size:1, f_artist_id:artist_id})
            .then(function(data){
                //console.log(data);
                //console.log(data.message.body.track_list[0].track.track_id);
                track_id = parseInt(JSON.stringify(data.message.body.track_list[0].track.track_id));
                music.trackLyrics({track_id: track_id})
                    .then(function(data){
                        //console.log(data);
                        //var qualcosa = JSON.stringify(data);
                        console.log(data.message.body.lyrics.lyrics_body);
                    }).catch(function(err){
                        console.log(err);
                })
            }).catch(function(err){
                console.log(err);
        })
    }).catch(function(err){
        console.log(err);
})
