const express = require("express")
const {graphqlHTTP} = require('express-graphql')
const {buildSchema} = require('graphql')
const events=[]
const app = express();
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
        events: ()=>{
            return events
        },
        createEvent:(args)=>{
            events.splice(0,events.length)
            const newEvent={
                _id:Math.random().toString(),
                title:args.eventInput.title,
                description:args.eventInput.description,
                price:+args.eventInput.price,
                date:args.eventInput.date
            }
            events.push(newEvent)
            return newEvent
        }
    },
    graphiql:true
}));


app.listen(3000);