const express = require('express')
const bodyParser = require('body-parser');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

require('dotenv').config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fodu2.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Light House !')
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
app.use(bodyParser.urlencoded({ extended: true }));

client.connect(err => {
    const database = client.db('LightHouse');
    const productCollection = database.collection("products");
    const adminCollection = database.collection("admin");
    const reviewCollection = database.collection("review");
    const orderCollection = database.collection("orders");


    // Add product page api
    app.post('/addProduct', (req, res) => {
        const product = req.body;
        productCollection.insertOne(product)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })

    //All products api
    app.get('/products', (req, res) => {
        productCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    //single data api
    app.get('/pd/:id', async (req, res) => {
        const singleProduct = await productCollection.findOne({ _id: ObjectId(req.params.id) })
        res.json(singleProduct);
        console.log(singleProduct)
    })


    // make admin api
    app.post('/addAdmin', (req, res) => {
        const newAdmin = req.body;
        console.log('adding new admin:', newAdmin)
        adminCollection.insertOne(newAdmin)
            .then(result => {
                console.log('insertedCount', result.insertedCount)
                res.send(result.insertedCount > 0)
            })
    })

    //review add, admin page
    app.post('/addReview', (req, res) => {
        const newReview = req.body;
        console.log('adding new review:', newReview)
        reviewCollection.insertOne(newReview)
            .then(result => {
                console.log('insertedCount', result.insertedCount)
                res.send(result.insertedCount > 0)
            })
    })

    // review receive get api
    app.get('/allReview', (req, res) => {
        reviewCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })



    // Add order  api
    app.post('/addOrder', (req, res) => {
        const order = req.body;
        console.log('adding new event', order)
        orderCollection.insertOne(order)
            .then(result => {
                console.log('inserted count', result.insertedCount)
                res.send(result.insertedCount > 0)

            })
    })


    // receive order get api
    app.get('/allOrder', (req, res) => {
        orderCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    // Email by user order get api

    app.get('/orders', (req, res) => {
        let query = {};
        const displayName = req.query.displayName;
        if (displayName) {
            query = { displayName: displayName };
        }
        orderCollection.find(query)
            .toArray((err, documents) => {
                res.send(documents)
            });

    })

    // admin and user email check
    app.post('/isAdmin', (req, res) => {
        const email = req.body.email;
        adminCollection.find({ email: email })
            .toArray((err, admin) => {
                res.send(admin.length > 0);
            })
    })

    // delete product api
    app.delete('/deleteItem/:id', (req, res) => {
        const id = ObjectId(req.params.id);
        console.log('delete this ', id);
        productCollection.findOneAndDelete({ _id: id })
            .then(documents => res.send(!!documents.value))
    })

    // delete order api
    app.delete('/cancelItem/:id', (req, res) => {
        const id = ObjectId(req.params.id);
        console.log('delete this ', id);
        orderCollection.findOneAndDelete({ _id: id })
            .then(documents => res.send(!!documents.value))
    })

    console.log('database connected');

});


app.listen(port, () => {
    console.log('running server on port', port);
})