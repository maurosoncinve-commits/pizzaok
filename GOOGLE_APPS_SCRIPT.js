// COPIA QUESTO CODICE NEL TUO PROGETTO SU SCRIPT.GOOGLE.COM

// Ho già inserito l'ID della tua cartella specifica qui sotto:
var FOLDER_ID = "1OwYpBnngF8oGEM7HL_z163yzX3WM8kpj"; 
var FILENAME = "pizzangooo_db.json";

function doGet(e) {
  var folder = DriveApp.getFolderById(FOLDER_ID);
  var files = folder.getFilesByName(FILENAME);
  
  if (files.hasNext()) {
    var content = files.next().getBlob().getDataAsString();
    return ContentService.createTextOutput(content).setMimeType(ContentService.MimeType.JSON);
  }
  
  // Database vuoto iniziale se il file non esiste ancora
  var emptyDb = JSON.stringify({customers: [], cards: [], transactions: []});
  return ContentService.createTextOutput(emptyDb).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    // Riceve i dati dall'App
    var content = e.postData.contents;
    
    var folder = DriveApp.getFolderById(FOLDER_ID);
    var files = folder.getFilesByName(FILENAME);
    
    if (files.hasNext()) {
      // Se il file esiste, lo aggiorna
      files.next().setContent(content);
    } else {
      // Se non esiste, lo crea nella cartella specifica
      folder.createFile(FILENAME, content);
    }
    
    return ContentService.createTextOutput(JSON.stringify({status: "success"}));
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({status: "error", message: err.toString()}));
  }
}

/*
ISTRUZIONI PER IL DEPLOY:
1. Incolla questo codice nell'editor di Google Apps Script.
2. Clicca su "Distribuisci" (Deploy) -> "Nuova distribuzione" (New deployment).
3. Clicca sull'icona ingranaggio -> seleziona "App web".
4. Descrizione: "PizzaDB".
5. Esegui come: "Me" (la tua email).
6. Chi può accedere: "Chiunque" (Anyone). IMPORTANTE!
7. Clicca "Distribuisci".
8. Autorizza l'accesso (se chiede "App non sicura", clicca Avanzate -> Vai a... -> Consenti).
9. Copia l'URL dell'App Web (finisce con /exec) e incollalo nelle impostazioni dell'app Pizza 'N Gooo.
*/