const express = require("express")
const {graphqlHTTP} = require('express-graphql')
const {buildSchema} = require('graphql')

const app = express();
app.use(express.json())

app.use('/graphql',graphqlHTTP({
    schema:buildSchema(`
        type RootQuery {
            events : [String!]!
        }
        type RootMutation {
            createEvent(name : String): String
        }

        schema {
            query:RootQuery
            mutation:RootMutation
        }
    `),
    rootValue: {
        events: ()=>{
            return ['HelloWorld','Happy Day','Go To temple Sumanth']
        },
        createEvent:(args)=>{
            const name = args.name;
            return name
        }
    },
    graphiql:true
}));


app.listen(3000);