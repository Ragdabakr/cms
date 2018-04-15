const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const crypto = require('crypto');

const userSchema = new Schema({

     firstName:{ type: String,required: true },
     lastName:{ type: String,required: true },
     email:{ type: String,required: true },
     password:{ type: String,required: true },
     photo: String,





    
});


userSchema.methods.gravatar = function(size) {
  if (!size) size = 200;
  if (!this.email) return 'https://gravatar.com/avatar/?s=' + size + '&d=retro';
  var md5 = crypto.createHash('md5').update(this.email).digest('hex');
  return 'https://gravatar.com/avatar/' + md5 + '?s=' + size + '&d=retro';
};

module.exports = mongoose.model('User', userSchema);
