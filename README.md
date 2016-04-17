#AVIInfo 

   Sort of "Mediainfo" for AVI Files - little AVIParser (just for main technics information about the file)

#Dependances : null

#Usage :

    <script src="AVIInfo.js" type="text/javascript" charset="utf-8"></script> 
    (in single file .html)

    importScripts('AVIInfo.js');                                              
    (in worker)


#How use it :

     
            avi(this.files[0], function(err, info) {
                if (err) {
                    .....
                } else {
                    sortie_texte = human_reading(info);
                    ....
                }
            }); 

    because there are two ways for calculate the sizes of each stream, there is a masked option :

     
            avi(this.files[0], withmovis, function(err, info) {
                if (err) {
                    .....
                } else {
                    sortie_texte = human_reading(info);
                    ....
                }
            }); 
    
    where 'withmovis' is false or true (false by default or by ignore). When withmovis is true, AVIInfo will calculate sizes by reading each size of each frame. It's more exact but more slower


  AVIInfo return an object structured (named 'info') wich contains a lot of technicals information about the file.
  If we want to read this informations, we need to make them readable. So human_reading is here !

#Examples :
	
	for a single file and no worker : index.html
	for multiple files and worker   : indexw.html

#Try it ? 
    http://aroug.eu/AVIInfo/   (multiple + worker)  
