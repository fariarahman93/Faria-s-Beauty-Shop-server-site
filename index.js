const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
console.log(process.env.DB_USER);
console.log(process.env.DB_PASS);



const { MongoClient, ServerApiVersion } = require('mongodb');
const { ObjectId } = require('mongodb');

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2lpsgvz.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);

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
    // await client.connect();
    const productCollection = client.db("productDB").collection("product");
    const brandCollection = client.db("productDB").collection("brands");
    const advertiseCollection = client.db("productDB").collection("advertise");
    const cartCollection = client.db("productDB").collection("cartCollection");

    app.post('/product', async (req, res) => {
      const newProduct = req.body;
      console.log(newProduct);
      const result = await productCollection.insertOne(newProduct);
      res.send(result);
    })
    app.put('/product/:id', async(req,res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const options = {upsert:true};
      const updatedProduct = req.body;
      const product = {
        $set: {
          photo:updatedProduct.photo,
           name:updatedProduct.name,
            brandName:updatedProduct.brandName, 
            type:updatedProduct.type,
             price:updatedProduct.price,
              Description:updatedProduct.Description,
              rating:updatedProduct.rating,
        }
      }
      const result = await productCollection.updateOne(filter, product,options);
      res.send(result);
    })
    app.delete('/users/:uid/products/:productId', async (req, res)=>{
      const uId = req.params.uid;
      const productId = req.params.productId;
      const query = {uId,productId}
      const result = await cartCollection.deleteOne(query);

      const cartProducts = await cartCollection.find({ uId: uId }).toArray();
      const productIds = cartProducts.map((cartProduct) => new ObjectId(cartProduct.productId));
      const products = await productCollection
          .find({ _id: { $in: productIds } })
          .toArray();

      res.json({deleted: result, data:products});

    })
    app.get('/products', async (req, res) => {
      const cursor = productCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })
    app.get('/brands', async (req, res) => {
      const cursor = brandCollection.find();
      const result = await cursor.toArray();
      res.send(result);

    })
    app.get('/advertise', async (req, res) => {
      const cursor = advertiseCollection.find();
      const result = await cursor.toArray();
      res.send(result);

    })
    app.get('/brands/:brandId', async (req, res) => {
      const brandId = req.params.brandId;
      console.log(brandId);
      const query = { _id: new ObjectId(brandId) }
      console.log(query);
      const result = await brandCollection.findOne(query);
      res.send(result)

    })

    app.get('/products/:productId', async (req, res) => {
      const productId = req.params.productId;
      console.log(productId);
      const query = { _id: new ObjectId(productId) }
      console.log(query);
      const result = await productCollection.findOne(query);
      res.send(result)

    })
    app.get('/brands/:brandId/products', async (req, res) => {
      const brandId = req.params.brandId;
      console.log(brandId);
      const query = { brandName: (brandId) }
      console.log(query);
      const result = await productCollection.find(query).toArray();
      res.send(result)

    })

    app.post('/cart',async(req,res)=>{
      const cart = req.body;
      const {uId,productId}=cart;
      console.log(cart);
      const cartProducts = await cartCollection.findOne({ uId,productId });
      if(cartProducts) return response.json({success:false})
      const result = await cartCollection.insertOne(cart);
      res.send(result);
    })

    app.get('/cart/:uId', async (req, res) => {
      const uId = req.params.uId;
      const cartProducts = await cartCollection.find({ uId: uId }).toArray();
      const productIds = cartProducts.map((cartProduct) => new ObjectId(cartProduct.productId));
      const products = await productCollection
          .find({ _id: { $in: productIds } })
          .toArray();

      res.json(products);
  });


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();

  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('server is running')
})
app.listen(port, () => {
  console.log(`server is running on port ${port}`)
})
// BvwZmGEOT4fWmfIY
// cosmetics