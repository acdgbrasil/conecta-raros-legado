import { z } from "zod";
import { UserAggregate } from "../../../../domain/user/user.entity";
import { createUserId, createPersonId, createRoleId } from "../../../../domain/types/identifiers";
import { Name } from "../../../../domain/user/value_objects/Name.vo";
import { Email } from "../../../../domain/user/value_objects/Email.vo";
import { JobTitle } from "../../../../domain/user/value_objects/JobTitle.vo";
import { Department } from "../../../../domain/user/value_objects/Department.vo";

// Schema do Banco (Source of Truth for Persistence)
export const UserPersistenceSchema = z.object({
  id: z.uuidv7(),
  person_id: z.uuidv7(),
  name: z.string(),
  email: z.string().email(),
  password_hash: z.string(),
  role_id: z.uuidv7(),
  is_active: z.boolean(),
  force_change_password: z.boolean(),
  job_title: z.string().nullable(),
  department: z.string().nullable(),
  last_login_at: z.date().nullable(),
  created_at: z.date(),
  updated_at: z.date()
});

export type UserPersistenceDTO = z.infer<typeof UserPersistenceSchema>;

/**
 * UserPersistenceCodec - Codec bi-direcional (Zod v4.1+)
 */
export const UserPersistenceCodec = z.codec(
  UserPersistenceSchema,
  z.custom<UserAggregate>(),
  {
    decode: (data) => {
      class ConcreteUser extends UserAggregate {}
      return new ConcreteUser(
        createUserId(data.id),
        createPersonId(data.person_id),
        Name.create(data.name),
        Email.create(data.email),
        data.password_hash,
        createRoleId(data.role_id),
        data.is_active,
        data.force_change_password,
        data.created_at,
        data.updated_at,
        data.last_login_at ?? undefined,
        data.job_title ? JobTitle.create(data.job_title) : undefined,
        data.department ? Department.create(data.department) : undefined
      );
    },
    encode: (user) => {
      return {
        id: user.id,
        person_id: user.personId,
        name: user.name.value,
        email: user.email.value,
        password_hash: user.passwordHash,
        role_id: user.roleId,
        is_active: user.isActive,
        force_change_password: user.forceChangePassword,
        job_title: user.jobTitle?.value ?? null,
        department: user.department?.value ?? null,
        last_login_at: user.lastLoginAt ?? null,
        created_at: user.createdAt,
        updated_at: user.updatedAt
      };
    }
  }
);
