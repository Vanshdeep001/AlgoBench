const Note = require('../models/note');

const getNote = async (req, res) => {
    try {
        const { problemId } = req.params;
        const userId = req.result._id;

        const note = await Note.findOne({ userId, problemId });

        if (!note) {
            return res.json({ notes: "" });
        }

        res.json(note);
    } catch (error) {
        console.error('Error fetching note:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const updateNote = async (req, res) => {
    try {
        const { problemId } = req.params;
        const { notes } = req.body;
        const userId = req.result._id;

        const note = await Note.findOneAndUpdate(
            { userId, problemId },
            { notes },
            { new: true, upsert: true }
        );

        res.json(note);
    } catch (error) {
        console.error('Error updating note:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    getNote,
    updateNote
};
