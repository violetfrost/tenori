const StudyModes = { Meanings: 0, Readings: 1 }
var activeDeck, activeDeckIndex, activeStudyMode;
var activeUserInput = { expected: [], actual: []}

/*
Study Preload, called when the study page is first loaded.
Checks the user-specificed decks folder for tenori files, and then orders the deck picker populated.
*/
window.StudyPreload = async function()
{
    await window.tenori.getPrefs().then(async prefs => {
        await window.tenori.listDecks(prefs.app.deckFolder).then(result => {
            StudyPopulatePicker(result);
        })
    })
}

/*
Study quiz preload, called when the study quiz flow is first loaded.
*/
window.StudyQuizPreload = async function()
{
    document.getElementById("study-input")
        .addEventListener("keyup", function handler(event)
        {
            event.preventDefault();
            if (event.keyCode === 13) {
                var textEntered = this.value;
                activeUserInput.actual.push(textEntered);
                activeDeckIndex++;
                StudyPopulateQuiz(activeDeckIndex).then(result => {
                    if(!result)
                        {
                            this.removeEventListener("keyup", handler);
                            StudyEndQuiz();
                        }
                })                
            }
        }
    );
    await StudyPopulateQuiz(activeDeckIndex).then(result => {
        console.log("Populating quiz");
    })
}

/*
Study Config Preload, called when a deck is selected and needs to be configured.
*/
window.StudyConfigPreload = async function()
{
    if(!activeDeck.directory)
        return alert("Error.");

    await window.tenori.loadDeck(activeDeck.directory).then(async deck => {
        if(!deck)
            return alert("Error loading deck.");
        
        /* Set the active deck variables to their defaults to prevent unexpected behavior. */
        activeDeck = deck;
        activeDeckIndex = 0;
        activeStudyMode = StudyModes.Meanings;
        activeUserInput = { expected: [], actual: []};

        await StudyInitDeck().then(async status => {
            if(!status)
                return alert("Error initializing deck.")
            
            /* We're finally ready to populate the configurator. */
            var x = await StudyPopulateConfigurator();
            console.log(x);
        })
    })
}

/*
Initialize the active deck for studying by getting data from kanjiapi.
*/
window.StudyInitDeck = async function()
{
    if(!activeDeck || !activeDeck.deck)
        return false;
    
    for await (const element of activeDeck.deck)
    {
        await ResolveKanjiData(element.char).then(result => {            
            if(!element)
                element.apiData = { error: true }

            element.apiData = {
                error: false,
                kun_readings: result.kun_readings,
                on_readings: result.on_readings,
                meanings: result.meanings,
                jlpt: result.jlpt
            }
        });
    }

    return true;
}

/*
Populates the quiz flow at the given element.
*/
StudyPopulateQuiz = async function(element)
{
    if(!activeDeck || activeDeck.deck.length -1 < element || !activeDeck.deck[element].apiData || activeDeck.deck[element].apiData.error)
        return false;
    
    var current = activeDeck.deck[element];
    var reading = ((current.kunYomi) ? current.apiData.kun_readings : current.apiData.on_readings)[current.reading]
    var meaning = current.apiData.meanings[current.meaning];

    document.getElementById("study-char").innerHTML = current.char;
    document.getElementById("study-definition").innerHTML = meaning;
    document.getElementById("study-reading").innerHTML = reading;
    
    var input = document.getElementById("study-input");
    input.value = "";
    input.placeholder = activeStudyMode == (StudyModes.Readings) ? "Romaji or Kana" : "English Meaning"

    activeUserInput.expected.push(
        activeStudyMode == (StudyModes.Readings) ? reading : meaning
    )

    return true;
}

/*
Ends quiz mode on the currently active deck.
TODO add support for additional post-study flow.
*/
StudyEndQuiz = async function()
{
    console.log(activeUserInput);
    SwapPage("page-study");
}

/*
Populates the deck picker based on a list of directories.
Each directory should be that of a Tenori file.
    Arguments:
        directories: an array of directories.
*/
StudyPopulatePicker = async function(directories)
{
    var container = document.getElementById("study-picker-container");
    container.innerHTML = "";
    for(var i = 0; i < directories.length; i++)
    {
        var hyperlink = document.createElement("a");
        hyperlink.setAttribute("href", "#");
        hyperlink.setAttribute("onclick", `StudySelectDeck(this.innerHTML)`);
        hyperlink.innerText = directories[i];
        container.appendChild(hyperlink);
        container.appendChild(document.createElement("div"));
    }
}

/*
Populate the configurator screen based on the active deck.
TODO: Clean this up, make it more efficient.
*/
StudyPopulateConfigurator = async function()
{
    if(!activeDeck || !activeDeck.deck)
        return false;
    
    var container = document.getElementById("study-configurator-panels");
    container.innerHTML = "";
    
    var index = 0;
    for await(const element of activeDeck.deck)
    {
        console.log(element.apiData);
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
            
        var meaningSelect = document.createElement("select");
        var readingSelect = document.createElement("select");
            
        /* Meaning Input */
        meaningLabel.innerHTML = "Meaning"
        meaningSelect.setAttribute("id", "meaning");
        for(var j = 0; j < element.apiData.meanings.length; j++)
        {
            var option = document.createElement("option");
            option.setAttribute("value", j);
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
            option.innerHTML = element.apiData.kun_readings[j];
            readingSelect.appendChild(option);
        }
        readingSelect.appendChild(document.createElement("option"))
        for(var j = 0; j < element.apiData.on_readings.length; j++)
        {
            var option = document.createElement("option");
            option.setAttribute("value", j);
            option.setAttribute("data-kunyomi", false)
            option.innerHTML = element.apiData.on_readings[j];
            readingSelect.appendChild(option);
        }
            
        form.appendChild(header);
        form.appendChild(divider);
        form.appendChild(meaningLabel);
        form.appendChild(meaningSelect);
        form.appendChild(readingLabel);
        form.appendChild(readingSelect);
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

        /* Get Preferred Reading */
        var reading = Array.from(form.querySelector("#reading").options).filter(o => o.selected)[0];

        activeDeck.deck[i].meaning = meaning;
        activeDeck.deck[i].kunYomi = reading.dataset.kunyomi === "true" ? true : false;
        activeDeck.deck[i].reading = reading.value;
    }

    SwapPage("page-study-quiz"); 
}

StudySelectDeck = function (directory)
{
    activeDeck = {};
    activeDeck.directory = directory;
    SwapPage("page-study-config"); 
}