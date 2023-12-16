const express = require("express")
const {graphqlHTTP} = require('express-graphql')
const {buildSchema} = require('graphql')
const events=[]
const app = express();
const Event = require('./models/event')
const mongoose = require("mongoose");
require('dotenv').config();
const UserName = process.env.MONGO_USER;
const Password = process.env.MONGO_PASSWORD;
const Mongo_DB = process.env.MONGO_DATABASE;
app.use(express.json())

app.use('/graphql',graphqlHTTP({
    schema:buildSchema(`
        type Event{
            _id : ID!
            title: String!
            description: String!
            price: Float!
            date: String!
        }
        input EventInput{
            title : String!
            description: String!
            price: Float!
            date: String!
        }
        type RootQuery {
            events : [Event!]!
        }
        type RootMutation {
            createEvent(eventInput:EventInput): Event
        }

        schema {
            query:RootQuery
            mutation:RootMutation
        }
    `),
    rootValue: {
        events: async()=>{
            const Allevents=await Event.find()
            console.log(Allevents)
            return Allevents
        },
        createEvent:async(args)=>{
            const newEvent = new Event({
                title:args.eventInput.title,
                description:args.eventInput.description,
                price:+args.eventInput.price,
                date:new Date()
            });
            await newEvent.save().then(result=>{
                console.log(result);
                return {...result._doc};
            })
            .catch(err=>{
                console.log(err)
                throw err;
            })
        }
    },
    graphiql:true
}));

mongoose.connect(`mongodb+srv://${UserName}:${Password}@eventbooking.powdood.mongodb.net/${Mongo_DB}?retryWrites=true&w=majority`)
.then(()=>{
    app.listen(3000);
    console.log("Connection was Succesfull")
})
.catch((err)=>{
    console.log(err)
})