const { resolve, reject } = require('promise');
var db=require('../config/connection')
var collection=require('../config/collections');
var objectId=require('mongodb').ObjectId
const { response } = require('express');

module.exports={
    addProduct:(product,callback)=>{
        console.log(product);

        db.get().collection('product').insertOne(product).then((data)=>{
        
           callback(data.insertedId) 
        })

    },
    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let product=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(product)
        })
    },
    deleteProduct:(prodId)=>{
        return new Promise ((resolve,reject)=>{
        console.log(prodId)
        //console.log((prodId))
        db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:objectId(prodId)}).then((response)=>{
           // console.log(response)
            resolve(response)
           
        })
        })
    },
    getProductDetails:(proId)=>{
        return new Promise ((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(proId)}).then((product)=>{
                resolve(product)
            })
        })
        

    },
    updateProduct:(proId,proDetails)=>{
        return new Promise ((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION)
            .updateOne({_id:objectId(proId)},
            {
                $set:{
                    Name:proDetails.Name,
                    Discription:proDetails.Discription,
                    Price:proDetails.Price,
                    Catagory:proDetails. Catagory,
                }
            }).then((response)=>{
                resolve()
            })
        })
    }
}
