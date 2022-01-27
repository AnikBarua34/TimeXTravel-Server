const express = require ('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const ObjectId =require('mongodb').ObjectId;
const cors =require('cors');
const app= express();

const port =process.env.PORT || 5000;

// using middle ware 
app.use(cors());
app.use(express.json());

// connecting to mongoDB 
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6xsao.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
console.log(uri)

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run(){

    try{
        await client.connect();
        const database = client.db("Time_Travel");
        // job task 
        const allBlogsCollection =database.collection("All_Blogs");
        const usersCollection =database.collection("Users_Collection");


        // job task post all blogs 1
        app.post('/postAllBlogs', async (req,res)=>{
            const newBlog =req.body;
            const result =await allBlogsCollection.insertOne(newBlog);
           
            res.json(result);
        }) 
        
        // GET ADDED NEW PRODUCTS ,2
            app.get('/getAllBlogs', async (req,res)=>{
            const cursor = allBlogsCollection.find({});
            const getNewBlog = await cursor.toArray();
            res.send(getNewBlog);
        })
         // DELETE PRODUCTS BY ID, 3
         app.delete('/getAllBlogs:id', async(req,res)=>{
            const id=req.params.id;
            const query={_id:ObjectId(id)};
            const result= await allBlogsCollection.deleteOne(query);
            console.log('Deleting with id',id)
            res.send(result);
        })
        // // ADD  NEW REGISTRATION USER,4
        app.post('/addUsers', async (req,res)=>{
            const users = req.body;
            const result = await usersCollection.insertOne(users);
            res.json(result);
        })

         // // ADD GOOGLE SIGN IN USERS TO DB,5 
        app.put('/addUsers', async (req,res)=>{
            const user = req.body;
            const query = {email: user.email};
            const options = {upsert:true};
            const updateDoc = { $set: user};
            const result = await usersCollection.updateOne(query,updateDoc,options);
            res.json(result);
          })
            // //   MAKE AN ADMIN,6
        app.put('/addUsers/admin',async(req,res)=>{
            const user=req.body;
            const filter={email: user.email};
            const updateDoc={$set: {role:'Admin'}};
            const result=await usersCollection.updateOne(filter,updateDoc);
            res.json(result);
        })

         // // ADMIN SET UP,7
        app.get('/addUsers/:email', async(req,res)=>{
            const email=req.params.email;
            const query={email:email};
            const user= await usersCollection.findOne(query)
            let isAdmin=false;
            if(user?.role ==='Admin'){
                isAdmin=true;
            }
            res.json({Admin: isAdmin})
        })
       
        

    }

    finally {
        // await client.close();
      }
      
}
run().catch(console.dir);

app.get('/',async (req,res)=>{
    res.send('Welcome to Time X Travel Agency server')
});

app.listen(port, ()=>{
    console.log('listening to port',port)
});