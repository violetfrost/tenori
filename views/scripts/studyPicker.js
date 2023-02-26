StudySelectDeck = function (directory)
{
    SessionData.activeDeck = {};
    SessionData.activeDeck.directory = directory;
    SwapPage("page-study-config"); 
}