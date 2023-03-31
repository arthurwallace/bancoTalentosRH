import * as yup from "yup";

export const schemaCandidato = yup.object().shape({
    dadosPessoais: yup.object().shape({
        nome: yup.string().required(),
        email: yup.string().email().required(),
        telefone: yup.string().required(),
        linkedin: yup.string().url(),
    }),
    senioridade: yup.string().oneOf(["estágio", "júnior", "pleno", "sênior"]).required(),
    skills: yup.array().of(yup.string().required()).min(1).required(),
});

export const schemaBuscaCandidatos = yup.object().shape({
    senioridade: yup.string(),
    skills: yup.string(),
});