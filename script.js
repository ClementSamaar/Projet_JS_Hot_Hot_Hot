/*SYSTEME DE NAVIGATION ONGLETS
 * rtd : real-time data
 * dh  : data history
 */
const O_rtdButton = document.querySelector("#realTimeData_button");
const O_dhButton = document.querySelector("#dataHistory_button");
const O_rtdDisplay = document.querySelector("#realTimeData_display");
const O_dhDisplay = document.querySelector("#dataHistory_display");

/**
 * @function changeTab
 * @description Permet de changer d'onglet en vérifiant la cohérence avec l'attribut aria-selected de button1 (déclenché par un listener)
 * @param {HTMLButtonElement} button1 Lors de l'appel de cette fonction, ce paramètre correspond au bouton sur lequel est placé le listener
 * @param {HTMLDivElement} display1 Lors de l'appel de cette fonction, ce paramètre correspond au contenu géré par le bouton sur lequel est placé le listener
 * @param {HTMLButtonElement} button2
 * @param {HTMLDivElement} display2
 */
function changeTab(button1, display1, button2, display2) {
    if (button1.getAttribute("aria-selected") === "false") {
        display1.setAttribute("class", "data_display");
        display2.setAttribute("class", "is-hidden");
        button1.setAttribute("aria-selected", "true");
        button2.setAttribute("aria-selected", "false");
        changeDisplayBackground();
    }
}

O_rtdButton.addEventListener("click", ()=>{
    changeTab(O_rtdButton, O_rtdDisplay, O_dhButton, O_dhDisplay);
});

O_dhButton.addEventListener("click", ()=>{
    changeTab(O_dhButton, O_dhDisplay, O_rtdButton, O_rtdDisplay);
});

//AFFICHAGE DES DONNEES EN TEMPS REEL
const O_mainContainer = document.querySelector("#mainDisplay_Container");
const O_loginButton = document.getElementById("loginButton");
const O_homeButton = document.getElementById("homeButton");
const O_docButton = document.getElementById("docButton");
const O_sensorRealTimeSelector = document.querySelector("#realTimeData_select");
const O_sensorDataHistorySelector = document.querySelector("#dataHistory_select");
const O_dataDisplay = document.querySelector("#realTimeData");
const O_suggestionDisplay = document.querySelector("#relatedSuggestion");
const O_maxValue = document.querySelector("#maxValue");
const O_minValue = document.querySelector("#minValue");
const O_footer = document.querySelector("footer");
let F_dataDisplayed;
let S_sockMsg;
let S_tempExt;
let S_tempInt;
let S_maxExt;
let S_minExt;
let S_maxInt;
let S_minInt;
let O_todayAtMidnight = new Date();
O_todayAtMidnight.setHours(0, 0, 0);
let A_dataHistory = [];

if (localStorage.getItem('NbVal') === null)
    localStorage.setItem('NbVal', '0');

A_dataHistory = fetchStoredData();
/**
 * @function rawMsgToNecessaryString()
 * @description Extrait les valeurs de température intérieure et extérieure de S_sockMsg vers S_tempInt et S_tempExt puis les affiche dans la console
 * @param {String} S_msg Données brutes
 */

function rawMsgToNecessaryString(S_msg) {
    S_msg = String(S_msg);
    let I_tempExtIndex;
    I_tempExtIndex = S_msg.indexOf(`Valeur`, S_msg.indexOf(`exterieur`)) + 9;
    //Cherche le mot 'valeur' depuis l'indice de la première lettre 'e' du mot exterieur
    //On ajoute 9 pour atteindre l'index du premier chiffre de la donnée de température depuis 'Valeur'
    S_tempExt = S_msg.slice(I_tempExtIndex, S_msg.indexOf(`"`, I_tempExtIndex));
    //On extrait le contenu de la chaine jusqu'au caractère '"' soit la donnée de température

    let I_tempIntIndex;
    I_tempIntIndex= S_msg.indexOf(`Valeur`, S_msg.indexOf(`interieur`)) + 9;
    S_tempInt = S_msg.slice(I_tempIntIndex, S_msg.indexOf(`"`, I_tempIntIndex));
    console.log("Température extérieure : ", S_tempExt);
    console.log("Température intérieure : ", S_tempInt);
}

/**
 * @function fetchStoredData()
 * @description Permet de récupérer dans A_storedData les valeurs persistantes et de rafraichir le localstorage avec les valeurs du jour seulement
 * @return {Array} A_storedData
 */

