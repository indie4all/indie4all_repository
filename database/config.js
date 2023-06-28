const mongoose = require('mongoose');



const dbConnection = async() => {

    try {

        await mongoose.connect( process.env.MONGODB_CNN, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        });

        console.log('DB connection succeed');

    } catch (error) {
        console.log(error);
        throw new Error('Cannot connect to the data base');
    }
}

module.exports = {
    dbConnection
}
