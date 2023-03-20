StudyPaginationPreload = async function()
{
    if(!SessionData.active.deck)
        return false;
    
    SessionData.active.deck.index = 0;

    await StudyPopulatePage().then(result => {
        if(!result)
            alert("error!");
        
        document.getElementById("study-pagination-advance")
                .onkeyup = function handler(event)
                {
                    if(event.key != "Enter")
                        return;
                    
                    SessionData.active.deck.list[SessionData.active.deck.index].userInput.actual = this.value;
                    StudyVerifyAnswer(SessionData.active.deck.index).then(result => {
                        if(SessionData.active.paginationMode == PaginationModes.Learn && !result)
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
    var element = SessionData.active.deck.list[index];
    return (element.userInput.expected == element.userInput.actual)
}

StudyPaginationAdvance = async function()
{
    if(SessionData.active.deck.index >= SessionData.active.deck.list.length -1)
        return false;
    
    SessionData.active.deck.index++;
    return StudyPopulatePage();
}

StudyPaginationRetreat = async function()
{
    if(SessionData.active.deck.index == 0)
        return false;
    
    SessionData.active.deck.index--;
    return StudyPopulatePage();
}

/*
Populates page based on active PaginationType and StudyMode.
*/
StudyPopulatePage = async function()
{
    var element = SessionData.active.deck.list[SessionData.active.deck.index];
    if(!element) return false;

    var char = document.getElementById("study-char");
    var sub1 = document.getElementById("study-sub1");
    var sub2 = document.getElementById("study-sub2");

    var button = document.getElementById("study-pagination-retreat");
    var input  = document.getElementById("study-pagination-advance");

    var expected = (SessionData.active.studyMode == StudyModes.Meaning) /* If studying meanings, populate using the selected meaning. */ 
    ? 
        element.apiData.meanings[element.meaning]
        : /* If using readings, get the selected meaning. */
        (element.kunYomi)
        ?
        element.apiData.kun_readings[element.reading]
    :
    element.apiData.on_readings[element.reading]

    char.innerText = element.char;
    sub1.innerText = (SessionData.active.paginationMode == PaginationModes.Learn) /* In Learn Mode, Populate Text */
    ? expected
    : "";

    sub2.innerText = (SessionData.active.paginationMode == PaginationModes.Learn)
    ? element.mnemonic
    : "";

    if(SessionData.active.paginationMode == PaginationModes.Learn)
        button.classList.remove("hidden");
    else button.classList.add("hidden");
    
    input.placeholder = SessionData.active.studyMode == StudyModes.Meaning ? "English Meaning" : "Romaji or Kana";
    input.value = "";
    
    element.userInput.expected = expected; 
    
    console.log(element);
    return true;
}