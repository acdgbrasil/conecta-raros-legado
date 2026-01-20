import { TimeInSeconds } from "../../../shared/constants/TimeInSeconds.constants";
import { JwtProvider } from "../../../shared/providers/jwt/Jwt.provider";
import { UseCaseProvider } from "../../../shared/providers/useCase/UseCase.provider";
import { UserRepository } from "../../domain/repository/User.repository";
import { AuthInputSchema, LoginInput } from "../../mapper/auth/Auth.input";
import { LoginOutput } from "../../mapper/auth/Auth.output";
import { UserMapper } from "../../mapper/user/User.mapper";

export class LoginUseCase implements UseCaseProvider<LoginInput,LoginOutput> {

  constructor(private readonly userRepository: UserRepository, private readonly jwtProvider: JwtProvider){}

  async execute(input: { email: string; password: string; }): Promise<LoginOutput> {
    const loginParsed = AuthInputSchema.parser(input);
    const user = await this.userRepository.findByEmail(loginParsed.email);
    if(!user) throw new Error("Credenciais inválidas.");
    if(!user.passwordHash) throw new Error("Conta não ativada ou sem senha definida.");
    const isValid = await Bun.password.verify(loginParsed.password, user.passwordHash);
    if(!isValid) throw new Error("Credenciais inválidas.");
    if(!user.isActive) throw new Error("Usuário inativo. Contate o administrador.");

    const token = await this.jwtProvider.sign({
      sub: user.id!,
      type:'access',
      roleId: user.roleId,
      permissions: user.permissions || [],
    },TimeInSeconds.FIVE_MINUTES);

    const refreshToken = await this.jwtProvider.sign({
      sub: user.id!,
      type:'refresh',
    },TimeInSeconds.THIRTY_DAYS);

    user.registerLogin();
    await this.userRepository.save(user);

    return {
      accessToken: token,
      refreshToken: refreshToken,
      user: UserMapper.toResponse(user),
    }
  }

}