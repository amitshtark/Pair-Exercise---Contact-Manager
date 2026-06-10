const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const contactsPath = path.join(__dirname, "contacts.json");

function runCommand(command) {
  return execSync(`node contacts.js ${command}`, {
    cwd: __dirname,
    encoding: "utf8",
  });
}

beforeEach(() => {
  if (fs.existsSync(contactsPath)) {
    fs.unlinkSync(contactsPath);
  }
});

afterEach(() => {
  if (fs.existsSync(contactsPath)) {
    fs.unlinkSync(contactsPath);
  }
});

describe("Contact Manager CLI", () => {
  test("shows error for invalid email", () => {
    const output = runCommand(`add "John" "invalid-email" "555-1234"`);

    expect(output).toContain("Email must contain @ symbol");
  });

  test("adds a new contact and creates contacts.json if missing", () => {
    const output = runCommand(`add "John Doe" "john@example.com" "555-123-4567"`);

    expect(output).toContain("Loading contacts from contacts.json...");
    expect(output).toContain("File not found - creating new contact list");
    expect(output).toContain("Contact added: John Doe");
    expect(output).toContain("Contacts saved to contacts.json");

    expect(fs.existsSync(contactsPath)).toBe(true);

    const contacts = JSON.parse(fs.readFileSync(contactsPath, "utf8"));
    expect(contacts).toHaveLength(1);
    expect(contacts[0]).toEqual({
      name: "John Doe",
      email: "john@example.com",
      phone: "555-123-4567",
    });
  });

  test("lists all contacts", () => {
    runCommand(`add "John Doe" "john@example.com" "555-123-4567"`);
    runCommand(`add "Jane Smith" "jane@example.com" "555-987-6543"`);

    const output = runCommand("list");

    expect(output).toContain("Loaded 2 contacts");
    expect(output).toContain("=== All Contacts ===");
    expect(output).toContain("1. John Doe - john@example.com - 555-123-4567");
    expect(output).toContain("2. Jane Smith - jane@example.com - 555-987-6543");
  });

  test("searches contacts by name", () => {
    runCommand(`add "John Doe" "john@example.com" "555-123-4567"`);
    runCommand(`add "Jane Smith" "jane@example.com" "555-987-6543"`);

    const output = runCommand(`search "john"`);

    expect(output).toContain(`=== Search Results for "john" ===`);
    expect(output).toContain("John Doe - john@example.com - 555-123-4567");
    expect(output).not.toContain("Jane Smith - jane@example.com - 555-987-6543");
  });

  test("searches contacts by email", () => {
    runCommand(`add "John Doe" "john@example.com" "555-123-4567"`);

    const output = runCommand(`search "example.com"`);

    expect(output).toContain("John Doe - john@example.com - 555-123-4567");
  });

  test("shows message when search has no results", () => {
    runCommand(`add "John Doe" "john@example.com" "555-123-4567"`);

    const output = runCommand(`search "bob"`);

    expect(output).toContain(`No contacts found matching "bob"`);
  });

  test("deletes a contact by email", () => {
    runCommand(`add "John Doe" "john@example.com" "555-123-4567"`);
    runCommand(`add "Jane Smith" "jane@example.com" "555-987-6543"`);

    const output = runCommand(`delete "jane@example.com"`);

    expect(output).toContain("Contact deleted: Jane Smith");
    expect(output).toContain("Contacts saved to contacts.json");

    const contacts = JSON.parse(fs.readFileSync(contactsPath, "utf8"));
    expect(contacts).toHaveLength(1);
    expect(contacts[0].email).toBe("john@example.com");
  });

  test("shows error when deleting non-existing contact", () => {
    runCommand(`add "John Doe" "john@example.com" "555-123-4567"`);

    const output = runCommand(`delete "nonexistent@example.com"`);

    expect(output).toContain("No contact found with email: nonexistent@example.com");
  });

  test("shows error when adding duplicate email", () => {
    runCommand(`add "John Doe" "john@example.com" "555-123-4567"`);

    const output = runCommand(`add "Bad User" "john@example.com" "555-9999"`);

    expect(output).toContain("Contact with this email already exists");
  });

  test("shows help message", () => {
    const output = runCommand("help");

    expect(output).toContain("Usage: node contacts.js [command] [arguments]");
    expect(output).toContain(`add "name" "email" "phone"`);
    expect(output).toContain("list");
    expect(output).toContain("search");
    expect(output).toContain("delete");
    expect(output).toContain("help");
  });

  test("shows error for unknown command", () => {
    const output = runCommand("invalidcommand");

    expect(output).toContain("Unknown command 'invalidcommand'");
    expect(output).toContain("Usage: node contacts.js [add|list|search|delete|help] [arguments]");
  });

  test("shows error for missing add arguments", () => {
    const output = runCommand("add");

    expect(output).toContain("Missing arguments for add command");
    expect(output).toContain(`Usage: node contacts.js add "name" "email" "phone"`);
  });
});