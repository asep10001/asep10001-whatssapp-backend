import mongoose from 'mongoose'

//schema
const whatssappSchema = mongoose.Schema({
    message: String,
    name: String,
    timestamp: String,
    received: String
})

export default mongoose.model('messagecontent', whatssappSchema)