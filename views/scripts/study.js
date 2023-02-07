/*
Valid Study Modes, used to dictate app behavior.
*/
const StudyModes = {
    Meanings: 0,
    Readings: 1,
    Kana: 2
}

/*
Study variables.
*/
var activeDeck;
var activeDeckDirectory;
var activeDeckIndex;
var activeDeckMode;
var deckUserInput = {
    input: [],
    expectedInput: []
}

var isUserStudying = false;

/*
Runs when navigating to this page in-app.
*/

window.StudyPreload = async function()
{
    await window.tenori.getPrefs().then(async prefs => {
        await window.tenori.listDecks(prefs.app.deckFolder).then(result => {
            StudyPopulatePicker(result)
            console.log(result);
        })
    })
    return false;
}

window.StudyConfigPreload = async function()
{
    var thing = await window.tenori.loadDeck(activeDeckDirectory);
    if(!thing)
        return alert('error');
    
    await StudyInitDeck(thing, [0, 2], StudyModes.Meanings).then(result => {
        if(!result)
            return alert('error');

        StudyPopulateConfigurator(result);
        //StudyBeginDeck(result);
    })
}

window.StudyQuizPreload = async function()
{
    StudyBeginDeck(activeDeck);
}

StudySelectDeck = function(directory)
{
    activeDeckDirectory = directory;
    SwapPage("page-study-config")
}

/*
Initializes a deck using kanjiapi.dev
TODO: Add functionality for Kana decks.

Args:
    deck: Deck JSON Object (window.tenori.loadDeck)
    range: Range within the deck to study, provided as a 2 entry array.
           range[0] must be no less than 0
           range[1] must be no larger than deck.length
    mode: The deck's study mode (StudyModes)
*/
StudyInitDeck = async function(deck, range, mode)
{
    if(!deck || !range || mode === undefined || range[0] < 0 || range[1] > deck.length || mode > 2 || mode < 0 || mode == StudyModes.Kana)
    { console.error("Deck preparation failed."); return false; }

    console.log("Preparing deck...");
    var preparedDeck = [];

    for (var i = range[0]; i < range[1]+1; i++)
    {
        await ResolveKanjiData(deck[i].char).then(result => {
            preparedDeck.push({
                error: false,
                mode: mode,
                data: result,
                study: {
                    reading: 0,
                    meaning: 0,
                    mnemonic: "Unset",
                    isKunYomi: false
                }})                
        }).catch(error => {
            console.error(error);
            preparedDeck.push({error: true})
        })
    }

    console.log(preparedDeck);
    return preparedDeck;
}

/*
Begins the study flow using the active deck.
*/
StudyBeginDeck = async function()
{
    if(activeDeck === undefined)
        return console.error("Study flow failed to begin. Active deck is undefined.");
    
    activeDeckIndex = 0;
    activeDeckMode = 0;

    StudyPopulate(activeDeck, activeDeckIndex).then(() => {
        isUserStudying = true;
    });
    return true;
}

/*
Advances the currently active deck and refreshes the screen.
*/
StudyAdvanceDeck = async function()
{
    var intendedIndex = activeDeckIndex+1;

    if(intendedIndex > activeDeck.length-1)
        return false;
    
    activeDeckIndex = intendedIndex;

    await StudyPopulate(activeDeck, activeDeckIndex);
    return true;
}

/*
Ends the currently active deck and cleans up.
*/
StudyEndDeck = async function()
{
    console.log("Ending deck...");
    for(var i = 0; i < deckUserInput.input.length; i++)
    {
        if(deckUserInput.input[i] != deckUserInput.expectedInput[i])
            alert("unexpected input " + deckUserInput.input[i] + ", expected input is " + deckUserInput.expectedInput[i]);
    }

    isUserStudying = false;
    activeDeck = undefined;
    activeDeckDirectory = undefined;
    activeDeckIndex = undefined;
    activeDeckMode = undefined;

    ForceSwap(document.getElementById("page-study"), false);

    console.log(deckUserInput);
}

