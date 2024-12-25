Lets build an internal order processing App for a fertilizer company called "BioWe". 
In this app the receptionist will take the order from the customer through a phone call and will feed it into the system and the order will appear in the form of a ticket to the prouction team for them to pack and get the order ready to ship.
The receptionist will select the products just like an e-commerce shopping experience and will send it to the production department. The production team will then receive the order and will start packing the products and will update the status of the ticket from pending to ready. 
It also has a CRM system with analytics.
It also has a robust inventory management system with raw materials and supplier tracking where low stock levels are tracked.
Its has a sales analytics system as well.
Lets build it using MERN stack.

Here is the connection string to connect to MongoDB running on the cloud ::


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://harsha:<db_password>@cluster0.0wtqn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);

And here is the password :: mesMD10ox5E3ZrTp

Let run backend on Port 5202 and frontend on Port 7484. If you see any programs already running on those ports then terminate them and run our App.

Build in javascript only.