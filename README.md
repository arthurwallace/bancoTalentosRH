# Projeto de cadastro de candidatos

Este é um projeto simples de cadastro de candidatos usando a plataforma AWS Lambda e o banco de dados DynamoDB. O objetivo é fornecer uma API para cadastro de candidatos e listar candidatos de um mock de dados pré-configurado.

## Tecnologias usadas

As seguintes tecnologias foram usadas neste projeto:

- Serverless
- Node.js
- TypeScript
- AWS Lambda
- AWS DynamoDB


## Como rodar o projeto

Para rodar o projeto localmente, siga os seguintes passos:

1. Clone este repositório
2. Certifique-se de ter o Node.js instalado em sua máquina
3. Instale as dependências do projeto rodando o comando `npm install`
4. Inicie o servidor localmente rodando o comando `sls offline start`
5. Use uma ferramenta como o Postman para testar as rotas disponíveis. A rota base é `http://localhost:3000`

Lembre-se de configurar suas credenciais da AWS antes de fazer deploy do projeto em produção.


## Rotas Disponíveis

As seguintes rotas estão disponíveis:

##### - POST /candidatos
Cadastra um novo candidato. É necessário enviar um objeto JSON com a seguinte estrutura:

```json
{
  "dadosPessoais": {
    "nome": string,
    "email": string,
    "telefone": string,
    "linkedin": string (opcional)
  },
  "senioridade": "estágio" | "júnior" | "pleno" | "sênior",
  "skills": string[]
}
```

##### - GET /candidatos
Retorna a lista de candidatos cadastrados. Atualmente, essa lista é gerada a partir de um mock de dados pré-configurado.

 ```json
{
    "candidadoID": "9a7bf4b0-0ffd-4a57-9d7a-f1de75d16f3f",
    "dadosPessoais": {
      "nome": "Bruno Silva",
      "telefone": "(31) 99999-9999",
      "linkedin": "https://www.linkedin.com/in/brunosilva/",
      "email": "brunosilva@gmail.com"
    },
    "senioridade": "sênior",
    "skills": [
      "java",
      "spring",
      "sql",
      "mongodb",
      "kafka"
    ]
  }
  
```

##### - GET /buscarCandidatos
Retorna uma lista de candidatos que atendam aos critérios de busca especificados nos parâmetros da requisição.

##### Parâmentros
- `senioridade`: (opcional) String que define a senioridade desejada do candidato.
- `skills`: (opcional) String que define as habilidades desejadas do candidato. Deve ser uma lista separada por vírgulas.


##### Exexmplo de retorno
`GET /buscar?senioridade=pleno&skills=react`
 ```json
[
  {
    "candidadoID": "c5b46413-bd53-43b7-a187-f0534edf0ba8",
    "dadosPessoais": {
        "nome": "Carla Santos",
        "telefone": "(11) 99999-9999",
        "linkedin": "https://www.linkedin.com/in/carlasantos/",
        "email": "carlasantos@gmail.com"
    },
    "senioridade": "pleno",
    "skills": [
      "javascript",
      "react",
      "node.js",
      "mysql",
      "mongodb"
    ],
    "compatibilidade": "100%"
  },
  {
    "candidadoID": "83fa019c-0f1c-4759-a4f7-f51cee7348c0",
    "dadosPessoais": {
        "nome": "Lucas Rodrigues",
        "telefone": "(11) 99999-9999",
        "linkedin": "https://www.linkedin.com/in/lucasrodrigues/",
        "email": "lucasrodrigues@gmail.com"
    },
    "senioridade": "pleno",
    "skills": [
      "javascript",
      "react",
      "node.js",
      "sql",
      "nosql"
    ],
    "compatibilidade": "100%"
  }
]
  
```



Este projeto foi desenvolvido por Arthur Wallace faz parte do desafio técnico para a vaga de desenvolvedor na Itera.

