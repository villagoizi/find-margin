const express = require('express');
const app = express();
const path = require('path')
const exphbs = require('express-handlebars');
const upload = require('express-fileupload');
const fs = require('fs');
const cors = require('cors');
const Tesseract = require('tesseract.js');


//Settings
app.set('views', path.join(__dirname, 'views'));

//Middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(upload());

//Engine
app.engine('.hbs', exphbs(
    {
        defaultLayout: 'main',
        layoutsDir: path.join(app.get('views'), 'layouts'),
        extname: '.hbs'
    }
));
app.set('view engine', '.hbs');


//Routes
app.get('/', (req,res)=> {
    res.render('home');
})

app.get('/find-margin', (req,res) => {
    res.render('find-margin')
})

app.post('/find-margin', (req,res,next)=>{
    if(!req.files || Object.keys(req.files).lenght === 0){
        return res.status(400).send('No files were uploaded')
    }

    let sampleFile = req.files.recibo;
    const extName = sampleFile.name.split('.').pop();
    sampleFile.name = Date.now() + '.' + extName;
    const url = path.join(__dirname,'uploads');
    const filePath = `${path.resolve(url,sampleFile.name)}`;

    sampleFile.mv(filePath, err => {
        if (err)
          return res.status(500).send(err);
      console.log('File upload');
    });
    
    Tesseract.recognize(
        filePath,
        'eng',
        { logger: m => console.log(m)}
    ).then( ({data: {text}}) => {
        console.log(text);
    });

})

app.listen(3000, () => console.log('Server on port 3000'));