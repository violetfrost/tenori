const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld('tenori', {
        loadDeck: async (directory = false) => ipcRenderer.invoke('tenori-load-deck', {directory: directory}),
        createSortedDeck: async (text) => ipcRenderer.invoke('tenori-create-sorted-deck', { text: text }),
        getPrefs: async() => ipcRenderer.invoke('tenori-get-prefs'),
        listDecks: async ( directory ) => ipcRenderer.invoke('tenori-list-decks', {directory: directory}),
        titlebarEvent: async( type ) => ipcRenderer.invoke('tenori-titlebar-event', {type: type}),
        titlebarEventReceive: (func) => ipcRenderer.on('tenori-titlebar-on', (event, ...args) => func(...args))
    }
);