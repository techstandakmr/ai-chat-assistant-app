import mongoose from 'mongoose';
const mongodbConnect = async () => {
    mongoose.connect(process.env.MONGODB_URL)
        .then(() => { console.log("MongoDB Connected") }) 
        .catch((error) => { console.log(error) }) 
};

export default mongodbConnect;