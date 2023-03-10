window.SettingsPreload = async function()
{

}

var currentPage = undefined;
var currentButton = undefined;
var canSwapPages = false;

document.addEventListener('tenori-dom-ready', () => {
    currentPage = document.getElementById("page-study");
    currentButton = currentPage.dataset.button;
    canSwapPages = false;
    window.StudyPreload().then(() => {
        currentPage.classList.remove("hidden");
        currentPage.classList.add("active");
        canSwapPages = true;
    });
});


SwapPage = function(toSwap) /* Handles the swapping of pages on the main window, toSwap is the page to make active*/
{
    if(!canSwapPages) /* If another swap operation is in progress, return. */
        return;
    
    var newPage = document.getElementById(toSwap);
    if(newPage == currentPage) /* If the active page is the same as the page to swap to, return. */
        return;
    
    ForceSwap(newPage);
}

ForceSwap = function(newPage)
{
    canSwapPages = false; /* Mark swap operation as in progress */
    
            
    if(newPage.dataset.button)
    {
        document.getElementById(currentButton).classList.remove("active");
        document.getElementById(newPage.dataset.button).classList.add("active");
        currentButton = newPage.dataset.button;
    }
    
    currentPage.classList.remove("active"); /* Swap classes on the active page, triggering a CSS transition */
    currentPage.classList.add("hidden");

    currentPage.addEventListener("transitionend", function handler() { /* Add an event listener for the current page's CSS transition */
        this.removeEventListener("transitionend", handler); /* Event handler removes itself to prevent redundant calls */
        console.log(`Preload is ${newPage.dataset.preload}`);
        if(newPage.dataset.preload) /* If page specifies a preload method, run it before finalizing the swap. */
            window[newPage.dataset.preload]().then(() => FinalizeSwap(newPage));
        else
            FinalizeSwap(newPage);    
    });
}

FinalizeSwap = function(newPage)
{
    document.activeElement.blur();
    newPage.classList.remove("hidden"); /* Swap classes on the new page, triggering a CSS transition */
    newPage.classList.add("active");
    newPage.addEventListener("transitionend", function handler() { /* Once again, adding an event listener and cancelling it to prevent redundant calls */
        this.removeEventListener("transitionend", handler);
        currentPage = newPage; /* Marking the current page as the swap page */
        canSwapPages = true; /* Ending the swap operation */
    });
}
