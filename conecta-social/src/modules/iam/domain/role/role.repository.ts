import { RoleAggregate } from "./role.entity";
import { RoleId } from "../types/identifiers";
import { RoleName } from "./role/value_objects/RoleName.vo";

export interface IRoleRepository {
  save(role: RoleAggregate): Promise<void>;
  findById(id: RoleId): Promise<RoleAggregate | null>;
  findByName(name: RoleName): Promise<RoleAggregate | null>;
  findAll(): Promise<RoleAggregate[]>;
  existsByName(name: RoleName): Promise<boolean>;
  delete(id: RoleId): Promise<void>;
}
