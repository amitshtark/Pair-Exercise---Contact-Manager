const view = require("./view");
const model = require("./model");
const { error } = require("node:console");

const command = process.argv[2];
const args = process.argv.slice(3);

switch (command) {
  case "add": {
    const name = args[0];
    const email = args[1];
    const phone = args[2];

    try {
      model.validateContact(name, email, phone);
    } catch (err) {
      view.showError(err.message);
      console.log('Usage: node contacts.js add "name" "email" "phone"');
      break;
    }

    view.showLoading("contacts.json");

    try {
      const contacts = model.loadContacts();
      view.showLoaded(contacts.length);
    } catch (err) {
      view.showError(err.message);
      contacts = model.createContactsJson();
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
    view.showLoading("contacts.json");
    const { contacts, created } = model.loadContacts();
    if (created) {
      view.showFileNotFound();
    } else {
      view.showLoaded(contacts.length);
    }
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
    view.showLoading("contacts.json");
    const { contacts, created } = model.loadContacts();
    if (created) {
      view.showFileNotFound();
    } else {
      view.showLoaded(contacts.length);
    }
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
