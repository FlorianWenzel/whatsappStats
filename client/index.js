
document.getElementById('file').onchange = function(event) {
    const fileList = document.getElementById('file').files;
    const reader = new FileReader();
    reader.onload = function(event) {
        let messages = [];
        let senders = [];
        let words = [];
        lines = event.target.result.split(/[\n]|[↵]/gi);
        for(i = 0; i < lines.length; i++){
            message = {};
            if(lines[i].includes('Video weggelassen') || lines[i].includes('Bild weggelassen') || lines[i].includes('Audio weggelassen')|| lines[i].includes('GIF weggelassen') || lines[i].includes(' hat die Gruppe erstellt.') || lines[i].includes('hat das Gruppenbild geändert.') || lines[i].includes('hat das Gruppenbild gelöscht.') || lines[i].includes('Du wurdest hinzugefügt') || lines[i].includes('‎Nachrichten an diese Gruppe sind jetzt mit Ende-zu-Ende-Verschlüsselung geschützt.') || (lines[i].includes('den Betreff zu ') && lines[i].includes(' geändert.'))){
                continue;
            }
            let parts = lines[i].split(': ');
            let misc = parts[0];
            message.sender = misc.split('] ')[1];
            let knownSender = false;
            for(j = 0; j < senders.length; j++){
                if(senders[j].name === message.sender){
                    senders[j].count ++;
                    knownSender = true;
                }
            }
            if(!knownSender){
                senders.push({name : message.sender, count : 1});
            }
            let messageContent = '';
            for(j = 1; j < parts.length; j++){
                messageContent += parts[j];
            }
            //words
            singleWords = messageContent.toLowerCase().replace(/[,]|[.]|[!]|[?]|["]|[\n]|[↵]/gi,'').split(' ');
            for(j = 0; j < singleWords.length; j++){
                let knownWord = false;
                if(singleWords[j] === 'sick'){
                    console.log(lines[i])
                }
                for(u = 0; u < words.length; u++){
                    if(words[u].value === singleWords[j]){
                        if(singleWords[j] === 'sick'){
                            console.log('A  ' + lines[i])
                        }
                        words[u].count ++;
                        knownWord = true;
                        break;
                    }
                }
                if(!knownWord){
                    if(singleWords[j] === 'sick'){
                        console.log('B  ' + lines[i])
                    }
                    words.push({value : singleWords[j], count : 1});
                }
            }
            words.sort((a, b) =>{
                if(a.count < b.count){
                    return 1;
                }else if(a.count === b.count){
                    return 0;
                }else{
                    return -1;
                }
            })
        }
        for(j=0;j<words.length;j++){
            if(words[j].value === 'sick'){
                console.log(words[j].count)
            }
        }
        console.log(words)
    };
    reader.readAsText(fileList[0]);

};