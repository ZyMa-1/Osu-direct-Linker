const form = document.getElementById('api-form');
const testButton = document.getElementById('testButton');

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const apiKey = document.getElementById('api-key').value;
    await chrome.storage.sync.set({
        'apiKey': apiKey
    });
    console.log('API key saved:', apiKey);
    window.close();
});

testButton.addEventListener('click', function() {
    event.preventDefault();
    const status = document.getElementById('status');
    status.textContent = '';
    const apiKey = document.getElementById('api-key').value;
    const testUrl = 'http://osu.ppy.sh/api/get_user?k=' + apiKey + '&u=2';
    fetch(testUrl)
        .then(response => {
            if (response.status === 200) {
                status.style.color = 'green';
                status.textContent = 'API Key is valid!';
            } else {
                status.style.color = 'red';
                status.textContent = 'API Key is invalid!';
            }
        })
        .catch(error => {
            status.style.color = 'red';
            status.textContent = 'API Key is invalid!';
        });
});

document.addEventListener('DOMContentLoaded', function() {
    const apiKeyInput = document.getElementById("api-key");
    chrome.storage.sync.get("apiKey", function(data) {
        if (data.apiKey) {
            apiKeyInput.value = data.apiKey;
        }
    });
});