import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import AWS from 'aws-sdk'
import { v4 } from "uuid";
import * as yup from "yup";
import { schemaCandidato, schemaBuscaCandidatos } from "./schemas";
import { mockCandidatos } from "./mockCandidatos";
import { handleError } from "./errorHandling";

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


export const cadastrarCandidato = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const reqBody = JSON.parse(event.body as string);

    await schemaCandidato.validate(reqBody, { abortEarly: false });

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




export const buscarCandidatos = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {

    const { senioridade, skills } = await schemaBuscaCandidatos.validate(event.queryStringParameters, {
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

    const resultado = candidatos.map((candidato: { skills: never[]; candidadoID: any; dadosPessoais: any; senioridade: any; }) => {
      const candidatoSkills = candidato.skills || [];
      const numSkillsMatch = candidatoSkills.filter((skill: any) => skillsList.includes(skill)).length;
      const compatibilidade = Math.round((numSkillsMatch / skillsList.length) * 100);

      return {
        candidadoID: candidato.candidadoID,
        dadosPessoais: candidato.dadosPessoais,
        senioridade: candidato.senioridade,
        skills: candidato.skills,
        compatibilidade,
      };
    })
    .sort((a: { compatibilidade: number }, b: { compatibilidade: number }) => b.compatibilidade - a.compatibilidade)
    .map((candidato: { compatibilidade: number }) => {
      return {
        ...candidato,
        compatibilidade: `${candidato.compatibilidade}%`,
      };
    });
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(resultado),
    };
  } catch (e) {
    return handleError(e);
  }
};





export const mockDados = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {

    let candidatos = mockCandidatos;

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

