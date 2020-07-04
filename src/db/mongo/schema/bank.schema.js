const mongoose = require("mongoose");

 const bankSchema = mongoose.Schema({
     agencia:{
        type: String,
        required: true
     },
     conta:{
        type: String,
        required: true
     },
     name:{
        type: String,
        required: true
     },
     balance:{
        type:Number,
         min: [0, 'Saldo da conta não pode ser negativo']
     }
 });

 module.exports = mongoose.model.accounts || mongoose.model('accounts', bankSchema);