/**
 * AVIInfo 
 * v 1.0   2016/04/17 
 *
 *       Documentation :
 *              http://www.alexander-noe.com/video/documentation/avi.pdf
 *              https://github.com/loarabia/ManagedMediaHelpers/blob/master/MediaParsers.Desktop/MpegLayer3WaveFormat.cs (dont' used here but ... who knows ?)
 *              http://www.jmcgowan.com/odmlff2.pdf
 *              https://www.opennet.ru/docs/formats/avi.txt
 *              https://msdn.microsoft.com/fr-fr/library/windows/desktop/dd390970%28v=vs.85%29.aspx
 *              https://msdn.microsoft.com/en-us/library/windows/desktop/dd317599%28v=vs.85%29.aspx
 */
"use strict";

var avi = function(opts, withmovis, cb) {
    var info = {};
    var atoms;
    var withmovis;
    var options = {
        type: 'uri',
    };
    if (!cb){
        cb = withmovis;
        withmovis = false;              // by default found sizes of stream by indx / idx1 and others indexes because it's more quickly than by readding each frame
    }
    if (typeof opts === 'string') {
        opts = {
            file: opts,
            type: 'uri'
        };
    } else 
    /******************************************************************************************************
               Can't be good for workers : they don't know anything about window !!
    if (typeof window !== 'undefined' && window.File && opts instanceof window.File)
    ********************************************************************************************************/
            {
        opts = {
            file: opts,
            type: 'file'
        };
        info.withmovis = withmovis;
        info.filesize = opts.file.size;
        info.filename = opts.file.name;
        info.filedate = opts.file.lastModifiedDate;
        info.tracks=[];
        info.JUNKS=[];
        info.cb=cb;
    }
    for (var k in opts) {
        options[k] = opts[k];
    }

    if (!options.file) {
        return cb('No file was set');
    }

    /******************************************************************************************************
               Can't be good for workers : they don't know anything about window !!
    if (options.type === 'file') {
        if (typeof window === 'undefined' || !window.File || !window.FileReader || typeof ArrayBuffer === 'undefined') {
            return cb('Browser does not have support for the File API and/or ArrayBuffers');
        }
    } else if (options.type === 'local') {
        if (typeof require !== 'function') {
            return cb('Local paths may not be read within a browser');
        }
        var fs = require('fs');
    } else {} /* Buffer Utitlities */
    /******************************************************************************************************/

    var AVIRiff = {};
    AVIRiff.parse = function(handle, callback) {
            /********************************************** that was a pretty good idea ... Helas ! See down
            Array.prototype.max = function() {
                return Math.max.apply(null, this);
            };

            Array.prototype.min = function() {
                return Math.min.apply(null, this);
            }
            ***********************************************************************************************/
            var xTagsAudio =   {
                    '0' :['Unknown,,,'],
                    '1' :['PCM,PCM,Microsoft PCM,http://www.microsoft.com/windows/'],
                    '2' :['ADPCM,ADPCM,Microsoft ADPCM,http://www.microsoft.com/windows/'],
                    '3' :['PCM,PCM,IEEE FLOAT,http://www.microsoft.com/windows/'],
                    '4' :['VSELP,,Compaq VSELP,'],
                    '5' :['CVSD,,IBM CVSD,'],
                    '6' :['A-Law,ADPCM,CCITT A-Law,http://www.microsoft.com/windows/'],
                    '7' :['U-Law,ADPCM,CCITT U-Law,http://www.microsoft.com/windows/'],
                    '8' :['DTS,DTS,,'],
                    '9' :['DRM,,Microsoft,'],
                    'A' :['WMSpeech,,,'],
                    'C' :['MPEG2 5.1,,MPEG2 5.1,'],
                    '10' :['ADPCM,ADPCM,OKI ADPCM,'],
                    '11' :['ADPCM,ADPCM,Intel ADPCM,'],
                    '12' :['ADPCM,ADPCM,Mediaspace (Videologic) ADPCM,'],
                    '13' :['ADPCM,ADPCM,Sierra ADPCM,'],
                    '14' :['ADPCM,ADPCM,Antex G723 ADPCM,'],
                    '15' :['STD,,DSP solutions Digi-STD,'],
                    '16' :['FIX,,DSP solutions Digi-FIX,'],
                    '17' :['ADPCM,ADPCM,Dialogic-OKI ADPCM,http://www.microsoft.com/windows/'],
                    '18' :['ADPCM,ADPCM,,'],
                    '19' :['CU,,HP CU_CODEC,'],
                    '1A' :['Dynamic Voice,,HP,'],
                    '20' :['ADPCM,ADPCM,Yamaha ADPCM,'],
                    '21' :['SONARC,,Speech Compression SONARC,'],
                    '22' :['Truespeech,,DSP Group TrueSpeech,http://www.microsoft.com/windows/'],
                    '23' :['SC1,,Echo Speech SC1,'],
                    '24' :['AF36,,Virtual Music AudioFile 36,'],
                    '25' :['APTX,,Audio Processing Technology X,'],
                    '26' :['AF10,,Virtual Music AudioFile 10,'],
                    '27' :['Prosody 1612,,Aculab plc Prosody 1612,'],
                    '28' :['LRC,,Merging Technologies LRC,'],
                    '30' :['AC2,,Dolby Laboratories AC2,'],
                    '31' :['GSM 6.10,,Microsoft GSM 6.10,http://www.microsoft.com/windows/'],
                    '32' :['MSAUDIO,,Microsoft Audio,'],
                    '33' :['ADPCM,ADPCM,Antex ADPCM,'],
                    '34' :['VQLPC,,Control Resources VQLPC,'],
                    '35' :['REAL,,DSP Solutions Digi-REAL,'],
                    '36' :['ADPCM,ADPCM,DSP Solutions Digi-ADPCM,'],
                    '37' :['CR10,,Control Resources 10,'],
                    '38' :['ADPCM,ADPCM,Natural MicroSystems VBX ADPCM,'],
                    '39' :['ADPCM,ADPCM,Crystal Semiconductor IMA ADPCM,'],
                    '3A' :['SC3,,Echo Speech SC3,'],
                    '3B' :['ADPCM,,Rockwell ADPCM,'],
                    '3C' :['DigiTalk,,Rockwell DigiTalk,'],
                    '3D' :['Xebec,,Xebec Multimedia Solutions,'],
                    '40' :['ADPCM,ADPCM,Antex Electronics G721 ADPCM,'],
                    '41' :['CELP,,Antex Electronics G728 CELP,'],
                    '42' :['G.723.1,,Microsoft G.723.1,http://www.microsoft.com/windows/'],
                    '42' :['ADPCM,,IBM,'],
                    '45' :['ADPCM,ADPCM,Microsoft G.726,http://www.microsoft.com/windows/'],
                    '50' :['MPEG-1/2 L1,MPEG-1,,http://www.iis.fraunhofer.de/amm/index.html'],
                    '51' :['MPEG-1/2 L2,MPEG-1,,http://www.iis.fraunhofer.de/amm/index.html'],
                    '52' :['RT24,,InSoft, Inc.,'],
                    '53' :['PAC,,InSoft, Inc.,'],
                    '55' :['MPEG-1/2 L3,MPEG-1,MPEG-1 or 2 layer 3,http://www.iis.fraunhofer.de/amm/index.html'],
                    '59' :['G723,,Lucent G723,'],
                    '60' :['Cirrus,,Cirrus Logic,'],
                    '61' :['PCM,,ESS Technology PCM,'],
                    '62' :['Voxware,,,'],
                    '63' :['ATRAC,,Canopus ATRAC,'],
                    '64' :['ADPCM,ADPCM,APICOM G726 ADPCM,'],
                    '65' :['ADPCM,ADPCM,APICOM G722 ADPCM,'],
                    '66' :['DSAT,,Microsoft DSAT,'],
                    '67' :['DSAT Display,,Microsoft DSAT DISPLAY,'],
                    '69' :['BYTE_ALIGNED,,Voxware BYTE_ALIGNED,http://www.voxware.com/'],
                    '70' :['AC8,,Voxware AC8,http://www.voxware.com/'],
                    '71' :['AC10,,Voxware AC10,http://www.voxware.com/'],
                    '72' :['AC16,,Voxware AC16,http://www.voxware.com/'],
                    '73' :['AC20,,Voxware AC20,http://www.voxware.com/'],
                    '74' :['RT24,,Voxware RT24 (MetaVoice),http://www.voxware.com/'],
                    '75' :['RT29,,Voxware RT29 (MetaSound),http://www.voxware.com/'],
                    '76' :['RT29HW,,Voxware RT29HW,http://www.voxware.com/'],
                    '77' :['VR12,,Voxware VR12,http://www.voxware.com/'],
                    '78' :['VR18,,Voxware VR18,http://www.voxware.com/'],
                    '79' :['TQ40,,Voxware TQ40,http://www.voxware.com/'],
                    '7A' :['SC3,,Voxware,'],
                    '7B' :['SC3,,Voxware,'],
                    '80' :['Softsound,,,'],
                    '81' :['TQ60,,Voxware TQ60,http://www.voxware.com/'],
                    '82' :['MSRT24,,Microsoft MSRT24,'],
                    '83' :['G729A,,AT&T G729A,'],
                    '84' :['MVI_MVI2,,Motion Pixels MVI_MVI2,'],
                    '85' :['ADPCM,ADPCM,DataFusion Systems (Pty) G726,'],
                    '86' :['GSM6.10,,DataFusion Systems (Pty) GSM6.10,'],
                    '88' :['ISI AUDIO,,Iterated Systems AUDIO,'],
                    '89' :['Onlive,,OnLive! Technologies,'],
                    '8A' :['SX20,,Multitude,'],
                    '8B' :['ADPCM,ADPCM,Infocom ITS A/S,'],
                    '8C' :['G.729,,Convedia Corporation,'],
                    '91' :['SBC24,,Siemens Business Communications Sys 24,'],
                    '92' :['AC3 SPDIF,,Sonic Foundry AC3 SPDIF,'],
                    '93' :['G723,,MediaSonic G723,'],
                    '94' :['Prosody 8KBPS,,Aculab plc Prosody 8KBPS,'],
                    '97' :['ADPCM,ADPCM,ZyXEL Communications ADPCM,'],
                    '98' :['LPCBB,,Philips Speech Processing LPCBB,'],
                    '99' :['Packed,,Studer Professional Audio AG Packed,'],
                    'A0' :['PHONYTALK,,Malden Electronics PHONYTALK,'],
                    'A1' :['GSM,,Racal Recorders,'],
                    'A2' :['G.720a,,Racal Recorders,'],
                    'A3' :['G.723.1,,Racal Recorders,'],
                    'A4' :['ACELP,,Racal Recorders,'],
                    'B0' :['AAC,AAC,NEC Corporation,'],
                    'FF' :['AAC,AAC,,'],
                    '100' :['ADPCM,ADPCM,,'],
                    '101' :['IRAT,,BeCubed IRAT,'],
                    '102' :[',,IBM A-law,'],
                    '103' :[',,IBM AVC ADPCM,'],
                    '111' :['G723,,Vivo G723,'],
                    '112' :['SIREN,,Vivo SIREN,'],
                    '120' :['CELP,,Philips Speech Processing,'],
                    '121' :['Grundig,,Philips Speech Processing,'],
                    '123' :['G723,,Digital Equipment Corporation (DEC) G723,'],
                    '125' :['ADPCM,ADPCM,,'],
                    '130' :['ACEPL,,Sipro ACEPL.net,http://dividix.host.sk'],
                    '131' :['ACELP4800,,Sipro ACELP4800,'],
                    '132' :['ACELP8V3,,Sipro ACELP8V3,'],
                    '133' :['G729,,Sipro G729,'],
                    '134' :['G729,,Sipro G729A,'],
                    '135' :['KELVIN,,Sipro KELVIN,'],
                    '135' :['AMR,,VoiceAge Corporation,'],
                    '140' :['ADPCM,ADPCM,Dictaphone Corporation G726 ADPCM,'],
                    '140' :['CELP68,,Dictaphone Corporation,'],
                    '140' :['CELP54,,Dictaphone Corporation,'],
                    '150' :['PureVoice,,Qualcomm PUREVOICE,'],
                    '151' :['HalfRate,,Qualcomm HALFRATE,'],
                    '155' :['TUBGSM,,Ring Zero Systems TUBGSM,'],
                    '160' :['WMA1,,Windows Media Audio 1,http://www.microsoft.com/windows/windowsmedia/format/codecdownload.aspx'],
                    '161' :['WMA2,,Windows Media Audio 2,http://www.microsoft.com/windows/windowsmedia/format/codecdownload.aspx'],
                    '162' :['WMA3,,Windows Media Audio 3,http://www.microsoft.com/windows/windowsmedia/format/codecdownload.aspx'],
                    '163' :['WMA Lossless,,Windows Media Audio 3,http://www.microsoft.com/windows/windowsmedia/format/codecdownload.aspx'],
                    '163' :['WMA Pro,,WMA Pro over S/PDIF,'],
                    '170' :['ADPCM,ADPCM,Unisys Nap ADPCM,'],
                    '171' :['U-Law,ADPCM,Unisys Nap U-law,'],
                    '172' :['A-Law,ADPCM,Unisys Nap A-law,'],
                    '173' :['16K,,Unisys Nap 16K,'],
                    '174' :['G.700,,SyCom Technologies,'],
                    '175' :['ADPCM,ADPCM,SyCom Technologies,'],
                    '176' :['CELP54,,SyCom Technologies,'],
                    '177' :['CELP68,,SyCom Technologies,'],
                    '178' :['ADPCM,ADPCM,Knowledge Adventure, Inc.,'],
                    '180' :['AAC,,Fraunhofer IIS,'],
                    '190' :['DTS,,,'],
                    '200' :['ADPCM,ADPCM,Creative Labs ADPCM,'],
                    '202' :['FastSpeech8,,Creative Labs Fast Speech 8,'],
                    '203' :['FastSpeech10,,Creative Labs Fast Speech 10,'],
                    '210' :['ADPCM,ADPCM,UHER informatic GmbH ADPCM,'],
                    '215' :[',,Ulead DV ACM,'],
                    '216' :[',,Ulead DV ACM,'],
                    '220' :['QuaterDeck,,Quarterdeck,'],
                    '230' :['VC,,I-link VC,'],
                    '240' :['RAW_SPORT,,Aureal RAW_SPORT,'],
                    '241' :['AC3,,ESST AC3,'],
                    '250' :['HSX,,Interactive Products, Inc. (IPI) HSX,'],
                    '251' :['RPELP,,Interactive Products, Inc. (IPI) RPELP,'],
                    '255' :['AAC LC'],
                    '260' :['CS2,,Consistent Software CS2,'],
                    '270' :['SCX,,Sony,'],
                    '271' :['SCY,,Sony,'],
                    '272' :['Atrac3,,Sony,'],
                    '273' :['SPC,,Sony,'],
                    '280' :['Telum,,,'],
                    '281' :['TelumIA,,,'],
                    '285' :['ADPCM,ADPCM,Norcom Voice Systems,'],
                    '300' :['FM_TOWNS_SND,,Fujitsu FM_TOWNS_SND,'],
                    '350' :['Dev,,Micronas Semiconductors, Inc.,'],
                    '351' :['CELP833,,Micronas Semiconductors, Inc.,'],
                    '400' :['BTV_DIGITAL,,Brooktree (BTV) DIGITAL,'],
                    '401' :['Music Coder,,Intel Music Coder,http://www.intel.com/'],
                    '402' :['IAC2,,Ligos IAC2,http://www.ligos.com'],
                    '450' :['Qdesign,,QDesign Music,'],
                    '500' :['VP7,,On2,'],
                    '501' :['VP6,,On2,'],
                    '680' :['VMPCM,,AT&T VME_VMPCM,'],
                    '681' :['TPC,,AT&T TPC,'],
                    '700' :['YMPEG,,YMPEG Alpha,'],
                    '8AE' :['LiteWave,,ClearJump LiteWave,'],
                    'AAC' :['AAC,AAC,,'],
                    '1000' :['GSM,,Ing C. Olivetti & C., S.p.A. GSM,'],
                    '1001' :['ADPCM,ADPCM,Ing C. Olivetti & C., S.p.A. ADPCM,'],
                    '1002' :['CELP,,Ing C. Olivetti & C., S.p.A. CELP,'],
                    '1003' :['SBC,,Ing C. Olivetti & C., S.p.A. SBC,'],
                    '1004' :['OPR,,Ing C. Olivetti & C., S.p.A. OPR,'],
                    '1100' :['LH_CODEC,,Lernout & Hauspie Codec,'],
                    '1101' :['CELP,,Lernout & Hauspie CELP 4.8 kb/s,http://www.microsoft.com/windows/'],
                    '1102' :['SBC,,Lernout & Hauspie SBC 8 kb/s,http://www.microsoft.com/windows/'],
                    '1103' :['SBC,,Lernout & Hauspie SBC 12 kb/s,http://www.microsoft.com/windows/'],
                    '1104' :['SBC,,Lernout & Hauspie SBC 16 kb/s,http://www.microsoft.com/windows/'],
                    '1400' :['NORRIS,,Norris Communications, Inc.,'],
                    '1401' :['ISIAUDIO,,ISIAudio,'],
                    '1500' :['MUSICOMPRESS,,Soundspace Music Compression,'],
                    '181C' :['RT24,,VoxWare RT24 speech codec,'],
                    '181E' :['AX24000P,,Lucent elemedia AX24000P Music codec,'],
                    '1971' :['SonicFoundry,,Lossless,'],
                    '1C03' :['ADPCM,ADPCM,Lucent SX5363S G.723 compliant codec,'],
                    '1C07' :['SX8300P,,Lucent SX8300P speech codec,'],
                    '1C0C' :['ADPCM,ADPCM,Lucent SX5363S G.723 compliant codec,'],
                    '1F03' :['DigiTalk,,CUseeMe DigiTalk (ex-Rocwell),'],
                    '1FC4' :['ALF2CD,,NCT Soft ALF2CD ACM,'],
                    '2000' :['AC3,AC3,Dolby AC3,'],
                    '2001' :['DTS,DTS,Digital Theater Systems,'],
                    '2002' :['Real Audio 1,,RealAudio 1/2 14.4,'],
                    '2003' :['Real Audio 1,,RealAudio 1/2 28.8,'],
                    '2004' :['Real Audio 2,,RealAudio G2/8 Cook (low bitrate),'],
                    '2005' :['Real Audio 3,,RealAudio 3/4/5 Music (DNET),'],
                    '2006' :['AAC,AAC,RealAudio 10 AAC (RAAC),'],
                    '2007' :['AAC+,AAC,RealAudio 10 AAC+ (RACP),'],
                    '3313' :['AviSynth,,makeAVIS (fake AVI sound from AviSynth scripts),'],
                    '4143' :['AAC,AAC,Divio MPEG-4 AAC audio,'],
                    '4201' :['Nokia,,,'],
                    '4243' :['ADPCM,ADPCM,G726,'],
                    '43AC' :['Lead Speech,,,'],
                    '564C' :['Lead Vorbis,,,'],
                    '566F' :['Vorbis,Vorbis,,http://www.vorbis.com'],
                    '5756' :['WavPack,,,http://www.wavpack.com/'],
                    '674F' :['Vorbis,Vorbis,Mode 1,http://www.vorbis.com'],
                    '6750' :['Vorbis,Vorbis,Mode 2,http://www.vorbis.com'],
                    '6751' :['Vorbis,Vorbis,Mode 3,http://www.vorbis.com'],
                    '676F' :['Vorbis,Vorbis,Mode 1+,http://www.vorbis.com'],
                    '6770' :['Vorbis,Vorbis,Mode 2+,http://www.vorbis.com'],
                    '6771' :['Vorbis,Vorbis,Mode 2+,http://www.vorbis.com'],
                    '7A21' :['AMR,,GSM-AMR (CBR, no SID),http://www.microsoft.com'],
                    '7A22' :['AMR,,GSM-AMR (VBR, including SID),http://www.microsoft.com'],
                    'A100' :['G723.1,,,'],
                    'A101' :['AVQSBC,,,'],
                    'A102' :['ODSBC,,,'],
                    'A103' :['G729A,,,'],
                    'A104' :['AMR-WB,,,'],
                    'A105' :['ADPCM,ADPCM,G726,'],
                    'A106' :['AAC,,,'],
                    'A107' :['ADPCM,ADPCM,G726,'],
                    'A109' :['Speex,,,http://www.speex.org/'],
                    'DFAC' :['FrameServer,,DebugMode SonicFoundry Vegas FrameServer ACM Codec,'],
                    'F1AC' :['FLAC,,Free Lossless Audio Codec FLAC,'],
                    'FFFE' :['PCM,PCM,Extensible wave format,'],
                    'FFFF' :['In Development,,In Development / Unregistered,']
                };

            var infotags =   {
                    'IARL' : "Archival Location",
                    'IART' : "Artist",
                    'ICMS' : "Commissioned by",
                    'ICMT' : "Comments",
                    'ICOP' : "Copyright",
                    'ICRD' : "Creation date",
                    'ICRP' : "Cropped",
                    'IDIM' : "Dimensions",
                    'IDPI' : "Dots Per Inch",
                    'IENG' : "Engineer",
                    'IGNR' : "Genre",
                    'IKEY' : "Keywords",
                    'ILGT' : "Lightness",
                    'IMED' : "Medium",
                    'INAM' : "Name",
                    'IPLT' : "Palette Setting",
                    'IPRD' : "Product",
                    'ISBJ' : "Subject",
                    'ISFT' : "Software"
                };    


            // dwFlags in idx1
            var AVIIF_LIST      = 0x00000001;          // chunk is a 'LIST'
            var AVIIF_KEYFRAME  = 0x00000010;          // this frame is a key frame.
            var AVIIF_FIRSTPART = 0x00000020;          // this frame is the start of a partial frame.
            var AVIIF_LASTPART  = 0x00000040;          // this frame is the end of a partial frame.
            var AVIIF_MIDPART   = 0x00000060;          // (AVIIF_LASTPART|AVIIF_FIRSTPART)
            var AVIIF_NOTIME    = 0x00000100;          // this frame doesn't take any time
            var AVIIF_COMPUSE   = 0x0FFF0000;          // these bits are for compressor use 
            var aviSIZE_FILTER  = 0xCFFFFFFF;          // to filter real size of Chunk
            var aviKEYF_FILTER  = 0x10000000;          // to filter Key Frame

            // dwFlags in avih
            var AVIF_HASINDEX       = 0x00000010;      // Index (idx1 atom) at end of file?
            var AVIF_MUSTUSEINDEX   = 0x00000020;
            var AVIF_ISINTERLEAVED  = 0x00000100;
            var AVIF_WASCAPTUREFILE = 0x00010000;
            var AVIF_COPYRIGHTED    = 0x00020000; 

            // bIndexType in indx (bIndexSubtype must be 0)
            var AVI_INDEX_OF_INDEXES = 0x00;           // each entry of the array points to an index chunk
            var AVI_INDEX_OF_CHUNKS  = 0x01;           // each entry of the array points to a chunk in the file
            var AVI_INDEX_IS_DATA    = 0x80;           // each entry of the array is really data
            // if bIndexSubtype = 0x01 then 


            var BuffSize=16*16*1024;                   // could be adapted : size of standard buffer used in this module.


            function litCar(buffer, pos, nb){
                var id = [];
                for (var i = pos; i < pos+nb; i++) {
                    id.push(String.fromCharCode(buffer.getUint8(i)));
                }
                return id.join("");
            }

            function readBytes(nbB, offset, cb) {
                handle.read(nbB , offset , function retrB(err, buffer) {
                    if (err){
                        cb(err);
                    } else {
                        var dv = new DataView(buffer);
                        cb(null,dv);
                    }
                });
            }

            function purgeboxesJUNK(Boxes){    

                for (var i=info.JUNKS.length-1; i>-1; i--){
                    var ascendance = info.JUNKS[i].split("-");
                    var myBoxe=Boxes[0];
                    for (var k=1; k<ascendance.length-1; k++){
                        myBoxe=myBoxe.children[ascendance[k]]; 
                    }
                    var arrayBox=[];
                    for (var u=0; u<myBoxe.children.length; u++){
                        if (u != ascendance[ascendance.length-1]) arrayBox.push(myBoxe.children[u]);
                    }
                    myBoxe.children=[];
                    for (var v=0; v<arrayBox.length; v++) myBoxe.children.push(arrayBox[v]);
                }
                return Boxes;
            }

            function parseodml(cb){
                if (info.isodml > -1){
                    var offset=atoms[0].children[0].children[info.isodml].children[0].off+8;
                    var nbB=atoms[0].children[0].children[info.isodml].children[0].len;
                    readBytes(4, offset, function(err,buffer){
                        if (err){
                            cb(err);
                        } else {
                            info.odmlLength=buffer.getUint32(0, true);
                            cb(null,atoms);
                        }
                    });
                } else cb(null,atoms);
            }

            function traiteBufferSI(ind, offsetbase, nbloop, lastloop, BuffSize, indexinfo, Bsicb){
                if (ind < nbloop){
                    var offset = offsetbase + (ind * BuffSize);
                    readBytes(BuffSize, offset,function(err,buff){
                        if (err){
                            cb(err);
                        } else {
                            for (var u=0; u< (BuffSize / 8); u++){
                                var dwSizeChunk = buff.getUint32((8*u) + 4,true);
                                info.tracks[indexinfo].FramesCount++;
                                var testBit0 = dwSizeChunk>>31;
                                var realSizeChunk = dwSizeChunk;
                                if (testBit0 != 0){
                                    realSizeChunk = dwSizeChunk % 0x10000000;
                                }    
                                if ((realSizeChunk % 2) == 1) realSizeChunk++;
                                info.tracks[indexinfo].Totalsize += realSizeChunk;
                                if ((dwSizeChunk & aviKEYF_FILTER) > 0) info.tracks[indexinfo].keyframesCount ++;
                                if (info.tracks[indexinfo].minSize > realSizeChunk) info.tracks[indexinfo].minSize = realSizeChunk;
                                if (info.tracks[indexinfo].maxSize < realSizeChunk) info.tracks[indexinfo].maxSize = realSizeChunk; 
                            }
                            ind++;
                            traiteBufferSI(ind, offsetbase, nbloop, lastloop, BuffSize, indexinfo, Bsicb);
                        }
                    });
                } else {
                    if ((ind == nbloop) && (lastloop > 0)){
                        var offset = offsetbase + (ind * BuffSize);
                        readBytes(lastloop, offset,function(err,buff){
                            if (err){
                                Bsicb(err);
                            } else {
                                for (var u=0; u< (lastloop / 8); u++){
                                    var dwSizeChunk = buff.getUint32((8*u) + 4,true);
                                    info.tracks[indexinfo].FramesCount++;
                                    var testBit0 = dwSizeChunk>>31;
                                    var realSizeChunk = dwSizeChunk;
                                    if (testBit0 != 0){
                                        realSizeChunk = dwSizeChunk % 0x10000000;
                                    }    
                                    if ((realSizeChunk % 2) == 1) realSizeChunk++;
                                    info.tracks[indexinfo].Totalsize += realSizeChunk;
                                    if ((dwSizeChunk & aviKEYF_FILTER) > 0) info.tracks[indexinfo].keyframesCount ++;
                                    if (info.tracks[indexinfo].minSize > realSizeChunk) info.tracks[indexinfo].minSize = realSizeChunk;
                                    if (info.tracks[indexinfo].maxSize < realSizeChunk) info.tracks[indexinfo].maxSize = realSizeChunk; 
                                }
                                Bsicb(null, atoms);
                            }
                        });
                    } else {
                        Bsicb(null,atoms);
                    }
                }            
            }    

            function traiteBuffer(ind, offsetbase, nbloop, lastloop, BuffSize, ncb){   // not for OPEN DML, just for old AVI
                if (ind < nbloop){
                    var offset = offsetbase + (ind * BuffSize);
                    readBytes(BuffSize, offset,function retrB_in_traiteBuffer(err,buff){
                        if (err){
                            ncb(err);
                        } else {
                            for (var u=0; u< (BuffSize / 16); u++){
                                var trackIndex = parseInt(litCar(buff,16*u,2));
                                var dwflags = buff.getUint32((16*u) + 4,true);
                                var dwSizeChunk = buff.getUint32((16*u) + 12,true);
                                info.tracks[trackIndex].FramesCount ++;
                                info.tracks[trackIndex].Totalsize += (dwSizeChunk & aviSIZE_FILTER);
                                if ((dwflags & AVIIF_NOTIME) == 0){
                                    if (info.tracks[trackIndex].minSize > (dwSizeChunk & aviSIZE_FILTER)) info.tracks[trackIndex].minSize=(dwSizeChunk & aviSIZE_FILTER);
                                    if (info.tracks[trackIndex].maxSize < (dwSizeChunk & aviSIZE_FILTER)) info.tracks[trackIndex].maxSize=(dwSizeChunk & aviSIZE_FILTER); 
                                    if ((dwflags & AVIIF_KEYFRAME) > 0) info.tracks[trackIndex].keyframesCount ++;
                                }    
                            }
                            ind++;
                            traiteBuffer(ind, offsetbase, nbloop, lastloop, BuffSize, ncb);
                        }
                    });
                } else {
                    if ((ind == nbloop) && (lastloop > 0)){
                        var offset = offsetbase + (ind * BuffSize); 
                        readBytes(lastloop, offset,function retrB_in_traiteBufferLast(err,buff){
                            if (err){
                                ncb(err);
                            } else {
                                for (var u=0; u< (lastloop / 16); u++){
                                    var trackIndex = parseInt(litCar(buff,16*u,2));
                                    var dwflags = buff.getUint32((16*u) + 4,true);
                                    var dwSizeChunk = buff.getUint32((16*u) + 12,true);
                                    info.tracks[trackIndex].FramesCount ++;
                                    info.tracks[trackIndex].Totalsize += (dwSizeChunk & aviSIZE_FILTER);
                                    if ((dwflags & AVIIF_NOTIME) == 0){
                                        if (info.tracks[trackIndex].minSize > (dwSizeChunk & aviSIZE_FILTER)) info.tracks[trackIndex].minSize=(dwSizeChunk & aviSIZE_FILTER);
                                        if (info.tracks[trackIndex].maxSize < (dwSizeChunk & aviSIZE_FILTER)) info.tracks[trackIndex].maxSize=(dwSizeChunk & aviSIZE_FILTER); 
                                        if ((dwflags & AVIIF_KEYFRAME) > 0) info.tracks[trackIndex].keyframesCount ++;
                                    }    
                                }
                                ncb(null, atoms);
                            }
                        });   
                    } else {
                        ncb(null, atoms);
                    }
                }
            }

            function processStandardIndex(ind, SIoffset, sicb){           // SIoffset : real offset in the file - no loop !
                readBytes(32, SIoffset,function(err,buff){
                    if (err){
                        sicb(err);
                    } else {
                        var obj={};
                        // read the Super Index chunk
                        obj.FourCC = litCar(buff,0,4);                    // must be 'ix' + ind (for debugging)
                        obj.cb = buff.getUint32(4,true);                  // size 
                        obj.wLongsPerEntry = buff.getUint16(8,true);      // must be 2  (for debugging) 
                        obj.bIndexSubType = buff.getUint8(10,true);       // must be 0
                        obj.bIndexType = buff.getUint8(11,true);          // must be 1 (AVI_INDEX_OF_CHUNKS)
                        obj.nEntriesInUse = buff.getUint32(12,true);      // = (cb-32) / 8  (for debugging) 
                        obj.dwChunkId = litCar(buff,16,4);                // must be 'ix' + ind  (for debugging)  
                        obj.nbSamples = 0;
                        obj.qwBaseOffset = (buff.getUint32(24,true)<<32) + buff.getUint32(20,true);  //(for debugging)
                        var nbloop = Math.floor((obj.cb - 32) / BuffSize);
                        var offsetbase = SIoffset+32;
                        var lastloop = (obj.cb - 32) % BuffSize;
                        traiteBufferSI(0, offsetbase, nbloop, lastloop, BuffSize, ind, function(err,atoms){
                            if (err){
                                sicb(err);
                            } else {
                                sicb(null, atoms);
                            }
                        });
                    }
                });    
            }

            function processindx(k, ind, indx, ccb){                      // bIndexType = 0 <=> AVI_INDEX_OF_INDEXES
                if (k < indx.nEntriesInUse){
                    var SIoffset=indx.entries[k].qWOffset;                // points on Standard Index
                    processStandardIndex(ind, SIoffset, function(err,atoms){
                        if (err){
                            ccb(err);
                        } else {
                            k++;
                            processindx(k, ind, indx, ccb);
                        }
                    });
                } else {
                    ccb(null, atoms);
                }
            }

            function dealwithindx(ind, ncb){
                // SuperIndexde ind
                var offset=atoms[0].children[0].children[info.tracks[ind].ind].children[info.tracks[ind].indxind].off +8;
                var nbB=atoms[0].children[0].children[info.tracks[ind].ind].children[info.tracks[ind].indxind].len;
                readBytes(nbB, offset,function retrB_indealwith(err,buff){
                    if (err){
                        ncb(err);
                    } else {
                        info.tracks[ind].indx={};
                        var obj={};
                        // read the Super Index chunk
                        obj.wLongsPerEntry = buff.getUint16(0,true);
                        obj.bIndexSubType = buff.getUint8(2,true);
                        obj.bIndexType = buff.getUint8(3,true);
                        obj.nEntriesInUse = buff.getUint32(4,true);
                        obj.dwChunkId = litCar(buff,8,4); 
                        obj.nbSamples = 0;
                        obj.entries=[];
                        if (obj.bIndexType == AVI_INDEX_OF_INDEXES){                      // bIndexType = 0 <=> AVI_INDEX_OF_INDEXES <=> wLongsPerEntry = 4
                            // 3 dwords reserved
                            for (var j=0; j<obj.nEntriesInUse; j++){
                                var obje = {};
                                obje.qWOffset = (buff.getUint32(28+(j*16),true)<<32) + buff.getUint32(24+(j*16),true);
                                obje.dwSize = buff.getUint32(32+(j*16),true);
                                obje.dwDuration = buff.getUint32(36+(j*16),true);
                                obj.nbSamples += obje.dwDuration;                        // in the end : info.tracks[ind].indx.nbSamples must be = info.tracks[ind].strh.dwLength !
                                obj.entries.push(obje);
                            }
                            info.tracks[ind].indx=obj;
                            processindx(0,ind, info.tracks[ind].indx, function retprocessindx(err,atoms){
                                if (err){
                                    ncb(err);
                                } else {
                                    if (ind < info.tracks.length-1){
                                        ind++;
                                        dealwithindx(ind, ncb);
                                    } else {
                                        ncb(null,atoms); 
                                    }       
                                }
                            }); 
                        } else {    // obj.wLongsPerEntry = 2
                            if (bIndexType == AVI_INDEX_OF_CHUNKS){                       // bIndexType = 1 <=> AVI_INDEX_OF_CHUNKS <=> wLongsPerEntry = 2
                                var offset=atoms[0].children[0].children[info.tracks[ind].ind].children[info.tracks[ind].indxind].off;
                                processStandardIndex(ind,offset, function ret_processSI_indealwidth(err,atoms){
                                    if (err){
                                        ncb(err);
                                    } else {
                                        if (ind < info.tracks.length-1){
                                            ind++;
                                            dealwithindx(ind, ncb);
                                        } else {
                                            ncb(null,atoms); 
                                        }       
                                    }
                                });
                            } else {                       // bIndexType = 80 <=> AVI_INDEX_IS_DATA <=> proceed with movi chunks
                                ncb(null,atoms);           // escaped ^^  (never meet but see dealmovi and readframe)
                            }
                        }
                    }
                });
            }

            function readframe(offset, nbB, nbBytesread, rrdf){
                readBytes(12,offset, function retrb_in_readframes(err,buff){
                    if (err){
                        rrdf(err);
                    } else {
                        if (litCar(buff,0,4) == 'LIST'){             // rec
                            info.tracks[0].keyframesCount++;
                            nbBytesread+= 12;    
                            readframe(offset+12, nbB, nbBytesread, rrdf);
                        } else {
                            if ((litCar(buff,2,2) != "wb") && (litCar(buff,2,2) != "dc") && (litCar(buff,2,2) != "db")){   // wb :  audio, dc : video compressed, db : video uncompressed
                               var truc=2;
                            }
                            if (litCar(buff,0,2) == 'ix'){           //     ON skip !! réservé au indx
                                var nbSI = buff.getUint32(4,true);
                                offset += nbSI + 8;
                                nbBytesread += nbSI + 8;
                                if (nbBytesread < nbB){
                                    readframe(offset, nbB, nbBytesread, rrdf);
                                } else {    
                                    rrdf(null, atoms);
                                }
                            } else {
                                var indtoupdate = parseInt(litCar(buff,0,2));
                                var dwChunkSize = buff.getUint32(4,true); 
                                if ((dwChunkSize % 2) == 1) dwChunkSize++;
                                nbBytesread += dwChunkSize + 8;
                                offset += dwChunkSize + 8; 
                                info.tracks[indtoupdate].FramesCount++;
                                info.tracks[indtoupdate].Totalsize += dwChunkSize;
                                if (info.tracks[indtoupdate].minSize > dwChunkSize) info.tracks[indtoupdate].minSize = dwChunkSize;
                                if (info.tracks[indtoupdate].maxSize < dwChunkSize) info.tracks[indtoupdate].maxSize = dwChunkSize; 
                                if (nbBytesread < nbB){
                                    readframe(offset, nbB, nbBytesread, rrdf);
                                } else {
                                    rrdf(null, atoms);
                                }
                            }
                        }
                    }
                });
            }

            function dealmovi(indm, rdm){
                var offset = atoms[indm].children[info.ismovi[indm]].off + 12;    // LIST of movi !
                var nbB    = atoms[indm].children[info.ismovi[indm]].len-4;
                var nbBytesread = 0;
                readframe(offset,nbB, nbBytesread, function retdealmovi(err,atoms){
                    if (err){
                        rdm(err);
                    } else {
                        if (indm < info.ismovi.length-1){
                            indm++;
                            dealmovi(indm, rdm);
                        } else {
                            rdm(null, atoms);
                        }    
                    }
                });
            }

            function sizebymovis(indice, sbmcb){
                dealmovi(0, function retdealmovi(err,atoms){
                    if (err){
                        sbmcb(err);
                    } else {
                        sbmcb(null, atoms);
                    }
                });
            }

            function parsesizes(atoms, withmovis, cb){
                if (withmovis){
                    // count sizes with movi(s)
                    sizebymovis(0, function retdealmovi(err,atoms){
                        if (err){
                            cb(err);
                        } else {
                            cb(null, atoms);
                        }
                    });
                } else {
                    if (!info.isOpenDML && info.AVIF_HASINDEX){       // more current
                        var offsetbase=atoms[0].children[info.isidx1].off+8;
                        var idx1length=atoms[0].children[info.isidx1].len;
                        var nbloop=Math.floor(idx1length / BuffSize);
                        var lastloop = idx1length % BuffSize;
                        var obj={Totalsize : 0, min : 0, max : 0, count : 0};
                        if (idx1length > 0){
                            traiteBuffer(0, offsetbase, nbloop, lastloop, BuffSize, function rettraiteBuffer(err,atoms){
                                if (err){
                                    cb(err);
                                } else {
                                    cb(null,atoms); 
                                }
                            });
                        }    
                    } else {
                        if (info.isOpenDML){
                                dealwithindx(0,function retdealwith_inparsesizes(err,atoms){
                                    if (err){
                                        cb(err);
                                    } else {
                                        cb(null,atoms);     
                                    }
                                });
                        } else {
                            // count sizes with movi(s) forced !
                            sizebymovis(0, function retdealmovi(err,atoms){
                                if (err){
                                    cb(err);
                                } else {
                                    cb(null, atoms);
                                }
                            });
                        }
                    } 
                }
            }

            function parsestrf(ind, atoms, cb){
                var indhdlr = info.tracks[ind].ind;
                var indstrf = info.tracks[ind].strfind;
                var nbB = atoms[0].children[0].children[indhdlr].children[indstrf].len;
                var offset = atoms[0].children[0].children[indhdlr].children[indstrf].off+8;
                readBytes(nbB, offset,function retrB_inparsestrf(err,buff){
                    if (err){
                        cb(err);
                    } else {
                        var obj={};
                        if (info.tracks[ind].strh.Typet == "vids"){
                            /**************************  BITMAPINFOHEADER structure ****************************************************************/
                            obj.biSize = buff.getUint32(0, true);
                            obj.biWidth = buff.getUint32(4, true);
                            obj.biHeight = buff.getUint32(8, true);
                            obj.biPlanes = buff.getUint16(12, true);
                            obj.biBitCount = buff.getUint16(14, true);
                            obj.biCompression = litCar(buff, 16, 4);
                            obj.biSizeImage = buff.getUint32(20, true); 
                            obj.biXPelsPerMeter = buff.getUint32(24, true);
                            obj.biYPelsPerMeter = buff.getUint32(28, true);
                            obj.biClrUsed = buff.getUint32(32, true);
                            obj.biClrImportant = buff.getUint32(36, true);
                            /**************************  end of BITMAPINFOHEADER structure *********************************************************/
                        }
                        if (info.tracks[ind].strh.Typet == "auds"){
                            /**************************  WAVEFORMATEX structure ********************************************************************/
                            obj.wFormatTag = buff.getUint16(0, true);           // format type
                            obj.nChannels = buff.getUint16(2, true);            // number of channels (i.e. mono, stereo...)
                            obj.nSamplesPerSec = buff.getUint32(4, true);       // sample rate
                            obj.nAvgBytesPerSec = buff.getUint32(8, true);      // for buffer estimation
                            obj.nBlockAlign = buff.getUint16(12, true);         // block size of data
                            obj.wBitsPerSample = buff.getUint16(14, true);      // Number of bits per sample of mono data
                            obj.cbSize = buff.getUint16(16, true);              // The count in bytes of the size of extra information (after cbSize) 
                            /***************************************** end of WAVEFORMATEX *********************************************************/
                            /*    don't bother of the rest if exists !  If cbSize>0 some more precisions for audio stream                          */ 
                        }  
                        info.tracks[ind].strf=obj; 
                        if (ind < info.tracks.length-1){
                            ind += 1;
                            parsestrf(ind, atoms, cb); 
                        } else {
                            cb(null, atoms);
                        }    
                    }
                });
            }

            function parsestrh(ind, atoms, cb){
                var indhdlr = info.tracks[ind].ind;
                var indstrh = info.tracks[ind].strhind;
                var nbB = atoms[0].children[0].children[indhdlr].children[indstrh].len;
                var offset = atoms[0].children[0].children[indhdlr].children[indstrh].off+8;
                readBytes(nbB, offset,function retrB_de_parsestrh(err,buffer){
                    if (err){
                        cb(err);
                    } else {
                        var obj = {};
                        obj.Typet = litCar(buffer, 0, 4);
                        obj.handler = litCar(buffer, 4, 4);
                        obj.dwFlags = buffer.getUint32(8, true);
                        obj.wPriority = buffer.getUint16(12, true);
                        var tmp = buffer.getUint16(14, true);
                        var chars = [];
                        chars[0] = (tmp >> 10) & 0x1F;
                        chars[1] = (tmp >> 5) & 0x1F;
                        chars[2] = (tmp) & 0x1F;
                        obj.wLanguage = String.fromCharCode(chars[0] + 0x60, chars[1] + 0x60, chars[2] + 0x60);
                        obj.dwInitialFrames = buffer.getUint32(16, true);
                        obj.dwScale = buffer.getUint32(20, true);
                        obj.dwRate = buffer.getUint32(24, true);
                        obj.dwStart = buffer.getUint32(28, true);
                        obj.dwLength = buffer.getUint32(32, true);
                        obj.dwSuggestedBufferSize = buffer.getUint32(36, true);
                        obj.dwQuality = buffer.getUint32(40, true);
                        obj.dwSampleSize = buffer.getUint32(42, true);
                        obj.rcFrame = {};
                        obj.rcFrame.Xorig = buffer.getUint16(46, true);
                        obj.rcFrame.Yorig = buffer.getUint16(48, true);
                        obj.rcFrame.width = buffer.getUint16(50, true);
                        obj.rcFrame.height = buffer.getUint16(52, true);
                        obj.dureeS = obj.dwLength * obj.dwScale / obj.dwRate;
                        info.tracks[ind].strh=obj;

                        if ((obj.Typet == 'vids') && (!info.dureeS)){
                            info.dureeS = obj.dwLength * obj.dwScale / obj.dwRate;
                        }
                        info
                        if (ind < info.tracks.length - 1){
                            ind += 1;
                            parsestrh(ind, atoms, cb);
                        } else { 
                            parsestrf(0, atoms, function retparsestrf_in_parsestrh(err,atoms){
                                if (err){
                                    cb(err);
                                } else {
                                    cb(null,atoms);
                                }
                            });
                        }      
                    }
                });
            }

            function parsehdlr(atoms,cb){
                parsestrh(0, atoms,function ret_parsestrh_in_parsehdlr(err,atoms){
                    if (err){
                        cb(err);
                    } else {
                        cb(null,atoms);
                    }
                });
            }

            function parseavih(offset, nbB, atoms, cb){
                readBytes(nbB, offset,function retrB_inparseavih(err,buffer){
                    if (err){
                        cb(err);
                    } else {
                        info.AVIF_HASINDEX = false;
                        info.AVIF_MUSTUSEINDEX = false;
                        info.AVIF_ISINTERLEAVED = false;
                        info.AVIF_WASCAPTUREFILE = false;
                        info.AVIF_COPYRIGHTED = false;
                        info.dwMicroSecPerFrame = buffer.getUint32(0, true);  
                        info.dwMaxBytesPerSec = buffer.getUint32(4, true);
                        info.dwPaddingGranularity = buffer.getUint32(8, true);
                        info.dwFlags = buffer.getUint32(12, true);
                        info.dwTotalFrames = buffer.getUint32(16, true);   // in the first RIFF-AVI !!
                        info.dwInitialFrames = buffer.getUint32(20, true);
                        info.dwStreams = buffer.getUint32(24, true);
                        info.dwSuggestedBufferSize = buffer.getUint32(28, true);
                        info.dwWidth = buffer.getUint32(32, true); 
                        info.dwHeight = buffer.getUint32(36, true); 
                        info.dwScale = buffer.getUint32(40, true); 
                        info.dwRate = buffer.getUint32(44, true); 
                        info.dwStart = buffer.getUint32(48, true);  
                        info.dwLength = buffer.getUint32(52, true); 
                        if ((info.dwFlags & AVIF_HASINDEX) > 0) info.AVIF_HASINDEX = true;
                        if ((info.dwFlags & AVIF_MUSTUSEINDEX) > 0) info.AVIF_MUSTUSEINDEX = true;
                        if ((info.dwFlags & AVIF_ISINTERLEAVED) > 0) info.AVIF_ISINTERLEAVED = true;
                        if ((info.dwFlags & AVIF_WASCAPTUREFILE) > 0) info.AVIF_WASCAPTUREFILE = true;
                        if ((info.dwFlags & AVIF_COPYRIGHTED) > 0) info.AVIF_COPYRIGHTED = true;
                        cb(null,atoms);
                    }
                });    
            }

            function parseinfo(picb){
                if (info.isINFO > -1){
                    var atominfo = atoms[0].children[info.isINFO];
                    info.swft = {offset : 0, length : 0, name : '' };
                    for (var j=0; j<atominfo.children.length; j++){
                        if (atominfo.children[j].name == 'ISFT'){
                            info.swft.offset = atominfo.children[j].off + 8;
                            info.swft.length = atominfo.children[j].len;
                        }
                    }
                    if (info.swft.offset > 0){
                        readBytes(info.swft.length, info.swft.offset, function(err,buffer){
                            if (err){
                                picb(err);
                            } else {
                                info.swft.name=litCar(buffer, 0, info.swft.length);
                                picb(null,atoms);    
                            }
                        });    
                    } else {
                        picb(null, atoms);
                    }
                } else {
                    picb(null, atoms);    
                }
            }

            function readAtoms(offset, ascendance, Boxes, racb){
                var ascendance, BoxeMere, atomname;

                if (!racb){
                    racb = Boxes;
                    Boxes=[]; 
                    var mere={};
                    mere.name = "OldMammy";
                    mere.offset = 0;
                    mere.len = info.filesize;
                    mere.Off = 0;
                    mere.children = [];
                    mere.nbread = 0;
                    Boxes.push(mere);
                }

                var myBoxe={};
                if (offset == info.filesize){
                    racb(null,Boxes);                                           // end !
                } else {
                    if (offset == info.filesize) racb(null, Boxes);             // OK ! End of search tree - Sortie de la boucle recherche d'arbre
                    if (offset+8 == info.filesize){                             // precaution !! Never meet but ?? Anyway ! Normalement, jamais rencontré mezokaou !?
                        // search mother 
                        readBytes(8, offset, function(err,buffer){
                            if (err){
                                racb(err);
                            } else {
                                BoxeMere = Boxes[0];
                                for (var k = 1; k < ascendance.length; k++) {
                                    BoxeMere = BoxeMere.children[ascendance[k]];
                                }
                                atomname=litCar(buffer, 0, 4);
                                var myBoxe={};
                                myBoxe.name=atomname;
                                myBoxe.off=Boxes[0].nbread;
                                myBoxe.len = 0;
                                BoxeMere.Children.push(myBoxe);
                                racb(null,Boxes);
                            } 
                        });
                    } else {                                                
                        readBytes(12, offset, function(err,buffer){             // So no risk therical ! Except last atom with 2 bytes length ??
                            if (err){
                                racb(err);
                            } else {
                                atomname=litCar(buffer, 0, 4);
                                if (atomname == "RIFF"){
                                    myBoxe.name=litCar(buffer, 8, 4);
                                    myBoxe.len=buffer.getUint32(4,true);
                                    myBoxe.ind=Boxes[0].children.length;
                                    myBoxe.children=[];
                                    myBoxe.nbread=0;
                                    myBoxe.off = Boxes[0].nbread;
                                    BoxeMere = Boxes[0];
                                    ascendance = [0];
                                    BoxeMere.nbread += 12;
                                    BoxeMere.children.push(myBoxe);
                                    ascendance.push(myBoxe.ind);
                                    readAtoms(Boxes[0].nbread, ascendance, Boxes, function(err,Boxes){
                                        if (err){
                                            racb(err);
                                        } else {
                                            racb(null, Boxes);
                                        }    
                                    });
                                } else {
                                    if (atomname == "LIST"){           
                                        // find atom mother - recherche de la mère                   
                                        BoxeMere = Boxes[0];
                                        for (var k = 1; k < ascendance.length; k++) {
                                            BoxeMere = BoxeMere.children[ascendance[k]];
                                        }
                                        myBoxe.name=litCar(buffer, 8, 4);
                                        myBoxe.len=buffer.getUint32(4,true);
                                        if ((myBoxe.len % 2) == 1) myBoxe.len+=1;               // ATTENTION : in movi list, this is necessary !!
                                        myBoxe.ind=BoxeMere.children.length;
                                        myBoxe.children=[];
                                        myBoxe.nbread=0;
                                        myBoxe.off = Boxes[0].nbread;
                                        BoxeMere.children.push(myBoxe);
                                        ascendance.push(myBoxe.ind);
                                        // update all mothers number of bytes read - mise à jour du nombre d'octets lus pour toutes les mères
                                        BoxeMere = Boxes[0];
                                        BoxeMere.nbread += 12;
                                        for (var k = 1; k < ascendance.length; k++) {
                                            BoxeMere = BoxeMere.children[ascendance[k]];
                                            BoxeMere.nbread += 12;
                                        }
                                        if (myBoxe.name == 'movi'){                             // Don't try to read and built this part !! too big.
                                            Boxes[0].nbread += myBoxe.len-4;
                                            while (ascendance.length > 2) ascendance.pop();
                                        }
                                        readAtoms(Boxes[0].nbread, ascendance, Boxes, function(err,Boxes){
                                            if (err){
                                                racb(err);
                                            } else {
                                                racb(null, Boxes);
                                            }    
                                        });
                                    } else {                                                    // ni RIFF ni LIST    (neigher RIFF neigher LIST) 
                                        // récupère la mère - find mother                                       
                                        BoxeMere = Boxes[0];
                                        for (var k = 1; k < ascendance.length; k++) {
                                            BoxeMere = BoxeMere.children[ascendance[k]];
                                        }
                                        myBoxe.name=litCar(buffer, 0, 4); 
                                        myBoxe.off = Boxes[0].nbread;
                                        myBoxe.len=buffer.getUint32(4,true);
                                        if ((myBoxe.len % 2) == 1) myBoxe.len+=1;               // ATTENTION : in movi list, this is necessary !!
                                        myBoxe.ind=BoxeMere.children.length;
                                        myBoxe.children=[];
                                        myBoxe.nbread=0;
                                        BoxeMere.children.push(myBoxe);
                                        ascendance.push(myBoxe.ind);  
                                        if (myBoxe.name == 'JUNK'){ 
                                            info.JUNKS.push(ascendance.join("-"));
                                        }

                                        // update all mothers number of bytes read - mise à jour du nombre d'octets lus pour toutes les mères
                                        BoxeMere = Boxes[0];
                                        BoxeMere.nbread += myBoxe.len+8;
                                        for (var k = 1; k < ascendance.length-1; k++) {
                                            BoxeMere = BoxeMere.children[ascendance[k]];
                                            BoxeMere.nbread = myBoxe.off + myBoxe.len + 8 - BoxeMere.off;
                                        } 
                                        // find last mother to have children - recherche dernière mère a pouvoir avoir des enfants
                                        ascendance.pop();
                                        while ((BoxeMere.nbread >= BoxeMere.len-1) && (BoxeMere.name != "OldMammy")) {
                                            ascendance.pop();
                                            BoxeMere = Boxes[0];
                                            for (var k = 1; k < ascendance.length; k++) {
                                                BoxeMere = BoxeMere.children[ascendance[k]];
                                            }
                                        }        
                                        readAtoms(Boxes[0].nbread, ascendance, Boxes, function(err, info) {
                                            if (err){
                                                racb(err);
                                            } else {
                                                racb(null, Boxes);
                                            }
                                        });   
                                    }
                                }    
                            }
                        });
                    }
                }
            }

            readAtoms(0, [0], function(err, Boxes) {
                if (err){
                    callback(err);
                } else {
                    atoms=[];
                    Boxes=purgeboxesJUNK(Boxes);
                    for (var v = 0; v < Boxes[0].children.length; v++) atoms.push(Boxes[0].children[v]);
                    Boxes=null;
                    info.isInterleaved = false;
                    info.isOpenDML = false;
                    for (var i=0; i<atoms.length; i++){
                        if (atoms[i].name == 'AVIX') info.isOpenDML=true;    // Theorical, after purgeboxesJUNK, if atoms.length > 1 OPENDML is true ;)
                    }
                    if (atoms[0].children[0].children[0].name == 'avih'){    // Theorical, after purgeboxesJUNK, it's allways avih box ;)

                        parseavih(atoms[0].children[0].children[0].off+8, atoms[0].children[0].children[0].len, atoms, function retparseavih(err, atoms){
                            if (err){
                                callback(err);
                            } else {
                                // 
                                var atomhdlr = atoms[0].children[0];
                                info.isodml = -1;
                                info.isidx1 = -1;
                                info.ismovi = [];
                                info.isINFO = -1;
                                for (var j=1; j<atomhdlr.children.length; j++){
                                    // theorical : info.tracks.length=info.dwStreams !
                                    if (atomhdlr.children[j].name == 'strl'){
                                        var track={};
                                        track.ind=j;
                                        info.tracks.push(track);
                                    }
                                    if (atomhdlr.children[j].name == 'odml'){
                                        info.isodml = j;
                                    }
                                }
                                for (var i=0; i<atoms[0].children.length; i++){
                                    if (atoms[0].children[i].name == 'movi') info.ismovi.push(i);
                                    if (atoms[0].children[i].name == 'idx1') info.isidx1=i;
                                    if (atoms[0].children[i].name == 'INFO') info.isINFO=i;
                                }
                                for (var k=0; k<info.tracks.length; k++){
                                    var indhdlr = info.tracks[k].ind;
                                    var atomstrl = atoms[0].children[0].children[indhdlr];
                                    for (var j=0; j<atomstrl.children.length; j++){
                                        if (atomstrl.children[j].name == 'strh'){
                                            info.tracks[k].strhind=j;
                                        }
                                        if (atomstrl.children[j].name == 'strf'){
                                            info.tracks[k].strfind=j;
                                        }
                                        if (atomstrl.children[j].name == 'indx'){   // for OPEN DML
                                            info.tracks[k].indxind=j;
                                        }
                                    }
                                }
                                for (var k=1; k<atoms.length; k++){
                                    if (atoms[k].name == "AVIX"){
                                        for (var u=0; u<atoms[k].children.length; u++){
                                            if (atoms[k].children[u].name == "movi") info.ismovi.push(u);
                                        }
                                    }
                                }
                                parsehdlr(atoms, function retparsehdlr(err,atoms){
                                    if (err){
                                        callback(err);
                                    } else {
                                        var obj={Totalsize : 0, min : 0, max : 0, count : 0};
                                        for (var t=0; t<info.tracks.length; t++) {
                                            info.tracks[t].Totalsize = 0;
                                            info.tracks[t].FramesCount = 0;
                                            info.tracks[t].minSize = 65535;
                                            info.tracks[t].maxSize = 0;
                                            info.tracks[t].keyframesCount = 0;
                                        }                                        
                                        parsesizes(atoms, info.withmovis, function retparsesizes(err,atoms){
                                            if (err){
                                                callback(err);
                                            } else {
                                                parseodml(function retparseodml(err,atoms){
                                                    if (err){
                                                        callback(err);
                                                    } else {
                                                        parseinfo(function retparseinfo(err, atoms){
                                                            if (err){
                                                                callback(err);
                                                            } else {
                                                                for (var i=0; i<info.tracks.length; i++){
                                                                    if ((info.tracks[i].strh.Typet == 'txts') && (info.tracks[i].Totalsize == 0)){
                                                                        // size of subtitles = 0 
                                                                        info.tracks[i].Totalsize = info.tracks[i].strh.dwSuggestedBufferSize;
                                                                    }
                                                                    if (info.tracks[i].strh.Typet == 'auds'){
                                                                        info.tracks[i].audiocodec=xTagsAudio[info.tracks[i].strf.wFormatTag.toString(16).toUpperCase()];    
                                                                    }
                                                                }
                                                                callback(null, info);
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                }
            });
        }
        /*
         * Reader.js
         * A unified reader interface for AJAX, local and File API access
         * 43081j
         * License: MIT, see LICENSE
         */
    var Reader = function(type) {
        this.type = type || Reader.OPEN_URI;
        this.size = null;
        this.file = null;
    };

    Reader.OPEN_FILE = 1;
    Reader.OPEN_URI = 2;
    Reader.OPEN_LOCAL = 3;

    if (typeof require === 'function') {
        var fs = require('fs');
    }

    Reader.prototype.open = function(file, callback) {
        this.file = file;
        var self = this;
        switch (this.type) {
            case Reader.OPEN_LOCAL:
                fs.stat(this.file, function(err, stat) {
                    if (err) {
                        return callback(err);
                    }
                    self.size = stat.size;
                    fs.open(self.file, 'r', function(err, fd) {
                        if (err) {
                            return callback(err);
                        }
                        self.fd = fd;
                        callback();
                    });
                });
                break;
            case Reader.OPEN_FILE:
                this.size = this.file.size;
                callback();
                break;
            default:
                this.ajax({
                        uri: this.file,
                        type: 'HEAD',
                    },
                    function(err, resp, xhr) {
                        if (err) {
                            return callback(err);
                        }
                        self.size = parseInt(xhr.getResponseHeader('Content-Length'));
                        callback();
                    }
                );
                break;
        }
    };

    Reader.prototype.close = function() {
        if (this.type === Reader.OPEN_LOCAL) {
            fs.close(this.fd);
        }
    };

    Reader.prototype.read = function(length, position, callback) {
        if (typeof position === 'function') {
            callback = position;
            position = 0;
        }
        if (this.type === Reader.OPEN_LOCAL) {
            this.readLocal(length, position, callback);
        } else if (this.type === Reader.OPEN_FILE) {
            this.readFile(length, position, callback);
        } else {
            this.readUri(length, position, callback);
        }
    };

    Reader.prototype.readBlob = function(length, position, type, callback) {
        if (typeof position === 'function') {
            callback = position;
            position = 0;
        } else if (typeof type === 'function') {
            callback = type;
            type = 'application/octet-stream';
        }
        this.read(length, position, function(err, data) {
            if (err) {
                callback(err);
                return;
            }
            callback(null, new Blob([data], {
                type: type
            }));
        });
    };

    /*
     * Local reader
     */
    Reader.prototype.readLocal = function(length, position, callback) {
        var buffer = new Buffer(length);
        fs.read(this.fd, buffer, 0, length, position, function(err, bytesRead, buffer) {
            if (err) {
                return callback(err);
            }
            var ab = new ArrayBuffer(buffer.length),
                view = new Uint8Array(ab);
            for (var i = 0; i < buffer.length; i++) {
                view[i] = buffer[i];
            }
            callback(null, ab);
        });
    };

    /*
     * URL reader
     */
    Reader.prototype.ajax = function(opts, callback) {
        var options = {
            type: 'GET',
            uri: null,
            responseType: 'text'
        };
        if (typeof opts === 'string') {
            opts = {
                uri: opts
            };
        }
        for (var k in opts) {
            options[k] = opts[k];
        }
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState !== 4) return;
            if (xhr.status !== 200 && xhr.status !== 206) {
                return callback('Received non-200/206 response (' + xhr.status + ')');
            }
            callback(null, xhr.response, xhr);
        };
        xhr.responseType = options.responseType;
        xhr.open(options.type, options.uri, true);
        if (options.range) {
            options.range = [].concat(options.range);
            if (options.range.length === 2) {
                xhr.setRequestHeader('Range', 'bytes=' + options.range[0] + '-' + options.range[1]);
            } else {
                xhr.setRequestHeader('Range', 'bytes=' + options.range[0]);
            }
        }
        xhr.send();
    };

    Reader.prototype.readUri = function(length, position, callback) {
        this.ajax({
                uri: this.file,
                type: 'GET',
                responseType: 'arraybuffer',
                range: [position, position + length - 1]
            },
            function(err, buffer) {
                if (err) {
                    return callback(err);
                }
                return callback(null, buffer);
            }
        );
    };

    /*
     * File API reader
     */
    Reader.prototype.readFile = function(length, position, callback) {
    /*      OK in wekWorkers (OK for Chrome, Opera and IE) except Firefox  :
    /*                       http://stackoverflow.com/questions/22741478/firefox-filereader-is-not-defined-only-when-called-from-web-worker     */    
        if (typeof FileReader === 'undefined'){
            var slice = this.file.slice(position, position + length),
                fr=new FileReaderSync();
            callback(null,fr.readAsArrayBuffer(slice));
        } else {    
            var slice = this.file.slice(position, position + length),
               fr = new FileReader();
            fr.onload = function(e) {
                callback(null, e.target.result);
            };
            fr.readAsArrayBuffer(slice);
        }
    };
    /*
     * Read the file
     */

    if (typeof options.type === 'string') {
        switch (options.type) {
            case 'file':
                options.type = Reader.OPEN_FILE;
                break;
            case 'local':
                options.type = Reader.OPEN_LOCAL;
                break;
            default:
                options.type = Reader.OPEN_URI
        }
    }

    var handle = new Reader(options.type);

    handle.open(options.file, function(err) {
        if (err) {
            return cb('Could not open specified file');
        }
        AVIRiff.parse(handle, function(err, tags) {
            cb(err, tags);
        });
    });
}; // MP4Tag.parse ! ??



if (typeof module !== 'undefined' && module.exports) {
    module.exports = avi;
} else {
    if (typeof define === 'function' && define.amd) {
        define('avi', [], function() {
            return avi;
        });
    } 
};
