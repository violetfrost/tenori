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


StudySelectDeck = function (directory)
{
    SessionData.activeDeck = {};
    SessionData.activeDeck.directory = directory;
    SwapPage("page-study-config"); 
}