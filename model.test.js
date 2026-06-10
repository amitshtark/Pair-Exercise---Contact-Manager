const fs = require("fs");
const {
  loadContacts,
  saveContacts,
  validateContact,
  addContact,
  deleteContact,
  searchContacts,
} = require("./model");

jest.mock("fs");

describe("model.js", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("loadContacts", () => {
    it("should load contacts from JSON file", () => {
      const mockContacts = [
        { name: "John Doe", email: "john@example.com", phone: "555-1234" },
        { name: "Jane Smith", email: "jane@example.com", phone: "555-5678" },
      ];
      fs.readFileSync.mockReturnValue(JSON.stringify(mockContacts));

      const result = loadContacts();

      expect(result).toEqual(mockContacts);
      expect(fs.readFileSync).toHaveBeenCalledWith(
        expect.stringContaining("contacts.json"),
        "utf8",
      );
    });

    it("should throw error when file does not exist", () => {
      const error = new Error("ENOENT: no such file or directory");
      fs.readFileSync.mockImplementation(() => {
        throw error;
      });

      expect(() => loadContacts()).toThrow(error);
    });

    it("should throw error on invalid JSON", () => {
      fs.readFileSync.mockReturnValue("{ invalid json }");

      expect(() => loadContacts()).toThrow(SyntaxError);
    });
  });

  describe("saveContacts", () => {
    it("should save contacts to JSON file with formatting", () => {
      const mockContacts = [
        { name: "John Doe", email: "john@example.com", phone: "555-1234" },
      ];

      saveContacts(mockContacts);

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("contacts.json"),
        JSON.stringify(mockContacts, null, 2),
        "utf8",
      );
    });

    it("should throw error on write failure", () => {
      const error = new Error("EACCES: permission denied");
      fs.writeFileSync.mockImplementation(() => {
        throw error;
      });

      expect(() => saveContacts([])).toThrow(error);
    });
  });

  describe("validateContact", () => {
    it("should not throw for valid contact", () => {
      expect(() => {
        validateContact("John Doe", "john@example.com", "555-1234");
      }).not.toThrow();
    });

    it("should throw error for missing name", () => {
      expect(() => {
        validateContact("", "john@example.com", "555-1234");
      }).toThrow("Missing name");
    });

    it("should throw error for missing email", () => {
      expect(() => {
        validateContact("John Doe", "", "555-1234");
      }).toThrow("Missing email");
    });

    it("should throw error for missing phone", () => {
      expect(() => {
        validateContact("John Doe", "john@example.com", "");
      }).toThrow("Missing phone");
    });

    it("should throw error for email without @ symbol", () => {
      expect(() => {
        validateContact("John Doe", "john.example.com", "555-1234");
      }).toThrow("Email must contain @ symbol");
    });

    it("should accept email with @ symbol in middle", () => {
      expect(() => {
        validateContact("John Doe", "john@example.com", "555-1234");
      }).not.toThrow();
    });

    it("should accept email with multiple @ symbols", () => {
      expect(() => {
        validateContact("John Doe", "john@@example.com", "555-1234");
      }).not.toThrow();
    });
  });

  describe("addContact", () => {
    it("should add new contact to empty array", () => {
      const contacts = [];

      const result = addContact(
        contacts,
        "John Doe",
        "john@example.com",
        "555-1234",
      );

      expect(result).toEqual({
        name: "John Doe",
        email: "john@example.com",
        phone: "555-1234",
      });
      expect(contacts).toHaveLength(1);
      expect(contacts[0]).toEqual(result);
    });

    it("should add new contact to existing contacts", () => {
      const contacts = [
        { name: "Jane Smith", email: "jane@example.com", phone: "555-5678" },
      ];

      const result = addContact(
        contacts,
        "John Doe",
        "john@example.com",
        "555-1234",
      );

      expect(contacts).toHaveLength(2);
      expect(contacts[1]).toEqual(result);
    });

    it("should throw error when email already exists", () => {
      const contacts = [
        { name: "John Doe", email: "john@example.com", phone: "555-1234" },
      ];

      expect(() => {
        addContact(contacts, "John Smith", "john@example.com", "555-9999");
      }).toThrow("Contact with this email already exists");
      expect(contacts).toHaveLength(1);
    });

    it("should be case-sensitive when checking duplicate emails", () => {
      const contacts = [
        { name: "John Doe", email: "john@example.com", phone: "555-1234" },
      ];

      const result = addContact(
        contacts,
        "John Smith",
        "JOHN@EXAMPLE.COM",
        "555-9999",
      );

      expect(contacts).toHaveLength(2);
      expect(result.email).toBe("JOHN@EXAMPLE.COM");
    });
  });

  describe("deleteContact", () => {
    it("should delete contact by email", () => {
      const contacts = [
        { name: "John Doe", email: "john@example.com", phone: "555-1234" },
        { name: "Jane Smith", email: "jane@example.com", phone: "555-5678" },
      ];

      const result = deleteContact(contacts, "john@example.com");

      expect(result).toEqual({
        name: "John Doe",
        email: "john@example.com",
        phone: "555-1234",
      });
      expect(contacts).toHaveLength(1);
      expect(contacts[0].email).toBe("jane@example.com");
    });

    it("should throw error when email not found", () => {
      const contacts = [
        { name: "John Doe", email: "john@example.com", phone: "555-1234" },
      ];

      expect(() => {
        deleteContact(contacts, "nonexistent@example.com");
      }).toThrow("No contact found with email: nonexistent@example.com");
      expect(contacts).toHaveLength(1);
    });

    it("should be case-sensitive when matching email", () => {
      const contacts = [
        { name: "John Doe", email: "john@example.com", phone: "555-1234" },
      ];

      expect(() => {
        deleteContact(contacts, "JOHN@EXAMPLE.COM");
      }).toThrow("No contact found with email: JOHN@EXAMPLE.COM");
    });

    it("should delete only the matching contact", () => {
      const contacts = [
        { name: "John Doe", email: "john@example.com", phone: "555-1234" },
        {
          name: "John Smith",
          email: "john.smith@example.com",
          phone: "555-9999",
        },
      ];

      deleteContact(contacts, "john@example.com");

      expect(contacts).toHaveLength(1);
      expect(contacts[0].name).toBe("John Smith");
    });
  });

  describe("searchContacts", () => {
    const contacts = [
      { name: "John Doe", email: "john@example.com", phone: "555-1234" },
      { name: "Jane Smith", email: "jane@example.com", phone: "555-5678" },
      { name: "Bob Johnson", email: "bob@example.com", phone: "555-9999" },
    ];

    it("should find contacts by name", () => {
      const result = searchContacts(contacts, "john");

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("John Doe");
      expect(result[1].name).toBe("Bob Johnson");
    });

    it("should find contacts by email", () => {
      const result = searchContacts(contacts, "jane@example.com");

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Jane Smith");
    });

    it("should be case-insensitive", () => {
      const result = searchContacts(contacts, "JOHN");

      expect(result).toHaveLength(2);
    });

    it("should find partial matches in name", () => {
      const result = searchContacts(contacts, "do");

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("John Doe");
    });

    it("should find partial matches in email", () => {
      const result = searchContacts(contacts, "bob@");

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Bob Johnson");
    });

    it("should return empty array when no matches found", () => {
      const result = searchContacts(contacts, "nonexistent");

      expect(result).toHaveLength(0);
    });

    it("should return empty array for empty search", () => {
      const result = searchContacts(contacts, "");

      expect(result).toHaveLength(3);
    });

    it("should not modify original contacts array", () => {
      const originalLength = contacts.length;

      searchContacts(contacts, "john");

      expect(contacts).toHaveLength(originalLength);
    });
  });
});
