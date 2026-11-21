
require('dotenv').config();
const express=require('express'),cors=require('cors'),bcrypt=require('bcryptjs'),jwt=require('jsonwebtoken');
const db=require('./database/db'),{auth,admin}=require('./middleware/auth');
const app = express();

const allowedOrigins = [
    process.env.CLIENT_ORIGIN,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174'
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('CORS blocked this frontend origin: ' + origin));
        }
    }
}));

app.use(express.json());
app.get('/',(q,s)=>s.json({message:'UCU Campus Lost and Found API is running'}));
app.get('/api/health',async(q,s)=>{try{await db.query('SELECT 1');s.json({api:'ok',database:'connected'});}catch(e){s.status(503).json({api:'ok',database:'disconnected',detail:e.message});}});
app.post('/api/auth/register',async(q,s)=>{try{const{full_name,email,student_number,password}=q.body;if(!full_name?.trim()||!email?.trim()||!password)return s.status(400).json({message:'Full name, email and password are required.'});if(password.length<8)return s.status(400).json({message:'Password must be at least 8 characters.'});const hash=await bcrypt.hash(password,12);const[r]=await db.execute('INSERT INTO users(full_name,email,student_number,password_hash) VALUES(?,?,?,?)',[full_name.trim(),email.trim().toLowerCase(),student_number?.trim()||null,hash]);s.status(201).json({message:'Account created. Sign in now.',user_id:r.insertId});}catch(e){if(e.code==='ER_DUP_ENTRY')return s.status(409).json({message:'Email or student number already registered.'});console.error(e);s.status(500).json({message:'Registration failed.'});}});
app.post('/api/auth/login',async(q,s)=>{try{const[r]=await db.execute('SELECT id,full_name,email,student_number,password_hash,role,phone,course,bio FROM users WHERE email=?',[String(q.body.email||'').toLowerCase()]);if(!r.length||!(await bcrypt.compare(q.body.password||'',r[0].password_hash)))return s.status(401).json({message:'Incorrect email or password.'});const u=r[0],token=jwt.sign({id:u.id,email:u.email,role:u.role},process.env.JWT_SECRET,{expiresIn:'12h'});delete u.password_hash;s.json({token,user:u});}catch(e){console.error(e);s.status(500).json({message:'Login failed.'});}});
app.get('/api/auth/me',auth,async(q,s)=>{const[r]=await db.execute('SELECT id,full_name,email,student_number,role,phone,course,bio FROM users WHERE id=?',[q.user.id]);if(!r.length)return s.status(404).json({message:'User not found'});s.json({user:r[0]});});
app.get('/api/items',async(q,s)=>{try{let sql='SELECT i.*,u.full_name reporter_name FROM items i JOIN users u ON u.id=i.user_id WHERE 1=1',a=[];if(q.query.q){sql+=' AND (i.title LIKE ? OR i.description LIKE ? OR i.location LIKE ?)';a.push(...Array(3).fill('%'+q.query.q+'%'));}if(['lost','found'].includes(q.query.type)){sql+=' AND i.item_type=?';a.push(q.query.type);}sql+=' ORDER BY i.created_at DESC LIMIT 250';const[items]=await db.execute(sql,a);s.json({items});}catch(e){console.error(e);s.status(500).json({message:'Could not load items.'});}});
app.get('/api/items/:id',async(q,s)=>{const[r]=await db.execute('SELECT i.*,u.full_name reporter_name FROM items i JOIN users u ON u.id=i.user_id WHERE i.id=?',[q.params.id]);if(!r.length)return s.status(404).json({message:'Item not found'});s.json({item:r[0]});});
app.post('/api/items',auth,async(q,s)=>{try{const{title,description,category,item_type,location,event_date,image_url}=q.body;if(!title||!description||!category||!location||!event_date||!['lost','found'].includes(item_type))return s.status(400).json({message:'Complete all required fields.'});const[r]=await db.execute('INSERT INTO items(user_id,title,description,category,item_type,location,event_date,image_url) VALUES(?,?,?,?,?,?,?,?)',[q.user.id,title,description,category,item_type,location,event_date,image_url||null]);s.status(201).json({message:'Report published.',item_id:r.insertId});}catch(e){console.error(e);s.status(500).json({message:'Could not publish report.'});}});
app.patch('/api/items/:id',auth,async(q,s)=>{const[r]=await db.execute('SELECT user_id FROM items WHERE id=?',[q.params.id]);if(!r.length)return s.status(404).json({message:'Item not found'});if(+r[0].user_id!==+q.user.id&&q.user.role!=='admin')return s.status(403).json({message:'Not allowed'});const k=['title','description','category','location','event_date','image_url','status'].filter(x=>q.body[x]!==undefined);if(!k.length)return s.status(400).json({message:'No changes supplied'});await db.execute(`UPDATE items SET ${k.map(x=>x+'=?').join(',')} WHERE id=?`,[...k.map(x=>q.body[x]),q.params.id]);s.json({message:'Item updated'});});
app.post('/api/claims',auth,async(q,s)=>{try{const{item_id,message}=q.body;if(!item_id||!message?.trim())return s.status(400).json({message:'Item and claim explanation are required.'});const[it]=await db.execute('SELECT id,user_id,title FROM items WHERE id=? AND status="open"',[item_id]);if(!it.length)return s.status(404).json({message:'Item is unavailable.'});if(+it[0].user_id===+q.user.id)return s.status(400).json({message:'You cannot claim your own report.'});const[r]=await db.execute('INSERT INTO claims(item_id,claimant_id,message) VALUES(?,?,?)',[item_id,q.user.id,message.trim()]);await db.execute('INSERT INTO notifications(user_id,message) VALUES(?,?)',[it[0].user_id,`A student submitted a claim for "${it[0].title}".`]);s.status(201).json({message:'Claim submitted.',claim_id:r.insertId});}catch(e){if(e.code==='ER_DUP_ENTRY')return s.status(409).json({message:'You already claimed this item.'});console.error(e);s.status(500).json({message:'Could not submit claim.'});}});
app.get('/api/claims/mine',auth,async(q,s)=>{const[r]=await db.execute('SELECT c.*,i.title item_title,i.item_type FROM claims c JOIN items i ON i.id=c.item_id WHERE c.claimant_id=? ORDER BY c.created_at DESC',[q.user.id]);s.json({claims:r});});
app.get('/api/claims',auth,admin,async(q,s)=>{const[r]=await db.execute('SELECT c.*,i.title item_title,u.full_name claimant_name FROM claims c JOIN items i ON i.id=c.item_id JOIN users u ON u.id=c.claimant_id ORDER BY c.created_at DESC');s.json({claims:r});});
app.patch('/api/claims/:id',auth,admin,async(q,s)=>{const st=q.body.status;if(!['approved','rejected'].includes(st))return s.status(400).json({message:'Invalid status.'});const[r]=await db.execute('SELECT c.*,i.title FROM claims c JOIN items i ON i.id=c.item_id WHERE c.id=?',[q.params.id]);if(!r.length)return s.status(404).json({message:'Claim not found.'});await db.execute('UPDATE claims SET status=? WHERE id=?',[st,q.params.id]);if(st==='approved')await db.execute('UPDATE items SET status="claimed" WHERE id=?',[r[0].item_id]);await db.execute('INSERT INTO notifications(user_id,message) VALUES(?,?)',[r[0].claimant_id,`Your claim for "${r[0].title}" was ${st}.`]);s.json({message:'Claim updated.'});});
app.get('/api/notifications',auth,async(q,s)=>{const[r]=await db.execute('SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC',[q.user.id]);s.json({notifications:r});});
app.patch('/api/notifications/:id/read',auth,async(q,s)=>{await db.execute('UPDATE notifications SET is_read=1 WHERE id=? AND user_id=?',[q.params.id,q.user.id]);s.json({message:'Marked read.'});});
app.patch('/api/users/me',auth,async(q,s)=>{const k=['full_name','phone','course','bio'].filter(x=>q.body[x]!==undefined);if(!k.length)return s.status(400).json({message:'No profile changes.'});await db.execute(`UPDATE users SET ${k.map(x=>x+'=?').join(',')} WHERE id=?`,[...k.map(x=>q.body[x]),q.user.id]);const[r]=await db.execute('SELECT id,full_name,email,student_number,role,phone,course,bio FROM users WHERE id=?',[q.user.id]);s.json({user:r[0],message:'Profile updated.'});});
app.get('/api/users/admin/list',auth,admin,async(q,s)=>{const[r]=await db.execute('SELECT id,full_name,email,student_number,role FROM users ORDER BY id DESC');s.json({users:r});});
app.patch('/api/users/admin/:id/role',auth,admin,async(q,s)=>{if(!['student','admin'].includes(q.body.role))return s.status(400).json({message:'Invalid role.'});await db.execute('UPDATE users SET role=? WHERE id=?',[q.body.role,q.params.id]);s.json({message:'Role updated.'});});
app.use((e,q,s,n)=>{console.error(e);s.status(500).json({message:'Unexpected server error.'});});
const port = Number(process.env.PORT || 5001);

app.listen(port, () => {
    console.log(`Backend running at http://localhost:${port}`);
});

