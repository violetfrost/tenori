const StudyModes = { Meaning: 0, Reading: 1 }
const PaginationModes = { Quiz: 0, Learn: 1}
var SessionData = {
    activeDeck: undefined,
    activeDeckIndex: 0,
    activeStudyMode: StudyModes.Meaning,
    activePaginationMode: PaginationModes.Learn
}

/*
Study Preload, called when the study page is first loaded.
Checks the user-specificed decks folder for tenori files, and then orders the deck picker populated.
*/
StudyPreload = async function()
{
    await window.tenori.getPrefs().then(async prefs => {
        await window.tenori.listDecks(prefs.app.deckFolder).then(result => {
            StudyPopulatePicker(result);
        })
    })
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
