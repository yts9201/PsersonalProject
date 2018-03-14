var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');

var ProductsSchema = new Schema({
    name : String,
    price : Number,
    description : String,
    created_at : {
        type : Date,
        default : Date.now()
    }
});

ProductsSchema.virtual('getDate').get(function(){
    var date = new Date(this.created_at);
    return {
        year : date.getFullYear(),
        month : date.getMonth(),
        day : date.getDate()
    }
});

ProductsSchema.plugin(autoIncrement.plugin, {model:'products', filed:'id', startAt:1});
module.exports = mongoose.model('products', ProductsSchema);