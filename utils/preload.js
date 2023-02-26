const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld('tenori', {
        loadDeck: async (directory = false) => ipcRenderer.invoke('tenori-load-deck', {directory: directory}),
        createSortedDeck: async (text) => ipcRenderer.invoke('tenori-create-sorted-deck', { text: text }),
        listDecks: async ( directory ) => ipcRenderer.invoke('tenori-list-decks', {directory: directory}),
        loadSession: async (directory) => ipcRenderer.invoke('tenori-load-session', { directory: directory }),
        createSession: async (name, deck, directory ) => ipcRenderer.invoke('tenori-create-session', { name: name, deck: deck, directory: directory }),
        listSessions: async( directory ) => ipcRenderer.invoke('tenori-list-sessions', {directory: directory}),
        getPrefs: async() => ipcRenderer.invoke('tenori-get-prefs'),
        titlebarEvent: async( type ) => ipcRenderer.invoke('tenori-titlebar-event', {type: type}),
        titlebarEventReceive: (func) => ipcRenderer.on('tenori-titlebar-on', (event, ...args) => func(...args))
    }
);