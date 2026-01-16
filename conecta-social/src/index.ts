import express from 'express';
import userRouter from './presenter/routers/userRouter.js';
import authRouter from './presenter/routers/authRouter.js';
import { connectionMongose, testConnection } from './infra/database/mongodb/mongoDtos/mongodbDto.js';
import { MongooseClientSingleton } from './infra/database/mongodb/mongooseClientSingleton.js';
import { _verifyPassEmailToken, createPassEmailToken, verifyToken } from './infra/jwt/jwtToken.js';
import admRouter from './presenter/routers/admRouter.js';
import { deleteUser } from './infra/database/postgress/postgressDTO.js';
import cors from 'cors';
import {config} from 'dotenv'
import { pool } from './infra/database/postgress/postgres.js';
import { migration_25_05_2025 } from './infra/database/postgress/migrations/postMigrations.js';
import { downloadRouter } from './presenter/routers/downloadRouter.js';
import { fileURLToPath } from 'url';

config({});

const verifyPostGress = (isConnected:boolean, pgClient:any) => {
    if(!isConnected) {
        console.log('Postgress is not connected');
        return;
    }
    migration_25_05_2025(pgClient).then((value) => {
        console.log('Migration completed successfully');
    }).catch((error) => {
        console.error('Error during migration:', error);
    })
    console.log('Postgress is connected');
}

const PORT = process.env.PORT || 3000;
function startDatabase() {
    pool(10).then(({isConnected, pgClient}) => verifyPostGress(isConnected, pgClient));
    connectionMongose().then((client) => {
        MongooseClientSingleton.setInstance(client);
        testConnection();
    });
}

function verifyGetEnviroments(){
    if(process.env.SUPER_ADM_EMAIL == null || process.env.SUPER_ADM_EMAIL == undefined || process.env.SUPER_ADM_EMAIL == ''){
        return "FAIL TO LOAD SUPER_ADM_EMAIL";
    }

    if(process.env.POSTGRES_USER == null || process.env.POSTGRES_USER == undefined || process.env.POSTGRES_USER == ''){
        return "FAIL TO LOAD POSTGRES_USER";
    }

    if(process.env.POSTGRES_PASSWORD == null || process.env.POSTGRES_PASSWORD == undefined || process.env.POSTGRES_PASSWORD == ''){
        return "FAIL TO LOAD POSTGRES_PASSWORD";
    }

    if(process.env.POSTGRES_HOST == null || process.env.POSTGRES_HOST == undefined || process.env.POSTGRES_HOST == ''){
        return "FAIL TO LOAD POSTGRES_HOST";
    }

    if(process.env.POSTGRES_PORT == null || process.env.POSTGRES_PORT == undefined || process.env.POSTGRES_PORT == ''){
        return "FAIL TO LOAD POSTGRES_PORT";
    }

    if(process.env.POSTGRES_DB == null || process.env.POSTGRES_DB == undefined || process.env.POSTGRES_DB == ''){
        return "FAIL TO LOAD POSTGRES_DB";
    }

    return "ENVIRONMENT VARIABLES LOADED";
}

async function a(){
    let b = ["wombaabmow@gmail.com","grouve-animos@gmail.com","jorgelima01@uol.com.br","jorgevictorlima@gmail.com","jorgequaltyassurance@gmail.com","paulloisnevesx@gmail.com",]
    for await (let i of b){
        deleteUser(i);
    }
}
const app = express();
app.use(cors());
const router = express.Router();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(router);
router.get('/downloads',(req,res)=> res.download('app-windows_candidate-0.1.0-v3.msi',(e)=>console.log(e)));
router.use('/api',authRouter);
router.use('/api/ping',async (_,res) => {
    res.send('pong');
});


router.use(verifyToken);
router.use(userRouter);
router.use('/api',admRouter);



app.listen(PORT,function(){
    console.log('SERVER RUNNING ON PORT: '+PORT);
    console.log(verifyGetEnviroments());
    startDatabase();
})
