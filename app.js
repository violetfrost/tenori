const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const utils = require('./utils/utils.js');
const fs = require('fs');
const path = require('path');

const deckSchema = JSON.parse(fs.readFileSync(__dirname + '/utils/deck_schema.json','utf8'));

const createWindow = () => {
    const win = new BrowserWindow({
      width: 1280,
      height: 720,
      minWidth: 640,
      minHeight: 360,
      autoHideMenuBar: true,
      webPreferences: {
        preload: path.join(app.getAppPath(), 'utils/preload.js')
      }
    })
  
    win.loadFile('views/index.html')
}

app.whenReady().then(() => {
    createWindow()
  })

ipcMain.handle('tenori-create-sorted-deck', (event, args) => {
    event.preventDefault();

    dialog.showSaveDialog({ /* Prompt the user to save their new deck to a JSON file. */
        defaultPath: "C:\\",
        filters: [
            {name: 'Tenori file', extensions: ['tenori']}
        ]
    }).then((result) => {
        if(result.canceled) /* If the user fails to set a save destination, return. */
            return;
        
        console.log(`File path: ${result.filePath}, Text: ${args.text}` )

        fs.writeFile(result.filePath, JSON.stringify(
            {
                properties: {
                    version: 100,
                    name: "Placeholder",
                    description: "Placeholder Description.",
                    author: "Jane Smith"
                },
                deck: utils.createSortedKanjiList(utils.getKanjiFromString(args.text))
            }
        ), err => {
            if(err)
                console.error(err);
        })

    }).catch(err => {
        console.error(err)
    });
})

ipcMain.handle('tenori-load-deck', async (event, args) => {
    event.preventDefault();

    var jsonObject;
    var filePath = (args.directory === false) ? false : args.directory;

    if(filePath === false)
    {
        await dialog.showOpenDialog({
            defaultPath: "C:\\",
            filters: [
                {name: 'Tenori file', extensions: ['tenori']}
            ]
        }).then(async (result) => {
            if(result.canceled)
                return;
            
            filePath = result.filePaths[0];
        });
    
        if(filePath == false)
            return false;
    }

    var data = await fs.readFileSync(filePath, 'utf8');
    
    try {
        jsonObject = JSON.parse(data);   
    } catch (error) {
        return false;
    }

    
    return utils.validateJsonAgainstSchema(jsonObject, deckSchema) ? jsonObject : false;
})

//TODO add actual prefs file and handling
ipcMain.handle('tenori-get-prefs', async (event, args) => {
    return {
        app: {
            theme: 'system',
            deckFolder: app.getPath('userData') + "\\decks"
        },
        study: {
            alwaysDisplayReadings: false,
            alwaysDisplayMeanings: false,
            alwaysDisplayMnemonics: false
        }
    }
})

ipcMain.handle('tenori-list-decks', async (event, args) => {
    if(args.directory === undefined)
        return false;
    
    console.log(args.directory);
    var finalFiles = [];

    if(await !fs.existsSync(args.directory))
    {
        await fs.mkdirSync(args.directory)
    }

    var files = await fs.readdirSync(args.directory);
    var names = files.filter(el => path.extname(el) === '.tenori')
    for(var i = 0; i < names.length; i++)
    {
        console.log(names[i]);
        finalFiles.push(path.join(args.directory, names[i]))
    }

    return finalFiles;
})