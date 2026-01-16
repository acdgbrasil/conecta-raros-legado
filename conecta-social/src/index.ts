import express from 'express';
import authRouter from './presenter/routers/authRouter.js';
import referencePersonRouter from './presenter/routers/modules/referencePersonRouter.js';
import familyRouter from './presenter/routers/modules/familyRouter.js';
import conditionsRouter from './presenter/routers/modules/conditionsRouter.js';
import socialRiskRouter from './presenter/routers/modules/socialRiskRouter.js';
import userManagementRouter from './presenter/routers/modules/userManagementRouter.js';
import { connectionMongose, testConnection } from './infra/database/mongodb/mongoDtos/mongodbDto.js';
import { MongooseClientSingleton } from './infra/database/mongodb/mongooseClientSingleton.js';
import { verifyToken } from './infra/jwt/jwtToken.js';
import admRouter from './presenter/routers/admRouter.js';
import { deleteUser } from './infra/database/postgress/postgressDTO.js';
import cors from 'cors';
import {config} from 'dotenv'
import { pool } from './infra/database/postgress/postgres.js';
import { migration_25_05_2025 } from './infra/database/postgress/migrations/postMigrations.js';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './infra/docs/swagger.js';
import rateLimit from 'express-rate-limit';

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

// Configuração para confiar no Proxy reverso (Nginx/Docker)
// Necessário para o rate-limit funcionar corretamente com X-Forwarded-For
app.set('trust proxy', 1);

// Security: CORS
// Allow requests from specific origins (or all if not configured)
const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*';
app.use(cors({
    origin: allowedOrigins
}));

// Security: Rate Limiting
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(limiter);

const router = express.Router();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(router);

// Documentação Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

router.get('/downloads',(req,res)=> res.download('app-windows_candidate-0.1.0-v3.msi',(e)=>console.log(e)));
router.use('/api',authRouter);
router.use('/api/ping',async (_,res) => {
    res.send('pong');
});


router.use(verifyToken);
// Old monolithic router removed

// New Modular Routers
router.use(referencePersonRouter);
router.use(familyRouter);
router.use(conditionsRouter);
router.use(socialRiskRouter);
router.use(userManagementRouter);

router.use('/api',admRouter);



app.listen(PORT,function(){
    console.log('SERVER RUNNING ON PORT: '+PORT);
    console.log(verifyGetEnviroments());
    startDatabase();
})