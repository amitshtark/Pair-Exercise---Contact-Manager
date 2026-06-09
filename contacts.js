const view = require("./view");
const model = require("./model");

const command = process.argv[2];
const args = process.argv.slice(3);
switch (command) {
  case "add":
    const name = args[0];
    const email = args[1];
    const phone = args[2];

    if (!name || !email || !phone) {
      view.showError("Missing arguments for add command");
      console.log('Usage: node app.js add "name" "email" "phone"');
      return;
    }
    view.showLoading("contacts.json");

    const contacts = model.loadContacts();
    const newContact = model.addContact(contacts, name, email, phone);

    view.showSuccess(`Contact added: ${newContact.name}`);

    model.saveContacts(contacts);

    view.showSuccess("Contacts saved to contacts.json");
    break;

  case "list":
    view.showLoading("contacts.json");
    try {
      const contacts = model.loadContacts();
      view.showContacts(contacts);
    } catch (err) {
      view.showError(err.message);
    }
    break;

  case "search":
    const query = args[0];
    if (!query) {
      view.showError("Missing argument for search command");
      console.log('Usage: node app.js search "email"');
      break;
    } else {
      view.showLoading("contacts.json");
      const contacts = model.loadContacts();
      const filtered_contacts = model.findContact(query, contacts);
      view.showSearchResults(query, filtered_contacts);
      break;
    }

  case "delete":
    const email = args[0];
    if (!email) {
      view.showError("Missing argument for delete command");
      console.log('Usage: node app.js delete "email"');
      break;
    } else {
      view.showLoading("contacts.json");
      const contacts = model.loadContacts();
      if (model.deleteContact(email, contacts)) {
        model.saveContacts(contacts);
        view.showSuccess(`contact ${email} was deleted`);
      } else view.showError(`contact ${email} not found`);
      break;
    }

  case "help":
    view.showHelp();
    break;

  default:
    view.showError(`Unknown command '${command}'`);
}
