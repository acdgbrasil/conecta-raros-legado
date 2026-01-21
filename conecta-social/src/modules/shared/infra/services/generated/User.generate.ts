export const UserGenerates = {
  /**
   * Gera uma senha aleatória forte de 12 caracteres.
   * Garante: 1 maiúscula, 1 minúscula, 1 número e 1 especial.
   */
  randomPassword(): string {
    const length = 12;
    const sets = [
      "abcdefghijklmnopqrstuvwxyz",
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      "0123456789",
      "!@#$%^&*"
    ];
    
    let password = "";
    
    // Garante pelo menos um de cada set
    sets.forEach(set => {
      password += set[Math.floor(Math.random() * set.length)];
    });

    // Preenche o restante até atingir o tamanho desejado
    const allChars = sets.join("");
    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Embaralha a senha final
    return password.split('').sort(() => 0.5 - Math.random()).join('');
  }
}
