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

var processedBeatmaps = new Set();

function addButtonToDiv(div) {
	var downloadButton = div.querySelector('a');
	if (!downloadButton) {
		console.error('Unable to find download button in div:', div);
		return;
	}
	var mapUrl = getTextBeforeLastSlash(downloadButton.href);
	var beatmapSetId = getTextAfterLastSlash(mapUrl);
	if (processedBeatmaps.has(beatmapSetId)) {
		return;
	}
	processedBeatmaps.add(beatmapSetId);
	
	var button = document.createElement('a');
	button.href = 'osu://dl/' + beatmapSetId;
	button.classList.add("beatmapset-panel__menu-item");
	button.setAttribute("data-turbolinks", "false");
	button.setAttribute("data-orig-title", "osu!direct download");
	button.title = "osu!direct download";
	const spanIcon = document.createElement('span');
	spanIcon.classList.add("fas", "fa-download");
	button.appendChild(spanIcon);

	div.appendChild(button);
}

function addButtonToDivs() {
	const divs = document.querySelectorAll(".beatmapset-panel__menu");
	divs.forEach(function(div) {
		addButtonToDiv(div);
	});
}

function initializeContentScript() {
	addButtonToDivs();
    // Watch for new divs being added (due to pagination)
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
			if (mutation.target.matches(".beatmapsets__items") || mutation.target.matches(".lazy-load") || mutation.target.matches(".osu-layout__col-container")){
				// mutation.target.childNodes.forEach(function(childNode) {
					// if (childNode.nodeType === Node.ELEMENT_NODE) {
					  // addButtonToDiv(childNode);
					// }
				// });
				addButtonToDivs();
				return;
			}
        });
    });
    const targetNode = document.querySelector(".beatmapsets__items, .lazy-load, .osu-layout__col-container");
    observer.observe(targetNode, {
        childList: true,
    });
    console.log('Content script initialized');
}

window.addEventListener('pageshow', function() {
	initializeContentScript();
});