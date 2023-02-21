window.tenori.titlebarEventReceive(args => {
    if(args.maximized)
        document.getElementById('restore-button').classList.remove('hidden');
    else
        document.getElementById('restore-button').classList.add('hidden');
});

document.getElementById('min-button').addEventListener("click", event => {
    window.tenori.titlebarEvent(0);
});

document.getElementById('max-button').addEventListener("click", event => {
    window.tenori.titlebarEvent(1);
});

document.getElementById('restore-button').addEventListener("click", event => {
    window.tenori.titlebarEvent(2);
});

document.getElementById('close-button').addEventListener("click", event => {
    window.tenori.titlebarEvent(3);
});
