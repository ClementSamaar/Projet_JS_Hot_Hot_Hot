//SYSTEME DE NAVIGATION ONGLETS
let O_rtdButton = document.querySelector("#realTimeData_button");
let O_dhButton = document.querySelector("#dataHistory_button");
let O_rtdDisplay = document.querySelector("#realTimeData_display");
let O_dhDisplay = document.querySelector("#dataHistory_display");

O_rtdButton.onclick = function () {
    if (O_rtdButton.getAttribute("aria-selected") === "false") {
        O_dhDisplay.setAttribute("class", "is-hidden");
        O_rtdDisplay.setAttribute("class", "");
        O_dhButton.setAttribute("aria-selected", "false");
        O_rtdButton.setAttribute("aria-selected", "true");
        changeDisplayBackground();
    }
}

O_dhButton.addEventListener("click", (event)=>{
    if (O_dhButton.getAttribute("aria-selected") === "false") {
        O_rtdDisplay.setAttribute("class", "is-hidden");
        O_dhDisplay.setAttribute("class", "");
        O_rtdButton.setAttribute("aria-selected", "false");
        O_dhButton.setAttribute("aria-selected", "true");
        changeDisplayBackground();
    }
});

//AFFICHAGE DES DONNEES EN TEMPS REEL
let O_mainDisplay_container = document.querySelector("#mainDisplay_Container");
let O_sensorSelector = document.querySelector("#realTimeData_select");
let O_dataDisplay = document.querySelector("#realTimeData");
let O_suggestionDisplay = document.querySelector("#relatedSuggestion");
let F_dataDisplayed;
let S_socketMessage;
let S_tempExtIndex;
let S_tempIntIndex;
let S_tempExt;
let S_tempInt;
let O_socket = new WebSocket('wss://ws.hothothot.dog:9502');//Créer une socket client

function displayValues() {
    if (O_sensorSelector.selectedIndex === 0)
        O_dataDisplay.innerHTML = S_tempExt + '°C';
    else
        O_dataDisplay.innerHTML = S_tempInt + '°C';

    if (String(O_sensorSelector.value) === "Température extérieure") {
        if (parseFloat(S_tempExt) < 0) {
            O_suggestionDisplay.innerHTML = "Banquise en vue !";
        } else if (parseFloat(S_tempExt) > 35) {
            O_suggestionDisplay.innerHTML = "Hot Hot Hot !";
        } else if (parseFloat(S_tempExt) >= 0 && parseFloat(S_tempExt) <= 35) {
            O_suggestionDisplay.innerHTML = null;
        }
    } else {
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

function changeDisplayBackground(){
    if (F_dataDisplayed >= 20){
        console.log("Rouge");
        O_mainDisplay_container.setAttribute("class", "redBackground");
        if (O_rtdButton.getAttribute("aria-selected") === "true"){
            O_rtdButton.setAttribute("class", "tabListButton redBackground");
            O_dhButton.setAttribute("class", "tabListButton")
        }
        else{
            O_rtdButton.setAttribute("class", "tabListButton");
            O_dhButton.setAttribute("class", "tabListButton redBackground");
        }
    }
    else if (F_dataDisplayed < 20){
        O_mainDisplay_container.setAttribute("class", "blueBackground");
        if (O_rtdButton.getAttribute("aria-selected") === "true"){
            O_rtdButton.setAttribute("class", "tabListButton blueBackground");
            O_dhButton.setAttribute("class", "tabListButton");
        }
        else {
            O_rtdButton.setAttribute("class", "tabListButton");
            O_dhButton.setAttribute("class", "tabListButton blueBackground");
        }
    }
    else{
        O_mainDisplay_container.setAttribute("class", "redBackground");
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

O_sensorSelector.addEventListener('change', (event) => {
    displayValues();
    changeDisplayBackground();
});

O_socket.onopen = function(){
    console.log("Connexion établie avec le serveur hothothot.dog sur le port 9502\n");
    O_socket.send('J\'ai besoin de valeurs fictives');//message à envoyer au serveur
    console.log('Message envoyé au serveur');
}

O_socket.onmessage = function (event) {
    //console.log(event);
    S_socketMessage = String(event.data);
    console.log(S_socketMessage);

    S_tempExtIndex = S_socketMessage.indexOf(`Valeur`,S_socketMessage.indexOf(`exterieur`)) + 9;
    S_tempExt = S_socketMessage.slice(S_tempExtIndex, S_socketMessage.indexOf(`"`, S_tempExtIndex + 1));
    S_tempIntIndex = S_socketMessage.indexOf(`Valeur`,S_socketMessage.indexOf(`interieur`)) + 9;
    S_tempInt = S_socketMessage.slice(S_tempIntIndex, S_socketMessage.indexOf(`"`, S_tempIntIndex + 1));
    console.log("Température extérieure : ", S_tempExt);
    console.log("Température intérieure : ", S_tempInt);

    F_dataDisplayed = parseFloat(O_dataDisplay.innerHTML.slice(0, O_dataDisplay.innerHTML.indexOf("°")));
    console.log(F_dataDisplayed);

    displayValues();
    changeDisplayBackground();
}//Lors de la reception

O_socket.onerror = function (event) {
    console.log(event);
}//Si il y a un problème
