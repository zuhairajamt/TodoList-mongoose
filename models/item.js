const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add todolist']
    }
});

const listSchema = mongoose.Schema({
    name: String,
    items: [itemSchema]
});

const Item = mongoose.model('Item', itemSchema);
const List = mongoose.model('List', listSchema);

module.exports = { Item, List };
