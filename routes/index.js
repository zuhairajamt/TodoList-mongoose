const express = require("express");
const _ = require("lodash");
const router = express.Router();
const date = require("../date");
const { Item, List } = require("../models/item");

const defaultItems = [
  { name: 'Item 1' },
  { name: 'Item 2' },
  { name: 'Item 3' }
];

router.get("/", async (req, res) => {
  const day = date.getDate();
  const itemFound = await Item.find();

  if (itemFound.length === 0) {
    await Item.insertMany(defaultItems);
    console.log("Successfully added to DB");
    return res.redirect('/');
  }

  res.render("list", { listTitle: day, newListItems: itemFound });
});

router.get("/:customListItems", async (req, res) => {
  const customListItems = _.capitalize(req.params.customListItems);

  try {
    let foundList = await List.findOne({ name: customListItems });

    if (!foundList) {
      foundList = new List({
        name: customListItems,
        items: defaultItems
      });
      await foundList.save();
      res.redirect("/" + customListItems);
    } else {
      res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
    }
  } catch (err) {
    console.log(err);
  }
});

router.post("/", async (req, res) => {
  const itemName = req.body.newItem;
  const listTitle = req.body.list;
  const day = date.getDate();

  const item = new Item({ name: itemName });

  if (listTitle == day) {
    await item.save();
    res.redirect("/");
  } else {
    try {
      let foundList = await List.findOne({ name: listTitle });
      foundList.items.push(item);
      await foundList.save();
      res.redirect('/' + listTitle);
    } catch (err) {
      console.log(err);
    }
  }
});

router.post("/delete", async (req, res) => {
  const listName = req.body.listName;
  const checkItemId = req.body.checkbox;
  const day = date.getDate();

  try {
    if (listName == day) {
      await Item.deleteOne({ _id: checkItemId });
      res.redirect("/");
    } else {
      await List.findOneAndUpdate(
        { name: listName },
        { $pull: { items: { _id: checkItemId } } }
      );
      res.redirect("/" + listName);
    }
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
