function showLoading(fileName) {
  console.log(`Loading contacts from ${fileName}...`);
}

function showLoaded(count) {
  console.log(`✓ Loaded ${count} contacts`);
}

function showContactDeleted(name) {
  console.log(`✓ Contact deleted: ${name}`);
}

function showSaved() {
  console.log("✓ Contacts saved to contacts.json");
}
function showError(message) {
  console.log(`✗ Error: ${message}`);
}

function showSuccess(message) {
  console.log(`✓ ${message}`);
}

function showContacts(contacts) {
  console.log("\n=== All Contacts ===");

  if (contacts.length === 0) {
    console.log("No contacts found");
    return;
  }

  contacts.forEach((contact, index) => {
    console.log(`${index + 1}. ${contact.name} - ${contact.email} - ${contact.phone}`);
  });

}
function showSearchResults(query, contacts) {
  console.log(`\n=== Search Results for "${query}" ===`);

  if (contacts.length === 0) {
    console.log(`No contacts found matching "${query}"`);
    return;
  }

  contacts.forEach((contact, index) => {
    console.log(`${index + 1}. ${contact.name} - ${contact.email} - ${contact.phone}`);
  });
}

function showHelp() {
  console.log(`Usage: node contacts.js [command] [arguments]

Commands:
  add "name" "email" "phone"  - Add a new contact
  list                        - List all contacts
  search "query"              - Search contacts by name or email
  delete "email"              - Delete contact by email
  help                        - Show this help message

Examples:
  node contacts.js add "John Doe" "john@example.com" "555-123-4567"
  node contacts.js search "john"
  node contacts.js delete "john@example.com"`);
}

module.exports = {
  showLoaded,
  showContactDeleted,
  showSaved,
  showLoading,
  showError,
  showSuccess,
  showContacts,
  showSearchResults,
  showHelp
};