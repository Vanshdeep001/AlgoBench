const mongoose = require('mongoose');
const { Schema } = mongoose;

const noteSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    problemId: {
        type: Schema.Types.ObjectId,
        ref: 'problem',
        required: true
    },
    notes: {
        type: String,
        default: ""
    }
}, {
    timestamps: true
});

// Ensure a user can only have one note per problem
noteSchema.index({ userId: 1, problemId: 1 }, { unique: true });

const Note = mongoose.model('note', noteSchema);

module.exports = Note;
