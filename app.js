const express = require("express")
const {graphqlHTTP} = require('express-graphql')
const {buildSchema} = require('graphql')
const events=[]
const app = express();
const Event = require('./models/event')
const User = require('./models/user')
const mongoose = require("mongoose");
const bcrypt = require('bcrypt')
require('dotenv').config();
const UserName = process.env.MONGO_USER;
const Password = process.env.MONGO_PASSWORD;
const Mongo_DB = process.env.MONGO_DATABASE;
const UserId="657ed400a9e3593a7dc02ca5";
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
        type User{
            _id:ID!
            email:String!
            password:String
        }
        input EventInput{
            title : String!
            description: String!
            price: Float!
            date: String!
        }
        input UserInput{
            email:String!
            password:String!
        }
        type RootQuery {
            events : [Event!]!
        }
        type RootMutation {
            createEvent(eventInput:EventInput): Event
            createUser(userInput:UserInput):User
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
            let newEventResult;
            const newEvent = new Event({
                title:args.eventInput.title,
                description:args.eventInput.description,
                price:+args.eventInput.price,
                date:new Date(),
                creator:UserId
            });

            return await newEvent.save().then( async result =>{
                newEventResult=result;
                const user=await User.findById(UserId)
                return user;
            })
            .then((user)=>{
                if(!user)
                {
                    throw new Error("User Already Exists")
                }
                user.createdEvent.push(newEvent);
                return user.save()
            })
            .then((result)=>{
                // console.log(result)
               return newEventResult
            })
            .catch(err=>{
                console.log(err)
                throw err;
            })
        },
        createUser:async(args)=>{
            const {email} = args.userInput
            const hashPassword = await bcrypt.hash(args.userInput.password,12);
            console.log(hashPassword)

            // checking whether user already exists in Database
            return User.findOne({email})
            .then(async(user)=>{
                //If user not present in database
                if(!user)
                {
                    //Create newUser and add to Database
                    const newUser = new User({
                        email,
                        password:hashPassword,
                    })
                    return newUser.save()
                    .then(userDetails=>{
                        return {...userDetails._doc,password:null,_id:userDetails.id}
                    })
                }
                else
                {
                    throw new Error("User Already Exists")
                }
            })
            .catch(err=>{
                throw new Error(err)
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