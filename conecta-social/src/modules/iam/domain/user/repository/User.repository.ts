import { User } from "../factories/User.factory";

export interface UserRepository {
  /**
   * Salva um usuário (Criação ou Atualização).
   * Deve ser capaz de detectar se é um INSERT ou UPDATE baseado no ID.
   */
  save(user: User): Promise<void>;

  /**
   * Busca um usuário pelo E-mail.
   * CRÍTICO: Deve retornar o usuário "Hidratado" (com todas as permissões carregadas via JOIN).
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Busca um usuário pelo ID (UUID).
   * Usado para updates parciais, troca de senha, etc.
   */
  findById(id: string): Promise<User | null>;

  /**
   * Lista usuários com paginação.
   */
  findAll(limit: number, offset: number): Promise<{ users: User[], total: number }>;

  /**
   * Método auxiliar para a troca de cargos.
   * Dado um ID de Role, retorna a lista de slugs de permissão (ex: ['users:read'])
   * associadas a ela.
   */
  getPermissionsByRoleId(roleId: string): Promise<string[]>;
  
  /**
   * Método auxiliar para verificar se uma Role existe antes de tentar usar.
   */
  checkRoleExists(roleId: string): Promise<boolean>;
}
