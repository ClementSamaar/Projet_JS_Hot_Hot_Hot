let O_sensorSelector = document.querySelector("#realTimeData_select");
let O_dataDisplay = document.querySelector("#realTimeData");
let O_suggestionDisplay = document.querySelector("#relatedSuggestion");

function displayValues(){
    if (O_sensorSelector.selectedIndex === 0)
        O_dataDisplay.innerHTML = S_tempExt + '°C';
    else
        O_dataDisplay.innerHTML = S_tempInt + '°C';

    if (String(O_sensorSelector.value) === "Température extérieure"){
        if (parseFloat(S_tempExt) < 0) {
            O_suggestionDisplay.innerHTML = "Banquise en vue !";
            alert("Banquise en vue !")
        }
        else if (parseFloat(S_tempExt) > 35) {
            O_suggestionDisplay.innerHTML = "Hot Hot Hot !";
            alert("Hot Hot Hot !")
        }
        else if (parseFloat(S_tempExt) >= 0 && parseFloat(S_tempExt) <= 35){
            O_suggestionDisplay.innerHTML = null;
        }
    }
    else{
        if (parseFloat(S_tempInt) < 0) {
            O_suggestionDisplay.innerHTML = "Canalisations gelées, appelez SOS plombier et mettez un bonnet !";
            alert("Canalisations gelées, appelez SOS plombier et mettez un bonnet !")
        }
        else if (parseFloat(S_tempInt) >= 0 && parseFloat(S_tempInt) < 12) {
            O_suggestionDisplay.innerHTML = "Montez le chauffage ou mettez un gros pull !";
            alert("Montez le chauffage ou mettez un gros pull !")
        }
        else if (parseFloat(S_tempInt) >= 12 && parseFloat(S_tempInt) < 22){
            O_suggestionDisplay.innerHTML = null;
        }
        else if (parseFloat(S_tempInt) >= 22 && parseFloat(S_tempInt) < 50){
            O_suggestionDisplay.innerHTML = "Baissez le chauffage !";
            alert("Baissez le chauffage !")
        }
        else if (parseFloat(S_tempInt) >= 50){
            O_suggestionDisplay.innerHTML = "Appelez les pompiers ou arrêtez votre barbecue !";
            alert("Appelez les pompiers ou arrêtez votre barbecue !")
        }
    }
}

O_sensorSelector.addEventListener('change', (event) => {
    displayValues();
});

//Créer une socket client
let O_socket = new WebSocket('wss://ws.hothothot.dog:9502');
let S_data;
let S_tempExtIndex;
let S_tempIntIndex;
let S_tempExt;
let S_tempInt;

O_socket.onopen = function(){
    console.log("Connexion établie avec le serveur hothothot.dog sur le port 9502\n");
    O_socket.send('J\'ai besoin de valeurs fictives');//message à envoyer au serveur
    console.log('Message envoyé au serveur');
}

O_socket.onmessage = function (event) {
    //console.log(event);
    S_data = String(event.data);
    console.log(S_data);
    S_tempExtIndex = S_data.indexOf(`Valeur`,S_data.indexOf(`exterieur`)) + 9;
    S_tempExt = S_data.slice(S_tempExtIndex, S_data.indexOf(`"`, S_tempExtIndex + 1));
    S_tempIntIndex = S_data.indexOf(`Valeur`,S_data.indexOf(`interieur`)) + 9;
    S_tempInt = S_data.slice(S_tempIntIndex, S_data.indexOf(`"`, S_tempIntIndex + 1));
    console.log("Température extérieure : ", S_tempExt);
    console.log("Température intérieure : ", S_tempInt);
    displayValues();
}//Lors de la reception

O_socket.onerror = function (event) {
    console.log(event);
}//Si il y a un problème