/*
Populates the screen using the current deck.
    Args:
        deck: An initialized study deck (StudyInitDeck)
        position: The position inside the deck to use
*/
StudyPopulate = async function(deck, position)
{
    var current = deck[position];
    console.log("Populating screen with active deck at index " + position);
    console.log(current);

    var reading = ((current.study.isKunYomi) ? current.data.kun_readings : current.data.on_readings)[current.study.reading]
    var meaning = current.data.meanings[current.study.meaning];

    document.getElementById("study-char").innerHTML = deck[position].data.kanji;
    document.getElementById("study-definition").innerHTML = meaning;
    document.getElementById("study-reading").innerHTML = reading;

    var input = document.getElementById("study-input");
    input.value = "";
    input.placeholder = activeDeckMode == (StudyModes.Readings || StudyModes.Kana) ? "Romaji or Kana" : "English Meaning"

    deckUserInput.expectedInput.push(
        activeDeckMode == (StudyModes.Readings || StudyModes.Kana) ? reading : meaning
    )
}

/*
Populates the configurator using the current deck.
    Args:
        deck: An initialized study deck (StudyInitDeck)
*/
StudyPopulateConfigurator = async function(deck)
{
    activeDeck = deck;
    var container = document.getElementById("study-configurator-panels");
    container.innerHTML = "";

    for(var i = 0; i < deck.length; i++)
    {
        var element = deck[i];
        var form = document.createElement("form");
        form.setAttribute("data-id", i);
        form.classList.add("rd-panel");

        /* Kanji Header */
        var header = document.createElement("h1");
        header.innerText = element.data.kanji;
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
        for(var j = 0; j < element.data.meanings.length; j++)
        {
            var option = document.createElement("option");
            option.setAttribute("value", j);
            option.innerHTML = element.data.meanings[j];
            meaningSelect.appendChild(option);
        }

        /* Reading Input */
        readingLabel.innerHTML = "Reading"
        readingSelect.setAttribute("id", "reading");
        for(var j = 0; j < element.data.kun_readings.length; j++)
        {
            var option = document.createElement("option");
            option.setAttribute("value", j);
            option.setAttribute("data-kunyomi", true)
            option.innerHTML = element.data.kun_readings[j];
            readingSelect.appendChild(option);
        }
        readingSelect.appendChild(document.createElement("option"))
        for(var j = 0; j < element.data.on_readings.length; j++)
        {
            var option = document.createElement("option");
            option.setAttribute("value", j);
            option.setAttribute("data-kunyomi", false)
            option.innerHTML = element.data.on_readings[j];
            readingSelect.appendChild(option);
        }

        form.appendChild(header);
        form.appendChild(divider);
        form.appendChild(meaningLabel);
        form.appendChild(meaningSelect);
        form.appendChild(readingLabel);
        form.appendChild(readingSelect);
        container.appendChild(form);
    }
}

StudyPopulatePicker = function(directories)
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

StudySubmitConfigurator = function()
{
    var forms = document.getElementById("study-configurator-panels").querySelectorAll("form");
    for(var i = 0; i < forms.length; i++)
    {
        var form = forms[i];

        var meaning = form.querySelector("#meaning").value;

        /* Get Preferred Reading */
        var reading = Array.from(form.querySelector("#reading").options).filter(o => o.selected)[0];

        activeDeck[i].study.meaning = meaning;
        activeDeck[i].study.isKunYomi = reading.dataset.kunyomi === "true" ? true : false;
        activeDeck[i].study.reading = reading.value;
    }

    SwapPage("page-study-quiz");  
}

/*
Event Listeners
*/
document.addEventListener("keypress", function onEvent(event) {
    if(!isUserStudying) //If the user isn't studying, don't use this!
        return;
    
    if (event.key === "Enter") {
        var textEntered = document.getElementById("study-input").value;
        deckUserInput.input.push(textEntered);
        //console.log(deckUserInput);
        StudyAdvanceDeck().then(result => {
            if(!result)
                StudyEndDeck();
        });
    }
});