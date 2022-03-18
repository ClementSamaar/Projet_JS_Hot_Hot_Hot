//SYSTEME DE NAVIGATION ONGLETS
//rtd : real-time data
//dh  : data history
const O_rtdButton = document.querySelector("#realTimeData_button");
const O_dhButton = document.querySelector("#dataHistory_button");
const O_rtdDisplay = document.querySelector("#realTimeData_display");
const O_dhDisplay = document.querySelector("#dataHistory_display");

/**
 * @function changeTab
 * @description Permet de changer d'onglet en vérifiant la cohérence avec l'attribut aria-selected de button1 (déclenché par un listener)
 * @param button1 Lors de l'appel de cette fonction, ce paramètre correspond au bouton sur lequel est placé le listener
 * @param display1 Lors de l'appel de cette fonction, ce paramètre correspond au contenu géré par le bouton sur lequel est placé le listener
 * @param button2
 * @param display2
 */
function changeTab(button1, display1, button2, display2) {
    if (button1.getAttribute("aria-selected") === "false") {
        display1.setAttribute("class", "");
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
const O_rtd_container = document.querySelector("#mainDisplay_Container");
const O_sensorSelector = document.querySelector("#realTimeData_select");
const O_dataDisplay = document.querySelector("#realTimeData");
const O_suggestionDisplay = document.querySelector("#relatedSuggestion");
const O_footer = document.querySelector("footer");
let F_dataDisplayed;
let S_sockMsg;
let S_tempExt;
let S_tempInt;

if (localStorage.getItem('NbVal') === null)
    localStorage.setItem('NbVal', '0');

let O_todayAtMidnight = new Date();
O_todayAtMidnight.setHours(0, 0, 0);
let A_dataHistory = [];
A_dataHistory = fetchOldData();

//ACQUISITION DES DONNEES PAR FETCH
/*
let O_dataDisplayFetch

A_fetchHeader = new Headers({
    "Accept": "application/json",
    "Content-Type": "application/json"
});

let A_init = {
    method: 'GET',
    headers: A_fetchHeader,
    mode: 'cors',
    cache: 'default'
}

fetch('https://hothothot.dog/api/capteurs', A_init).then(function(response){
    console.log(response);
    O_dataDisplayFetch = response.body;
})

console.log(O_dataDisplayFetch);*/

//ACQUISITION DES DONNEES PAR WEBSOCKET
/**
 * @function sockMsgToNecessaryString()
 * @description Extrait les valeurs de température intérieure et extérieure de S_sockMsg vers S_tempInt et S_tempExt puis les affiche dans la console
 */
function sockMsgToNecessaryString() {
    let S_tempExtIndex = S_sockMsg.indexOf(`Valeur`, S_sockMsg.indexOf(`exterieur`)) + 9;
    //Cherche le mot 'valeur' depuis l'indice de la première lettre 'e' du mot exterieur
    //On ajoute 9 pour atteindre l'index du premier chiffre de la donnée de température depuis 'Valeur'
    S_tempExt = S_sockMsg.slice(S_tempExtIndex, S_sockMsg.indexOf(`"`, S_tempExtIndex));
    //On extrait le contenu de la chaine jusqu'au caractère '"' soit la donnée de température

    let S_tempIntIndex = S_sockMsg.indexOf(`Valeur`, S_sockMsg.indexOf(`interieur`)) + 9;
    S_tempInt = S_sockMsg.slice(S_tempIntIndex, S_sockMsg.indexOf(`"`, S_tempIntIndex));
    console.log("Température extérieure : ", S_tempExt);
    console.log("Température intérieure : ", S_tempInt);
}

/**
 * @function fetchOldData()
 * @description Permet de récupérer dans A_storedData les valeurs persistantes du localStorage
 * @return A_storedData[]
 */
function fetchOldData(){
    let A_storedData = []
    let I_nbVal = parseInt(localStorage.getItem('NbVal'));
    let i = 0;

    while (A_storedData.length < I_nbVal){
        let O_fetchedData = new LocalStorageData(i);
        if (localStorage.getItem(O_fetchedData.getKeyDate) != null) {
            O_fetchedData.fetchData();

            if (Date.parse(O_fetchedData.getDateValue) >= O_todayAtMidnight.getTime()) {
                A_storedData.push(O_fetchedData);
            }
            else {
                O_fetchedData.clearStoredData();
                localStorage.setItem('NbVal', String(--I_nbVal));
            }
        }
        ++i;
    }
    return A_storedData;
}

/**
 * @function storeData()
 * @description Permet de stocker un nouvel ensemble de valeurs dans le localStorage et l'ajouter à A_storedData
 * @param TempInt Valeur TempInt à stocker
 * @param TempExt Valeur TempExt à stocker
 */
function storeData(TempInt, TempExt){
    let O_lastStoredData = A_dataHistory[A_dataHistory.length - 1];
    console.log(typeof(O_lastStoredData));
    let I_id = parseInt(O_lastStoredData.getKeyDate.charAt(4)) + 1;
    let O_dataToStore = new LocalStorageData(I_id, new Date(), TempInt, TempExt);
    O_dataToStore.storeData();
    localStorage.setItem('NbVal', String(I_id));
    A_dataHistory.push(O_dataToStore);
}

/**
 * @function displayValues()
 * @description Affiche les valeurs de température et les suggestions associées quand cela est nécessaire
 */
function displayValues() {
    if (O_sensorSelector.selectedIndex === 0)
        O_dataDisplay.innerHTML = S_tempExt + '°C';
    else
        O_dataDisplay.innerHTML = S_tempInt + '°C';

    //ALERTES POUR LA TEMPÉRATURE EXTÉRIEURE
    if (String(O_sensorSelector.value) === "Température extérieure") {
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
 * @function changeDisplayBackground()
 * @description Change la couleur d'arrière fond de certains éléments en fonction de la température
 */
function changeDisplayBackground(){
    //Lorsque la température est supérieure ou égale à 20, l'arrière fond est de couleur rouge
    if (F_dataDisplayed >= 20){
        O_rtd_container.setAttribute("class", "redBackground");
        O_footer.setAttribute("class", "redBackground");
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
        O_rtd_container.setAttribute("class", "blueBackground");
        O_footer.setAttribute("class", "blueBackground");
        if (O_rtdButton.getAttribute("aria-selected") === "true"){
            O_rtdButton.setAttribute("class", "tabListButton blueBackground");
            O_dhButton.setAttribute("class", "tabListButton");
        }
        else {
            O_rtdButton.setAttribute("class", "tabListButton");
            O_dhButton.setAttribute("class", "tabListButton blueBackground");
        }
    }
    //Lorsque qu'il n'y a pas de données, l'arrière fond est de couleur rouge
    else if (F_dataDisplayed == null){
        O_rtd_container.setAttribute("class", "redBackground");
        O_footer.setAttribute("class", "redBackground");
        if (O_rtdButton.getAttribute("aria-selected") === "true"){
            O_rtdButton.setAttribute("class", "tabListButton redBackground");
            O_dhButton.setAttribute("class", "tabListButton")
        }
        else{
            O_rtdButton.setAttribute("class", "tabListButton");
            O_dhButton.setAttribute("class", "tabListButton redBackground");
        }
    }
}

O_sensorSelector.addEventListener('change', () => {
    displayValues();
    changeDisplayBackground();
});

const O_socket = new WebSocket('wss://ws.hothothot.dog:9502');//Créer une socket client

O_socket.onopen = function(){
    console.log("Connexion établie avec le serveur hothothot.dog sur le port 9502\n");
    O_socket.send('J\'ai besoin de valeurs fictives');//message à envoyer au serveur
    console.log('Message envoyé au serveur');
}

O_socket.onmessage = function (event) {
    S_sockMsg = String(event.data);
    console.log(S_sockMsg);
    sockMsgToNecessaryString();
    storeData(parseFloat(S_tempInt), parseFloat(S_tempExt));
    displayValues();
    F_dataDisplayed = parseFloat(O_dataDisplay.innerHTML.slice(0, O_dataDisplay.innerHTML.indexOf("°")));
    changeDisplayBackground();
}//Lors de la reception

O_socket.onerror = function (event) {
    console.log(event);
}//Si il y a un problème