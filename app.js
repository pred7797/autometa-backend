require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const models = require("./models/model")
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
const studentData = [];
const PORT = process.env.PORT || 3000;

mongoose.set('strictQuery', true);
// MongoDB connection
mongoose.connect(process.env.MONGO_DB_CONNECT, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}, (error) => {
    if (!error) {
        console.log(process.env.MONGO_DB_CONNECT);
        console.log("connected");

        app.post("/api/addStudent", async (req, res) => {
            console.log("result", req.body);

            let data = models(req.body);
            try {
                let dataToStore = await data.save();
                res.status(200).json(dataToStore)
            } catch (error) {
                res.status(400).json({
                    'status': error.message
                })
            }
        })

    }
    else {
        console.log(error.message);
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
