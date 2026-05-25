"use client";

import { ArrowLeft, ArrowRight, ImageIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import Link from "next/link";
import * as yup from "yup";
import Swal from "sweetalert2";

type OccurrenceFormData = {
  title: string;
  description: string;
  cep: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  date: string;
  urgency: string;
  image?: FileList;
};

type OccurrenceFormProps = {
  backHref: string;
};

const occurrenceSchema: yup.ObjectSchema<OccurrenceFormData> = yup.object({
  title: yup
    .string()
    .required("Informe o título da ocorrência.")
    .min(5, "O título deve ter pelo menos 5 caracteres."),

  description: yup
    .string()
    .required("Informe a descrição do problema.")
    .min(10, "A descrição deve ter pelo menos 10 caracteres."),

  cep: yup
    .string()
    .required("Informe o CEP.")
    .matches(/^\d{5}-?\d{3}$/, "Informe um CEP válido."),

  logradouro: yup.string().required("Informe o logradouro."),

  numero: yup.string().required("Informe o número."),

  bairro: yup.string().required("Informe o bairro."),

  cidade: yup.string().required("Informe a cidade."),

  estado: yup
    .string()
    .required("Informe o estado.")
    .length(2, "Use a sigla do estado com 2 letras."),

  date: yup.string().required("Informe a data da ocorrência."),

  urgency: yup.string().required("Selecione o grau de urgência."),

  image: yup.mixed<FileList>().optional(),
});

const cleanCep = (value: string) => {
  return value.replace(/\D/g, "");
};

const formatCep = (value: string) => {
  const onlyNumbers = cleanCep(value);

  if (onlyNumbers.length <= 5) {
    return onlyNumbers;
  }

  return `${onlyNumbers.slice(0, 5)}-${onlyNumbers.slice(5, 8)}`;
};

const OccurrenceForm = ({ backHref }: OccurrenceFormProps) => {
  const {
    register,
    handleSubmit,
    setValue,
    setFocus,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OccurrenceFormData>({
    resolver: yupResolver(occurrenceSchema),
    defaultValues: {
      title: "",
      description: "",
      cep: "",
      logradouro: "",
      numero: "",
      bairro: "",
      cidade: "",
      estado: "",
      date: "",
      urgency: "",
    },
  });

  const cepValue = watch("cep");

  const router = useRouter();

  const handleCepChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const formattedCep = formatCep(event.target.value);
    const onlyNumbersCep = cleanCep(formattedCep);

    setValue("cep", formattedCep, {
      shouldValidate: true,
      shouldDirty: true,
    });

    if (onlyNumbersCep.length !== 8) {
      return;
    }

    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${onlyNumbersCep}/json/`,
      );

      const data = await response.json();

      if (data.erro) {
        alert("CEP não encontrado.");
        return;
      }

      setValue("logradouro", data.logradouro ?? "", {
        shouldValidate: true,
      });

      setValue("bairro", data.bairro ?? "", {
        shouldValidate: true,
      });

      setValue("cidade", data.localidade ?? "", {
        shouldValidate: true,
      });

      setValue("estado", data.uf ?? "", {
        shouldValidate: true,
      });

      setFocus("numero");
    } catch {
      alert("Erro ao buscar o CEP. Tente novamente.");
    }
  };

  const sleep = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  const onSubmit = async (data: OccurrenceFormData) => {
    await sleep(3000);

    const occurrence = {
      id: crypto.randomUUID(),
      titulo: data.title,
      descricao: data.description,
      endereco: {
        cep: data.cep,
        logradouro: data.logradouro,
        numero: data.numero,
        bairro: data.bairro,
        cidade: data.cidade,
        estado: data.estado,
      },
      dataOcorrencia: data.date,
      urgencia: data.urgency,
      imagem: data.image?.[0]?.name ?? null,
      status: "Criada",
      criadoEm: new Date().toISOString(),
    };

    console.log("Solicitação criada:", occurrence);

    await Swal.fire({
      icon: "success",
      title: "Solicitação criada com sucesso!",
      text: "Sua ocorrência foi registrada e será analisada pela equipe responsável.",
      confirmButtonText: "OK",
      confirmButtonColor: "#172554",
    });

    reset();
    router.push("/servicos");
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-4 flex flex-col gap-3"
    >
      <div>
        <label className="mb-1 block text-sm font-medium text-blue-950">
          Título da Ocorrência
        </label>

        <input
          type="text"
          placeholder="Relate a ocorrência"
          className="h-10 w-full rounded-md border border-zinc-400 bg-white px-3 text-sm outline-none placeholder:text-zinc-400 focus:border-blue-800"
          {...register("title")}
        />

        {errors.title && (
          <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-blue-950">
          Descrição do Problema
        </label>

        <textarea
          placeholder="Descreva aqui o problema"
          className="min-h-20 w-full resize-none rounded-md border border-zinc-400 bg-white px-3 py-2 text-sm outline-none placeholder:text-zinc-400 focus:border-blue-800"
          {...register("description")}
        />

        {errors.description && (
          <p className="mt-1 text-xs text-red-600">
            {errors.description.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-blue-950">
          CEP
        </label>

        <input
          type="text"
          placeholder="Digite o CEP"
          maxLength={9}
          value={cepValue}
          className="h-10 w-full rounded-md border border-zinc-400 bg-white px-3 text-sm outline-none placeholder:text-zinc-400 focus:border-blue-800"
          {...register("cep")}
          onChange={handleCepChange}
        />

        {errors.cep && (
          <p className="mt-1 text-xs text-red-600">{errors.cep.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-blue-950">
          Logradouro
        </label>

        <input
          type="text"
          placeholder="Rua, avenida, travessa..."
          className="h-10 w-full rounded-md border border-zinc-400 bg-white px-3 text-sm outline-none placeholder:text-zinc-400 focus:border-blue-800"
          {...register("logradouro")}
        />

        {errors.logradouro && (
          <p className="mt-1 text-xs text-red-600">
            {errors.logradouro.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-blue-950">
          Número
        </label>

        <input
          type="text"
          placeholder="Digite o número"
          className="h-10 w-full rounded-md border border-zinc-400 bg-white px-3 text-sm outline-none placeholder:text-zinc-400 focus:border-blue-800"
          {...register("numero")}
        />

        {errors.numero && (
          <p className="mt-1 text-xs text-red-600">{errors.numero.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-blue-950">
          Bairro
        </label>

        <input
          type="text"
          placeholder="Bairro"
          className="h-10 w-full rounded-md border border-zinc-400 bg-white px-3 text-sm outline-none placeholder:text-zinc-400 focus:border-blue-800"
          {...register("bairro")}
        />

        {errors.bairro && (
          <p className="mt-1 text-xs text-red-600">{errors.bairro.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-blue-950">
            Cidade
          </label>

          <input
            type="text"
            placeholder="Cidade"
            className="h-10 w-full rounded-md border border-zinc-400 bg-white px-3 text-sm outline-none placeholder:text-zinc-400 focus:border-blue-800"
            {...register("cidade")}
          />

          {errors.cidade && (
            <p className="mt-1 text-xs text-red-600">{errors.cidade.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-blue-950">
            Estado
          </label>

          <input
            type="text"
            placeholder="UF"
            maxLength={2}
            className="h-10 w-full rounded-md border border-zinc-400 bg-white px-3 text-sm uppercase outline-none placeholder:text-zinc-400 focus:border-blue-800"
            {...register("estado")}
          />

          {errors.estado && (
            <p className="mt-1 text-xs text-red-600">{errors.estado.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-blue-950">
          Data da Ocorrência
        </label>

        <input
          type="date"
          className="h-10 w-full rounded-md border border-zinc-400 bg-white px-3 text-sm outline-none placeholder:text-zinc-400 focus:border-blue-800"
          {...register("date")}
        />

        {errors.date && (
          <p className="mt-1 text-xs text-red-600">{errors.date.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-blue-950">
          Imagem
        </label>

        <label className="flex h-24 w-full cursor-pointer flex-col items-center justify-center rounded-md border border-zinc-400 bg-zinc-100 text-zinc-500">
          <ImageIcon className="h-6 w-6" />
          <span className="mt-1 text-sm">Anexar Imagem</span>

          <input
            type="file"
            accept="image/*"
            className="hidden"
            {...register("image")}
          />
        </label>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-blue-950">
          Grau de Urgência
        </label>

        <select
          defaultValue=""
          className="h-10 w-full rounded-md border border-zinc-400 bg-white px-3 text-sm text-zinc-500 outline-none focus:border-blue-800"
          {...register("urgency")}
        >
          <option value="" disabled>
            Qual o grau de urgência?
          </option>
          <option value="baixo">Baixo</option>
          <option value="medio">Médio</option>
          <option value="alto">Alto</option>
          <option value="critico">Crítico</option>
        </select>

        {errors.urgency && (
          <p className="mt-1 text-xs text-red-600">{errors.urgency.message}</p>
        )}
      </div>

      <p className="mt-20 text-xs leading-relaxed text-blue-500">
        A urgência ajuda a equipe a priorizar a análise da solicitação, mas o
        prazo de atendimento pode variar conforme avaliação técnica.
      </p>

      <div className="mt-4 flex items-center justify-between">
        <Link
          href={backHref}
          className="flex items-center gap-2 text-sm text-blue-950"
        >
          <ArrowLeft className="h-4 w-4" />
          voltar
        </Link>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 rounded-md bg-blue-950 px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          )}

          {isSubmitting ? "Registrando..." : "Continuar"}

          {!isSubmitting && <ArrowRight className="h-4 w-4" />}
        </button>
      </div>
    </form>
  );
};

export default OccurrenceForm;
