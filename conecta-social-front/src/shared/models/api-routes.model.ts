export enum ApiRoutes {
  // --- AUTH ---
  AUTH_LOGIN = "/api/auth/login",
  AUTH_REGISTER = "/api/auth/register",
  AUTH_FORGOT_PASSWORD = "/api/auth/forgot/password",
  AUTH_RESET_PASSWORD = "/api/auth/reset/password",

  // --- ADMIN ---
  ADM_USERS = "/api/adm/users",
  ADM_DEACTIVATE_USER = "/api/adm/deactivate/user",

  // --- USER MANAGEMENT ---
  CREATE_ADM = "/create/adm",
  CREATE_USER = "/create/user",

  // --- REFERENCE PERSON ---
  REFERENCE_PERSONS = "/reference-persons", // POST, GET
  // Para rotas com ID dinâmico, o ideal é usar template literals no serviço, 
  // mas podemos manter a base aqui se preferir.
  // Exemplo de uso: `${ApiRoutes.REFERENCE_PERSONS}/${id}`

  // --- FAMILY ---
  FAMILIES_BASE = "/families", // Usar como base para :familyId
  MEMBERS_BASE = "/members",   // Usar como base para :memberId

  // --- SOCIAL RISK (Nomes originais do backend mantidos) ---
  CREATE_VIOLENCE_SITUATION = "/create/violence/situation",
  CREATE_VIOLENCE_OBSERVATION = "/create/violence/situation/observation",
  CREATE_SOCIO_EDUCATIONAL = "/create/history/socio/educational/measures",
  CREATE_SOCIO_EDUCATIONAL_OBSERVATION = "/create/history/socio/educational/measures/observations",
  CREATE_INSTITUTIONAL_HISTORY = "/create/family/history/institutional",
  CREATE_INSTITUTIONAL_OBSERVATION = "/create/family/history/institutional/observation",
}
