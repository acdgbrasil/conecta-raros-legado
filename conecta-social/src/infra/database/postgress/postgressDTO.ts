import { User, UserRole } from '../../../domain/entity/user.js';
import { CustomError } from '../../error/error.js';
import { pool } from './postgres.js';
import { CREATE_TABLE_USER, createNewUserAdmin } from './schema/userSchema.js';



export async function createADM(user: User):Promise<User>{
    try{
        const {isConnected, pgClient } = await pool(10);
        if(!isConnected) throw new CustomError('Database Error', 500, 'Database Error', 'Failed to connect to the database');
        const {rows} = await pgClient.query(createNewUserAdmin,[user.fullName, user.email, user.password, user.crm, UserRole.admin.toString(), true]);
        if(rows.length === 0) throw new CustomError('Database Error', 500, 'Database Error', 'Failed to create user');
        return new User(
            rows[0].id,
            rows[0].full_name,
            rows[0].email,
            rows[0].password,
            rows[0].crm,
            rows[0].role,
            rows[0].created_at,
            rows[0].updated_at,
            rows[0].is_active
        );
    }catch(e){
        throw e;
    }
}

export async function create(user: User): Promise<User> {
    try{
        const {isConnected, pgClient } = await pool(10);
        if(!isConnected) throw new CustomError('Database Error', 500, 'Database Error', 'Failed to connect to the database');
        const {rows} = await pgClient.query(createNewUserAdmin,[user.fullName, user.email, user.password, user.crm, UserRole.user.toString(), true]);
        if(rows.length === 0) throw new CustomError('Database Error', 500, 'Database Error', 'Failed to create user');
        return new User(
            rows[0].id,
            rows[0].full_name,
            rows[0].email,
            rows[0].password,
            rows[0].crm,
            rows[0].role,
            rows[0].created_at,
            rows[0].updated_at,
            rows[0].is_active
        );

    }catch(e){
        throw e;
    }
}

export async function findByEmail(email: string){
    try{
        const {isConnected, pgClient } = await pool(10);
        if(!isConnected) throw new CustomError('Database Error', 500, 'Database Error', 'Failed to connect to the database');

        const {rows} = await pgClient.query('SELECT * FROM users WHERE email = $1', [email]);
        if(rows.length === 0) return null; // No user found with the given email
        return new User(
            rows[0].id,
            rows[0].full_name,
            rows[0].email,
            rows[0].password,
            rows[0].crm,
            rows[0].role,
            rows[0].created_at,
            rows[0].updated_at,
            rows[0].is_active
        );

    }catch(e){
        throw e;
    }
}

export async function findById(id: string){
    try{
        const {isConnected, pgClient } = await pool(10);
        if(!isConnected) throw new CustomError('Database Error', 500, 'Database Error', 'Failed to connect to the database');

        const {rows} = await pgClient.query('SELECT * FROM users WHERE id = $1', [id]);
        if(rows.length === 0) return null;
        return new User(
            rows[0].id,
            rows[0].full_name,
            rows[0].email,
            rows[0].password,
            rows[0].crm,
            rows[0].role,
            rows[0].created_at,
            rows[0].updated_at,
            rows[0].is_active
        );

    }catch(e){
        throw e;
    }
}


export async function listAllUsers(){
    try{
       const {isConnected, pgClient } = await pool(10);
        if(!isConnected) throw new CustomError('Database Error', 500, 'Database Error', 'Failed to connect to the database');

        const {rows} = await pgClient.query('SELECT * FROM users');
        if(rows.length === 0) throw new CustomError('No users found', 404, 'No users found', 'No users found');
        return rows.map(row => new User(
            row.id,
            row.full_name,
            row.email,
            row.password,
            row.crm,
            row.role,
            row.created_at,
            row.updated_at,
            row.is_active
        ));

    }catch(e){
        throw e
    }
}

export async function deleteUser(email: string){
    try{
        const {isConnected, pgClient } = await pool(10);
        if(!isConnected) throw new CustomError('Database Error', 500, 'Database Error', 'Failed to connect to the database');
        const {rowCount} = await pgClient.query('DELETE FROM users WHERE email = $1', [email]);
        if(rowCount === 0) throw new CustomError('User not found', 404, 'User not found', 'User not found');
        return true;

    }catch(e){
        if(e instanceof Error && e.message.includes('Record to delete does not exist.')){
            throw new CustomError('User not found',404,'User not found','User not found');
        }
        throw e;
    }
}

export async function deactivateUser(email:string){
    try{
        const {isConnected, pgClient } = await pool(10);
        if(!isConnected) throw new CustomError('Database Error', 500, 'Database Error', 'Failed to connect to the database');
        const {rowCount} = await pgClient.query('UPDATE users SET is_active = false WHERE email = $1', [email]);
        if(rowCount === 0) throw new CustomError('User not found', 404, 'User not found', 'User not found');
        return true;
        
    }catch(err){
        throw err
    }
}

export async function changePassword(email: string, newPassword: string):Promise<User>{
    try{
       const {isConnected, pgClient } = await pool(10);
        if(!isConnected) throw new CustomError('Database Error', 500, 'Database Error', 'Failed to connect to the database');

        const {rows} = await pgClient.query('UPDATE users SET password = $1, updated_at = NOW() WHERE email = $2 RETURNING *', [newPassword, email]);
        if(rows.length === 0) throw new CustomError('User not found', 404, 'User not found', 'User not found');
        return new User(
            rows[0].id,
            rows[0].full_name,
            rows[0].email,
            rows[0].password,
            rows[0].crm,
            rows[0].role,
            rows[0].created_at,
            rows[0].updated_at,
            rows[0].is_active
        );

    }catch(e){
        throw e;
    }
}