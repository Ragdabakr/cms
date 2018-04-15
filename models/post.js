const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseAlgolia = require("mongoose-algolia");


const postSchema = new Schema({

    title:{ type: String,required: true },

    status:{type: String,default: 'public'},

    allowComments:{type: Boolean, require: true },

    body:{type: String,require: true },

    file:{type :String},
    
    date :{type:Date , default:Date.now()},

    category :{ type: Schema.Types.ObjectId ,ref:"Category"},

    comments: [{

        type: Schema.Types.ObjectId,
        ref: 'Comment'


    }],

      user: {

        type: Schema.Types.ObjectId,
        ref: 'User'


    }

 
    
},{usePushEach: true});





//Algolia search
postSchema.plugin(mongooseAlgolia,{
  appId: "V7OVKGFP9W",
  apiKey: "601f201036900a7b2a70b0dba0a63566",
  indexName: 'postSchema', //The name of the index in Algolia, you can also pass in a function
  selector: 'title category ', //You can decide which field that are getting synced to Algolia (same as selector in mongoose)
  populate: {
    path: 'user',
    select: 'firstName'
  },
  defaults: {
    author: 'unknown'
  },
  mappings: {
    title: function(value) {
      return `Title: ${value}`
    }
  },
  virtuals: {
    whatever: function(doc) {
      return `Custom data ${doc.title}`
    }
  },
  debug: true // Default: false -> If true operations are logged out in your console
});


let Model = mongoose.model('Post', postSchema);

Model.SyncToAlgolia(); //Clears the Algolia index for this schema and synchronizes all documents to Algolia (based on the settings defined in your plugin settings)
Model.SetAlgoliaSettings({
  searchableAttributes: ['title','category'] //Sets the settings for this schema, see [Algolia's Index settings parameters](https://www.algolia.com/doc/api-client/javascript/settings#set-settings) for more info.
});


module.exports = Model;
