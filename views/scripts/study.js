const StudyModes = { Meaning: 0, Reading: 1 }
const PaginationModes = { Quiz: 0, Learn: 1}
var SessionData = {
    activeDeck: undefined,
    activeDeckIndex: 0,
    activeStudyMode: StudyModes.Meaning,
    activePaginationMode: PaginationModes.Learn
}

var prefs = {};

/*
Study Preload, called when the study page is first loaded.
Checks the user-specificed decks folder for tenori files, and then orders the deck picker populated.
*/
StudyPreload = async function()
{
    await window.tenori.getPrefs().then(async result => {
        prefs = result;

        await window.tenori.listSessions(prefs.app.sessionFolder).then(async sessions => {
            console.log(sessions);
            
            await StudyPopulateSessionPicker(sessions).then(async () => {
                document.getElementById("rd-sessions-create").onclick = () => { SwapPage("page-study-create-session") };
            })
        })
    })
}

StudyLaunchSession = async function(session)
{
    SessionData = session;
    console.log(session);
    SwapPage("page-study-config");
}

SessionCreatorPreload = async function()
{
        await window.tenori.listDecks(prefs.app.deckFolder).then(async result => {
            await StudyPopulatePicker(result);

            document.getElementById("sessions-creator-cancel").onclick = () => { SwapPage("page-study") };
            document.getElementById("sessions-creator-submit").onclick = () => { StudySubmitSession() };
        })
}

StudySubmitSession = async function()
{
    var sessionName = await document.getElementById("study-session-input-name").value;
    var sessionDeck = await document.querySelector('input[name="study-session-input-deck"]:checked').value;

    if(!sessionName || sessionName == "" || !sessionDeck)
        return false;
    
    await window.tenori.createSession(sessionName, sessionDeck, prefs.app.sessionFolder).then(async session => {
        if(!session)
            return false;
       
        await StudyLaunchSession(session);
    });
}

StudyPopulateSessionPicker = async function(directories)
{
    var container = document.getElementById("study-sessions-container");
    container.innerHTML = "";

    for await (var directory of directories)
    {
        await window.tenori.loadSession(directory).then(async session => {

            var panel = document.createElement("div");
            panel.classList.add("rd-sessions", "rd-panel");
            panel.onclick = () => {
                StudyLaunchSession(session);
            }

            var sessionTitle = document.createElement("h1");
            sessionTitle.innerHTML = session.properties.name;

            panel.appendChild(sessionTitle);

            container.appendChild(panel);
        });
    }

    var createSession = document.createElement("div");
    var csButton = document.createElement("div");
    csButton.classList.add("rd-sessions-plus");
    createSession.classList.add("rd-sessions", "rd-sessions-create", "rd-panel");
    createSession.id = "rd-sessions-create";

    createSession.appendChild(csButton);
    container.appendChild(createSession);
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
        var htmlID = `rd-panel-selector-${i}`;
        
        var input = document.createElement("input");
        input.classList.add("rd-sessions-input")
        input.id = htmlID;
        input.name = "study-session-input-deck"
        input.value = directories[i];
        input.type = "radio";

        var label = document.createElement("label");
        label.classList.add("rd-sessions", "rd-panel");
        label.htmlFor = htmlID

        var text = document.createElement("h1");
        text.classList.add(["rd-sessions-header"]);
        text.innerText = directories[i].replace(/^.*[\\\/]/, '');
        label.appendChild(text);

        container.appendChild(input);
        container.appendChild(label);
    }
}

/*
Initialize the active deck for studying by getting data from kanjiapi.
*/
StudyInitDeck = async function()
{
    if(!SessionData.activeDeck || !SessionData.activeDeck.deck)
        return false;
    
    for await (const element of SessionData.activeDeck.deck)
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

            element.userInput = {
                expected: undefined,
                actual: undefined
            }
        });
    }

    return true;
}

/*
Force re-initialization of study page.
*/
StudyForceReset = function()
{
    SessionData.activeDeck = undefined;
    SessionData.activeDeckIndex = undefined;

    SwapPage("page-study");
}
