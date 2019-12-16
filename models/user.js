const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
 
// схема пользователя
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        minlength: 6,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    }
});
 
// создание хеша пароля
userSchema.pre( 'save', async function( next ) {
    var user = this;    
 
    if ( user.isModified( 'password' ) ) {        
        user.password = await bcrypt.hash( user.password, 8 );
    }
 
    next();
} );
 
const User = mongoose.model( 'User', userSchema );
 
module.exports = User;