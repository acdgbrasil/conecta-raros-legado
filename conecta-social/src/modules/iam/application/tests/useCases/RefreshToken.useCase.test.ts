import { describe, test, expect, mock, beforeEach } from "bun:test";
import { RefreshTokenUseCase } from "../../useCases/RefreshToken.useCase";
import { IUserRepository } from "../../../domain/user/user.repository";
import { TokenRepository } from "../../../domain/authentication/repository/Token.repository";
import { JwtProvider } from "../../../../shared/domain/services/JwtProvider.protocol";
import { UserMapper } from "../../mappers/user/User.mapper";

describe("RefreshTokenUseCase", () => {
  let userRepository: IUserRepository;
  let tokenRepository: TokenRepository;
  let jwtProvider: JwtProvider;
  let useCase: RefreshTokenUseCase;

  const v7Id = "018e9c34-2e0b-70c8-8000-123456789000";
  const mockUserRaw = {
    id: v7Id, 
    person_id: v7Id, 
    name: "User", 
    email: "user@test.com",
    password_hash: "hash", 
    role_id: v7Id, 
    is_active: true,
    force_change_password: false, 
    job_title: "Staff",
    department: "Sales",
    last_login_at: new Date(),
    created_at: new Date(), 
    updated_at: new Date()
  };

  beforeEach(() => {
    userRepository = {
      findById: mock(async () => UserMapper.fromPersistence(mockUserRaw))
    } as any;

    tokenRepository = {
      findRefreshToken: mock(async () => ({ userId: v7Id, isRevoked: false })),
      revokeRefreshToken: mock(async () => {}),
      revokeAllUserRefreshTokens: mock(async () => {}),
      saveRefreshToken: mock(async () => {})
    } as any;

    jwtProvider = {
      verify: mock(async () => ({ sub: v7Id, type: "refresh" })),
      sign: mock(async () => "new_token")
    };

    useCase = new RefreshTokenUseCase(userRepository, tokenRepository, jwtProvider);
  });

  test("should rotate tokens successfully", async () => {
    const result = await useCase.execute({ refreshToken: "valid_rt" });

    expect(result.accessToken).toBe("new_token");
    expect(tokenRepository.revokeRefreshToken).toHaveBeenCalled();
    expect(tokenRepository.saveRefreshToken).toHaveBeenCalled();
  });

  test("should detect reuse and revoke all tokens", async () => {
    // Simula token já revogado (reuso detectado)
    (tokenRepository.findRefreshToken as any).mockImplementation(() => 
      Promise.resolve({ userId: v7Id, isRevoked: true })
    );

    expect(useCase.execute({ refreshToken: "reused_rt" })).rejects.toThrow("already used");
    expect(tokenRepository.revokeAllUserRefreshTokens).toHaveBeenCalledWith(v7Id);
  });
});
