importScripts('AVIInfo.js');


        function duree(s) {

            function onetotwo(Pint) {
                if (Pint < 10) {
                    return '0' + Pint.toString();
                } else {
                    return Pint.toString();
                }
            }

            function onetothree(Pint) {
                if (Pint < 10) {
                    return '00' + Pint.toString();
                } else {
                    if (Pint < 100) {
                        return '0' + Pint.toString();
                    } else {
                        return Pint.toString();
                    }
                }
            }

            var out = '';
            var lhh = '';
            var lmn = '';
            var lss = '';
            var lms = '';
            lhh = Math.floor(s / 3600);
            lmn = Math.floor((s - lhh * 3600) / 60);
            lss = Math.floor(s - lhh * 3600 - lmn * 60);
            lms = Math.ceil((s - lhh * 3600 - lmn * 60 - lss) * 1000);
            if (lhh > 0) {
                lhh = lhh.toString() + ":";
                out = lhh;
            }
            if (lmn > 0) {
                if (out.length == 0) {
                    out = lmn.toString() + ":";
                } else {
                    out = out + onetotwo(lmn) + ":";
                }
            } else {
                if (out.length > 0) {
                    out = out + "00:";
                }
            }
            if (lss > 0) {
                if (out.length == 0) {
                    out = lss.toString();
                } else {
                    out = out + onetotwo(lss);
                }
            } else {
                if (out.length == 0) {
                    out = "0";
                } else {
                    out = out + "00";
                }
            }
            if (lms != 0) {
                out = out + '.' + onetothree(lms);
            }
            return out;
        }

        function humanFileSize(size) {
            var i = Math.floor(Math.log(size) / Math.log(1024));
            return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['o', 'ko', 'Mo', 'Go', 'To'][i];
        };

        function humanBitrate(size) {
            var i = Math.floor(Math.log(size) / Math.log(1024));
            return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['bps', 'kbps', 'Mbps', 'Gbps', 'Tbps'][i];
        };

        function human_reading(info) {
            info.text = "ArouG's AVI Infos :\n";
            info.text += "-------------------\n";
            info.text += "File : " + info.filename + "\n";

            var d= new Date(info.filedate);    
            info.text += "Date : " + (d.getFullYear()) + '/' + (d.getMonth() + 1) + '/' + d.getDate() + ' ' + d.getHours() + ':' + d.getMinutes() + "\n";
            info.text += "Size : " + humanFileSize(info.filesize) + "\n";
            info.text += "Format : AVI \n";
            if (info.isOpenDML){
                info.text += "Format profile : OPENDML\n";
            }
            if (info.AVIF_HASINDEX) {
                info.text += "Indexed : Yes\n";
            } else {
                info.text += "Indexed : No\n";
            }
            info.text += "Duration : " + duree(info.dureeS) + "\n";
            var DataSize = 0;
            for (var i = 0; i < info.tracks.length; i++) DataSize += info.tracks[i].Totalsize;
            GlobBitrate = 8 * DataSize / info.dureeS;
            info.text += "Global bitrate : " + humanBitrate(GlobBitrate) + "\n";
            if (info.swft){
                if (info.swft.offset > 0) {
                    info.text += "Creator : " + info.swft.name + "\n";
                }
            }    
            info.text += "Count of streams : " + info.dwStreams + "\n";
            info.text += "\n";

            for (var i = 0; i < info.tracks.length; i++) {
                if (info.tracks[i].strh.Typet == 'vids'){
                    info.text += "Video :\n";
                }
                if (info.tracks[i].strh.Typet == 'auds'){
                    info.text += "Audio :\n";
                }
                if (info.tracks[i].strh.Typet == 'txts'){
                    info.text += "Subtitles :\n";
                }
                info.text += "Track number " + (i+1) + "\n";
                info.text += "Size : " + humanFileSize(info.tracks[i].Totalsize) + "\n";
                info.text += "Count of samples : " + info.tracks[i].strh.dwLength + "\n";
                info.text += "Duration : " + duree(info.tracks[i].strh.dureeS) + "\n";
                var tmp = 8 * info.tracks[i].Totalsize / info.tracks[i].strh.dureeS;
                if ((info.tracks[i].strh.Typet == 'vids') || (info.tracks[i].strh.Typet == 'auds')) {
                    info.text += "Global Bitrate : " + humanBitrate(tmp) + "\n";
                }                
                if (info.tracks[i].strh.wLanguage != "```"){
                    info.text += "Langage : " + info.tracks[i].strh.wLanguage + "\n";
                }
                if (info.tracks[i].strh.Typet == 'vids') {
                    tmp = Math.ceil(100 * info.tracks[i].strh.dwLength / info.tracks[i].strh.dureeS) / 100;
                    info.text += "Framerate : " + tmp + " FPS\n";
                    info.text += "Width : " + Math.ceil(info.dwWidth) + "\n";
                    info.text += "Heidth : " + Math.ceil(info.dwHeight) + "\n";
                    info.text += "Codec Video more info :\n";
                    if (info.tracks[i].strh.handler) {
                        info.text += "handler : " + info.tracks[i].strh.handler + "\n";
                    }
                    info.text += "Compressor : " + info.tracks[i].strf.biCompression + "\n";
                    info.text += "Depth (number of bits / pixel) : " + info.tracks[i].strf.biBitCount + "\n";
                }

                if (info.tracks[i].strh.Typet == 'auds') {
                    info.text += "Codec Audio more info :\n";
                    info.text += "handler : 0x" + info.tracks[i].strf.wFormatTag.toString(16).toUpperCase() + "\n";
                        info.text += "Compressor : " + info.tracks[i].audiocodec[0] + "\n";
                    info.text += "Count of channels : " + info.tracks[i].strf.nChannels + "\n";
                    info.text += "SampleRate : " + info.tracks[i].strf.nSamplesPerSec + "\n";
                }
                info.text += "\n";
            }
            return info.text;
        }


onmessage = function(event) {

  var file = event.data;
    if ((file.type == 'video/x-msvideo') || (file.type == 'video/avi') || (file.type == 'video/msvideo')){ 
        avi(file, function(err, info) {
          if (err) {
            console.log('error : ' + err);
            postMessage({
              'data' : 'error : ' + err
            });
          } else {
            sortie_texte = human_reading(info);
            postMessage({
              'data' : sortie_texte
            });
            //console.log(sortie_texte);
          }
        });
    } else {
        postMessage({'data' : 'nop'});
    }    
  }