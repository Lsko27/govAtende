"use client";

import { ArrowLeft, ArrowRight, ImageIcon, Paperclip } from "lucide-react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";

import {
  occurrenceSchema,
  type OccurrenceFormData,
} from "@/schemas/ocurrenceSchema";

type OccurrenceFormProps = {
  backHref: string;
};

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

  const cepRegister = register("cep");

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

  const labelClass =
    "mb-1 block text-sm font-medium text-blue-950 lg:text-[17px]";

  const inputClass =
    "h-10 w-full rounded-md border border-zinc-400 bg-white px-3 text-sm outline-none placeholder:italic placeholder:text-zinc-400 focus:border-blue-800 lg:h-[29px] lg:rounded-lg";

  const errorClass = "mt-1 text-xs text-red-600";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="
      mt-4 flex flex-col gap-3
      lg:mx-auto lg:mt-10 lg:grid lg:w-[80%] lg:max-w-275
      lg:grid-cols-2 lg:gap-x-3 lg:gap-y-3
    "
    >
      {/* Título */}
      <div>
        <label className={labelClass}>Título</label>

        <input
          type="text"
          placeholder="Relate a ocorrência"
          className={inputClass}
          {...register("title")}
        />

        {errors.title && <p className={errorClass}>{errors.title.message}</p>}
      </div>

      {/* Localização / CEP */}
      <div>
        <label className={labelClass}>
          <span className="lg:hidden">CEP</span>
          <span className="hidden lg:inline">Localização</span>
        </label>

        <input
          type="text"
          placeholder="Digite endereço ou CEP"
          maxLength={9}
          className={inputClass}
          {...cepRegister}
          onChange={(event) => {
            cepRegister.onChange(event);
            handleCepChange(event);
          }}
        />

        {errors.cep && <p className={errorClass}>{errors.cep.message}</p>}
      </div>

      {/* Descrição */}
      <div className="lg:col-span-2">
        <label className={labelClass}>Descrição da Ocorrência</label>

        <textarea
          placeholder="Descreva aqui o problema"
          className="
          min-h-20 w-full resize-none rounded-md border border-zinc-400
          bg-white px-3 py-2 text-sm outline-none
          placeholder:italic placeholder:text-zinc-400
          focus:border-blue-800
          lg:min-h-33.5 lg:rounded-lg
        "
          {...register("description")}
        />

        {errors.description && (
          <p className={errorClass}>{errors.description.message}</p>
        )}
      </div>

      {/* Logradouro */}
      <div className="lg:col-span-2">
        <label className={labelClass}>Logradouro</label>

        <input
          type="text"
          placeholder="Rua, avenida, travessa..."
          className={inputClass}
          {...register("logradouro")}
        />

        {errors.logradouro && (
          <p className={errorClass}>{errors.logradouro.message}</p>
        )}
      </div>

      {/* Número */}
      <div>
        <label className={labelClass}>Número</label>

        <input
          type="text"
          placeholder="Digite o número"
          className={inputClass}
          {...register("numero")}
        />

        {errors.numero && <p className={errorClass}>{errors.numero.message}</p>}
      </div>

      {/* Bairro */}
      <div>
        <label className={labelClass}>Bairro</label>

        <input
          type="text"
          placeholder="Bairro"
          className={inputClass}
          {...register("bairro")}
        />

        {errors.bairro && <p className={errorClass}>{errors.bairro.message}</p>}
      </div>

      {/* Cidade */}
      <div>
        <label className={labelClass}>Cidade</label>

        <input
          type="text"
          placeholder="Cidade"
          className={inputClass}
          {...register("cidade")}
        />

        {errors.cidade && <p className={errorClass}>{errors.cidade.message}</p>}
      </div>

      {/* Estado */}
      <div>
        <label className={labelClass}>Estado</label>

        <input
          type="text"
          placeholder="UF"
          maxLength={2}
          className={`${inputClass} uppercase`}
          {...register("estado")}
          onChange={(event) => {
            setValue("estado", event.target.value.toUpperCase(), {
              shouldValidate: true,
              shouldDirty: true,
            });
          }}
        />

        {errors.estado && <p className={errorClass}>{errors.estado.message}</p>}
      </div>

      {/* Data */}
      <div>
        <label className={labelClass}>Data da Ocorrência</label>

        <input type="date" className={inputClass} {...register("date")} />

        {errors.date && <p className={errorClass}>{errors.date.message}</p>}
      </div>

      {/* Imagem */}
      <div>
        <label className={labelClass}>Imagem</label>

        <label
          className="
          flex h-24 w-full cursor-pointer flex-col items-center
          justify-center rounded-md border border-zinc-400 bg-zinc-100
          text-zinc-500
          lg:h-7.5 lg:flex-row lg:justify-between lg:rounded-lg
          lg:bg-white lg:px-3
        "
        >
          <ImageIcon className="h-6 w-6 lg:hidden" />

          <span className="mt-1 text-sm lg:hidden">Anexar Imagem</span>

          <span className="hidden text-sm italic text-zinc-400 lg:inline">
            Escolher arquivo
          </span>

          <Paperclip className="hidden h-4 w-4 text-blue-600 lg:block" />

          <input
            type="file"
            accept="image/*"
            className="hidden"
            {...register("image")}
          />
        </label>
      </div>

      {/* Urgência */}
      <div>
        <label className={labelClass}>Grau de Urgência</label>

        <select
          defaultValue=""
          className={`${inputClass} text-zinc-500`}
          {...register("urgency")}
        >
          <option value="" disabled>
            Selecione o grau de urgência
          </option>

          <option value="baixo">Baixo</option>
          <option value="medio">Médio</option>
          <option value="alto">Alto</option>
          <option value="critico">Crítico</option>
        </select>

        {errors.urgency && (
          <p className={errorClass}>{errors.urgency.message}</p>
        )}
      </div>

      {/* Observação */}
      <p
        className="
        mt-20 text-xs leading-relaxed text-blue-500
        lg:mt-0 lg:px-3 lg:text-[13px] lg:leading-5
      "
      >
        A urgência ajuda a equipe a priorizar a análise, mas o prazo de
        atendimento pode variar conforme avaliação técnica.
      </p>

      {/* Navegação */}
      <div
        className="
        mt-4 flex items-center justify-between
        lg:col-span-2 lg:mt-3
      "
      >
        <Link
          href={backHref}
          className="
          flex items-center gap-2 text-sm text-blue-950
          lg:text-base lg:font-semibold lg:text-blue-600
        "
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>

        <button
          type="submit"
          disabled={isSubmitting}
          className="
          flex items-center gap-2 rounded-md bg-blue-950 px-5 py-3
          text-sm font-medium text-white
          disabled:cursor-not-allowed disabled:opacity-70
          lg:rounded-lg lg:px-5 lg:text-base
        "
        >
          {isSubmitting && (
            <span
              className="
              h-4 w-4 animate-spin rounded-full border-2
              border-white border-t-transparent
            "
            />
          )}

          {isSubmitting ? "Registrando..." : "Continuar"}

          {!isSubmitting && <ArrowRight className="h-4 w-4" />}
        </button>
      </div>
    </form>
  );
};

export default OccurrenceForm;
