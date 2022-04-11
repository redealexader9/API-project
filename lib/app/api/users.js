const { User } = require('../../models/users');
const common = require('./common');

async function lookupUser(req, res, next, value){
    try{
        if(value.length == 24){
        res.locals.user = await User.findById(value);
        }
        else if(value.length >= 4 && value.length <= 20){
            res.locals.user = await User.findOne({username: value});
        }
        if(res.locals.user){
            next();
        }
        else{
            common.notFound(req, res);
        }
    }
    catch(err){
        console.log("error: " + err);
        next(err);
    }
}


async function findUser(req, res, next){
return res.json(res.locals.user);
}

async function createUser(req, res, next){
    try{
        const user = new User({
            username: req.body.username,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
        });
        await user.save();
        res.json(user);
    }
    catch(err) {
        next(err);
    }
}

async function updateUser(req, res, next){
    try{
        let user = res.locals.user;
        user.username = req.body.username;
        user.firstname = req.body.firstname;
        user.lastname = req.body.lastname;
        user.email = req.body.email;
        await user.save();
        res.json(user);

    }
    catch(err){
        next(err);
    }
}



async function getAllUsers(req, res, next){
    try{
        let users = await User.find( {status: "active"}).select(['id', 'username']);
        res.json(users);
    }
    catch(err){
        next(err);
    }
}

async function deleteUser(req, res, next){
    try{
       let user = res.locals.user;
       let userFound = await User.findById(user);
       await user.remove();
       res.json(userFound);
    }
    catch(err){
        next(err);
    }
}





module.exports = { lookupUser, 
                    createUser, 
                    getAllUsers, 
                    updateUser, 
                    deleteUser,
                    findUser, 
                };