function fetchStoredData(){
    let NbVal = parseInt(localStorage.getItem('NbVal'));
    let A_storedData = [];
    if (NbVal !== null){
        for (let i = 0; i < NbVal; i++) {
            let O_fetchedData = new LocalStorageData(i);
            O_fetchedData.fetchData();
            if (O_fetchedData.getDateValue !== null) {
                if (Date.parse(O_fetchedData.getDateValue) >= O_todayAtMidnight.getTime() && !isNaN(parseFloat(O_fetchedData.getTempInt)))
                    A_storedData.push(O_fetchedData);
            }
        }
        NbVal = A_storedData.length;
        localStorage.clear();
        localStorage.setItem('NbVal', String(NbVal));
        for (let i = 0; i < NbVal; i++) {
            A_storedData[i].refactorKeys(i);
            A_storedData[i].storeData();
        }
        return A_storedData;
    }
    return null;
}

/**
 * @function storeData()
 * @description Permet de stocker un nouvel ensemble de valeurs dans le localStorage et l'ajouter à A_storedData
 * @param {number} TempInt Valeur TempInt à stocker
 * @param {number} TempExt Valeur TempExt à stocker
 */
function storeData(TempInt, TempExt){
    let I_id;

    I_id = parseInt(localStorage.getItem('NbVal'));
    localStorage.setItem('NbVal', String(I_id + 1));

    let O_dataToStore = new LocalStorageData(I_id, new Date(), TempInt, TempExt);
    O_dataToStore.storeData();
    A_dataHistory = fetchStoredData();
}

/**
 * @function sortDataHistoryArray()
 * @description Permet de trouver les maximales et minimales du jour
 */
function sortDataHistoryArray(){
    if (A_dataHistory !== null) {
        S_maxExt = parseFloat(A_dataHistory[0].getTempExt);
        S_minExt = parseFloat(A_dataHistory[0].getTempExt);
        S_maxInt = parseFloat(A_dataHistory[0].getTempInt);
        S_minInt = parseFloat(A_dataHistory[0].getTempInt);
        for (let i = 0; i < A_dataHistory.length; i++) {
            if (S_maxExt < parseFloat(A_dataHistory[i].getTempExt))
                S_maxExt = A_dataHistory[i].getTempExt;

            if (S_minExt > parseFloat(A_dataHistory[i].getTempExt))
                S_minExt = A_dataHistory[i].getTempExt;

            if (S_maxInt < parseFloat(A_dataHistory[i].getTempInt))
                S_maxInt = A_dataHistory[i].getTempInt;

            if (S_minInt > parseFloat(A_dataHistory[i].getTempInt))
                S_minInt = A_dataHistory[i].getTempInt;
        }
    }
}
/**
 * @function displayRealTimeValues()
 * @description Affiche les valeurs de température et les suggestions associées quand cela est nécessaire
 */
function displayRealTimeValues() {
    if (O_sensorRealTimeSelector.selectedIndex === 0)
        O_dataDisplay.innerHTML = S_tempExt + '°C';
    else
        O_dataDisplay.innerHTML = S_tempInt + '°C';

    //ALERTES POUR LA TEMPÉRATURE EXTÉRIEURE
    if (String(O_sensorRealTimeSelector.value) === "Température extérieure") {
        if (parseFloat(S_tempExt) < 0) {
            O_suggestionDisplay.innerHTML = "Banquise en vue !";
        } else if (parseFloat(S_tempExt) > 35) {
            O_suggestionDisplay.innerHTML = "Hot Hot Hot !";
        } else if (parseFloat(S_tempExt) >= 0 && parseFloat(S_tempExt) <= 35) {
            O_suggestionDisplay.innerHTML = null;
        }
    }
    //ALERTES POUR LA TEMPÉRATURE INTÉRIEURE
    else {
        if (parseFloat(S_tempInt) < 0) {
            O_suggestionDisplay.innerHTML = "Canalisations gelées, appelez SOS plombier et mettez un bonnet !";
        } else if (parseFloat(S_tempInt) >= 0 && parseFloat(S_tempInt) < 12) {
            O_suggestionDisplay.innerHTML = "Montez le chauffage ou mettez un gros pull !";
        } else if (parseFloat(S_tempInt) >= 12 && parseFloat(S_tempInt) < 22) {
            O_suggestionDisplay.innerHTML = null;
        } else if (parseFloat(S_tempInt) >= 22 && parseFloat(S_tempInt) < 50) {
            O_suggestionDisplay.innerHTML = "Baissez le chauffage !";
        } else if (parseFloat(S_tempInt) >= 50) {
            O_suggestionDisplay.innerHTML = "Appelez les pompiers ou arrêtez votre barbecue !";
        }
    }
}

/**
 * @function displayHistoryValues()
 * @description Affiche la température maximale et minimale du jour
 */
