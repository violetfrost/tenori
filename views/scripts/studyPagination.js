StudyPaginationPreload = async function()
{
    if(!SessionData.activeDeck)
        return false;
    
    SessionData.activeDeckIndex = 0;

    await StudyPopulatePage().then(result => {
        if(!result)
            alert("error!");
        
        document.getElementById("study-pagination-advance")
                .onkeyup = function handler(event)
                {
                    if(event.key != "Enter")
                        return;
                    
                    SessionData.activeDeck.deck[SessionData.activeDeckIndex].userInput.actual = this.value;
                    StudyVerifyAnswer(SessionData.activeDeckIndex).then(result => {
                        if(SessionData.activePaginationMode == PaginationModes.Learn && !result)
                            return;
                        
                        StudyPaginationAdvance().then(result => {
                            if(result)
                            return;

                            SwapPage("page-study-recap");
                        })
                    });
                };
        
        document.getElementById("study-pagination-retreat")
                .onclick = function handler(event)
                {
                    StudyPaginationRetreat().then(result => {
                        if(!result)
                            console.error("Already reached end of pagination.");
                    });
                };
    })
}

StudyVerifyAnswer = async function(index)
{
    var element = SessionData.activeDeck.deck[index];
    return (element.userInput.expected == element.userInput.actual)
}

StudyPaginationAdvance = async function()
{
    if(SessionData.activeDeckIndex >= SessionData.activeDeck.deck.length -1)
        return false;
    
    SessionData.activeDeckIndex++;
    return StudyPopulatePage();
}

StudyPaginationRetreat = async function()
{
    if(SessionData.activeDeckIndex == 0)
        return false;
    
    SessionData.activeDeckIndex--;
    return StudyPopulatePage();
}

/*
Populates page based on active PaginationType and StudyMode.
*/
StudyPopulatePage = async function()
{
    var element = SessionData.activeDeck.deck[SessionData.activeDeckIndex];
    if(!element) return false;

    var char = document.getElementById("study-char");
    var sub1 = document.getElementById("study-sub1");
    var sub2 = document.getElementById("study-sub2");

    var button = document.getElementById("study-pagination-retreat");
    var input  = document.getElementById("study-pagination-advance");

    var expected = (SessionData.activeStudyMode == StudyModes.Meaning) /* If studying meanings, populate using the selected meaning. */ 
    ? 
        element.apiData.meanings[element.meaning]
        : /* If using readings, get the selected meaning. */
        (element.kunYomi)
        ?
        element.apiData.kun_readings[element.reading]
    :
    element.apiData.on_readings[element.reading]

    char.innerText = element.char;
    sub1.innerText = (SessionData.activePaginationMode == PaginationModes.Learn) /* In Learn Mode, Populate Text */
    ? expected
    : "";

    sub2.innerText = (SessionData.activePaginationMode == PaginationModes.Learn)
    ? element.mnemonic
    : "";

    if(SessionData.activePaginationMode == PaginationModes.Learn)
        button.classList.remove("hidden");
    else button.classList.add("hidden");
    
    input.placeholder = SessionData.activeStudyMode == StudyModes.Meaning ? "English Meaning" : "Romaji or Kana";
    input.value = "";
    
    element.userInput.expected = expected; 
    
    console.log(element);
    return true;
}