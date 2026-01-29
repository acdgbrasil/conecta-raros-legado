import { UserId, PersonId, RoleId } from "../types/identifiers";
import { Email } from "./value_objects/Email.vo";
import { Name } from "./value_objects/Name.vo";
import { JobTitle } from "./value_objects/JobTitle.vo";
import { Department } from "./value_objects/Department.vo";
import { AggregateRoot } from "../../../shared/domain/AggregateRoot";
import { UserDeactivatedEvent } from "../events/UserDeactivated.event";
import { UserRoleChangedEvent } from "../events/UserRoleChanged.event";
import { UserLoggedInEvent } from "../events/UserLoggedIn.event";
import { UserPasswordChangedEvent } from "../events/UserPasswordChanged.event";
import { UserUpdatedEvent } from "../events/UserUpdated.event";

export interface IUser {
  readonly id: UserId;
  readonly personId: PersonId;
  readonly name: Name;
  readonly email: Email;
  readonly passwordHash: string;
  
  roleId: RoleId;
  isActive: boolean;
  forceChangePassword: boolean;
  lastLoginAt?: Date;
  
  jobTitle?: JobTitle;
  department?: Department;
  
  readonly createdAt: Date;
  updatedAt: Date;
}

export abstract class UserAggregate extends AggregateRoot implements IUser {
  constructor(
    public readonly id: UserId,
    public readonly personId: PersonId,
    public name: Name,
    public readonly email: Email,
    protected _passwordHash: string,
    public roleId: RoleId,
    public isActive: boolean,
    public forceChangePassword: boolean,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public lastLoginAt?: Date,
    public jobTitle?: JobTitle,
    public department?: Department
  ) {
    super();
  }

  get passwordHash(): string {
    return this._passwordHash;
  }

  // --- Comportamentos ---

  public updateDetails(props: { name?: Name; jobTitle?: JobTitle; department?: Department }): void {
    if (props.name) this.name = props.name;
    if (props.jobTitle) this.jobTitle = props.jobTitle;
    if (props.department) this.department = props.department;
    
    this.updatedAt = new Date();
    this.addDomainEvent(new UserUpdatedEvent(this.id));
  }

  public changePassword(newHash: string): void {
    this._passwordHash = newHash;
    this.forceChangePassword = false;
    this.updatedAt = new Date();
    this.addDomainEvent(new UserPasswordChangedEvent(this.id));
  }

  public registerLogin(): void {
    this.lastLoginAt = new Date();
    this.updatedAt = new Date();
    this.addDomainEvent(new UserLoggedInEvent(this.id));
  }

  public toggleStatus(active: boolean): void {
    this.isActive = active;
    this.updatedAt = new Date();
    
    if (!active) {
      this.addDomainEvent(new UserDeactivatedEvent(this.id));
    }
  }

  public changeRole(newRoleId: RoleId): void {
    this.roleId = newRoleId;
    this.updatedAt = new Date();
    this.addDomainEvent(new UserRoleChangedEvent(this.id, newRoleId));
  }
}
