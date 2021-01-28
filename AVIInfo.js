/**
 * AVIInfo 
 * v 1.4 2021/01/28   premières gestions des erreurs d'un fichier .AVI 
 *
 *       Inspirations :  https://multimedia.cx/avistuff.txt
 */
"use strict";

function getStackTrace() {
    let stack = new Error().stack || '';
    stack = stack.split('\n').map(function(line) {
        return line.trim();
    });
    return stack.splice(stack[0] == 'Error' ? 2 : 1);
}

var avi = function(opts, withmovis, cb) {
    //'use strict';
    var info = {};
    info.file = opts;
    info.filesize = info.file.size;
    info.filename = info.file.name;
    info.filedate = info.file.lastModified;
    info.withmovis = withmovis;
    info.nbboucleslect = 0;

    var atoms;
    //var withmovis;
    info.tracks = [];
    info.JUNKS = [];
    info.cb = cb;

    var AVIRiff = {};

    AVIRiff.parse = function(callback) {
        /********************************************** that was a pretty good idea ... Helas ! See down
        Array.prototype.max = function() {
            return Math.max.apply(null, this);
        };

        Array.prototype.min = function() {
            return Math.min.apply(null, this);
        }
        ***********************************************************************************************/
        var moovatom;
        var xTagsAudio = { // https://wiki.multimedia.cx/index.php/TwoCC
            '0': ['Unknown,,,'],
            '1': ['PCM,PCM,Microsoft PCM,http://www.microsoft.com/windows/'],
            '2': ['ADPCM,ADPCM,Microsoft ADPCM,http://www.microsoft.com/windows/'],
            '3': ['PCM,PCM,IEEE FLOAT,http://www.microsoft.com/windows/'],
            '4': ['VSELP,,Compaq VSELP,'],
            '5': ['CVSD,,IBM CVSD,'],
            '6': ['A-Law,ADPCM,CCITT A-Law,http://www.microsoft.com/windows/'],
            '7': ['U-Law,ADPCM,CCITT U-Law,http://www.microsoft.com/windows/'],
            '8': ['DTS,DTS,,'],
            '9': ['DRM,,Microsoft,'],
            'A': ['WMSpeech,,,'],
            'C': ['MPEG2 5.1,,MPEG2 5.1,'],
            '10': ['ADPCM,ADPCM,OKI ADPCM,'],
            '11': ['ADPCM,ADPCM,Intel ADPCM,'],
            '12': ['ADPCM,ADPCM,Mediaspace (Videologic) ADPCM,'],
            '13': ['ADPCM,ADPCM,Sierra ADPCM,'],
            '14': ['ADPCM,ADPCM,Antex G723 ADPCM,'],
            '15': ['STD,,DSP solutions Digi-STD,'],
            '16': ['FIX,,DSP solutions Digi-FIX,'],
            '17': ['ADPCM,ADPCM,Dialogic-OKI ADPCM,http://www.microsoft.com/windows/'],
            '18': ['ADPCM,ADPCM,,'],
            '19': ['CU,,HP CU_CODEC,'],
            '1A': ['Dynamic Voice,,HP,'],
            '20': ['ADPCM,ADPCM,Yamaha ADPCM,'],
            '21': ['SONARC,,Speech Compression SONARC,'],
            '22': ['Truespeech,,DSP Group TrueSpeech,http://www.microsoft.com/windows/'],
            '23': ['SC1,,Echo Speech SC1,'],
            '24': ['AF36,,Virtual Music AudioFile 36,'],
            '25': ['APTX,,Audio Processing Technology X,'],
            '26': ['AF10,,Virtual Music AudioFile 10,'],
            '27': ['Prosody 1612,,Aculab plc Prosody 1612,'],
            '28': ['LRC,,Merging Technologies LRC,'],
            '30': ['AC2,,Dolby Laboratories AC2,'],
            '31': ['GSM 6.10,,Microsoft GSM 6.10,http://www.microsoft.com/windows/'],
            '32': ['MSAUDIO,,Microsoft Audio,'],
            '33': ['ADPCM,ADPCM,Antex ADPCM,'],
            '34': ['VQLPC,,Control Resources VQLPC,'],
            '35': ['REAL,,DSP Solutions Digi-REAL,'],
            '36': ['ADPCM,ADPCM,DSP Solutions Digi-ADPCM,'],
            '37': ['CR10,,Control Resources 10,'],
            '38': ['ADPCM,ADPCM,Natural MicroSystems VBX ADPCM,'],
            '39': ['ADPCM,ADPCM,Crystal Semiconductor IMA ADPCM,'],
            '3A': ['SC3,,Echo Speech SC3,'],
            '3B': ['ADPCM,,Rockwell ADPCM,'],
            '3C': ['DigiTalk,,Rockwell DigiTalk,'],
            '3D': ['Xebec,,Xebec Multimedia Solutions,'],
            '40': ['ADPCM,ADPCM,Antex Electronics G721 ADPCM,'],
            '41': ['CELP,,Antex Electronics G728 CELP,'],
            '42': ['G.723.1,,Microsoft G.723.1,http://www.microsoft.com/windows/'],
            '43': ['ADPCM,,IBM,'],
            '45': ['ADPCM,ADPCM,Microsoft G.726,http://www.microsoft.com/windows/'],
            '50': ['MPEG-1/2 L1,MPEG-1,,http://www.iis.fraunhofer.de/amm/index.html'],
            '51': ['MPEG-1/2 L2,MPEG-1,,http://www.iis.fraunhofer.de/amm/index.html'],
            '52': ['RT24,,InSoft, Inc.,'],
            '53': ['PAC,,InSoft, Inc.,'],
            '55': ['MPEG-1/2 L3,MPEG-1,MPEG-1 or 2 layer 3,http://www.iis.fraunhofer.de/amm/index.html'],
            '59': ['G723,,Lucent G723,'],
            '60': ['Cirrus,,Cirrus Logic,'],
            '61': ['PCM,,ESS Technology PCM,'],
            '62': ['Voxware,,,'],
            '63': ['ATRAC,,Canopus ATRAC,'],
            '64': ['ADPCM,ADPCM,APICOM G726 ADPCM,'],
            '65': ['ADPCM,ADPCM,APICOM G722 ADPCM,'],
            '66': ['DSAT,,Microsoft DSAT,'],
            '67': ['DSAT Display,,Microsoft DSAT DISPLAY,'],
            '69': ['BYTE_ALIGNED,,Voxware BYTE_ALIGNED,http://www.voxware.com/'],
            '70': ['AC8,,Voxware AC8,http://www.voxware.com/'],
            '71': ['AC10,,Voxware AC10,http://www.voxware.com/'],
            '72': ['AC16,,Voxware AC16,http://www.voxware.com/'],
            '73': ['AC20,,Voxware AC20,http://www.voxware.com/'],
            '74': ['RT24,,Voxware RT24 (MetaVoice),http://www.voxware.com/'],
            '75': ['RT29,,Voxware RT29 (MetaSound),http://www.voxware.com/'],
            '76': ['RT29HW,,Voxware RT29HW,http://www.voxware.com/'],
            '77': ['VR12,,Voxware VR12,http://www.voxware.com/'],
            '78': ['VR18,,Voxware VR18,http://www.voxware.com/'],
            '79': ['TQ40,,Voxware TQ40,http://www.voxware.com/'],
            '7A': ['SC3,,Voxware,'],
            '7B': ['SC3,,Voxware,'],
            '80': ['Softsound,,,'],
            '81': ['TQ60,,Voxware TQ60,http://www.voxware.com/'],
            '82': ['MSRT24,,Microsoft MSRT24,'],
            '83': ['G729A,,AT&T G729A,'],
            '84': ['MVI_MVI2,,Motion Pixels MVI_MVI2,'],
            '85': ['ADPCM,ADPCM,DataFusion Systems (Pty) G726,'],
            '86': ['GSM6.10,,DataFusion Systems (Pty) GSM6.10,'],
            '88': ['ISI AUDIO,,Iterated Systems AUDIO,'],
            '89': ['Onlive,,OnLive! Technologies,'],
            '8A': ['SX20,,Multitude,'],
            '8B': ['ADPCM,ADPCM,Infocom ITS A/S,'],
            '8C': ['G.729,,Convedia Corporation,'],
            '91': ['SBC24,,Siemens Business Communications Sys 24,'],
            '92': ['AC3 SPDIF,,Sonic Foundry AC3 SPDIF,'],
            '93': ['G723,,MediaSonic G723,'],
            '94': ['Prosody 8KBPS,,Aculab plc Prosody 8KBPS,'],
            '97': ['ADPCM,ADPCM,ZyXEL Communications ADPCM,'],
            '98': ['LPCBB,,Philips Speech Processing LPCBB,'],
            '99': ['Packed,,Studer Professional Audio AG Packed,'],
            'A0': ['PHONYTALK,,Malden Electronics PHONYTALK,'],
            'A1': ['GSM,,Racal Recorders,'],
            'A2': ['G.720a,,Racal Recorders,'],
            'A3': ['G.723.1,,Racal Recorders,'],
            'A4': ['ACELP,,Racal Recorders,'],
            'B0': ['AAC,AAC,NEC Corporation,'],
            'FF': ['AAC,AAC,,'],
            '100': ['ADPCM,ADPCM,,'],
            '101': ['IRAT,,BeCubed IRAT,'],
            '102': [',,IBM A-law,'],
            '103': [',,IBM AVC ADPCM,'],
            '111': ['G723,,Vivo G723,'],
            '112': ['SIREN,,Vivo SIREN,'],
            '120': ['CELP,,Philips Speech Processing,'],
            '121': ['Grundig,,Philips Speech Processing,'],
            '123': ['G723,,Digital Equipment Corporation (DEC) G723,'],
            '125': ['ADPCM,ADPCM,,'],
            '130': ['ACEPL,,Sipro ACEPL.net,http://dividix.host.sk'],
            '131': ['ACELP4800,,Sipro ACELP4800,'],
            '132': ['ACELP8V3,,Sipro ACELP8V3,'],
            '133': ['G729,,Sipro G729,'],
            '134': ['G729,,Sipro G729A,'],
            '135': ['KELVIN,,Sipro KELVIN,'],
            '136': ['AMR,,VoiceAge Corporation,'],
            '140': ['ADPCM,ADPCM,Dictaphone Corporation G726 ADPCM,'],
            '141': ['CELP68,,Dictaphone Corporation,'],
            '142': ['CELP54,,Dictaphone Corporation,'],
            '150': ['PureVoice,,Qualcomm PUREVOICE,'],
            '151': ['HalfRate,,Qualcomm HALFRATE,'],
            '155': ['TUBGSM,,Ring Zero Systems TUBGSM,'],
            '160': ['WMA1,,Windows Media Audio 1,http://www.microsoft.com/windows/windowsmedia/format/codecdownload.aspx'],
            '161': ['WMA2,,Windows Media Audio 2,http://www.microsoft.com/windows/windowsmedia/format/codecdownload.aspx'],
            '162': ['WMA3,,Windows Media Audio 3,http://www.microsoft.com/windows/windowsmedia/format/codecdownload.aspx'],
            '163': ['WMA Lossless,,Windows Media Audio 3,http://www.microsoft.com/windows/windowsmedia/format/codecdownload.aspx'],
            '164': ['WMA Pro,,WMA Pro over S/PDIF,'],
            '170': ['ADPCM,ADPCM,Unisys Nap ADPCM,'],
            '171': ['U-Law,ADPCM,Unisys Nap U-law,'],
            '172': ['A-Law,ADPCM,Unisys Nap A-law,'],
            '173': ['16K,,Unisys Nap 16K,'],
            '174': ['G.700,,SyCom Technologies,'],
            '175': ['ADPCM,ADPCM,SyCom Technologies,'],
            '176': ['CELP54,,SyCom Technologies,'],
            '177': ['CELP68,,SyCom Technologies,'],
            '178': ['ADPCM,ADPCM,Knowledge Adventure, Inc.,'],
            '180': ['AAC,,Fraunhofer IIS,'],
            '190': ['DTS,,,'],
            '200': ['ADPCM,ADPCM,Creative Labs ADPCM,'],
            '202': ['FastSpeech8,,Creative Labs Fast Speech 8,'],
            '203': ['FastSpeech10,,Creative Labs Fast Speech 10,'],
            '210': ['ADPCM,ADPCM,UHER informatic GmbH ADPCM,'],
            '215': [',,Ulead DV ACM,'],
            '216': [',,Ulead DV ACM,'],
            '220': ['QuaterDeck,,Quarterdeck,'],
            '230': ['VC,,I-link VC,'],
            '240': ['RAW_SPORT,,Aureal RAW_SPORT,'],
            '241': ['AC3,,ESST AC3,'],
            '250': ['HSX,,Interactive Products, Inc. (IPI) HSX,'],
            '251': ['RPELP,,Interactive Products, Inc. (IPI) RPELP,'],
            '255': ['AAC LC'],
            '260': ['CS2,,Consistent Software CS2,'],
            '270': ['SCX,,Sony,'],
            '271': ['SCY,,Sony,'],
            '272': ['Atrac3,,Sony,'],
            '273': ['SPC,,Sony,'],
            '280': ['Telum,,,'],
            '281': ['TelumIA,,,'],
            '285': ['ADPCM,ADPCM,Norcom Voice Systems,'],
            '300': ['FM_TOWNS_SND,,Fujitsu FM_TOWNS_SND,'],
            '350': ['Dev,,Micronas Semiconductors, Inc.,'],
            '351': ['CELP833,,Micronas Semiconductors, Inc.,'],
            '400': ['BTV_DIGITAL,,Brooktree (BTV) DIGITAL,'],
            '401': ['Music Coder,,Intel Music Coder,http://www.intel.com/'],
            '402': ['IAC2,,Ligos IAC2,http://www.ligos.com'],
            '450': ['Qdesign,,QDesign Music,'],
            '500': ['VP7,,On2,'],
            '501': ['VP6,,On2,'],
            '680': ['VMPCM,,AT&T VME_VMPCM,'],
            '681': ['TPC,,AT&T TPC,'],
            '700': ['YMPEG,,YMPEG Alpha,'],
            '8AE': ['LiteWave,,ClearJump LiteWave,'],
            'AAC': ['AAC,AAC,,'],
            '1000': ['GSM,,Ing C. Olivetti & C., S.p.A. GSM,'],
            '1001': ['ADPCM,ADPCM,Ing C. Olivetti & C., S.p.A. ADPCM,'],
            '1002': ['CELP,,Ing C. Olivetti & C., S.p.A. CELP,'],
            '1003': ['SBC,,Ing C. Olivetti & C., S.p.A. SBC,'],
            '1004': ['OPR,,Ing C. Olivetti & C., S.p.A. OPR,'],
            '1100': ['LH_CODEC,,Lernout & Hauspie Codec,'],
            '1101': ['CELP,,Lernout & Hauspie CELP 4.8 kb/s,http://www.microsoft.com/windows/'],
            '1102': ['SBC,,Lernout & Hauspie SBC 8 kb/s,http://www.microsoft.com/windows/'],
            '1103': ['SBC,,Lernout & Hauspie SBC 12 kb/s,http://www.microsoft.com/windows/'],
            '1104': ['SBC,,Lernout & Hauspie SBC 16 kb/s,http://www.microsoft.com/windows/'],
            '1400': ['NORRIS,,Norris Communications, Inc.,'],
            '1401': ['ISIAUDIO,,ISIAudio,'],
            '1500': ['MUSICOMPRESS,,Soundspace Music Compression,'],
            '181C': ['RT24,,VoxWare RT24 speech codec,'],
            '181E': ['AX24000P,,Lucent elemedia AX24000P Music codec,'],
            '1971': ['SonicFoundry,,Lossless,'],
            '1C03': ['ADPCM,ADPCM,Lucent SX5363S G.723 compliant codec,'],
            '1C07': ['SX8300P,,Lucent SX8300P speech codec,'],
            '1C0C': ['ADPCM,ADPCM,Lucent SX5363S G.723 compliant codec,'],
            '1F03': ['DigiTalk,,CUseeMe DigiTalk (ex-Rocwell),'],
            '1FC4': ['ALF2CD,,NCT Soft ALF2CD ACM,'],
            '2000': ['AC3,AC3,Dolby AC3,'],
            '2001': ['DTS,DTS,Digital Theater Systems,'],
            '2002': ['Real Audio 1,,RealAudio 1/2 14.4,'],
            '2003': ['Real Audio 1,,RealAudio 1/2 28.8,'],
            '2004': ['Real Audio 2,,RealAudio G2/8 Cook (low bitrate),'],
            '2005': ['Real Audio 3,,RealAudio 3/4/5 Music (DNET),'],
            '2006': ['AAC,AAC,RealAudio 10 AAC (RAAC),'],
            '2007': ['AAC+,AAC,RealAudio 10 AAC+ (RACP),'],
            '3313': ['AviSynth,,makeAVIS (fake AVI sound from AviSynth scripts),'],
            '4143': ['AAC,AAC,Divio MPEG-4 AAC audio,'],
            '4201': ['Nokia,,,'],
            '4243': ['ADPCM,ADPCM,G726,'],
            '43AC': ['Lead Speech,,,'],
            '564C': ['Lead Vorbis,,,'],
            '566F': ['Vorbis,Vorbis,,http://www.vorbis.com'],
            '5756': ['WavPack,,,http://www.wavpack.com/'],
            '674F': ['Vorbis,Vorbis,Mode 1,http://www.vorbis.com'],
            '6750': ['Vorbis,Vorbis,Mode 2,http://www.vorbis.com'],
            '6751': ['Vorbis,Vorbis,Mode 3,http://www.vorbis.com'],
            '676F': ['Vorbis,Vorbis,Mode 1+,http://www.vorbis.com'],
            '6770': ['Vorbis,Vorbis,Mode 2+,http://www.vorbis.com'],
            '6771': ['Vorbis,Vorbis,Mode 2+,http://www.vorbis.com'],
            '7A21': ['AMR,,GSM-AMR (CBR, no SID),http://www.microsoft.com'],
            '7A22': ['AMR,,GSM-AMR (VBR, including SID),http://www.microsoft.com'],
            'A100': ['G723.1,,,'],
            'A101': ['AVQSBC,,,'],
            'A102': ['ODSBC,,,'],
            'A103': ['G729A,,,'],
            'A104': ['AMR-WB,,,'],
            'A105': ['ADPCM,ADPCM,G726,'],
            'A106': ['AAC,,,'],
            'A107': ['ADPCM,ADPCM,G726,'],
            'A109': ['Speex,,,http://www.speex.org/'],
            'DFAC': ['FrameServer,,DebugMode SonicFoundry Vegas FrameServer ACM Codec,'],
            'F1AC': ['FLAC,,Free Lossless Audio Codec FLAC,'],
            'FFFE': ['PCM,PCM,Extensible wave format,'],
            'FFFF': ['In Development,,In Development / Unregistered,']
        };

        var infotags = {
            'IARL': "Archival Location",
            'IART': "Artist",
            'ICMS': "Commissioned by",
            'ICMT': "Comments",
            'ICOP': "Copyright",
            'ICRD': "Creation date",
            'ICRP': "Cropped",
            'IDIM': "Dimensions",
            'IDPI': "Dots Per Inch",
            'IENG': "Engineer",
            'IGNR': "Genre",
            'IKEY': "Keywords",
            'ILGT': "Lightness",
            'IMED': "Medium",
            'INAM': "Name",
            'IPLT': "Palette Setting",
            'IPRD': "Product",
            'ISBJ': "Subject",
            'ISFT': "Software"
        };

        var semitag = ['wb', 'dc', 'tx', 'ix', 'im'];
        // dwFlags in idx1
        var AVIIF_LIST = 0x00000001; // chunk is a 'LIST'
        var AVIIF_KEYFRAME = 0x00000010; // this frame is a key frame.
        var AVIIF_FIRSTPART = 0x00000020; // this frame is the start of a partial frame.
        var AVIIF_LASTPART = 0x00000040; // this frame is the end of a partial frame.
        var AVIIF_MIDPART = 0x00000060; // (AVIIF_LASTPART|AVIIF_FIRSTPART)
        var AVIIF_NOTIME = 0x00000100; // this frame doesn't take any time
        var AVIIF_COMPUSE = 0x0FFF0000; // these bits are for compressor use 
        var aviSIZE_FILTER = 0xCFFFFFFF; // to filter real size of Chunk
        var aviKEYF_FILTER = 0x10000000; // to filter Key Frame

        // dwFlags in avih
        var AVIF_HASINDEX = 0x00000010; // Index (idx1 atom) at end of file?
        var AVIF_MUSTUSEINDEX = 0x00000020;
        var AVIF_ISINTERLEAVED = 0x00000100;
        var AVIF_WASCAPTUREFILE = 0x00010000;
        var AVIF_COPYRIGHTED = 0x00020000;

        // bIndexType in indx (bIndexSubtype must be 0)
        var AVI_INDEX_OF_INDEXES = 0x00; // each entry of the array points to an index chunk
        var AVI_INDEX_OF_CHUNKS = 0x01; // each entry of the array points to a chunk in the file
        var AVI_INDEX_IS_DATA = 0x80; // each entry of the array is really data
        // if bIndexSubtype = 0x01 then 


        var BuffSize = 16 * 16 * 1024; // could be adapted : size of standard buffer used in this module.
        var Boxes;
        var errlect = [];

        /********************************************************************
               Lecture de nb caractères dans la buffer fourni en entrée
        *********************************************************************/
        function litCar(buffer, pos, nb) {
            try {
                info.pos = pos;
                info.nb = nb;
                info.bufferLength = buffer.byteLength;
                if ((pos + nb <= buffer.byteLength) && (pos >= 0) && (nb >= 0)) {
                    var id = [];
                    for (var i = pos; i < pos + nb; i++) {
                        id.push(String.fromCharCode(buffer.getUint8(i)));
                    }
                    return id.join("");
                } else {
                    getStackTrace();
                }
            } catch (err) {
                cb('erreur à litCar dans le fichier ' + info.filename);
            }
        }

        /********************************************************************
               réation d'un buffer du type DataView à partir du fichier
               Fonction bien évidemment asychrone !
        *********************************************************************/
        async function AsyncreadBytes(offset, nbB) {
            try {
                if ((offset + nbB <= info.filesize) && (offset >= 0) && (nbB >= 0)) {
                    info.nbboucleslect++;
                    var partie = info.file.slice(offset, offset + nbB);
                    var tmpblob = new Response(partie);
                    var buffer = await tmpblob.arrayBuffer();
                    return new DataView(buffer);
                } else {
                    return false;
                }
            } catch (err) {
                cb('erreur à AsyncreadBytes dans le fichier ' + info.filename);
            }
        }

        /********************************************************************
               Fais du ménage dans l'organisation des boites : 
               libère (purge) toutes celles qui sont des JUNKs
        *********************************************************************/
        function purgeboxesJUNK(Boxes) {

            for (var i = info.JUNKS.length - 1; i > -1; i--) {
                var ascendance = info.JUNKS[i].split("-");
                var myBoxe = Boxes[0];
                for (var k = 1; k < ascendance.length - 1; k++) {
                    myBoxe = myBoxe.children[ascendance[k]];
                }
                var arrayBox = [];
                for (var u = 0; u < myBoxe.children.length; u++) {
                    if (u != ascendance[ascendance.length - 1]) arrayBox.push(myBoxe.children[u]);
                }
                myBoxe.children = [];
                for (var v = 0; v < arrayBox.length; v++) myBoxe.children.push(arrayBox[v]);
            }
            return Boxes;
        }

        /********************************************************************
               Ne sert pas à grand chose : se contente d'aller "récupérer" la
               taille de la boite / atome omdl (dont on ne fera rien !!)
        *********************************************************************/
        async function parseodml(cb) {
            try {
                if (info.isodml > -1) {
                    var offset = atoms[0].children[0].children[info.isodml].children[0].off + 8;
                    var nbB = atoms[0].children[0].children[info.isodml].children[0].len;
                    var buffer = await AsyncreadBytes(offset, 4);
                    info.odmlLength = buffer.getUint32(0, true);
                    cb(null, atoms);
                } else cb(null, atoms);
            } catch (err) {
                cb('erreur à parseodml dans le fichier ' + info.filename);
            }
        }

        /*****************************************************************************
               Traite les buffers de Standard Index et va calculer le nombre de frames
        ******************************************************************************/
        async function traiteBufferSI(ind, offsetbase, nbloop, lastloop, BuffSize, indexinfo, Bsicb) {
            try {
                if (ind < nbloop) {
                    var offset = offsetbase + (ind * BuffSize);
                    var buff = await AsyncreadBytes(offset, BuffSize);
                    for (var u = 0; u < (BuffSize / 8); u++) {
                        var dwSizeChunk = buff.getUint32((8 * u) + 4, true);
                        info.tracks[indexinfo].FramesCount++;
                        var testBit0 = dwSizeChunk >> 31;
                        var realSizeChunk = dwSizeChunk;
                        if (testBit0 !== 0) {
                            realSizeChunk = dwSizeChunk % 0x10000000;
                        }
                        if ((realSizeChunk % 2) == 1) realSizeChunk++;
                        info.tracks[indexinfo].Totalsize += realSizeChunk;
                        if ((dwSizeChunk & aviKEYF_FILTER) > 0) info.tracks[indexinfo].keyframesCount++;
                        if (info.tracks[indexinfo].minSize > realSizeChunk) info.tracks[indexinfo].minSize = realSizeChunk;
                        if (info.tracks[indexinfo].maxSize < realSizeChunk) info.tracks[indexinfo].maxSize = realSizeChunk;
                    }
                    ind++;
                    traiteBufferSI(ind, offsetbase, nbloop, lastloop, BuffSize, indexinfo, Bsicb);
                } else {
                    if ((ind == nbloop) && (lastloop > 0)) {
                        var offset1 = offsetbase + (ind * BuffSize);
                        var buff = await AsyncreadBytes(offset1, lastloop); // en dernier lieu il faut lire lastloop
                        for (var u = 0; u < (lastloop / 8); u++) {
                            var dwSizeChunk = buff.getUint32((8 * u) + 4, true);
                            info.tracks[indexinfo].FramesCount++;
                            var testBit0 = dwSizeChunk >> 31;
                            var realSizeChunk = dwSizeChunk;
                            if (testBit0 !== 0) {
                                realSizeChunk = dwSizeChunk % 0x10000000;
                            }
                            if ((realSizeChunk % 2) == 1) realSizeChunk++;
                            info.tracks[indexinfo].Totalsize += realSizeChunk;
                            if ((dwSizeChunk & aviKEYF_FILTER) > 0) info.tracks[indexinfo].keyframesCount++;
                            if (info.tracks[indexinfo].minSize > realSizeChunk) info.tracks[indexinfo].minSize = realSizeChunk;
                            if (info.tracks[indexinfo].maxSize < realSizeChunk) info.tracks[indexinfo].maxSize = realSizeChunk;
                        }
                        Bsicb(null, atoms);
                    } else {
                        Bsicb(null, atoms);
                    }
                }
                //}
            } catch (err) {
                cb('erreur à traiteBufferSI dans le fichier ' + info.filename);
            }
        }

        /******************************************************************************
               Traite les buffers "normaux" d'index et va calculer le nombre de frames
        *******************************************************************************/
        async function traiteBuffer(ind, offsetbase, nbloop, lastloop, BuffSize, ncb) { // not for OPEN DML, just for old AVI
            try {
                if (ind < nbloop) {
                    var offset = offsetbase + (ind * BuffSize);
                    var buff = await AsyncreadBytes(offset, BuffSize);
                    for (var u = 0; u < (BuffSize / 16); u++) {
                        var idchunk = litCar(buff, 16 * u, 4);
                        if (idchunk != 'LIST') { // on 'zappe' tout simplement les chunk LIST
                            var trackIndex = parseInt(litCar(buff, 16 * u, 2));
                            if (trackIndex >= info.tracks.length) {
                                errlect.push('Index of track impossible');
                            } else {
                                var dwflags = buff.getUint32((16 * u) + 4, true);
                                var dwSizeChunk = buff.getUint32((16 * u) + 12, true);
                                info.tracks[trackIndex].FramesCount++;
                                info.tracks[trackIndex].Totalsize += (dwSizeChunk & aviSIZE_FILTER);
                                if ((dwflags & AVIIF_NOTIME) === 0) {
                                    if (info.tracks[trackIndex].minSize > (dwSizeChunk & aviSIZE_FILTER)) info.tracks[trackIndex].minSize = (dwSizeChunk & aviSIZE_FILTER);
                                    if (info.tracks[trackIndex].maxSize < (dwSizeChunk & aviSIZE_FILTER)) info.tracks[trackIndex].maxSize = (dwSizeChunk & aviSIZE_FILTER);
                                    if ((dwflags & AVIIF_KEYFRAME) > 0) info.tracks[trackIndex].keyframesCount++;
                                }
                            }
                        }
                    }
                    ind++;
                    traiteBuffer(ind, offsetbase, nbloop, lastloop, BuffSize, ncb);
                } else {
                    if ((ind == nbloop) && (lastloop > 0)) {
                        var offset = offsetbase + (ind * BuffSize);
                        var buff = await AsyncreadBytes(offset, lastloop);
                        for (var u = 0; u < (lastloop / 16); u++) {
                            var idchunk = litCar(buff, 16 * u, 4);
                            if (idchunk != 'LIST') {
                                var trackIndex = parseInt(litCar(buff, 16 * u, 2));
                                if (trackIndex >= info.tracks.length) {
                                    errlect.push('Index of track impossible');
                                } else {
                                    var dwflags = buff.getUint32((16 * u) + 4, true);
                                    var dwSizeChunk = buff.getUint32((16 * u) + 12, true);
                                    info.tracks[trackIndex].FramesCount++;
                                    info.tracks[trackIndex].Totalsize += (dwSizeChunk & aviSIZE_FILTER);
                                    if ((dwflags & AVIIF_NOTIME) === 0) {
                                        if (info.tracks[trackIndex].minSize > (dwSizeChunk & aviSIZE_FILTER)) info.tracks[trackIndex].minSize = (dwSizeChunk & aviSIZE_FILTER);
                                        if (info.tracks[trackIndex].maxSize < (dwSizeChunk & aviSIZE_FILTER)) info.tracks[trackIndex].maxSize = (dwSizeChunk & aviSIZE_FILTER);
                                        if ((dwflags & AVIIF_KEYFRAME) > 0) info.tracks[trackIndex].keyframesCount++;
                                    }
                                }
                            }
                        }
                    }
                    ncb(null, atoms);
                }
            } catch (err) {
                cb('erreur à traiteBuffer dans le fichier ' + info.filename);
            }
        }

        /******************************************************************************
               Prépare le travail pour aller calculer le nombre de frames (pour SI)
        *******************************************************************************/
        async function processStandardIndex(ind, SIoffset, sicb) { // SIoffset : real offset in the file - no loop !
            try {
                var buff = await AsyncreadBytes(SIoffset, 32);
                var obj = {};
                // read the Super Index chunk
                obj.FourCC = litCar(buff, 0, 4); // must be 'ix' + ind (for (debug)ging)
                obj.cb = buff.getUint32(4, true); // size 
                obj.wLongsPerEntry = buff.getUint16(8, true); // must be 2  (for (debug)ging) 
                obj.bIndexSubType = buff.getUint8(10, true); // must be 0
                obj.bIndexType = buff.getUint8(11, true); // must be 1 (AVI_INDEX_OF_CHUNKS)
                obj.nEntriesInUse = buff.getUint32(12, true); // = (cb-32) / 8  (for (debug)ging) 
                obj.dwChunkId = litCar(buff, 16, 4); // must be 'ix' + ind  (for (debug)ging)  
                obj.nbSamples = 0;
                obj.qwBaseOffset = (buff.getUint32(24, true) << 32) + buff.getUint32(20, true); //(for (debug)ging)
                var nbloop = Math.floor((obj.cb - 32) / BuffSize);
                var offsetbase = SIoffset + 32;
                var lastloop = (obj.cb - 32) % BuffSize;
                traiteBufferSI(0, offsetbase, nbloop, lastloop, BuffSize, ind, function(err, atoms) {
                    if (err) {
                        sicb(err);
                    } else {
                        sicb(null, atoms);
                    }
                });
            } catch (err) {
                cb('erreur à processStandardIndex dans le fichier ' + info.filename);
            }
        }

        /************************************************************************************
               Prépare le travail pour aller calculer le nombre de frames (pour index normal)
        *************************************************************************************/
        function processindx(k, ind, indx, ccb) { // bIndexType = 0 <=> AVI_INDEX_OF_INDEXES
            try {
                if (k < indx.nEntriesInUse) {
                    var SIoffset = indx.entries[k].qWOffset; // points on Standard Index
                    processStandardIndex(ind, SIoffset, function(err, atoms) {
                        if (err) {
                            ccb(err);
                        } else {
                            k++;
                            processindx(k, ind, indx, ccb);
                        }
                    });
                } else {
                    ccb(null, atoms);
                }
            } catch (err) {
                cb('erreur à processindx dans le fichier ' + info.filename);
            }
        }

        async function dealwithindx(ind, ncb) {
            try {
                // SuperIndexde ind
                var offset = atoms[0].children[0].children[info.tracks[ind].ind].children[info.tracks[ind].indxind].off + 8;
                var nbB = atoms[0].children[0].children[info.tracks[ind].ind].children[info.tracks[ind].indxind].len;
                var buff = await AsyncreadBytes(offset, nbB);
                info.tracks[ind].indx = {};
                var obj = {};
                // read the Super Index chunk
                obj.wLongsPerEntry = buff.getUint16(0, true);
                obj.bIndexSubType = buff.getUint8(2, true);
                obj.bIndexType = buff.getUint8(3, true);
                obj.nEntriesInUse = buff.getUint32(4, true);
                obj.dwChunkId = litCar(buff, 8, 4);
                obj.nbSamples = 0;
                obj.entries = [];
                if (obj.bIndexType == AVI_INDEX_OF_INDEXES) { // bIndexType = 0 <=> AVI_INDEX_OF_INDEXES <=> wLongsPerEntry = 4
                    // 3 dwords reserved
                    for (var j = 0; j < obj.nEntriesInUse; j++) {
                        var obje = {};
                        obje.qWOffset = (buff.getUint32(28 + (j * 16), true) << 32) + buff.getUint32(24 + (j * 16), true);
                        obje.dwSize = buff.getUint32(32 + (j * 16), true);
                        obje.dwDuration = buff.getUint32(36 + (j * 16), true);
                        obj.nbSamples += obje.dwDuration; // in the end : info.tracks[ind].indx.nbSamples must be = info.tracks[ind].strh.dwLength !
                        obj.entries.push(obje);
                    }
                    info.tracks[ind].indx = obj;
                    processindx(0, ind, info.tracks[ind].indx, function retprocessindx(err, atoms) {
                        if (err) {
                            ncb(err);
                        } else {
                            if (ind < info.tracks.length - 1) {
                                ind++;
                                dealwithindx(ind, ncb);
                            } else {
                                ncb(null, atoms);
                            }
                        }
                    });
                } else { // obj.wLongsPerEntry = 2
                    if (bIndexType == AVI_INDEX_OF_CHUNKS) { // bIndexType = 1 <=> AVI_INDEX_OF_CHUNKS <=> wLongsPerEntry = 2
                        var offset = atoms[0].children[0].children[info.tracks[ind].ind].children[info.tracks[ind].indxind].off;
                        processStandardIndex(ind, offset, function ret_processSI_indealwidth(err, atoms) {
                            if (err) {
                                ncb(err);
                            } else {
                                if (ind < info.tracks.length - 1) {
                                    ind++;
                                    dealwithindx(ind, ncb);
                                } else {
                                    ncb(null, atoms);
                                }
                            }
                        });
                    } else { // bIndexType = 80 <=> AVI_INDEX_IS_DATA <=> proceed with movi chunks
                        ncb(null, atoms); // escaped ^^  (never meet but see dealmovi and readframe)
                    }
                }
            } catch (err) {
                cb('erreur à dealwithindx dans le fichier ' + info.filename);
            }
        }

        async function readframe(offset, nbB, nbBytesread, rrdf) {
            try {
                /******************************************************************
                 * Mise en place d'un buffer tamporisé de granulométrie 1 pour accroitre rapidité
                 ******************************************************************/
                var offsetbuff = offset; // valeur initiale
                //var endbuff = false;  
                var taillebuffer = Math.min(BuffSize, info.filesize - offset);
                //var taillebuffer = Math.floor(taillebuffer / 8) * 8;
                var lasttmpbuffer = false;
                if (taillebuffer > 0) {
                    var tmpbuffer = await AsyncreadBytes(offset, taillebuffer); // initialise le buffer
                } else {
                    var tmpbuffer = '';
                }
                var indexbuff = 0; // valeur initiale de l'index buffer
                var nboct_a_lire = 0;
                if (taillebuffer > 0) {
                    var tillend = info.filesize - offsetbuff - indexbuff; // avant lecture 
                    var tillend_in_buffer = taillebuffer - indexbuff;
                } else {
                    var tillend = info.filesize - offset;
                    var tillend_in_buffer = tillend;
                    taillebuffer = tillend;
                    lasttmpbuffer = true;
                    tmpbuffer = await AsyncreadBytes(offset, taillebuffer);
                    indexbuff = 0;
                }

                async function retourne_partie_buffer(offset, nbocts) {
                    indexbuff = offset - offsetbuff;
                    tillend = info.filesize - offsetbuff - indexbuff;
                    tillend_in_buffer = taillebuffer - indexbuff;
                    if (tillend_in_buffer >= nbocts) { // reste suffisamment d'octets
                        var pieceOftmpbuffer = new DataView(tmpbuffer.buffer.slice(indexbuff, indexbuff + nbocts));
                        if (pieceOftmpbuffer.byteLength == nbocts) {
                            return pieceOftmpbuffer;
                        } else {
                            return false;
                        }
                    } else {
                        // buffertmp trop petit : il est nécessaire de le recharger
                        offsetbuff = offset;
                        taillebuffer = Math.min(BuffSize, info.filesize - offset);
                        if (taillebuffer < nbocts) {
                            cb('Internal Error : BufferSize too small at ReadFrame in ' + info.filename);
                            return false;
                        } else {
                            tmpbuffer = await AsyncreadBytes(offset, taillebuffer);
                            indexbuff = 0;
                            tillend = info.filesize - offsetbuff - indexbuff;
                            tillend_in_buffer = taillebuffer - indexbuff;
                            var pieceOftmpbuffer = new DataView(tmpbuffer.buffer.slice(0, nbocts));
                            return pieceOftmpbuffer;
                        }
                    }
                }

                var fuint32;
                var doloop = true;
                do {
                    //var buff = await AsyncreadBytes(offset, 12);
                    var buff = await retourne_partie_buffer(offset, 12);
                    if (litCar(buff, 0, 4) == 'LIST') { // rec
                        // info.tracks[0].keyframesCount++;    NON NON NON
                        nbBytesread += 12;
                        offset += 12; // et on boucle !
                    } else {
                        fuint32 = buff.getUint32(0, true);
                        if (fuint32 === 0) {
                            rrdf(null, atoms);
                            return; // on s'arrête là !! gestion très sommaire : on ne cherche pas à skipper les '00000000'
                        } else {
                            if ((litCar(buff, 2, 2) != "wb") && (litCar(buff, 2, 2) != "dc") && (litCar(buff, 2, 2) != "db")) { // wb :  audio, dc : video compressed, db : video uncompressed
                                return; // on s'arrête là !! gestion très sommaire : on ne cherche pas à skipper les '00000000'
                            }
                            if (litCar(buff, 0, 2) == 'ix') { //     ON skip !! réservé au indx
                                var nbSI = buff.getUint32(4, true);
                                offset += nbSI + 8;
                                nbBytesread += nbSI + 8;
                                if (nbBytesread >= nbB) {
                                    rrdf(null, atoms); //     là, y'a un hic et on quitte !
                                    return false; // dès fois que !??
                                }
                            } else {
                                var indtoupdate = parseInt(litCar(buff, 0, 2));
                                var dwChunkSize = buff.getUint32(4, true);
                                if ((dwChunkSize % 2) == 1) dwChunkSize++;
                                nbBytesread += dwChunkSize + 8;
                                offset += dwChunkSize + 8;
                                info.tracks[indtoupdate].FramesCount++;
                                info.tracks[indtoupdate].Totalsize += dwChunkSize;
                                if (info.tracks[indtoupdate].minSize > dwChunkSize) info.tracks[indtoupdate].minSize = dwChunkSize;
                                if (info.tracks[indtoupdate].maxSize < dwChunkSize) info.tracks[indtoupdate].maxSize = dwChunkSize;
                                if ((nbBytesread >= nbB) || (offset > info.filesize)) {
                                    rrdf(null, atoms); //     là, y'a un hic et on quitte !
                                    return false; // dès fois que !??
                                }
                            }
                        }
                    }
                } while (doloop);
            } catch (err) {
                cb('erreur à readframe dans le fichier ' + info.filename);
            }
        }

        function dealmovi(indm, rdm) {
            try {
                var offset = atoms[indm].children[info.ismovi[indm]].off + 12; // LIST of movi !
                var nbB = atoms[indm].children[info.ismovi[indm]].len - 4;
                var nbBytesread = 0;
                readframe(offset, nbB, nbBytesread, function retdealmovi(err, atoms) {
                    if (err) {
                        rdm(err);
                    } else {
                        if (indm < info.ismovi.length - 1) {
                            indm++;
                            dealmovi(indm, rdm);
                        } else {
                            rdm(null, atoms);
                        }
                    }
                });
            } catch (err) {
                cb('erreur à dealmovi dans le fichier ' + info.filename);
            }
        }

        function sizebymovis(indice, sbmcb) {
            try {
                dealmovi(0, function retdealmovi(err, atoms) {
                    if (err) {
                        sbmcb(err);
                    } else {
                        sbmcb(null, atoms);
                    }
                });
            } catch (err) {
                cb('erreur à sizebymovis dans le fichier ' + info.filename);
            }
        }

        function parsesizes(atoms, withmovis, cb) {
            if (!withmovis && !info.isOpenDML && info.AVIF_HASINDEX && (info.isidx1 == -1)) { // si nous n'avons pas trouvé d'atome indx et que tout nous semble qu'il existe
                withmovis = true; // on va tenter de calculer la taille avec l'atome 'movi'  
            }
            if (withmovis) {
                // count sizes with movi(s)
                sizebymovis(0, function retdealmovi(err, atoms) {
                    if (err) {
                        cb(err);
                    } else {
                        cb(null, atoms);
                    }
                });
            } else {
                try { // considère que withmovis = false
                    if (!info.isOpenDML && info.AVIF_HASINDEX) { // more current AVI ancien et avec index  TEST : on change info.isOpen pour tester parsesize quand info.isidx1 = -1
                        var offsetbase = atoms[0].children[info.isidx1].off + 8;
                        var idx1length = atoms[0].children[info.isidx1].len;
                        //var BuffSize=16*16*1024;
                        var nbloop = Math.floor(idx1length / BuffSize);
                        var lastloop = idx1length % BuffSize;
                        var obj = {
                            Totalsize: 0,
                            min: 0,
                            max: 0,
                            count: 0
                        };
                        if (idx1length > 0) {
                            traiteBuffer(0, offsetbase, nbloop, lastloop, BuffSize, function rettraiteBuffer(err, atoms) {
                                if (err) {
                                    cb(err);
                                } else {
                                    cb(null, atoms);
                                }
                            });
                        } else {
                            cb(null, atoms);
                        }
                    } else {
                        if (info.isOpenDML) {
                            dealwithindx(0, function retdealwith_inparsesizes(err, atoms) {
                                if (err) {
                                    cb(err);
                                } else {
                                    cb(null, atoms);
                                }
                            });
                        } else {
                            // count sizes with movi(s) forced !
                            sizebymovis(0, function retdealmovi(err, atoms) {
                                if (err) {
                                    cb(err);
                                } else {
                                    cb(null, atoms);
                                }
                            });
                        }
                    }
                } catch (err) {
                    cb('erreur à parsesizes dans le fichier ' + info.filename);
                }
            }
        }

        async function parsestrf(ind, atoms, cb) {
            try {
                var indhdlr = info.tracks[ind].ind;
                var indstrf = info.tracks[ind].strfind;
                var nbB = atoms[0].children[0].children[indhdlr].children[indstrf].len;
                var offset = atoms[0].children[0].children[indhdlr].children[indstrf].off + 8;
                var buff = await AsyncreadBytes(offset, nbB);
                var obj = {};
                if (info.tracks[ind].strh.Typet == "vids") {
                    /**************************  BITMAPINFOHEADER structure ****************************************************************/
                    obj.biSize = buff.getUint32(0, true);
                    obj.biWidth = buff.getUint32(4, true);
                    obj.biHeight = buff.getUint32(8, true);
                    obj.biPlanes = buff.getUint16(12, true);
                    obj.biBitCount = buff.getUint16(14, true);
                    //obj.biCompression = buff.getUint32(16, true);
                    obj.biCompression = litCar(buff, 16, 4);
                    obj.biSizeImage = buff.getUint32(20, true);
                    obj.biXPelsPerMeter = buff.getUint32(24, true);
                    obj.biYPelsPerMeter = buff.getUint32(28, true);
                    obj.biClrUsed = buff.getUint32(32, true);
                    obj.biClrImportant = buff.getUint32(36, true);
                    /**************************  end of BITMAPINFOHEADER structure *********************************************************/
                }
                if (info.tracks[ind].strh.Typet == "auds") {
                    /**************************  WAVEFORMATEX structure ********************************************************************/
                    obj.wFormatTag = buff.getUint16(0, true); // format type
                    obj.nChannels = buff.getUint16(2, true); // number of channels (i.e. mono, stereo...)
                    obj.nSamplesPerSec = buff.getUint32(4, true); // sample rate
                    obj.nAvgBytesPerSec = buff.getUint32(8, true); // for buffer estimation
                    obj.nBlockAlign = buff.getUint16(12, true); // block size of data
                    obj.wBitsPerSample = buff.getUint16(14, true); // Number of bits per sample of mono data
                    // We don't need - for this purpose of cdSize :-))
                    //if (buff.byteLength > 16){
                    //    obj.cbSize = buff.getUint16(16, true);          // The count in bytes of the size of extra information (after cbSize) 
                    //}
                    /***************************************** end of WAVEFORMATEX *********************************************************/
                    /*    don't bother of the rest if exists !  If cbSize>0 some more precisions for audio stream                          */
                }
                info.tracks[ind].strf = obj;
                if (ind < info.tracks.length - 1) {
                    ind += 1;
                    parsestrf(ind, atoms, cb);
                } else {
                    cb(null, atoms);
                }
            } catch (err) {
                cb('erreur à parsestrf dans le fichier ' + info.filename);
            }
        }

        async function parsestrh(ind, atoms, cb) {
            try {
                var indhdlr = info.tracks[ind].ind;
                var indstrh = info.tracks[ind].strhind;
                var nbB = atoms[0].children[0].children[indhdlr].children[indstrh].len;
                var offset = atoms[0].children[0].children[indhdlr].children[indstrh].off + 8;
                var buffer = await AsyncreadBytes(offset, nbB);
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
                info.tracks[ind].strh = obj;

                if ((obj.Typet == 'vids') && (!info.dureeS)) {
                    info.dureeS = obj.dwLength * obj.dwScale / obj.dwRate;
                }
                //info
                if (ind < info.tracks.length - 1) {
                    ind += 1;
                    parsestrh(ind, atoms, cb);
                } else {
                    parsestrf(0, atoms, function retparsestrf_in_parsestrh(err, atoms) {
                        if (err) {
                            cb(err);
                        } else {
                            cb(null, atoms);
                        }
                    });
                }
            } catch (err) {
                cb('erreur à parsestrh dans le fichier ' + info.filename);
            }
        }

        function parsehdlr(atoms, cb) {
            try {
                parsestrh(0, atoms, function ret_parsestrh_in_parsehdlr(err, atoms) {
                    if (err) {
                        cb(err);
                    } else {
                        cb(null, atoms);
                    }
                });
            } catch (err) {
                cb('erreur à parsehdlr dans le fichier ' + info.filename);
            }
        }

        async function parseavih(offset, nbB, atoms, cb) {
            try {
                var buffer = await AsyncreadBytes(offset, nbB);
                info.AVIF_HASINDEX = false;
                info.AVIF_MUSTUSEINDEX = false;
                info.AVIF_ISINTERLEAVED = false;
                info.AVIF_WASCAPTUREFILE = false;
                info.AVIF_COPYRIGHTED = false;
                info.dwMicroSecPerFrame = buffer.getUint32(0, true);
                info.dwMaxBytesPerSec = buffer.getUint32(4, true);
                info.dwPaddingGranularity = buffer.getUint32(8, true);
                info.dwFlags = buffer.getUint32(12, true);
                info.dwTotalFrames = buffer.getUint32(16, true); // in the first RIFF-AVI !!
                info.dwInitialFrames = buffer.getUint32(20, true);
                info.dwStreams = buffer.getUint32(24, true);
                info.dwSuggestedBufferSize = buffer.getUint32(28, true);
                info.dwWidth = buffer.getUint32(32, true);
                info.dwHeight = buffer.getUint32(36, true);
                info.dwScale = buffer.getUint32(40, true);
                info.dwRate = buffer.getUint32(44, true);
                info.dwStart = buffer.getUint32(48, true);
                info.dwLength = buffer.getUint32(52, true);
                if ((info.dwFlags & AVIF_HASINDEX) > 0) {
                    info.AVIF_HASINDEX = true;
                }
                if ((info.dwFlags & AVIF_MUSTUSEINDEX) > 0) info.AVIF_MUSTUSEINDEX = true;
                if ((info.dwFlags & AVIF_ISINTERLEAVED) > 0) info.AVIF_ISINTERLEAVED = true;
                if ((info.dwFlags & AVIF_WASCAPTUREFILE) > 0) info.AVIF_WASCAPTUREFILE = true;
                if ((info.dwFlags & AVIF_COPYRIGHTED) > 0) info.AVIF_COPYRIGHTED = true;
                cb(null, atoms);
            } catch (err) {
                cb('erreur à parseavih dans le fichier ' + info.filename);
            }
        }

        async function parseinfo(picb) {
            try {
                if (info.isINFO > -1) {
                    var atominfo = atoms[0].children[info.isINFO];
                    info.swft = {
                        offset: 0,
                        length: 0,
                        name: ''
                    };
                    for (var j = 0; j < atominfo.children.length; j++) {
                        if (atominfo.children[j].name == 'ISFT') {
                            info.swft.offset = atominfo.children[j].off + 8;
                            info.swft.length = atominfo.children[j].len;
                        }
                    }
                    if (info.swft.offset > 0) {
                        var buffer = await AsyncreadBytes(info.swft.offset, info.swft.length);
                        info.swft.name = litCar(buffer, 0, info.swft.length);
                        picb(null, atoms);
                    } else {
                        picb(null, atoms);
                    }
                } else {
                    picb(null, atoms);
                }
            } catch (err) {
                cb('erreur à parseinfo dans le fichier ' + info.filename);
            }
        }

        async function skipchunknull(offset) {
            // initial 4 premiers octets sont lus en 'byte' dans fuint32
            var firsterror = true;
            var lasterrormess = '';
            do {
                var endbuff = false;
                var taillebuffer = Math.min(BuffSize, info.filesize - offset);
                var taillebuffer = Math.floor(taillebuffer / 8) * 8;
                var tmpbuffer = await AsyncreadBytes(offset, taillebuffer); // genere une erreur si buffsize + offset dépasse 
                var indexbuff = 0;
                if (taillebuffer > 0) {
                    do {
                        var fuint32 = tmpbuffer.getUint32(0 + (8 * indexbuff), true);
                        var suint32 = tmpbuffer.getUint32(4 + (8 * indexbuff), true);
                        var int64iszero = (fuint32 == 0) && (suint32 == 0);
                        if (firsterror) {
                            errlect.push('╔ chunk null en offset=' + (offset + (8 * indexbuff)));
                            firsterror = false;
                        } else {
                            lasterrormess = '╚ chunk null en offset=' + (offset + (8 * indexbuff));
                        }
                        indexbuff += 1; // pointe sur suivant qu'on n'a donc pas lu
                    } while (int64iszero && ((8 * (indexbuff + 1)) < taillebuffer));
                    offset += (8 * indexbuff); // offset référence le prochain non lu
                    if (int64iszero) {
                        endbuff = true; // on continue seulement si on dépasse ET que l'on a toujours 00000000 00000000 
                    }
                }
            } while (endbuff); // int64iszero = false

            if ((offset + 8) > info.filesize) offset = info.filesize;
            if (lasterrormess != '') {
                errlect.push('║  -----');
                errlect.push(lasterrormess);
            }
            return offset;
        }

        async function skipavinindex(offset) {
            do {
                var endbuff = false;
                var taillebuffer = Math.min(BuffSize, info.filesize - offset);
                var taillebuffer = Math.floor(taillebuffer / 8) * 8;
                var tmpbuffer = await AsyncreadBytes(offset, taillebuffer); // genere une erreur si buffsize + offset dépasse 
                var indexbuff = 0;
                do {
                    // traite les listes d'index 'inattendues'
                    var nameleft = litCar(tmpbuffer, indexbuff, 2);
                    var nameright = litCar(tmpbuffer, indexbuff + 2, 2);
                    var sizechunk = tmpbuffer.getUint32(indexbuff + 4, true);
                    if ((sizechunk % 2) == 1) sizechunk += 1;
                    indexbuff += sizechunk + 8; // indexbuff pointe déjà sue le suivant (à lire)
                    var tantque1 = (semitag.indexOf(nameleft) != -1) || (semitag.indexOf(nameright) != -1);
                    var tantque2 = (indexbuff + 8) < taillebuffer;
                    var tantque3 = (sizechunk == 16);
                } while (tantque1 && tantque2 && !tantque3);
                if (!tantque1) {
                    var truc = 4;
                }
                offset = offset + indexbuff;
                if (tantque3 && tantque1) {
                    var truc = 8;
                }
                endbuff = true;
                if ((tantque1 && tantque3) || (!tantque1)) {
                    endbuff = false;
                    offset = offset - sizechunk - 8;
                }
            } while (endbuff); // int64iszero = false !
            return offset;
        }

        async function readAtoms(offset, ascendance, Boxes, racb) {
            try {
                var ascendance, BoxeMere, atomname;

                if (!racb) {
                    racb = Boxes;
                    Boxes = [];
                    var mere = {};
                    mere.name = "OldMammy";
                    mere.offset = 0;
                    mere.len = info.filesize;
                    mere.Off = 0;
                    mere.children = [];
                    mere.nbread = 0;
                    Boxes.push(mere);
                }

                var myBoxe = {};
                if (offset == info.filesize) {
                    racb(null, Boxes); // end !
                } else {
                    //if (offset == info.filesize) racb(null, Boxes); // OK ! End of search tree - Sortie de la boucle recherche d'arbre
                    if (offset + 8 > info.filesize) {
                        // considère que c'est une erreur de fichier et, en l'occurence, on dit que c'est fini 
                        errlect.push('dernier atome trop petit');
                        racb(null, Boxes);
                    } else {
                        if (offset + 8 == info.filesize) { // precaution !! Never meet but ?? Anyway ! Normalement, jamais rencontrÃ© mezokaou !?
                            // search mother 
                            errlect.push('dernier atome trop petit offset+8 égale taille du fichier - fin de readAtoms');
                            var buffer = await AsyncreadBytes(offset, 4);
                            BoxeMere = Boxes[0];
                            for (var k = 1; k < ascendance.length; k++) {
                                BoxeMere = BoxeMere.children[ascendance[k]];
                            }
                            atomname = litCar(buffer, 0, 4);
                            var myBoxe = {};
                            myBoxe.name = atomname;
                            myBoxe.off = Boxes[0].nbread;
                            myBoxe.len = 0;
                            BoxeMere.Children.push(myBoxe);
                            racb(null, Boxes);
                        } else {
                            if ((offset + 12) > info.filesize) {
                                racb(null, Boxes); //tente de continuer qd meme 
                            } else {
                                var buffer = await AsyncreadBytes(offset, 12);
                                var fuint32 = buffer.getUint32(0, true);
                                //atomname = litCar(buffer, 0, 4); 
                                if (fuint32 == 0) {
                                    nextoffset = await skipchunknull(offset);
                                    if (nextoffset + 12 > info.filesize) {
                                        racb(null, Boxes); //tente de continuer qd meme 
                                        return;
                                    } else {
                                        var buffer = await AsyncreadBytes(nextoffset, 12);
                                    }
                                }
                                //else {
                                atomname = litCar(buffer, 0, 4);
                                if (atomname == "RIFF") {
                                    myBoxe.name = litCar(buffer, 8, 4);
                                    myBoxe.len = buffer.getUint32(4, true);
                                    if ((myBoxe.len % 2) == 1) {
                                        myBoxe.len += 1; // ATTENTION : in movi list, this is necessary !!
                                        errlect.push('Petit problème de parité !');
                                    }
                                    myBoxe.ind = Boxes[0].children.length;
                                    myBoxe.children = [];
                                    myBoxe.nbread = 0;
                                    myBoxe.off = Boxes[0].nbread;
                                    BoxeMere = Boxes[0];
                                    ascendance = [0];
                                    BoxeMere.nbread += 12;
                                    BoxeMere.children.push(myBoxe);
                                    ascendance.push(myBoxe.ind);
                                    readAtoms(Boxes[0].nbread, ascendance, Boxes, function(err, Boxes) {
                                        if (err) {
                                            racb(err);
                                        } else {
                                            racb(null, Boxes);
                                        }
                                    });
                                } else {
                                    if (atomname == "LIST") {
                                        // find atom mother - recherche de la mère 
                                        BoxeMere = Boxes[0];
                                        for (var k = 1; k < ascendance.length; k++) {
                                            BoxeMere = BoxeMere.children[ascendance[k]];
                                        }
                                        myBoxe.name = litCar(buffer, 8, 4);
                                        myBoxe.len = buffer.getUint32(4, true);
                                        if ((myBoxe.len % 2) == 1) {
                                            myBoxe.len += 1; // ATTENTION : in movi list, this is necessary !!
                                            errlect.push('Petit problème de parité !');
                                        }
                                        myBoxe.ind = BoxeMere.children.length;
                                        myBoxe.children = [];
                                        myBoxe.nbread = 0;
                                        myBoxe.off = Boxes[0].nbread;
                                        BoxeMere.children.push(myBoxe);
                                        ascendance.push(myBoxe.ind);
                                        // update all mothers number of bytes read - mise à jour du nombre d'octets lus pour toutes les mÃ¨res
                                        BoxeMere = Boxes[0];
                                        BoxeMere.nbread += 12;
                                        for (var k = 1; k < ascendance.length; k++) {
                                            BoxeMere = BoxeMere.children[ascendance[k]];
                                            BoxeMere.nbread += 12;
                                        }
                                        if (myBoxe.name == 'movi') { // Don't try to read en built this part !! too big.
                                            Boxes[0].nbread += myBoxe.len - 4;
                                            while (ascendance.length > 2) ascendance.pop();
                                        }
                                        readAtoms(Boxes[0].nbread, ascendance, Boxes, function(err, Boxes) {
                                            if (err) {
                                                racb(err);
                                            } else {
                                                racb(null, Boxes);
                                            }
                                        });
                                    } else { // ni RIFF ni LIST    (neigher RIFF neigher LIST) 
                                        var buffer = await AsyncreadBytes(offset, 12);
                                        var fuint32 = buffer.getUint32(0, true);
                                        //atomname = litCar(buffer, 0, 4); 
                                        if (fuint32 == 0) {
                                            nextoffset = await skipchunknull(offset);
                                            if (nextoffset + 12 > info.filesize) {
                                                //racb(null, Boxes);  //tente de continuer qd meme 
                                                return;
                                            } else {
                                                var buffer = await AsyncreadBytes(nextoffset, 12);
                                            }
                                        }
                                        atomname = litCar(buffer, 0, 4);
                                        // récupère la mère - find mother     
                                        BoxeMere = Boxes[0];
                                        for (var k = 1; k < ascendance.length; k++) {
                                            BoxeMere = BoxeMere.children[ascendance[k]];
                                        }
                                        myBoxe.name = atomname;
                                        var nameleft = myBoxe.name.substr(0, 2);
                                        var nameright = myBoxe.name.substr(2, 2);
                                        if ((semitag.indexOf(nameleft) != -1) || (semitag.indexOf(nameright) != -1)) {
                                            var nextoffset = await skipavinindex(offset);
                                            var buffer = await AsyncreadBytes(nextoffset, 12);
                                            offset = nextoffset;
                                        }
                                        atomname = litCar(buffer, 0, 4);
                                        myBoxe.name = atomname;
                                        myBoxe.off = offset;
                                        myBoxe.len = buffer.getUint32(4, true);
                                        if ((myBoxe.len % 2) == 1) myBoxe.len += 1; // ATTENTION : in movi list, this is necessary !!
                                        myBoxe.ind = BoxeMere.children.length;
                                        myBoxe.children = [];
                                        myBoxe.nbread = 0;
                                        BoxeMere.children.push(myBoxe);
                                        ascendance.push(myBoxe.ind);
                                        if (myBoxe.name == 'JUNK') {
                                            info.JUNKS.push(ascendance.join("-"));
                                        }

                                        // update all mothers number of bytes read - mise à jour du nombre d'octets lus pour toutes les mÃ¨res
                                        BoxeMere = Boxes[0];
                                        BoxeMere.nbread += myBoxe.len + 8;
                                        for (var k = 1; k < ascendance.length - 1; k++) {
                                            BoxeMere = BoxeMere.children[ascendance[k]];
                                            BoxeMere.nbread = myBoxe.off + myBoxe.len + 8 - BoxeMere.off;
                                        }
                                        // find last mother to have children - recherche derniÃ¨re mÃ¨re a pouvoir avoir des enfants
                                        ascendance.pop();
                                        while ((BoxeMere.nbread >= BoxeMere.len - 1) && (BoxeMere.name != "OldMammy")) {
                                            ascendance.pop();
                                            BoxeMere = Boxes[0];
                                            for (var k = 1; k < ascendance.length; k++) {
                                                BoxeMere = BoxeMere.children[ascendance[k]];
                                            }
                                        }
                                        readAtoms(Boxes[0].nbread, ascendance, Boxes, function(err, info) {
                                            if (err) {
                                                racb(err);
                                            } else {
                                                racb(null, Boxes);
                                            }
                                        });
                                    }
                                } // ni RIFF ni LIST
                            } // (offset + 12) > info.filesize
                        } // (offset + 8 == info.filesize)
                    } // (offset + 8 > info.filesize)
                } // (offset == info.filesize)
            } catch (err) {
                // test encore de récupérer des infos à partir des informations de parseAVI
                cb('erreur à readAtoms dans le fichier ' + info.filename);
            }
        }

        readAtoms(0, [0], function(err, Boxes) {
            if (err) {
                callback(err);
            } else {
                atoms = [];
                Boxes = purgeboxesJUNK(Boxes);
                for (var v = 0; v < Boxes[0].children.length; v++) atoms.push(Boxes[0].children[v]);
                Boxes = null;
                info.isInterleaved = false;
                info.isOpenDML = false;
                for (var i = 0; i < atoms.length; i++) {
                    if (atoms[i].name == 'AVIX') info.isOpenDML = true; // Theorical, after purgeboxesJUNK, if atoms.length > 1 OPENDML is true ;)
                }
                if (atoms[0].children[0].children[0].name == 'avih') { // Theorical, after purgeboxesJUNK, it's allways avih box ;)
                    parseavih(atoms[0].children[0].children[0].off + 8, atoms[0].children[0].children[0].len, atoms, function retparseavih(err, atoms) {
                        if (err) {
                            callback(err);
                        } else {
                            var atomhdlr = atoms[0].children[0];
                            info.isodml = -1;
                            info.isidx1 = -1;
                            info.ismovi = [];
                            info.isINFO = -1;
                            for (var j = 1; j < atomhdlr.children.length; j++) {
                                // theorical : info.tracks.length=info.dwStreams !
                                if (atomhdlr.children[j].name == 'strl') {
                                    var track = {};
                                    track.ind = j;
                                    info.tracks.push(track);
                                }
                                if (atomhdlr.children[j].name == 'odml') {
                                    info.isodml = j;
                                }
                            }
                            for (var i = 0; i < atoms[0].children.length; i++) {
                                if (atoms[0].children[i].name == 'movi') info.ismovi.push(i);
                                if (atoms[0].children[i].name == 'idx1') {
                                    info.isidx1 = i;
                                }
                                if (atoms[0].children[i].name == 'INFO') {
                                    info.isINFO = i;
                                }
                            }
                            for (var k = 0; k < info.tracks.length; k++) {
                                var indhdlr = info.tracks[k].ind;
                                var atomstrl = atoms[0].children[0].children[indhdlr];
                                for (var j = 0; j < atomstrl.children.length; j++) {
                                    if (atomstrl.children[j].name == 'strh') {
                                        info.tracks[k].strhind = j;
                                    }
                                    if (atomstrl.children[j].name == 'strf') {
                                        info.tracks[k].strfind = j;
                                    }
                                    if (atomstrl.children[j].name == 'indx') { // for OPEN DML
                                        info.tracks[k].indxind = j;
                                    }
                                }
                            }
                            for (var k = 1; k < atoms.length; k++) {
                                if (atoms[k].name == "AVIX") {
                                    for (var u = 0; u < atoms[k].children.length; u++) {
                                        if (atoms[k].children[u].name == "movi") info.ismovi.push(u);
                                    }
                                }
                            }
                            parsehdlr(atoms, function retparsehdlr(err, atoms) {
                                if (err) {
                                    callback(err);
                                } else {
                                    var obj = {
                                        Totalsize: 0,
                                        min: 0,
                                        max: 0,
                                        count: 0
                                    };
                                    for (var t = 0; t < info.tracks.length; t++) {
                                        info.tracks[t].Totalsize = 0;
                                        info.tracks[t].FramesCount = 0;
                                        info.tracks[t].minSize = 65535;
                                        info.tracks[t].maxSize = 0;
                                        info.tracks[t].keyframesCount = 0;
                                    }
                                    parsesizes(atoms, info.withmovis, function retparsesizes(err, atoms) {
                                        if (err) {
                                            callback(err);
                                        } else {
                                            parseodml(function retparseodml(err, atoms) {
                                                if (err) {
                                                    callback(err);
                                                } else {
                                                    parseinfo(function retparseinfo(err, atoms) {
                                                        if (err) {
                                                            callback(err);
                                                        } else {
                                                            for (var i = 0; i < info.tracks.length; i++) {
                                                                if ((info.tracks[i].strh.Typet == 'txts') && (info.tracks[i].Totalsize == 0)) {
                                                                    // size of subtitles = 0 
                                                                    info.tracks[i].Totalsize = info.tracks[i].strh.dwSuggestedBufferSize;
                                                                }
                                                                if (info.tracks[i].strh.Typet == 'auds') {
                                                                    info.tracks[i].audiocodec = xTagsAudio[info.tracks[i].strf.wFormatTag.toString(16).toUpperCase()];
                                                                }
                                                            }
                                                            info.errors = errlect;
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
    //try {
    AVIRiff.parse(function(err, tags) {
        cb(err, tags);
    });
    //} catch (error) {
    //    cb('erreur dans le fichier '+info.filename);
    //}   
}; // avi


if (typeof module !== 'undefined' && module.exports) {
    module.exports = avi;
} else {
    if (typeof define === 'function' && define.amd) {
        define('avi', [], function() {
            return avi;
        });
    }
};
