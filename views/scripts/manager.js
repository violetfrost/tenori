window.DeckManagerPreload = async function()
{

}


ManagerCreateDeckFromBox = function()
{
    var textBox = document.getElementById("mgr-jp-text");
    if(textBox && textBox.value !== "")
    {
        window.tenori.createSortedDeck(textBox.value); 
    }
}