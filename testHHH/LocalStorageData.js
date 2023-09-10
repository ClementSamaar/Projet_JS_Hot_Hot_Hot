class LocalStorageData{
    constructor(id = null, dateValue = null, tempInt = null, tempExt = null) {
        this._keyDate = "Date" + id;
        this._keyTempInt = "TempInt" + id;
        this._keyTempExt = "TempExt" + id;
        this._dateValue = dateValue;
        this._tempInt = tempInt;
        this._tempExt = tempExt;
    }

    fetchData(){
        this._dateValue = localStorage.getItem(this._keyDate);
        this._tempInt = localStorage.getItem(this._keyTempInt);
        this._tempExt = localStorage.getItem(this._keyTempExt);
    }

    storeData(){
        localStorage.setItem(this._keyDate, this._dateValue);
        localStorage.setItem(this._keyTempInt, this._tempInt);
        localStorage.setItem(this._keyTempExt, this._tempExt);
    }

    clearStoredData(){
        localStorage.removeItem(this._keyDate);
        localStorage.removeItem(this._keyTempInt);
        localStorage.removeItem(this._keyTempExt);
    }

    refactorKeys(newId){
        this._keyDate = "Date" + newId;
        this._keyTempInt = "TempInt" + newId;
        this._keyTempExt = "TempExt" + newId;
    }

    get getDateValue() {
        return this._dateValue;
    }

    set setDateValue(value) {
        this._dateValue = value;
    }

    get getTempInt() {
        return this._tempInt;
    }

    set setTempInt(value) {
        this._tempInt = value;
    }

    get getTempExt() {
        return this._tempExt;
    }

    set setTempExt(value) {
        this._tempExt = value;
    }

    get getKeyDate() {
        return this._keyDate;
    }

    set getKeyDate(value) {
        this._keyDate = value;
    }

    get getKeyTempInt() {
        return this._keyTempInt;
    }

    set setKeyTempInt(value) {
        this._keyTempInt = value;
    }

    get getKeyTempExt() {
        return this._keyTempExt;
    }

    set setKeyTempExt(value) {
        this._keyTempExt = value;
    }
}