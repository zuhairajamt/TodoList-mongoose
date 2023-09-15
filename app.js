//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//const url = 'mongodb://localhost:27017/todolistDB';
const url = `mongodb+srv://zuhairajamt:${process.env.PASS}@todoapi.ythjapb.mongodb.net/todolistDB`;
mongoose.connect(url);

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add todolist']
  }
});

const Item = mongoose.model('Item', itemSchema);

const item1 = new Item({
  name: 'Item 1'
});

const item2 = new Item({
  name: 'Item 2'
});

const item3 = new Item({
  name: 'Item 3'
});

const defaultItems = [item1, item2, item3];

const listSchema = mongoose.Schema({
  name: String,
  items: [itemSchema]
});

const List = new mongoose.model('List', listSchema);

app.get("/", async function (req, res) {

  const day = date.getDate();
  const itemFound = await Item.find(); // need async await to works
  if (itemFound.length === 0) {
    Item.insertMany(defaultItems).then(function () {
      console.log("Successfully added to DB");
    }).catch(function (err) {
      console.log(err);
    });
    res.redirect('/');
  } else {
    res.render("list", { listTitle: day, newListItems: itemFound });
  }
});

app.get("/:customListItems", function (req, res) {
  const customListItems = _.capitalize(req.params.customListItems);

  List.findOne({ name: customListItems })
    .then(function (foundList) {

      if (!foundList) {
        const list = new List({
          name: customListItems,
          items: defaultItems
        });

        list.save();
        res.redirect("/" + customListItems);
      }
      else {
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
      }
    })
    .catch(function (err) { console.log(err) });
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listTitle = req.body.list;

  const day = date.getDate();

  const item = new Item({
    name: itemName
  });

  console.log(itemName)

  if (listTitle == day) {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listTitle })
      .then(function (foundList) {
        foundList.items.push(item);
        foundList.save();
        res.redirect('/' + listTitle);
      })
      .catch(function (err) { console.log(err) });
  }
});

app.post("/delete", function (req, res) {

  const listName = req.body.listName;
  const checkItemId = req.body.checkbox;
  const day = date.getDate();

  // Delete the item from the default collection
  if (listName == day) {
    deleteCheckedItem();
  } else {
    // Find the custom list and pull the item from the array
    deleteCustomItem();
  }

  async function deleteCheckedItem() {
    await Item.deleteOne({ _id: checkItemId });
    res.redirect("/");
  }

  async function deleteCustomItem() {
    await List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkItemId } } }
    );
    res.redirect("/" + listName);
  }
});

app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
