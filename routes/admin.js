var express = require('express');
var router = express.Router();
var ProductsModel = require('../models/ProductsModel');
var CommentsModel = require('../models/CommentsModel');
var csrf = require('csurf');
var csrfProtection = csrf({cookie:true});
var path = require('path');
var uploadDir = path.join(__dirname, '../uploads');
var fs = require('fs');
var loginRequired = require('../libs/loginRequired');

var multer = require('multer');
var storage = multer.diskStorage({
    destination : function(req, file, callback){
        callback(null, uploadDir);
    },
    filename : function(req, file, callback){
        callback(null, 'products-' + Date.now() + '.'+ file.mimetype.split('/')[1]);
    }
});
var upload = multer({storage:storage});

router.get('/products', function(req,res){
    ProductsModel.find(function(err, products){
        res.render('admin/products', {products:products});
    });
});

router.get('/products/write', loginRequired, csrfProtection, function(req,res){
    res.render('admin/form', {product:"", csrfToken:req.csrfToken()});
});
router.post('/products/write', loginRequired, upload.single('thumbnail'), csrfProtection, function(req,res){
    var product = new ProductsModel({
        name : req.body.name,
        price : req.body.price,
        description : req.body.description,
        thumbnail: (req.file) ? req.file.filename : "",
        displayname : req.user.displayname
    });
    var validationError = product.validateSync();
    if(validationError){
        res.send(validationError);
    } else {
        product.save(function(err){
            res.redirect('/admin/products');
        });
    }
})

router.get('/products/detail/:id' , function(req, res){
    ProductsModel.findOne( { 'id' :  req.params.id } , function(err, product){
        CommentsModel.find({product_id:req.params.id}, function(err, comments){
            res.render('admin/productsDetail', { product: product, comments:comments });  
        });
    });
});

router.get('/products/edit/:id', loginRequired, csrfProtection, function(req,res){
    ProductsModel.findOne({id:req.params.id}, function(err, product){
        res.render('admin/form', {product:product, csrfToken:req.csrfToken()});
    });
});
router.post('/products/edit/:id', loginRequired, upload.single('thumbnail'), csrfProtection, function(req,res){
    ProductsModel.findOne({id:req.params.id}, function(err, product){
        if(req.file){
            fs.unlinkSync(uploadDir + '/' + product.thumbnail);
        }
    });
    var query = {
        name : req.body.name,
        price : req.body.price,
        description : req.body.description,
        thumbnail : (req.file) ? req.file.filename : product.thumbnail,
        displayname : req.user.displayname
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

router.post('/products/ajax_comment/insert', function(req,res){
    var comment = new CommentsModel({
        content : req.body.content,
        product_id : parseInt(req.body.product_id)
    });
    comment.save(function(err, comment){
        res.json({
            id : comment.id,
            content : comment.content,
            message : "success"
        });
    });
});
router.post('/products/ajax_comment/delete', function(req,res){
    CommentsModel.remove({id:req.body.comment_id}, function(err){
        res.json({message:"success"});
    });
});


module.exports = router;