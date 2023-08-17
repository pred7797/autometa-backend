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
mongoose.connect('mongodb+srv://prerakdarji03:prerakdarji@autometa.ixlm8cm.mongodb.net/SAKEC', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}, (error) => {
    if (!error) {
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
