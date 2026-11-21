const jwt=require('jsonwebtoken');
function auth(req,res,next){const h=req.headers.authorization||'';const t=h.startsWith('Bearer ')?h.slice(7):null;if(!t)return res.status(401).json({message:'Please sign in.'});try{req.user=jwt.verify(t,process.env.JWT_SECRET);next();}catch{return res.status(401).json({message:'Session expired. Sign in again.'});}}
function admin(req,res,next){if(req.user?.role!=='admin')return res.status(403).json({message:'Administrator access required.'});next();}
module.exports={auth,admin};
