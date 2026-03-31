/**
 * Contact Controller
 * Handles incoming contact messages from the About Us page
 */
const { Contact } = require('../models');

// @desc    Submit a new contact message
// @route   POST /api/contacts
// @access  Public
exports.submitContact = async (req, res) => {
    try {
        const { fullName, email, subject, phone, message } = req.body;

        if (!fullName || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        const newContact = await Contact.create({
            fullName,
            email,
            subject,
            phone,
            message
        });

        res.status(201).json({
            success: true,
            data: newContact
        });
    } catch (error) {
        console.error('Error in submitContact:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Get all contact messages
// @route   GET /api/contacts
// @access  Private/Admin
exports.getContacts = async (req, res) => {
    try {
        const contacts = await Contact.findAll({
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            success: true,
            data: contacts
        });
    } catch (error) {
        console.error('Error in getContacts:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Update contact status
// @route   PUT /api/contacts/:id/status
// @access  Private/Admin
exports.updateContactStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['unread', 'read', 'resolved'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const contact = await Contact.findByPk(id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact message not found'
            });
        }

        contact.status = status;
        await contact.save();

        res.status(200).json({
            success: true,
            data: contact
        });
    } catch (error) {
        console.error('Error in updateContactStatus:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Delete a contact message
// @route   DELETE /api/contacts/:id
// @access  Private/Admin
exports.deleteContact = async (req, res) => {
    try {
        const { id } = req.params;
        const contact = await Contact.findByPk(id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact message not found'
            });
        }

        await contact.destroy();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        console.error('Error in deleteContact:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};
