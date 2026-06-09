const view = require("./view");
const model = require("./model");

const command = process.argv[2];
const args = process.argv.slice(3);

switch (command) {
  case "add": {
    const name = args[0];
    const email = args[1];
    const phone = args[2];
    if (!name || !email || !phone)
    {
      view.showError("Missing arguments for add command");
      console.log('Usage: node contacts.js add "name" "email" "phone"');
      break;
    }
    try {
      model.validateContact(name, email, phone);
    } catch (err) {
      view.showError(err.message);
      break;
    }

    view.showLoading("contacts.json");
    let contacts;
    try {
      contacts = model.loadContacts();
      view.showLoaded(contacts.length);
    } catch (err) {
      contacts = fileNotFound();

    }

    try {
      const newContact = model.addContact(contacts, name, email, phone);
      view.showSuccess(`Contact added: ${newContact.name}`);
      model.saveContacts(contacts);
      view.showSuccess("Contacts saved to contacts.json");
    } catch (err) {
      view.showError(err.message);
    }
    break;
  }

  case "list": {
    view.showLoading("contacts.json");
    try {
      const contacts = model.loadContacts();
      view.showLoaded(contacts.length);
      view.showContacts(contacts);
    } catch (err) {
      view.showError(err.message);
    }
    break;
  }

  case "search": {
    const query = args[0];
    if (!query) {
      view.showError("Missing argument for search command");
      console.log('Usage: node contacts.js search "query"');
      break;
    }
    const contacts = getContacts();
    const results = model.searchContacts(contacts, query);
    view.showSearchResults(query, results);
    break;
  }

  case "delete": {
    const email = args[0];
    if (!email) {
      view.showError("Missing argument for delete command");
      console.log('Usage: node contacts.js delete "email"');
      break;
    }
    const contacts = getContacts();
    try {
      const removed = model.deleteContact(contacts, email);
      view.showContactDeleted(removed.name);
      model.saveContacts(contacts);
      view.showSaved();
    } catch (err) {
      view.showError(err.message);
    }
    break;
  }

  case "help":
    view.showHelp();
    break;

  default:
    view.showError(`Unknown command '${command}'`);
    console.log(
      "Usage: node contacts.js [add|list|search|delete|help] [arguments]",
    );
}
function fileNotFound() {
  try {
    model.saveContacts([]);
    view.showError("File not found - creating new contact list");
    return [];
  } catch (error) {
    view.showError(error.message);
    return [];
  }
}
function getContacts(){
    view.showLoading("contacts.json");
    try{
      const contacts = model.loadContacts();
      view.showLoaded(contacts.length);
      return contacts;
    }catch(err){
      const contacts = fileNotFound();
      return contacts;
    }
}