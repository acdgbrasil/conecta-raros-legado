

export const HTTP_STATUS = {
  "5XX": {
    "INTERNAL_SERVER_ERROR": {
      code: 500,
      message: "Internal Server Error",
      description: "O servidor encontrou uma situação com a qual não sabe lidar."
    },
    "NOT_IMPLEMENTED": {
      code: 501,
      message: "Not Implemented",
      description: "O método da requisição não é suportado pelo servidor e não pode ser manipulado. Os únicos métodos que servidores devem suportar (e portanto não devem retornar este código) são GET e HEAD."
    },
    "BAD_GATEWAY": {
      code: 502,
      message: "Bad Gateway",
      description: "Essa resposta de erro significa que o servidor, enquanto trabalhava como um gateway para obter uma resposta necessária para lidar com a solicitação, obteve uma resposta inválida."
    },
    "SERVICE_UNAVAILABLE": {
      code: 503,
      message: "Service Unavailable",
      description: "O servidor não está pronto para manipular a requisição Causas comuns são um servidor em manutenção ou sobrecarregado. Note que junto a esta resposta, uma página amigável explicando o problema deveria ser enviada. Esta resposta deve ser usada para condições temporárias e o cabeçalho HTTP Retry-After deverá, se possível, conter o tempo estimado para recuperação do serviço. O webmaster deve também tomar cuidado com os cabeçalhos relacionados com o cache que são enviados com esta resposta, já que estas respostas de condições temporárias normalmente não deveriam ser postas em cache."
    },
    "GATEWAY_TIMEOUT": {
      code: 504,
      message: "Gateway Timeout",
      description: "Essa resposta de erro é fornecida quando o servidor está atuando como um gateway e não consegue obter uma resposta a tempo."
    },
    "HTTP_VERSION_NOT_SUPPORTED": {
      code: 505,
      message: "HTTP Version Not Supported",
      description: "A versão HTTP usada na requisição não é suportada pelo servidor."
    },
    "VARIANT_ALSO_NEGOTIATES": {
      code: 506,
      message: "Variant Also Negotiates",
      description: "O servidor tem um erro de configuração interna: o recurso variante escolhido está configurado para se envolver em negociação de conteúdo transparente e, portanto, não é um ponto final adequado no processo de negociação."
    },
    "INSUFFICIENT_STORAGE": {
      code: 507,
      message: "Insufficient Storage (WebDAV)",
      description: "O método não pôde ser executado no recurso porque o servidor não pode armazenar a representação necessária para concluir a solicitação com êxito."
    },
    "LOOP_DETECTED": {
      code: 508,
      message: "Loop Detected (WebDAV)",
      description: "O servidor detectou um loop infinito ao processar a solicitação."
    },
    "NOT_EXTENDED": {
      code: 510,
      message: "Not Extended",
      description: "Extensões adicionais à solicitação são necessárias para que o servidor a atenda."
    },
    "NETWORK_AUTHENTICATION_REQUIRED": {
      code: 511,
      message: "Network Authentication Required",
      description: "Indica que o cliente precisa se autenticar para obter acesso à rede."
    }
  },
  "4XX": {
    "BAD_REQUEST": {
      code: 400,
      message: "Bad Request",
      description: "O servidor não pode ou não irá processar a solicitação devido a algo que é percebido como um erro do cliente (por exemplo, sintaxe de solicitação malformada, enquadramento de mensagem de solicitação inválida ou roteamento de solicitação enganosa)."
    },
    "UNAUTHORIZED": {
      code: 401,
      message: "Unauthorized",
      description: "Embora o padrão HTTP especifique \"unauthorized\", semanticamente, essa resposta significa \"unauthenticated\". Ou seja, o cliente deve se autenticar para obter a resposta solicitada."
    },
    "PAYMENT_REQUIRED_EXPERIMENTAL": {
      code: 402,
      message: "Payment Required Experimental",
      description: "Este código de resposta está reservado para uso futuro. O objetivo inicial da criação deste código era usá-lo para sistemas digitais de pagamento, no entanto, este código de status é usado raramente e não existe nenhuma convenção padrão."
    },
    "FORBIDDEN": {
      code: 403,
      message: "Forbidden",
      description: "O cliente não tem direitos de acesso ao conteúdo; ou seja, não é autorizado, portanto o servidor está se recusando a fornecer o recurso solicitado. Ao contrário do 401 Unauthorized, a identidade do cliente é conhecida pelo servidor."
    },
    "NOT_FOUND": {
      code: 404,
      message: "Not Found",
      description: "O servidor não pode encontrar o recurso solicitado. No navegador, isso significa que o URL não é reconhecido. Em uma API, isso também pode significar que o endpoint é válido, mas o próprio recurso não existe. Os servidores também podem enviar esta resposta em vez de 403 Forbidden para ocultar a existência de um recurso de um cliente não autorizado. Este código de resposta é provavelmente o mais conhecido devido à sua ocorrência frequente na web."
    },
    "METHOD_NOT_ALLOWED": {
      code: 405,
      message: "Method Not Allowed",
      description: "O método de solicitação é conhecido pelo servidor, mas não é suportado pelo recurso de destino. Por exemplo, uma API pode não permitir chamar DELETE para remover um recurso."
    },
    "NOT_ACCEPTABLE": {
      code: 406,
      message: "Not Acceptable",
      description: "Esta resposta é enviada quando o servidor web, após realizar negociação de conteúdo orientada pelo servidor, não encontra nenhum conteúdo que esteja em conformidade com os critérios fornecidos por o agente do usuário."
    },
    "PROXY_AUTHENTICATION_REQUIRED": {
      code: 407,
      message: "Proxy Authentication Required",
      description: "É semelhante a 401 Unauthorized, mas a autenticação precisa ser feita por um proxy."
    },
    "REQUEST_TIMEOUT": {
      code: 408,
      message: "Request Timeout",
      description: "Esta resposta é enviada por alguns servidores em uma conexão ociosa, mesmo sem qualquer requisição prévia pelo cliente. Isso significa que o servidor gostaria de desligar esta conexão não utilizada. Essa resposta é muito mais usada, pois alguns navegadores, como Chrome, Firefox 27+ ou IE9, usam mecanismos de pré-conexão HTTP para acelerar a navegação. Observe também que alguns servidores simplesmente encerram a conexão sem enviar esta mensagem."
    },
    "CONFLICT": {
      code: 409,
      message: "Conflict",
      description: "Esta resposta será enviada quando uma requisição conflitar com o estado atual do servidor."
    },
    "GONE": {
      code: 410,
      message: "Gone",
      description: "Esta resposta é enviada quando o conteúdo solicitado foi excluído permanentemente do servidor, sem endereço de encaminhamento. Espera-se que os clientes removam seus caches e links para o recurso. A especificação HTTP pretende que esse código de status seja usado para \"serviços promocionais por tempo limitado\". As APIs não devem se sentir compelidas a indicar recursos que foram excluídos com esse código de status."
    },
    "LENGTH_REQUIRED": {
      code: 411,
      message: "Length Required",
      description: "O servidor rejeitou a solicitação porque o campo de cabeçalho Content-Length não está definido e o servidor o exige."
    },
    "PRECONDITION_FAILED": {
      code: 412,
      message: "Precondition Failed",
      description: "O cliente indicou nos seus cabeçalhos pré-condições que o servidor não atende."
    },
    "PAYLOAD_TOO_LARGE": {
      code: 413,
      message: "Payload Too Large",
      description: "A entidade requisição é maior do que os limites definidos pelo servidor. O servidor pode fechar a conexão ou retornar um campo de cabeçalho Retry-After."
    },
    "URI_TOO_LONG": {
      code: 414,
      message: "URI Too Long",
      description: "O URI solicitado pelo cliente é mais longo do que o servidor está disposto a interpretar."
    },
    "UNSUPPORTED_MEDIA_TYPE": {
      code: 415,
      message: "Unsupported Media Type",
      description: "O formato de mídia dos dados requisitados não é suportado pelo servidor, portanto, o servidor está rejeitando a requisição."
    },
    "RANGE_NOT_SATISFIABLE": {
      code: 416,
      message: "Range Not Satisfiable",
      description: "O intervalo especificado pelo campo de cabeçalho Range na solicitação não pode ser atendido. É possível que o intervalo esteja fora do tamanho dos dados do URI de destino."
    },
    "EXPECTATION_FAILED": {
      code: 417,
      message: "Expectation Failed",
      description: "Este código de resposta significa que a expectativa indicada pelo campo de cabeçalho de solicitação Expect não pode ser atendida pelo servidor."
    },
    "IM_A_TEAPOT": {
      code: 418,
      message: "I'm a teapot",
      description: "O servidor recusa a tentativa de coar café num bule de chá."
    },
    "MISDIRECTED_REQUEST": {
      code: 421,
      message: "Misdirected Request",
      description: "A requisição foi direcionada a um servidor inapto a produzir a resposta. Pode ser enviado por um servidor que não está configurado para produzir respostas para a combinação de esquema e autoridade inclusas na URI da requisição."
    },
    "UNPROCESSABLE_CONTENT": {
      code: 422,
      message: "Unprocessable Content (WebDAV)",
      description: "A solicitação foi bem formada, mas não pôde ser atendida devido a erros semânticos."
    },
    "LOCKED": {
      code: 423,
      message: "Locked (WebDAV)",
      description: "O recurso que está sendo acessado está bloqueado."
    },
    "FAILED_DEPENDENCY": {
      code: 424,
      message: "Failed Dependency (WebDAV)",
      description: "A solicitação falhou devido à falha de uma solicitação anterior."
    },
    "TOO_EARLY_EXPERIMENTAL": {
      code: 425,
      message: "Too Early Experimental",
      description: "Indica que o servidor não está disposto a correr o risco de processar uma solicitação que pode ser repetida."
    },
    "UPGRADE_REQUIRED": {
      code: 426,
      message: "Upgrade Required",
      description: "O servidor se recusa a executar a solicitação usando o protocolo atual, mas pode estar disposto a fazê-lo depois que o cliente atualizar para um protocolo diferente. O servidor envia um cabeçalho Upgrade em uma resposta 426 para indicar os protocolos necessários."
    },
    "PRECONDITION_REQUIRED": {
      code: 428,
      message: "Precondition Required",
      description: "O servidor de origem exige que a solicitação seja condicional. Esta resposta destina-se a prevenir o problema de 'atualização perdida', onde um cliente pega (GET) o estado de um recurso, o modifica e o coloca (PUT) de volta no servidor, quando entretanto um terceiro modificou o estado no servidor, levando a um conflito."
    },
    "TOO_MANY_REQUESTS": {
      code: 429,
      message: "Too Many Requests",
      description: "O usuário enviou muitas requisições num dado tempo (\"limitação de frequência\")."
    },
    "REQUEST_HEADER_FIELDS_TOO_LARGE": {
      code: 431,
      message: "Request Header Fields Too Large",
      description: "O servidor não está disposto a processar a solicitação porque seus campos de cabeçalho são muito grandes. A solicitação pode ser reenviada após reduzir o tamanho dos campos do cabeçalho da solicitação."
    },
    "UNAVAILABLE_FOR_LEGAL_REASONS": {
      code: 451,
      message: "Unavailable For Legal Reasons",
      description: "O agente do usuário solicitou um recurso que não pode ser fornecido legalmente, como uma página da Web censurada por um governo."
    }
  },
  "3XX": {
    "MULTIPLE_CHOICES": {
      code: 300,
      message: "Multiple Choices",
      description: "A solicitação tem mais de uma resposta possível. O agente do usuário ou usuário deve escolher um deles. (Não há uma maneira padronizada de escolher uma das respostas, mas links HTML para as possibilidades são recomendados para que o usuário possa escolher)."
    },
    "MOVED_PERMANENTLY": {
      code: 301,
      message: "Moved Permanently",
      description: "A URL do recurso solicitado foi alterada permanentemente. A nova URL é fornecida na resposta."
    },
    "FOUND": {
      code: 302,
      message: "Found",
      description: "Este código de resposta significa que o URI do recurso solicitado foi alterado temporariamente. Outras alterações no URI podem ser feitas no futuro. Portanto, esta mesma URI deve ser utilizada pelo cliente em requisições futuras."
    },
    "SEE_OTHER": {
      code: 303,
      message: "See Other",
      description: "O servidor enviou esta resposta para direcionar o cliente a obter o recurso solicitado em outro URI com uma solicitação GET."
    },
    "NOT_MODIFIED": {
      code: 304,
      message: "Not Modified",
      description: "É usado para fins de cache. Ele informa ao cliente que a resposta não foi modificada, portanto, o cliente pode continuar a usar a mesma versão em cache da resposta."
    },
    "USE_PROXY_DEPRECATED": {
      code: 305,
      message: "Use Proxy Deprecated",
      description: "Definido em uma versão anterior da especificação HTTP para indicar que uma resposta solicitada deve ser acessada por um proxy. Foi descontinuado devido a questões de segurança em relação à configuração em banda de um proxy."
    },
    "UNUSED_DEPRECATED": {
      code: 306,
      message: "unused Deprecated",
      description: "Esse código de resposta não é mais usado, é apenas reservado. Foi usado em uma versão anterior da especificação HTTP/1.1."
    },
    "TEMPORARY_REDIRECT": {
      code: 307,
      message: "Temporary Redirect",
      description: "O servidor envia esta resposta para direcionar o cliente a obter o recurso solicitado em outra URI com o mesmo método usado na solicitação anterior. Tem a mesma semântica do código de resposta HTTP 302 Found, com a exceção de que o agente do usuário não deve alterar o método HTTP usado: se um POST foi usado na primeira solicitação, um POST deve ser usado no segundo pedido."
    },
    "PERMANENT_REDIRECT": {
      code: 308,
      message: "Permanent Redirect",
      description: "Isso significa que o recurso agora está permanentemente localizado em outro URI, especificado pelo cabeçalho de resposta HTTP Location:. Isso tem a mesma semântica que o código de resposta HTTP 301 Moved Permanently, com a exceção de que o agente do usuário não deve alterar o método HTTP usado: se um POST foi usado na primeira solicitação, um POST deve ser usado no segundo pedido."
    }
  },
  "2XX": {
    "OK": {
      code: 200,
      message: "OK",
      description: "A solicitação foi bem-sucedida. O significado do resultado de \"sucesso\" depende do método HTTP:"
    },
    "CREATED": {
      code: 201,
      message: "Created",
      description: "A requisição foi bem sucedida e um novo recurso foi criado como resultado. Esta é normalmente a resposta enviada após as solicitações POST ou algumas solicitações PUT."
    },
    "ACCEPTED": {
      code: 202,
      message: "Accepted",
      description: "A solicitação foi recebida, mas ainda não foi atendida. É sem compromisso, pois não há como no HTTP enviar posteriormente uma resposta assíncrona indicando o resultado da solicitação. Destina-se a casos em que outro processo ou servidor manipula a solicitação ou processamento em lote."
    },
    "NON_AUTHORITATIVE_INFORMATION": {
      code: 203,
      message: "Non-Authoritative Information",
      description: "Esse código de resposta significa que os metadados retornados não são exatamente os mesmos que estão disponíveis no servidor de origem, mas são coletados de uma cópia local ou de terceiros. Isso é usado principalmente para espelhos ou backups de outro recurso. Exceto para esse caso específico, a resposta 200 OK é preferida a este status."
    },
    "NO_CONTENT": {
      code: 204,
      message: "No Content",
      description: "Não há conteúdo para enviar para esta solicitação, mas os cabeçalhos podem ser úteis. O agente do usuário pode atualizar seus cabeçalhos em cache para este recurso com os novos."
    },
    "RESET_CONTENT": {
      code: 205,
      message: "Reset Content",
      description: "Diz ao agente do usuário para redefinir o documento que enviou esta solicitação."
    },
    "PARTIAL_CONTENT": {
      code: 206,
      message: "Partial Content",
      description: "Este código de resposta é usado quando o cabeçalho Range é enviado do cliente para solicitar apenas parte de um recurso."
    },
    "MULTI_STATUS": {
      code: 207,
      message: "Multi-Status (WebDAV)",
      description: "Transmite informações sobre vários recursos, para situações em que vários códigos de status podem ser apropriados."
    },
    "ALREADY_REPORTED": {
      code: 208,
      message: "Already Reported (WebDAV)",
      description: "Usado dentro de um elemento de resposta <dav:propstat> para evitar enumerar repetidamente os membros internos de várias ligações para a mesma coleção."
    },
    "IM_USED": {
      code: 226,
      message: "IM Used (HTTP Delta encoding)",
      description: "O servidor atendeu a uma solicitação GET para o recurso e a resposta é uma representação do resultado de uma ou mais manipulações de instância aplicadas à instância atual."
    }
  },
  "1XX": {
    "CONTINUE": {
      code: 100,
      message: "Continue",
      description: "Essa resposta provisória indica que o cliente deve continuar a solicitação ou ignorar a resposta se a solicitação já estiver concluída."
    },
    "SWITCHING_PROTOCOLS": {
      code: 101,
      message: "Switching Protocols",
      description: "Esse código é enviado em resposta a um cabeçalho de solicitação Upgrade do cliente e indica o protocolo para o qual o servidor está mudando."
    },
    "PROCESSING": {
      code: 102,
      message: "Processing (WebDAV)",
      description: "Este código indica que o servidor recebeu e está processando a requisição, mas nenhuma resposta está disponível ainda."
    },
    "EARLY_HINTS_EXPERIMENTAL": {
      code: 103,
      message: "Early Hints Experimental",
      description: "Este código de status destina-se principalmente a ser usado com o cabeçalho Link, permitindo que o agente do usuário inicie o pré-carregamento recursos enquanto o servidor prepara uma resposta."
    }
  }
};
