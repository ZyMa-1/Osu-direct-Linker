function getTextBeforeLastSlash(str) {
    let lastIndex = str.lastIndexOf('/');
    let result = str.substring(0, lastIndex);
    return result;
}

function getTextAfterLastSlash(str) {
    let lastSlashIndex = str.lastIndexOf('/');
    if (lastSlashIndex !== -1) {
        return str.substring(lastSlashIndex + 1);
    } else {
        return str;
    }
}

async function requestOsuAPI(params) {
    const url = new URL('https://osu.ppy.sh/api/' + params.endpoint);
    // Add query params to URL
    for (const [key, value] of Object.entries(params)) {
        if (key !== 'endpoint') {
            url.searchParams.append(key, value);
        }
    }
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    const json = await response.json();
    return json;
}

async function getFirstBeatmapId(beatmapSetId) {
    const apiKey = await new Promise((resolve, reject) => {
        chrome.storage.sync.get('apiKey', (result) => {
            const apiKey = result['apiKey'];
            if (apiKey) {
                resolve(apiKey);
            } else {
                reject(new Error('API key not found in storage'));
            }
        });
    });
    const params = {
        endpoint: 'get_beatmaps',
        k: apiKey,
        s: beatmapSetId
    };
    const data = await requestOsuAPI(params);
    if (data && Array.isArray(data) && data.length > 0) {
        return data[0].beatmap_id;
    }
    throw new Error('Could not retrieve beatmap ID.');
}


var processedDivs = new Set();

async function addButtonToDivs() {
    const divs = document.querySelectorAll('.beatmapset-panel__menu');

    for (let i = 0; i < divs.length; i++) {
        const div = divs[i];
        if (processedDivs.has(div)) {
            continue;
        }
        processedDivs.add(div);
        var downloadButton = div.querySelector('a');
        if (!downloadButton) {
            console.error('Unable to find download button in div:', div);
            continue;
        }
        var mapUrl = getTextBeforeLastSlash(downloadButton.href);
        var beatmapSetId = getTextAfterLastSlash(mapUrl);
        var beatmapId = await getFirstBeatmapId(beatmapSetId);
        if (!beatmapId) {
            console.error('Unable to find beatmap ID in download URL:', mapUrl);
            continue;
        }
        var button = document.createElement('a');
        button.href = 'osu://b/' + beatmapId;
        button.classList.add("beatmapset-panel__menu-item");
        button.setAttribute("data-turbolinks", "false");
        button.setAttribute("data-orig-title", "osu!direct download");
        button.title = "osu!direct download";
        const spanIcon = document.createElement('span');
        spanIcon.classList.add("fas", "fa-download");
        button.appendChild(spanIcon);

        downloadButton.parentNode.insertBefore(button, downloadButton.nextSibling);
    }
}


function addTextToHeaderTitle() {
    const title = document.querySelector('.header-v4__title');
    if (title) {
        title.textContent += ' with extension';
    }
}

async function initializeContentScript() {
	//addTextToHeaderTitle();
	await addButtonToDivs();
    // Watch for new divs being added (due to pagination)
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(async function(mutation) {
            for (var i = 0; i < mutation.addedNodes.length; i++) {
                var node = mutation.addedNodes[i];
                if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('beatmapsets__items-row')) {
                    await addButtonToDivs();
                    break;
                }
            }
        });
    });
    const targetNode = document.querySelector(".beatmapsets__items");
    observer.observe(targetNode, {
        childList: true
    });
    console.log('Content script initialized');
}

window.addEventListener('pageshow', async function() {
	 await initializeContentScript();
});