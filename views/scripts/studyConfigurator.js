/*
Study Config Preload, called when a deck is selected and needs to be configured.
*/
StudyConfigPreload = async function()
{
    if(!SessionData.file.properties.deck)
        return alert("Error.");

    await window.tenori.loadDeck(SessionData.file.properties.deck).then(async deck => {
        if(!deck)
            return alert("Error loading deck.");

        deck.list = deck.list.slice(SessionData.active.block.start, SessionData.active.block.end+1)

        /* Set the active deck variables to their defaults to prevent unexpected behavior. */
        SessionData.active.deck = deck;
        SessionData.active.deck.index = 0;
        SessionData.active.studyMode = StudyModes.Meaning;
        SessionData.active.paginationMode = PaginationModes.Learn;

        console.log(SessionData);
        await StudyInitDeck().then(async status => {
            if(!status)
                return alert("Error initializing deck.")
            
            /* We're finally ready to populate the configurator. */
            await StudyPopulateConfigurator();
        })
    })
}

/*
Populate the configurator screen based on the active deck.
TODO: Clean this up, make it more efficient.
*/
StudyPopulateConfigurator = async function()
{
    if(!SessionData.active.deck)
        return false;
    
    document.getElementById("study-configurator-name").innerText = SessionData.active.deck.properties.name;
    document.getElementById("study-configurator-author").innerText = `by ${SessionData.active.deck.properties.author}`;
    document.getElementById("study-configurator-description").innerText = SessionData.active.deck.properties.description;
    
    var container = document.getElementById("study-configurator-panels");
    container.innerHTML = "";
    
    var index = 0;
    for await(const element of SessionData.active.deck.list)
    {
        if(!element.apiData || element.apiData.error == true)
            return;
        
        var form = document.createElement("form");
        form.setAttribute("data-id", index);
        form.classList.add("rd-panel");
            
        /* Kanji Header */
        var header = document.createElement("h1");
        header.innerText = element.char;
        header.classList.add("rd-study-config-kanji");
        var divider = document.createElement("div");
        divider.classList.add("content-divider");
            
        /* Input & Label definitions */
            
        var meaningLabel = document.createElement("label");
        var readingLabel = document.createElement("label");
        var mnemonicLabel = document.createElement("label");
            
        var meaningSelect = document.createElement("select");
        var readingSelect = document.createElement("select");
        var mnemonicTextarea = document.createElement("textarea");

        /* Meaning Input */
        meaningLabel.innerHTML = "Meaning"
        meaningSelect.setAttribute("id", "meaning");
        for(var j = 0; j < element.apiData.meanings.length; j++)
        {
            var option = document.createElement("option");
            option.setAttribute("value", j);
            if(j == element.meaning)
                option.setAttribute("selected", "selected");
            option.innerHTML = element.apiData.meanings[j];
            meaningSelect.appendChild(option);
        }
            
        /* Reading Input */
        readingLabel.innerHTML = "Reading"
        readingSelect.setAttribute("id", "reading");
        for(var j = 0; j < element.apiData.kun_readings.length; j++)
        {
            var option = document.createElement("option");
            option.setAttribute("value", j);
            option.setAttribute("data-kunyomi", true)
            if(element.kunYomi && j == element.reading)
                option.setAttribute("selected", "selected");
            option.innerHTML = element.apiData.kun_readings[j];
            readingSelect.appendChild(option);
        }
        readingSelect.appendChild(document.createElement("option"))
        for(var j = 0; j < element.apiData.on_readings.length; j++)
        {
            var option = document.createElement("option");
            option.setAttribute("value", j);
            option.setAttribute("data-kunyomi", false)
            if(!element.kunYomi && j == element.reading)
                option.setAttribute("selected", "selected");
            option.innerHTML = element.apiData.on_readings[j];
            readingSelect.appendChild(option);
        }
        
        /* Mnemonic Input */
        mnemonicLabel.innerHTML = "Mnemonic"
        mnemonicTextarea.setAttribute("id", "mnemonic");
        mnemonicTextarea.value = element.mnemonic;

        form.appendChild(header);
        form.appendChild(divider);
        form.appendChild(meaningLabel);
        form.appendChild(meaningSelect);
        form.appendChild(readingLabel);
        form.appendChild(readingSelect);
        form.appendChild(mnemonicLabel);
        form.appendChild(mnemonicTextarea);
        container.appendChild(form);
            
        index++;
    }

    return true;
}

/*
Submit configurator and update active deck based on selected options.
Also, begin quiz flow.
*/
StudySubmitConfigurator = function()
{
    var forms = document.getElementById("study-configurator-panels").querySelectorAll("form");
    for(var i = 0; i < forms.length; i++)
    {
        var form = forms[i];

        var meaning = form.querySelector("#meaning").value;
        var mnemonic = form.querySelector("#mnemonic").value;

        /* Get Preferred Reading */
        var reading = Array.from(form.querySelector("#reading").options).filter(o => o.selected)[0];

        SessionData.active.deck.list[i].meaning = meaning;
        SessionData.active.deck.list[i].kunYomi = reading.dataset.kunyomi === "true" ? true : false;
        SessionData.active.deck.list[i].reading = reading.value;
        SessionData.active.deck.list[i].mnemonic = mnemonic; 
    }

    console.log(SessionData);

    SwapPage("page-study-pagination"); 
}