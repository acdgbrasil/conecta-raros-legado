Então, use para mim o @tooling/docker/ Para mim para criar algumas coisas. Primeiro quero separar completamente algumas coisas... Primeiro quero criar várias versões de ambientes:
  local -> Onde tudo roda na maquina ATUAL da pessoa, porém a infra (Banco de dados, Brokers e etc ) Rodam em um ambiente especifico para o desenvolvedor poder debugar seu codigo, usar hot-reload e tudo mais sem mais preocupações.
  simulate-cloud (Terá um para cada situação ou maquina ) -> Um ambiente que será um clone do servidor... onde o objetivo dele é criar vários "simuladores" dos ambientes reais para o desenvolvedor ter a tranquilidade de saber que suas
  modificações rodam perfeitamente em um abiente que o servidor usará.
  homologação -> Um ambiente completo para os Q.As, testes e hackers eticos possam achar falhas sem comprometer as outras situações
  CI/CD -> Um ambiente para testes automatizados e qualidade de CI/CD
  Prods -> Ambientes de produção controlados por versionamentos para serem subidos para produções.

  Conseguimos isso?