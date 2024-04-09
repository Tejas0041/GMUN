if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const express= require('express')
const app= express()
const path= require('path')
const mongoose = require('mongoose')
const session= require('express-session');
const flash= require('express-flash');
const Registration= require('./models/registrationSchema.js')
const multer= require('multer')
const {storage} = require('./cloudinary/cloudinary.js')
const upload= multer({storage})
const MongoDBStore= require("connect-mongo");
// const dbUrl= 'mongodb://localhost:27017/gmun'
const dbUrl= process.env.DB_URL;
const secret= process.env.SECRET || 'thisshouldbeabettersecret'
const sgMail = require('@sendgrid/mail');
const sgMailApi= process.env.SENDGRID_API;

sgMail.setApiKey(sgMailApi);

app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'public')))

app.use(express.urlencoded({extended: true}))

app.set('view engine', 'ejs')

mongoose.connect(dbUrl);
const db= mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", ()=>{
    console.log("Database Connected");
});

const store = new MongoDBStore({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24*60*60 //time is in seconds
});

store.on('error', function(err){
    console.log("Error!", err);
})

const sessionConfig= {
    store,
    name: 'GMUN_IIEST_Shibpur',
    httpOnly: true,
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + (1000*60*60*24*7),
        maxAge: (1000*60*60*24*7)
    }
}

app.use(session(sessionConfig));
app.use(flash());


app.use((req, res, next)=>{
    res.locals.success= req.flash('success');
    res.locals.error= req.flash('error');
    next();
});

const mp= {
    'unsc': 'United Nations Security Council',
    'unhrc': 'United Nations Human Rights Council',
    'ip': 'International Press',
    'loksabha': 'Loksabha',
    'hogwarts': 'Hogwarts'
}

app.get('/', (req, res)=>{
    res.render('templates/home.ejs');
})

app.get('/register/:name', (req, res)=>{
    const {name}= req.params;
    const formname= mp[name];
    res.render('templates/form.ejs', {formname, name});
})


app.post('/register/:evtname', upload.array('image'), async(req, res)=>{
    try{
        const {evtname}= req.params;
        const cmt= mp[evtname];
        const {name, phone, whatsapp, email, mun_attended, country}=req.body;
        const newReg= new Registration({name, phone, whatsapp, email, mun_attended, country});

        newReg.image =req.files.map(f=>({url:f.path, filename: f.filename}));

        newReg.committee= cmt;
        await newReg.save();
        req.flash('success', "Regitration Successful")

        const msg = {
            to: `${email}`,
            from: 'tejaspawar62689@gmail.com',
            subject: 'Registration Confirmation: Global Model United Nations Event by Debsoc, IIEST Shibpur',
            html: `
            <div>
                Dear ${name}, <br> <br>
                We are delighted to confirm your commitee registration <b>(${cmt})</b> for the  Global Model United Nations event organized by Debsoc at IIEST Shibpur. We are thrilled to have you join us for this enriching experience.
                <br> <br>

                Warm regards, <br>
                Tejas Pawar <br>
                (Lead Web Developer) <br>
                Debsoc, IIEST Shibpur <br> <br>

                <div style="display: flex; max-width: 350px; background-color:#181818; color:white; border-radius: 8px; margin-left: 2px">
                    <div>
                        <img style="max-width: 135px;" src="https://res.cloudinary.com/di7h49uue/image/upload/v1712674109/GMUN_IIEST_SHibpur_4_zdybku.png" alt="">
                    </div>
                    <hr>
                    <div style="font-size: 10px; padding: 3px">
                        <h5>IIEST GLOBAL MODEL UNITED NATIONS</h5>
                        <h6>IIEST, Shibpur</h6>
                        <div style="font-size: 8px;">
                            <div>+91 8447436195 | iiestgmun@gmail.com</div>
                            <div>Botanical Garden Area, Howrah <br> WB (711103)</div>
                        </div>
                        <br>
                        <div style="display: flex;">
                            <div style="margin-right: 8px;">
                                <a href="https://www.instagram.com/debsociiests?igsh=MTJ2cGczM3UxZ3o4aw==" target="_blank">
                                    <img style="max-width: 20px;" src="https://i2.wp.com/www.multarte.com.br/wp-content/uploads/2019/03/logo-instagram-png-fundo-transparente13.png?fit=2400,2400&ssl=1" alt="">
                                </a>
                            </div>
                            <div>
                                <a href="https://www.linkedin.com/company/debsoc-iiest-shibpur/" target="_blank">
                                    <img style="max-width: 19px;" src="https://pngimg.com/d/linkedIn_PNG16.png" alt="">
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            `,
        };

        sgMail.send(msg)
        .then(() => console.log(`Email sent: ${email} | ${cmt} | ${phone}`))
        .catch(error => console.error(error));

        res.redirect('/')
    }
    catch(e){
        req.flash('error', "There was an error occured while making your registration")
        res.redirect('/')
    }
})

app.listen(8080, ()=>{
    console.log('Server started successfully on port 8080')
})


// cloudinary dashboard
/*
https://console.cloudinary.com/console/c-4fdaf1ef66d49e556500f5d34957aa/media_library/search?q=&view_mode=mosaic
*/
