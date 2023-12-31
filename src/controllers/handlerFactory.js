const API_FEATURE = require("../utils/apiFeatures");
const appError = require("../utils/appErrors");
const catchAsync = require("../utils/catchAsync");
const redis=require("redis")
const client = redis.createClient({
  legacyMode: true,
  PORT: 5001
})
client.connect().catch(console.error)

client.on('connect', () => {
  console.log('Connected to Redis');
});

client.on('error', (err) => {
  console.error('Redis Error:', err);
});

client.on('end', () => {
  console.log('Connection to Redis closed');
});


exports.deleteOne=Model=>catchAsync(async (req, res, next) => {
  // delete doc  from DB
  const doc = await Model.findByIdAndDelete(req.params.id);
  // check if the user is deleteing avaliabnle doc in DB
  if (!doc) {
    return next(new appError("document  not found ", 404));
  }
  // send  sucess  response  with  null
  res.status(200).json({ status: "sucess", data: null });
});
exports.updateOne=Model=> catchAsync(async(req,res,next)=>{
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    });
  if (!doc) {
    return next(new appError("document  not found ", 404));
  }
    // send sucess message with  newly  updated tour
  res.status(200).json({ status: "sucess", data: { doc } });
})
 exports.createOne=Model=>catchAsync(async(req,res,next)=>{
  const doc=await Model.create(req.body);
  res.status(201).json({status:"sucess",data:{doc}})

 })
 exports.getOne=(Model, popOption)=> catchAsync(async (req, res, next) => {
 let query=Model.findById(req.params.id);
 if(popOption) query=query.populate(popOption)
 const doc=await  query
  if (!doc) {
    return next(new appError("document  not found ", 404));
  }
  res.status(200).json({ status: "sucess", data: { doc } });
});
exports.getAll=Model=>catchAsync(async (req, res, next) => {
 
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };
  const features = new API_FEATURE(Model.find(filter), req.query)
    .filter()
    .sort()
    .fieldLimiting()
    .pagination();
// check if it is avaliable  cache.
const cachKey="all-data"
client.get(cachKey,async (err,data)=>{
  if(err) throw err
  if(data!==null){
    console.log("data from cach")
    res.send(JSON.parse(data))
  }
  else{
    console.log("from Mongodb")

  const doc = await features.query;

  if (!doc || doc.length === 0) {
    return res.status(404).json({ error: "document not found" });
  }
  res
    .status(200)
    .json({ status: "sucess", result: doc.length, data: { doc } });
    // cach the data to redis.
  client.setEx(cachKey,3600,JSON.stringify(doc))
  }
  

})



});
