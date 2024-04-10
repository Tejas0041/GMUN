module.exports.isAdmin= (req, res, next)=>{
    if(!req.isAuthenticated()){
        return res.redirect('/adminlogin');
    }
    next();
}