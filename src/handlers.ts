import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import AWS from 'aws-sdk'
import { v4 } from "uuid";
import * as yup from "yup";

const docClient = new AWS.DynamoDB.DocumentClient(
  {
    region: 'localhost',
    endpoint: 'http://localhost:8000',
    accessKeyId: 'DEFAULT_ACCESS_KEY',
    secretAccessKey: 'DEFAULT_SECRET'
  }
)

const tableName = "CandidatosTable";

const headers = {
  "content-type": "application/json",
};



const schema = yup.object().shape({
  dadosPessoais: yup.object().shape({
    nome: yup.string().required(),
    email: yup.string().email().required(),
    telefone: yup.string().required(),
    linkedin: yup.string().url(),
  }),
  senioridade: yup.string().oneOf(["estágio", "júnior", "pleno", "sênior"]).required(),
  skills: yup.array().of(yup.string().required()).min(1).required(),
});



export const cadastrarCandidato = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const reqBody = JSON.parse(event.body as string);

    await schema.validate(reqBody, { abortEarly: false });

    reqBody.senioridade = reqBody.senioridade.toLowerCase();
    reqBody.skills = reqBody.skills.map((skill: string) => skill.toLowerCase());

    const candidato = {
      ...reqBody,
      candidadoID: v4(),
    };

    await docClient
      .put({
        TableName: tableName,
        Item: candidato,
      })
      .promise();

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify(candidato),
    };
  } catch (e) {
    return handleError(e);
  }
};


export const mockDados = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {

    let candidatos = [
      {
        "dadosPessoais": {
          "nome": "Lucas Rodrigues",
          "email": "lucasrodrigues@gmail.com",
          "telefone": "(11) 99999-9999",
          "linkedin": "https://www.linkedin.com/in/lucasrodrigues/"
        },
        "senioridade": "pleno",
        "skills": [
          "JavaScript",
          "React",
          "Node.js",
          "SQL",
          "NoSQL"
        ]
      },
      {
        "dadosPessoais": {
          "nome": "Juliana Oliveira",
          "email": "julianaoliveira@gmail.com",
          "telefone": "(21) 99999-9999",
          "linkedin": "https://www.linkedin.com/in/julianaoliveira/"
        },
        "senioridade": "júnior",
        "skills": [
          "Python",
          "Django",
          "HTML",
          "CSS",
          "JavaScript"
        ]
      },
      {
        "dadosPessoais": {
          "nome": "Bruno Silva",
          "email": "brunosilva@gmail.com",
          "telefone": "(31) 99999-9999",
          "linkedin": "https://www.linkedin.com/in/brunosilva/"
        },
        "senioridade": "sênior",
        "skills": [
          "Java",
          "Spring",
          "SQL",
          "MongoDB",
          "Kafka"
        ]
      },
      {
        "dadosPessoais": {
          "nome": "Carla Santos",
          "email": "carlasantos@gmail.com",
          "telefone": "(11) 99999-9999",
          "linkedin": "https://www.linkedin.com/in/carlasantos/"
        },
        "senioridade": "pleno",
        "skills": [
          "JavaScript",
          "React",
          "Node.js",
          "MySQL",
          "MongoDB"
        ]
      },
      {
        "dadosPessoais": {
          "nome": "Rafaela Souza",
          "email": "rafaelasouza@gmail.com",
          "telefone": "(21) 99999-9999",
          "linkedin": "https://www.linkedin.com/in/rafaelasouza/"
        },
        "senioridade": "júnior",
        "skills": [
          "PHP",
          "Laravel",
          "HTML",
          "CSS",
          "JavaScript"
        ]
      },
      {
        "dadosPessoais": {
          "nome": "Fernando Oliveira",
          "email": "fernandooliveira@gmail.com",
          "telefone": "(31) 99999-9999",
          "linkedin": "https://www.linkedin.com/in/fernandooliveira/"
        },
        "senioridade": "sênior",
        "skills": [
          "Python",
          "Django",
          "PostgreSQL",
          "Redis",
          "Elasticsearch"
        ]
      }
    ]

    candidatos.map(async (item, i) => {
      item.senioridade = item.senioridade.toLowerCase();
      item.skills = item.skills.map((skill: string) => skill.toLowerCase());
      const candidato = {
        ...item,
        candidadoID: v4(),
      };

      await docClient
        .put({
          TableName: tableName,
          Item: candidato,
        })
        .promise();

    })

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify(candidatos),
    };
  } catch (e) {
    return handleError(e);
  }
};

export const buscaCandidatosSchema = yup.object().shape({
  senioridade: yup.string(),
  skills: yup.string(),
});

export const buscarCandidatos = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {

    const { senioridade, skills } = await buscaCandidatosSchema.validate(event.queryStringParameters, {
      abortEarly: false,
    });

    const skillsList = skills ? skills.replace(/\s/g, '').toLowerCase().split(',') : [];

    const ExpressionAttributeValues: Record<string, string> = {};
    skillsList.forEach((skill, index) => {
      const key = `:skill${index}`;
      ExpressionAttributeValues[key] = skill;
    });

    const scanBuilder = function (senioridade: any, skills: any) {
      if (senioridade && skills.length > 0) {
        ExpressionAttributeValues[':senioridade'] = senioridade.toLowerCase();
        return {
          TableName: tableName,
          FilterExpression: `(contains(skills, ${Object.keys(ExpressionAttributeValues).slice(0, -1).join(') or contains(skills, ')})) and senioridade = :senioridade`,
          ExpressionAttributeValues,
        }
      }
      else if (!senioridade && skills.length > 0) {
        return {
          TableName: tableName,
          FilterExpression: `contains(skills, ${Object.keys(ExpressionAttributeValues).join(') or contains(skills, ')})`,
          ExpressionAttributeValues,
        }
      }
      else if (senioridade && skills.length == 0) {
        ExpressionAttributeValues[':senioridade'] = senioridade.toLowerCase();
        return {
          TableName: tableName,
          FilterExpression: `senioridade = :senioridade`,
          ExpressionAttributeValues,
        }
      }

      return {
        TableName: tableName
      }
    }


    const scanParams = scanBuilder(senioridade, skills);
    console.log(scanParams);
    const result = await docClient.scan(scanParams).promise();

    const candidatos = (<any>result.Items);

    const vagaSkills = skillsList.length;
    const resultado = candidatos.map((candidato: { skills: never[]; }) => {
      const candidatoSkills = candidato.skills || [];
      const numSkillsMatch = candidatoSkills.filter((skill: any) => skillsList.includes(skill)).length;
      const compatibilidade = Math.round((numSkillsMatch / vagaSkills) * 100);

      return {
        ...candidato,
        compatibilidade: `${compatibilidade}%`,
      };
    }).sort((a: { nota: number }, b: { nota: number }) => b.nota - a.nota);;


    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(resultado),
    };
  } catch (e) {
    return handleError(e);
  }
};


export const listarCandidatos = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const output = await docClient
      .scan({
        TableName: tableName,
      })
      .promise();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(output.Items),
    };
  } catch (e) {
    return handleError(e);
  }
};




//Error handling
class HttpError extends Error {
  constructor(public statusCode: number, body: Record<string, unknown> = {}) {
    super(JSON.stringify(body));
  }
}

const handleError = (e: unknown) => {
  if (e instanceof yup.ValidationError) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        errors: e.errors,
      }),
    };
  }

  if (e instanceof SyntaxError) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: `corpo da requisição inválido : "${e.message}"` }),
    };
  }

  if (e instanceof HttpError) {
    return {
      statusCode: e.statusCode,
      headers,
      body: e.message,
    };
  }

  throw e;
};
