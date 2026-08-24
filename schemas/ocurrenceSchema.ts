import * as yup from "yup";

export type OccurrenceFormData = {
  title: string;
  description: string;
  cep: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  urgency: string;
  image?: FileList;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];

export const occurrenceSchema: yup.ObjectSchema<OccurrenceFormData> =
  yup.object({
    title: yup
      .string()
      .trim()
      .required("Informe o título da ocorrência.")
      .min(5, "O título deve ter pelo menos 5 caracteres.")
      .max(80, "O título deve ter no máximo 80 caracteres.")
      .matches(/[a-zA-ZÀ-ÿ]/, "O título precisa conter letras."),

    description: yup
      .string()
      .trim()
      .required("Informe a descrição do problema.")
      .min(10, "A descrição deve ter pelo menos 10 caracteres.")
      .max(500, "A descrição deve ter no máximo 500 caracteres.")
      .matches(/[a-zA-ZÀ-ÿ]/, "A descrição precisa conter texto válido."),

    cep: yup
      .string()
      .required("Informe o CEP.")
      .matches(/^\d{5}-?\d{3}$/, "Informe um CEP válido."),

    logradouro: yup
      .string()
      .trim()
      .required("Informe o logradouro.")
      .min(3, "O logradouro deve ter pelo menos 3 caracteres."),

    numero: yup
      .string()
      .trim()
      .required("Informe o número.")
      .matches(/^[0-9]+[a-zA-ZÀ-ÿ0-9\s/-]*$/, "Informe um número válido."),

    bairro: yup
      .string()
      .trim()
      .required("Informe o bairro.")
      .min(2, "O bairro deve ter pelo menos 2 caracteres."),

    cidade: yup
      .string()
      .trim()
      .required("Informe a cidade.")
      .min(2, "A cidade deve ter pelo menos 2 caracteres.")
      .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Informe uma cidade válida."),

    estado: yup
      .string()
      .trim()
      .uppercase()
      .required("Informe o estado.")
      .length(2, "Use a sigla do estado com 2 letras.")
      .matches(/^[A-Z]{2}$/, "Informe uma UF válida."),

    urgency: yup
      .string()
      .required("Selecione o grau de urgência.")
      .oneOf(
        ["BAIXA", "MEDIA", "ALTA", "CRITICA"],
        "Selecione um grau de urgência válido.",
      ),

    image: yup
      .mixed<FileList>()
      .optional()
      .test("file-size", "A imagem deve ter no máximo 5 MB.", (files) => {
        if (!files || files.length === 0) {
          return true;
        }

        return files[0].size <= MAX_FILE_SIZE;
      })
      .test(
        "file-type",
        "A imagem deve estar em formato JPG, PNG ou WEBP.",
        (files) => {
          if (!files || files.length === 0) {
            return true;
          }

          return allowedImageTypes.includes(files[0].type);
        },
      ),
  });
