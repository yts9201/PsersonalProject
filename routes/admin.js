var express = require('express');
var router = express.Router();
var ProductsModel = require('../models/ProductsModel');

router.get('/products', function(req,res){
    ProductsModel.find(function(err, products){
        res.render('admin/products', {products:products});
    });
});

router.get('/products/write', function(req,res){
    res.render('admin/form', {product:""});
});
router.post('/products/write', function(req,res){
    var product = new ProductsModel({
        name : req.body.name,
        price : req.body.price,
        description : req.body.description
    });
    product.save(function(err){
        res.redirect('/admin/products');
    });
})

router.get('/products/detail/:id' , function(req, res){
    ProductsModel.findOne( { 'id' :  req.params.id } , function(err, product){
        res.render('admin/productsDetail', { product: product });  
    });
});

router.get('/products/edit/:id', function(req,res){
    ProductsModel.findOne({id:req.params.id}, function(err, product){
        res.render('admin/form', {product:product});
    });
});
router.post('/products/edit/:id', function(req,res){
    var query = {
        name : req.body.name,
        price : req.body.price,
        description : req.body.description
    };
    ProductsModel.update({id:req.params.id}, {$set:query}, function(err){
        res.redirect('/admin/products/detail/'+req.params.id);
    });
});

router.get('/products/delete/:id', function(req,res){
    ProductsModel.remove({id:req.params.id}, function(err){
        res.redirect('/admin/products');
    });
});


module.exports = router;