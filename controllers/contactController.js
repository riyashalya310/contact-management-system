const { Contact } = require('../models');
const moment = require('moment-timezone');

// Add a contact
exports.addContact = async (req, res) => {
  const { name, email, phone, address, timezone } = req.body;

  try {
    const contact = await Contact.create({ name, email, phone, address, timezone, deleted: false });
    res.status(201).json(contact);
  } catch (err) {
    res.status(500).json({ message: 'Error adding contact' });
  }
};

// Get contacts
exports.getContacts = async (req, res) => {
  const { name, email, timezone, startDate, endDate } = req.query;

  try {
    let where = { deleted: false };

    if (name) where.name = name;
    if (email) where.email = email;
    if (timezone) where.timezone = timezone;
    if (startDate && endDate) where.createdAt = { $between: [startDate, endDate] };

    const contacts = await Contact.findAll({ where });
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving contacts' });
  }
};
