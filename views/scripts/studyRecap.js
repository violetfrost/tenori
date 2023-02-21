StudyRecapPreload = async function()
{
    var text = document.getElementById("study-recap-text");
    var btn1 = document.getElementById("study-recap-button1");
    var btn2 = document.getElementById("study-recap-button2");
    var btn3 = document.getElementById("study-recap-button3");

    text.innerText =
    (SessionData.activePaginationMode == PaginationModes.Learn)
    ? "Now that you've had a chance to look at all the Kanji, it's time to test what you've learned! It's okay if you don't feel 100% confident, just do your best to remember! If you'd like, you can also head back and review the Kanji again."
    : await StudyGetResultsString();

    btn1.innerText = SessionData.activePaginationMode == PaginationModes.Learn
    ? "Go Back"
    : "Study Again";

    btn2.innerText = SessionData.activePaginationMode == PaginationModes.Learn
    ? "Continue to Quiz"
    : "Repeat Quiz"
    
    btn3.innerText = SessionData.activeStudyMode == StudyModes.Meaning
    ? "Switch to Readings"
    : "Switch to Meanings";
}

StudyGetResultsString = async function()
{
    var string = "Here's how you did: \n";
    for await(element of SessionData.activeDeck.deck)
    {
        string+= `\n${(element.userInput.expected == element.userInput.actual) ? "✅" : "🚫"} - ${element.char} - Expected ${element.userInput.expected}, Got: ${element.userInput.actual}`
    }
    return string;
}

StudyReturn = async function()
{
    SessionData.activePaginationMode = PaginationModes.Learn;
    SwapPage("page-study-pagination");
}

StudyContinue = async function()
{
    SessionData.activePaginationMode = PaginationModes.Quiz;
    SwapPage("page-study-pagination");
}

StudySwitchModes = async function()
{
    SessionData.activeStudyMode =
    (SessionData.activeStudyMode === StudyModes.Meaning) ? StudyModes.Reading : StudyModes.Meaning; 
    SwapPage("page-study-pagination");
}