StudyBlocksPreload = async function () {

    await window.tenori.loadDeck(SessionData.file.properties.deck).then(async deck => {
        if (!deck)
            return alert("Error loading deck.");

        /* Set the active deck variables to their defaults to prevent unexpected behavior. */
        SessionData.active.deck = deck;
        SessionData.active.deck.index = 0;
        SessionData.active.studyMode = StudyModes.Meaning;
        SessionData.active.paginationMode = PaginationModes.Learn;

        document.getElementById("study-blocks-name").innerText = SessionData.active.deck.properties.name;
        document.getElementById("study-configurator-name").innerText = SessionData.active.deck.properties.name;

        document.getElementById("study-blocks-author").innerText = `by ${SessionData.active.deck.properties.author}`;
        document.getElementById("study-blocks-description").innerText = SessionData.active.deck.properties.description;

        if (SessionData.file.blocks.list.length == 0)
            await StudyInitBlocklist();

        var container = document.getElementById("study-blocks-container");
        container.innerHTML = "";

        var index = 0;
        for await (block of SessionData.file.blocks.list) {
            var panel = document.createElement("div");
            panel.classList.add("rd-sessions", "rd-panel");
            (function (index) {
                panel.onclick = () => {
                    StudyLaunchBlock(index);
                }
            })(index);

            var blockTitle = document.createElement("h1");
            blockTitle.innerText = `Block ${index + 1}`;

            var theDate = new Date(block.lastStudied);
            var blockInfo = document.createElement("p");
            blockInfo.classList.add("rd-sessions-info");

            var lastStudiedText = block.lastStudied == 0 ? `Not studied yet.` : `Last studied ${theDate.toLocaleDateString()}, ${theDate.toLocaleTimeString()}`;
            blockInfo.innerText = lastStudiedText;

            panel.appendChild(blockTitle);
            panel.appendChild(blockInfo);

            container.appendChild(panel);
            index++;
        }

    });
}

StudyLaunchBlock = async function (blockIndex) {
    if (SessionData.file.blocks.list.length == 0)
        return false;

    var start = 0;
    var end = 0;
    var index = 0;

    for await (var block of SessionData.file.blocks.list) {
        if (blockIndex == index)
            break;

        start += block.size;
        index++;
    }
    end = start + SessionData.file.blocks.list[index].size - 1;

    SessionData.active.block.index = index;
    SessionData.active.block.start = start;
    SessionData.active.block.end = end;

    SwapPage("page-study-config");
}

StudyInitBlocklist = async function()
{
    //SessionData.file.blocks.refBlockSize
    //for await(var )

    if(SessionData.file.blocks.refBlockSize > SessionData.active.deck.list.length)
        return await StudyCreateBlock(SessionData.active.deck.list.length);

    const numBlocks = Math.ceil(SessionData.active.deck.list.length / SessionData.file.blocks.refBlockSize);
    console.log(numBlocks);
    const blockSizes = new Array(numBlocks).fill(SessionData.file.blocks.refBlockSize);
    blockSizes[numBlocks - 1] = SessionData.active.deck.list.length - (numBlocks - 1) * SessionData.file.blocks.refBlockSize;

    for await(var blockSize of blockSizes)
    {
        await StudyCreateBlock(blockSize);
        console.log(blockSize);
    }
}

StudyCreateBlock = async function (size) {
    SessionData.file.blocks.list.push(
        {
            size: size,
            studyMode: 0,
            paginationMode: 0,
            lastStudied: 0
        }
    );
}