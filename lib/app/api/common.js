const res = require('express/lib/response');
const { mongoose } = require('mongoose');
function notFound(req, res, value){
    res.status(404);
    if(value == undefined){
      res.status(404);
    res.json({ message: "The resource was not found" });
    }
    else{
      res.status(404);
      res.json({message: `The resource '${value}' was not found`});
    }
}

function changeId(){
    mongoose.set('toJSON', {
        virtuals: true,
        transform: (doc, converted) => {
          delete converted._id;
        }
      });
}

function teacherValidationFailed(req, res, value){
  res.status(404);
  if(value == undefined){
    res.json({message: "Course validation failed: teacher: User not found"});
  }
  else{
    res.json({message: `Course validation failed: teacher: User ${value} not found`});
  }
}



function usedOtherPlaces(req, res){
res.status(400);
res.json({message: 'Other resources depent on this resource'});
}

function deleteId(obj){
obj['id'] = obj['_id'];
delete obj['_id'];
return obj;

}


module.exports = { 
  notFound, 
  changeId,
  teacherValidationFailed,
  usedOtherPlaces,
  deleteId,

};