/* Modified from csi.js by LexmarkWeb, MIT License. More info in /assets/acknowledgements.txt */
document.addEventListener("DOMContentLoaded", async function(event) {
    const elements = document.getElementsByTagName('*');
    for await (var element of elements) {
        if (element.hasAttribute('data-include')) {
            await fragment(element, element.getAttribute('data-include'));
        }
    }
    document.dispatchEvent(new CustomEvent('tenori-dom-ready'));
});

async function fragment(element, url) {
    await fetch(url).then(async response => {
        if(response.status != 200)
            return console.error(response);
        
        element.outerHTML = await response.text();
    })
}
