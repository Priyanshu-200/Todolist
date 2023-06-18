const express= require("express");
const bodyParser = require("body-parser");
const date = require(__dirname+"/date.js");
const mongoose = require('mongoose');
const _ = require('lodash');
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect('mongodb://127.0.0.1:27017/todolistDB');


const itemsSchema = {
     name: String
  };

  const Item = mongoose.model("Item",itemsSchema);

  const item1 = new Item({
    name: "Welcome to your to-do-List"
  });
  const item2 = new Item({
    name: "Hit the + button to add new item"
  });
  const item3 = new Item({
    name: "<---- Hit this delete an item"
  });

  const defaultItems = [item1, item2, item3];

  const listSchema = {
    name: String,
    items: [itemsSchema]
  }

  const List = mongoose.model("List",listSchema);

app.get("/",function(req,res){
   async function fun1()
   {
    await Item.find({}).then((foundItems)=>{
        if(foundItems.length==0)
        {
            Item.insertMany(defaultItems).then(function(){
                console.log("Data inserted")  // Success
            }).catch(function(error){
                console.log(error)      // Failure
            });
            res.redirect("/");
        }
        else
        {
            res.render("list",{
                listTitle: "Today" , newListItems: foundItems
            });
        }
    });
   }
   fun1();
});
app.get("/:customListName",function(req,res){
    const customListName=_.capitalize(req.params.customListName);
    async function fun2()
    {
     await List.findOne({ name: customListName }).then((foundList)=>{
        if(!foundList)
        {
            const list = new List({
                name: customListName,
                items: defaultItems
            });
            list.save();
            res.redirect("/"+customListName);
        }
        else
        {
            res.render("list",{listTitle: foundList.name, newListItems: foundList.items});
        }
     });
    }
    fun2();
    
});
app.post("/",function(req,res){
    const itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item({
        name: itemName
    })
    if(listName=="Today")
    {
    item.save();
    res.redirect("/");
    }
    else
    {
        async function fun3()
        {
            await List.findOne({name: listName}).then((foundList)=>{
                foundList.items.push(item);
                foundList.save();
                res.redirect("/"+listName);
            });
        }
        fun3();
    }
});
app.post("/delete",function(req,res){
    const checkedItemId = (req.body.checkbox);
    const listName = req.body.listName;
    if(listName=="Today")
    {
        async function fun1()
        {
        await Item.findByIdAndDelete(checkedItemId);
        }
        fun1();
        res.redirect("/");
    }
    else
    {
        async function fun4()
        {
        await List.findOneAndUpdate({name: listName},{$pull:{items:{_id: checkedItemId}}});
        }
        fun4();
        res.redirect("/"+listName);
    }
});

app.get("/about",function(req,res){
    res.render("about");
});
app.post("/work",function(req,res){
    let item = req.body.newItem;
    workItems.push(item);
    res.redirect("/work");
});
app.listen(3000,function(req,res){
    console.log("Listening on port 3000");
});