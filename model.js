const fs = require("fs");
const path = require("path");

const contactsPath = path.join(__dirname, "contacts.json");

function loadContacts() {
  try {
    const data = fs.readFileSync(contactsPath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    throw error;
  }
}

function saveContacts(contacts) {
  try {
    fs.writeFileSync(contactsPath, JSON.stringify(contacts, null, 2), "utf8");
  } catch (error) {
    throw error;
  }
}

function validateContact(name, email, phone) {
  if (!name) throw new Error("Missing name");
  if (!email) throw new Error("Missing email");
  if (!phone) throw new Error("Missing phone");
  if (!email.includes("@")) throw new Error("Email must contain @ symbol");
}

function addContact(contacts, name, email, phone) {
  const exists = contacts.find((c) => c.email === email);
  if (exists) throw new Error("Contact with this email already exists");
  const contact = { name, email, phone };
  contacts.push(contact);
  return contact;
}

function deleteContact(contacts, email) {
  const index = contacts.findIndex((c) => c.email === email);
  if (index === -1) throw new Error(`No contact found with email: ${email}`);
  const [removed] = contacts.splice(index, 1);
  return removed;
}

function searchContacts(contacts, query) {
  const q = query.toLowerCase();
  return contacts.filter((c) => c.name.toLowerCase().includes(q) ||
     c.email.toLowerCase().includes(q));
}

module.exports = {
  loadContacts,
  saveContacts,
  validateContact,
  addContact,
  deleteContact,
  searchContacts,
};
