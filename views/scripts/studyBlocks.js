StudyBlocksPreload = async function()
{
    if(SessionData.file.blocks.list.length == 0)
        StudyCreateBlock();

    var container = document.getElementById("study-blocks-container");
    container.innerHTML = "";

    var index = 0;
    for await(block of SessionData.file.blocks.list)
    {
        var panel = document.createElement("div");
        panel.classList.add("rd-sessions", "rd-panel");
        (function(index) {
            panel.onclick = () => {
                StudyLaunchBlock(index);
            }
        })(index);

        var blockTitle = document.createElement("h1");
        blockTitle.innerText = `Block ${index+1}`;
        
        var theDate = new Date(block.lastStudied);
        var blockInfo = document.createElement("p");
        blockInfo.classList.add("rd-sessions-info");
        blockInfo.innerText = `Last studied ${theDate.toLocaleDateString()}, ${theDate.toLocaleTimeString()}`;

        panel.appendChild(blockTitle);
        panel.appendChild(blockInfo);
        
        container.appendChild(panel);
        index++;
    }

    var createBlock = document.createElement("div");
    var csButton = document.createElement("div");
    csButton.classList.add("rd-sessions-plus");
    createBlock.classList.add("rd-sessions", "rd-sessions-create", "rd-panel");
    createBlock.id = "rd-blocks-create";

    createBlock.appendChild(csButton);
    container.appendChild(createBlock);

    console.log(SessionData);   
}

StudyLaunchBlock = async function(blockIndex)
{
    if(SessionData.file.blocks.list.length == 0)
        return false;

    var start = 0;
    var end = 0;
    var index = 0;

    for await (var block of SessionData.file.blocks.list)
    {
        if(blockIndex == index)
            break;
     
        start+=block.size-1;   
        index++;
    }
    end = start + SessionData.file.blocks.list[index].size-1;

    SessionData.active.block.index = index;
    SessionData.active.block.start = start;
    SessionData.active.block.end = end;
    
    SwapPage("page-study-config");
}

StudyCreateBlock = async function()
{
    SessionData.file.blocks.list.push(
        {
            size: SessionData.file.blocks.refBlockSize,
            studyMode: 0,
            paginationMode: 0,
            lastStudied: Date.now()
        }
    );
}