function displayHistoryValues() {
    sortDataHistoryArray();
    if (O_sensorDataHistorySelector.selectedIndex === 0) {
        O_maxValue.innerHTML = S_maxExt + '°C';
        O_minValue.innerHTML = S_minExt + '°C';
    } else {
        O_maxValue.innerHTML = S_maxInt + '°C';
        O_minValue.innerHTML = S_minInt + '°C';
    }
}
/**
 * @function changeDisplayBackground()
 * @description Change la couleur d'arrière fond de certains éléments en fonction de la température
 */
function changeDisplayBackground(){
    //Lorsque la température est supérieure ou égale à 20, l'arrière fond est de couleur rouge
    if (F_dataDisplayed >= 20){
        O_mainContainer.setAttribute("class", "redBackground");
        O_footer.setAttribute("class", "redBackground");
        O_loginButton.setAttribute("class", "redBackground");
        O_homeButton.setAttribute("class", "redBackground")
        O_docButton.setAttribute("class", "redBackground")
        if (O_rtdButton.getAttribute("aria-selected") === "true"){
            O_rtdButton.setAttribute("class", "tabListButton redBackground");
            O_dhButton.setAttribute("class", "tabListButton")
        }
        else{
            O_rtdButton.setAttribute("class", "tabListButton");
            O_dhButton.setAttribute("class", "tabListButton redBackground");
        }
    }
    //Lorsque la température est inférieure à 20, l'arrière fond est de couleur bleue
    else if (F_dataDisplayed < 20){
        O_mainContainer.setAttribute("class", "blueBackground");
        O_footer.setAttribute("class", "blueBackground");
        O_loginButton.setAttribute("class", "blueBackground");
        O_homeButton.setAttribute("class", "blueBackground")
        O_docButton.setAttribute("class", "blueBackground")
        if (O_rtdButton.getAttribute("aria-selected") === "true"){
            O_rtdButton.setAttribute("class", "tabListButton blueBackground");
            O_dhButton.setAttribute("class", "tabListButton");
        }
        else {
            O_rtdButton.setAttribute("class", "tabListButton");
            O_dhButton.setAttribute("class", "tabListButton blueBackground");
        }
    }
}

/**
 * @function processFetchData()
 * @description Traite la réponse du fetch
 */

function processFetchData() {
    rawMsgToNecessaryString(S_fetchResponse);
    storeData(parseFloat(S_tempInt), parseFloat(S_tempExt));
    displayRealTimeValues();
    displayHistoryValues();
    F_dataDisplayed = parseFloat(O_dataDisplay.innerHTML.slice(0, O_dataDisplay.innerHTML.indexOf("°")));
    changeDisplayBackground();
}

O_sensorRealTimeSelector.addEventListener('change', () => {
    displayRealTimeValues();
    changeDisplayBackground();
});

O_sensorDataHistorySelector.addEventListener('change', () => {
    displayHistoryValues();
});

//ACQUISITION DES DONNEES PAR WEBSOCKET

const O_socket = new WebSocket('wss://ws.hothothot.dog:9502');//Créer une socket client

O_socket.onopen = function(){
    console.log("Connexion établie avec le serveur hothothot.dog sur le port 9502\n");
    O_socket.send('J\'ai besoin de valeurs fictives');//message à envoyer au serveur
    console.log('Message envoyé au serveur');
};

O_socket.onmessage = function (event) {
    S_sockMsg = String(event.data);
    rawMsgToNecessaryString(S_sockMsg);
    storeData(parseFloat(S_tempInt), parseFloat(S_tempExt));
    displayRealTimeValues();
    displayHistoryValues();
    F_dataDisplayed = parseFloat(O_dataDisplay.innerHTML.slice(0, O_dataDisplay.innerHTML.indexOf("°")));
    changeDisplayBackground();
};//Lors de la reception

O_socket.onerror = function (event) {
    console.log(event);
};//Si il y a un problème

//ACQUISITION DES DONNEES PAR FETCH

let S_fetchResponse;

let A_fetchHeader = new Headers({
    "Accept": "application/json",
    "Content-Type": "application/json"
});

let A_init = {
    method: 'GET',
    headers: A_fetchHeader,
    mode: 'cors',
    cache: 'default',
    keepalive: true
};

/**
 * @function fetchData()
 * @description Effectue une requète fetch vers le serveur hothothot, retourne la réponse sous forme de string et traite cette réponse
 */
function fetchAndProcess() {
    fetch('https://hothothot.dog/api/capteurs', A_init)
        .then(response => response.json())
        .then(response => S_fetchResponse = JSON.stringify(response))
        .catch(error => console.log(error));
    setTimeout(processFetchData, 1000);
}

fetchAndProcess();

if (O_socket.readyState !== O_socket.OPEN || S_sockMsg === null)
    I_fetchIntervalId = setInterval(fetchAndProcess, 10000);

if (O_socket.readyState === O_socket.OPEN && S_sockMsg !== null)
    clearInterval(I_fetchIntervalId);
