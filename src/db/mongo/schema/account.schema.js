import mongoose from "mongoose";

 const AccountSchema = mongoose.Schema({
     agencia:{
        type: Number,
        required: true
     },
     conta:{
        type: Number,
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

 export default mongoose.model.accounts || mongoose.model('accounts', AccountSchema);