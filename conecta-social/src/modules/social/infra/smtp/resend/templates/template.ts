export const templateNewUser = (initalPass:string) => `
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <title>Cadastro Realizado</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f5f6fa;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background-color: #ffffff;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        overflow: hidden;
      }
      .header {
        background-color: #4f46e5;
        color: #ffffff;
        text-align: center;
        padding: 20px 0;
      }
      .content {
        padding: 30px;
        color: #333333;
      }
      .content h2 {
        margin-top: 0;
        color: #4f46e5;
      }
      .password-box {
        background-color: #f1f5f9;
        border: 1px solid #cbd5e1;
        padding: 12px 16px;
        font-size: 18px;
        font-weight: bold;
        margin: 20px 0;
        border-radius: 4px;
        font-family: monospace;
        color: #1e293b;
      }
      .signature {
        margin-top: 40px;
        font-size: 15px;
        color: #444444;
      }
      .footer {
        text-align: center;
        font-size: 14px;
        color: #888888;
        padding: 20px;
        border-top: 1px solid #e2e8f0;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Cadastro Realizado com Sucesso!</h1>
      </div>
      <div class="content">
        <h2>Bem-vindo(a)!</h2>
        <p>Seu cadastro foi concluído com sucesso. Para sua segurança, recomendamos que altere sua senha imediatamente.</p>

        <p><strong>Sua senha inicial é:</strong></p>
        <div class="password-box">
          ${initalPass}
        </div>

        <p>Você poderá alterar sua senha acessando sua conta no sistema.</p>
        <p>Em caso de dúvidas, estou à disposição para te ajudar.</p>

        <div class="signature">
          Atenciosamente,<br />
          <strong>Gabriel Aderaldo</strong><br />
          Gerente de produto<br />
        </div>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} Envolve. Todos os direitos reservados.
      </div>
    </div>
  </body>
</html>
`


export const templateResetPassword = (expiredCode: string) => `
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <title>Redefinição de Senha</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f5f6fa;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background-color: #ffffff;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        overflow: hidden;
      }
      .header {
        background-color: #e11d48;
        color: #ffffff;
        text-align: center;
        padding: 20px 0;
      }
      .content {
        padding: 30px;
        color: #333333;
      }
      .content h2 {
        margin-top: 0;
        color: #e11d48;
      }
      .code-box {
        background-color: #fef3c7;
        border: 1px solid #facc15;
        padding: 12px 16px;
        font-size: 20px;
        font-weight: bold;
        margin: 20px 0;
        border-radius: 4px;
        font-family: monospace;
        color: #92400e;
        text-align: center;
        letter-spacing: 1px;
      }
      .signature {
        margin-top: 40px;
        font-size: 15px;
        color: #444444;
      }
      .footer {
        text-align: center;
        font-size: 14px;
        color: #888888;
        padding: 20px;
        border-top: 1px solid #e2e8f0;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Redefinição de Senha</h1>
      </div>
      <div class="content">
        <h2>Olá!</h2>
        <p>Você solicitou a redefinição da sua senha. Utilize o código abaixo para completar o processo:</p>

        <div class="code-box">
          ${expiredCode}
        </div>

        <p><strong>Importante:</strong> este código é temporário e expira em poucos minutos.</p>
        <p>Se você não solicitou essa alteração, ignore este e-mail.</p>

        <div class="signature">
          Atenciosamente,<br />
          <strong>Gabriel Aderaldo</strong><br />
          Gerente de produto<br />
        </div>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} Envolve. Todos os direitos reservados.
      </div>
    </div>
  </body>
</html>
`