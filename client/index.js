const colors = [
    '255, 99, 132',
    '54, 162, 235',
    '255, 206, 86',
    '75, 192, 192',
    '53, 102, 255',
    '255, 159, 64',
    '129, 2, 247',
    '0, 200, 0',
    '200, 0, 200'
];
document.getElementById('file').onchange = function(event) {
    const fileList = document.getElementById('file').files;
    const reader = new FileReader();
    reader.onload = function(event) {
        document.getElementById('charts').classList.remove('hidden');
        document.getElementById('selectButton').classList.add('hidden');
        let senders = [];
        let linesByDate = [];
        let linesByHour = [];
        let words = [];
        let previousSender = null;
        let previousDate = null;
        let previousHour = null;
        let lines = event.target.result.split(/[\n]|[↵]/gi);
        //lines = lines.splice(lines.length - 1000, lines.length);
        for(let i = 0; i < lines.length; i++){
            let message = {};
            if(lines[i].includes('Video weggelassen') || lines[i] === '\n' || lines[i].includes('Bild weggelassen') || lines[i].includes('hat die Gruppe verlassen') || lines[i].includes('hinzugefügt.') || lines[i].includes('hat die Telefonnummer gewechselt. ‎Tippe,') || lines[i].includes(' hat die Gruppe “')  || lines[i].includes('Audio weggelassen')|| lines[i].includes('GIF weggelassen') || lines[i].includes(' hat die Gruppe erstellt.') || lines[i].includes('hat das Gruppenbild geändert.') || lines[i].includes('hat das Gruppenbild gelöscht.') || lines[i].includes('Du wurdest hinzugefügt') || lines[i].includes('‎Nachrichten an diese Gruppe sind jetzt mit Ende-zu-Ende-Verschlüsselung geschützt.') || (lines[i].includes('den Betreff zu ') && lines[i].includes(' geändert.'))){
                continue;
            }
            let parts = lines[i].split(': ');
            let misc = parts[0];
            message.sender = misc.split('] ')[1];
            if(!message.sender){
                message.sender = previousSender;
            }else{
                previousSender = message.sender;
            }

            if(lines[i].startsWith('[') && lines[i].startsWith(']', 19)){
                message.date = parts[0].split(',')[0].replace('[', '');
                previousDate = message.date;
            }else{
                message.date = previousDate;
            }

            if(lines[i].startsWith('[') && lines[i].startsWith(']', 19)){
                message.hour = parseInt(parts[0].split('] ')[0].split(', ')[1].split(':')[0]);
                previousHour = message.hour;
            }else{
                message.hour = previousHour;
            }

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

            linesByDate.push({value: messageContent, date:message.date});
            linesByHour.push({value: messageContent, hour: message.hour, sender: message.sender})
            //words
            let singleWords = messageContent.toLowerCase();
            singleWords = singleWords.replace(/[,]|[.]|[!]|[?]|["]|[\n]|[↵]/gi,'')
            singleWords = singleWords.split(' ');
            for(j = 0; j < singleWords.length; j++){
                singleWords[j] = singleWords[j].trim()
                if(singleWords[j] === ''){
                    continue;
                }
                let knownWord = false;
                for(u = 0; u < words.length; u++){
                    if(words[u].value === singleWords[j]){
                        words[u].count ++;
                        let wordSenders = words[u].senders;
                        let alreadyASender = false
                        for(l = 0; l < wordSenders.length; l++){
                            if(wordSenders[l].name === message.sender){
                                wordSenders[l].count ++;
                                alreadyASender = true;
                                break;
                            }
                        }
                        if(!alreadyASender){
                            wordSenders.push({name:message.sender, count: 1})
                        }
                        knownWord = true;

                        break;
                    }
                }
                if(!knownWord){
                    words.push({value : singleWords[j], count : 1, senders : [{name:message.sender, count: 1}]});
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

        drawByHour(linesByHour, senders);
        drawMostChattersChart(senders);
        drawTopWords(words.slice(0, 25), senders);
        drawTimeline(linesByDate);
    };
    reader.readAsText(fileList[0]);
};

function drawMostChattersChart(senders){
    let labels = [];
    let data = [];
    let backgroundColor = [];
    let borderColor = [];
    for(let i = 0; i < senders.length; i++){
        labels.push(senders[i].name);
        data.push(senders[i].count);
        backgroundColor.push('rgba(' + colors[i % colors.length] + ',0.2)')
        borderColor.push('rgba(' + colors[i % colors.length] + ',1)')

    }
    let ctx = document.getElementById("myChart");
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: '# of messages by date',
                data: data,
                backgroundColor: backgroundColor,
                borderColor: borderColor,
                borderWidth: 1
            }]
        }
    });
}
function drawTopWords(words, senders){
    let labels = [];
    let datasets = [];
    for(let i = 0; i < senders.length; i++){
        datasets.push({
            label: senders[i].name,
            data: [],
            backgroundColor: 'rgba('+colors[i+0 % colors.length]+',0.2)',
            borderColor: 'rgba('+colors[i+0 % colors.length]+',1)',
            borderWidth: 1
        });
    }
    for(let i = 0; i < words.length; i++){
        labels.push(words[i].value);
        for(let sender of senders){
            let foundSender = false;
            for(let s of words[i].senders){
                if(s.name.includes(sender.name)){
                    for(let j = 0; j < datasets.length; j++){
                        if(datasets[j].label === sender.name){
                            datasets[j].data.push(s.count);
                            foundSender = true;
                            break;
                        }
                    }
                }
            }
            if(!foundSender) {
                for (let dataset of datasets) {
                    if (dataset.label === sender.name) {
                        dataset.data.push(0)
                    }
                }
            }
        }

    }
    let ctx = document.getElementById("topWords");
    ctx.height = words.length * senders.length * 20;
    new Chart(ctx, {
        type: 'horizontalBar',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            maintainAspectRatio: false,
        }
    });
}
function drawTimeline(linesByDate){
    let months = [];
    for(let line of linesByDate){
        let knownDate = false;
        for(let month of months){
            if(month.date === line.date.split('.')[1] + '.' + line.date.split('.')[2]){
                month.count++;
                knownDate = true;
                break;
            }
        }
        if(!knownDate){
            months.push({ date:line.date.split('.')[1] + '.' + line.date.split('.')[2], count: 1});
        }
    }
    let labels = [];
    let data = [];
    for(let day of months){
        d  = day.date.split('.')[0];
        labels.push(day.date);
        data.push(day.count);
    }

    let ctx = document.getElementById("timeline");
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '# of messages',
                data: data,
                backgroundColor: 'rgba(54, 162, 235, .2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        }
    });
}
function drawByHour(linesByHour, senders){
    let hoursBySender = [];
    let labels = [];
    for(let i = 0; i < senders.length; i++) {
        for (let line of linesByHour) {
            if (!hoursBySender[i]){
                hoursBySender[i] = [];
            }
            if(line.sender === senders[i].name){
                if (hoursBySender[i][line.hour]) {
                    hoursBySender[i][line.hour]++;
                } else {
                    hoursBySender[i][line.hour] = 1;
                }
            }
        }
    }
    let datasets = [];
    for(let i = 0; i < senders.length; i++){
        datasets[i] = {
            data: []
        };
        for(let hour = 0; hour < 24; hour++){
            if(i===0){
                labels.push(hour + ':00');
            }
            datasets[i].data.push(hoursBySender[i][hour]);
        }
        datasets[i].label = senders[i].name;
        datasets[i].backgroundColor = 'rgba('+colors[i+0 % colors.length]+',0.2)';
        datasets[i].borderColor = 'rgba('+colors[i+0 % colors.length]+',1)';
        datasets[i].borderWidth = 1
    }
    console.log(datasets);
    let ctx = document.getElementById("byHour");
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: datasets
        }
    });
}