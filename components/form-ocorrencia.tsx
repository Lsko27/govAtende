"use client";

import { ArrowLeft, ArrowRight, ImageIcon, Paperclip } from "lucide-react";
import { Controller, type FieldErrors, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  occurrenceSchema,
  type OccurrenceFormData,
} from "@/schemas/ocurrenceSchema";

type OccurrenceFormProps = {
  backHref: string;
  subservicoId: number;
};

type CreatedRequestResponse = {
  id: number;
};

type ViaCepResponse = {
  cep?: string;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
};

const cleanCep = (value: string) => {
  return value.replace(/\D/g, "");
};

const formatCep = (value: string) => {
  const onlyNumbers = cleanCep(value).slice(0, 8);

  if (onlyNumbers.length <= 5) {
    return onlyNumbers;
  }

  return `${onlyNumbers.slice(0, 5)}-${onlyNumbers.slice(5, 8)}`;
};

const OccurrenceForm = ({ backHref, subservicoId }: OccurrenceFormProps) => {
  const {
    register,
    handleSubmit,
    control,
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
      urgency: "",
    },
  });

  const router = useRouter();
  const cepRegister = register("cep");

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

      if (!response.ok) {
        throw new Error("Não foi possível consultar o CEP.");
      }

      const data = (await response.json()) as ViaCepResponse;

      if (data.erro) {
        await Swal.fire({
          icon: "error",
          title: "CEP não encontrado",
          text: "Verifique o CEP informado e tente novamente.",
          confirmButtonText: "OK",
          confirmButtonColor: "#172554",
        });

        return;
      }

      setValue("logradouro", data.logradouro ?? "", {
        shouldValidate: true,
        shouldDirty: true,
      });

      setValue("bairro", data.bairro ?? "", {
        shouldValidate: true,
        shouldDirty: true,
      });

      setValue("cidade", data.localidade ?? "", {
        shouldValidate: true,
        shouldDirty: true,
      });

      setValue("estado", data.uf ?? "", {
        shouldValidate: true,
        shouldDirty: true,
      });

      setFocus("numero");
    } catch {
      await Swal.fire({
        icon: "error",
        title: "Erro ao consultar CEP",
        text: "Não foi possível buscar o endereço. Tente novamente.",
        confirmButtonText: "OK",
        confirmButtonColor: "#172554",
      });
    }
  };

  const onSubmit = async (data: OccurrenceFormData) => {
    try {
      const response = await fetch("/api/backend/solicitacoes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          titulo: data.title.trim(),
          descricao: data.description.trim(),
          urgencia: data.urgency,
          subservicoId,
          endereco: {
            logradouro: data.logradouro.trim(),
            numero: data.numero.trim(),
            complemento: null,
            bairro: data.bairro.trim(),
            cidade: data.cidade.trim(),
            estado: data.estado.trim().toUpperCase(),
            cep: cleanCep(data.cep),
            latitude: null,
            longitude: null,
          },
        }),
      });

      const responseBody = await response.json().catch(() => null);

      if (response.status === 401 || response.status === 403) {
        router.replace("/");
        router.refresh();
        return;
      }

      if (!response.ok) {
        throw new Error(
          responseBody?.detail ||
            responseBody?.message ||
            "Não foi possível registrar a solicitação.",
        );
      }

      const createdRequest = responseBody as CreatedRequestResponse;

      if (!createdRequest || typeof createdRequest.id !== "number") {
        throw new Error(
          "A solicitação foi enviada, mas o servidor não retornou seu identificador.",
        );
      }

      let attachmentError: string | null = null;
      const selectedImage = data.image?.[0];

      if (selectedImage) {
        const formData = new FormData();

        formData.append("arquivo", selectedImage);

        const attachmentResponse = await fetch(
          `/api/backend/solicitacoes/${createdRequest.id}/anexos`,
          {
            method: "POST",
            body: formData,
          },
        );

        if (
          attachmentResponse.status === 401 ||
          attachmentResponse.status === 403
        ) {
          router.replace("/");
          router.refresh();
          return;
        }

        if (!attachmentResponse.ok) {
          const attachmentBody = await attachmentResponse
            .json()
            .catch(() => null);

          attachmentError =
            attachmentBody?.detail ||
            attachmentBody?.message ||
            "Não foi possível enviar a imagem.";
        }
      }

      if (attachmentError) {
        await Swal.fire({
          icon: "warning",
          title: "Solicitação criada",
          text:
            "A solicitação foi registrada, mas ocorreu um erro " +
            `no envio da imagem: ${attachmentError}`,
          confirmButtonText: "Ver solicitações",
          confirmButtonColor: "#172554",
        });
      } else {
        await Swal.fire({
          icon: "success",
          title: "Solicitação criada com sucesso!",
          text: "Sua ocorrência foi registrada e será analisada.",
          confirmButtonText: "Ver solicitações",
          confirmButtonColor: "#172554",
        });
      }

      reset();

      router.push("/servicos/minhas-solicitacoes");
      router.refresh();
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Erro ao registrar solicitação",
        text:
          error instanceof Error
            ? error.message
            : "Não foi possível registrar a solicitação.",
        confirmButtonText: "OK",
        confirmButtonColor: "#172554",
      });
    }
  };

  const labelClass =
    "mb-1 block text-sm font-medium text-blue-950 lg:text-[17px]";

  const inputClass =
    "h-10 w-full border-zinc-400 bg-white text-sm " +
    "placeholder:italic placeholder:text-zinc-400 " +
    "focus-visible:border-blue-800 focus-visible:ring-blue-800/20 " +
    "lg:h-9 lg:rounded-lg";

  const errorClass = "mt-1 text-xs text-red-600";

  const onInvalid = (formErrors: FieldErrors<OccurrenceFormData>) => {
    console.error("Erros de validação:", formErrors);

    void Swal.fire({
      icon: "error",
      title: "Revise os campos",
      text: "Existem campos inválidos ou não preenchidos no formulário.",
      confirmButtonText: "OK",
      confirmButtonColor: "#172554",
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      className="
        mt-4 flex flex-col gap-3
        lg:mx-auto lg:mt-10 lg:grid lg:w-[80%] lg:max-w-275
        lg:grid-cols-2 lg:gap-x-3 lg:gap-y-3
      "
    >
      {/* Título */}
      <div>
        <Label htmlFor="title" className={labelClass}>
          Título
        </Label>

        <Input
          id="title"
          type="text"
          placeholder="Relate a ocorrência"
          className={inputClass}
          aria-invalid={!!errors.title}
          {...register("title")}
        />

        {errors.title && <p className={errorClass}>{errors.title.message}</p>}
      </div>

      {/* CEP */}
      <div>
        <Label htmlFor="cep" className={labelClass}>
          <span className="lg:hidden">CEP</span>
          <span className="hidden lg:inline">Localização</span>
        </Label>

        <Input
          id="cep"
          type="text"
          inputMode="numeric"
          placeholder="Digite endereço ou CEP"
          maxLength={9}
          className={inputClass}
          aria-invalid={!!errors.cep}
          {...cepRegister}
          onChange={(event) => {
            cepRegister.onChange(event);
            void handleCepChange(event);
          }}
        />

        {errors.cep && <p className={errorClass}>{errors.cep.message}</p>}
      </div>

      {/* Descrição */}
      <div className="lg:col-span-2">
        <Label htmlFor="description" className={labelClass}>
          Descrição da Ocorrência
        </Label>

        <Textarea
          id="description"
          placeholder="Descreva aqui o problema"
          className="
            min-h-20 resize-none border-zinc-400 bg-white text-sm
            placeholder:italic placeholder:text-zinc-400
            focus-visible:border-blue-800 focus-visible:ring-blue-800/20
            lg:min-h-32 lg:rounded-lg
          "
          aria-invalid={!!errors.description}
          {...register("description")}
        />

        {errors.description && (
          <p className={errorClass}>{errors.description.message}</p>
        )}
      </div>

      {/* Logradouro */}
      <div className="lg:col-span-2">
        <Label htmlFor="logradouro" className={labelClass}>
          Logradouro
        </Label>

        <Input
          id="logradouro"
          type="text"
          placeholder="Rua, avenida, travessa..."
          className={inputClass}
          aria-invalid={!!errors.logradouro}
          {...register("logradouro")}
        />

        {errors.logradouro && (
          <p className={errorClass}>{errors.logradouro.message}</p>
        )}
      </div>

      {/* Número */}
      <div>
        <Label htmlFor="numero" className={labelClass}>
          Número
        </Label>

        <Input
          id="numero"
          type="text"
          placeholder="Digite o número"
          className={inputClass}
          aria-invalid={!!errors.numero}
          {...register("numero")}
        />

        {errors.numero && <p className={errorClass}>{errors.numero.message}</p>}
      </div>

      {/* Bairro */}
      <div>
        <Label htmlFor="bairro" className={labelClass}>
          Bairro
        </Label>

        <Input
          id="bairro"
          type="text"
          placeholder="Bairro"
          className={inputClass}
          aria-invalid={!!errors.bairro}
          {...register("bairro")}
        />

        {errors.bairro && <p className={errorClass}>{errors.bairro.message}</p>}
      </div>

      {/* Cidade */}
      <div>
        <Label htmlFor="cidade" className={labelClass}>
          Cidade
        </Label>

        <Input
          id="cidade"
          type="text"
          placeholder="Cidade"
          className={inputClass}
          aria-invalid={!!errors.cidade}
          {...register("cidade")}
        />

        {errors.cidade && <p className={errorClass}>{errors.cidade.message}</p>}
      </div>

      {/* Estado */}
      <div>
        <Label htmlFor="estado" className={labelClass}>
          Estado
        </Label>

        <Input
          id="estado"
          type="text"
          placeholder="UF"
          maxLength={2}
          className={`${inputClass} uppercase`}
          aria-invalid={!!errors.estado}
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

      {/* Imagem */}
      <div>
        <Label className={labelClass}>Imagem</Label>

        <Label
          htmlFor="image"
          className="
            flex h-24 w-full cursor-pointer flex-col items-center
            justify-center rounded-md border border-zinc-400 bg-zinc-100
            text-zinc-500 transition-colors hover:bg-zinc-200
            lg:h-9 lg:flex-row lg:justify-between lg:rounded-lg
            lg:bg-white lg:px-3 lg:hover:bg-zinc-50
          "
        >
          <ImageIcon className="h-6 w-6 lg:hidden" />

          <span className="mt-1 text-sm lg:hidden">Anexar imagem</span>

          <span className="hidden text-sm italic text-zinc-400 lg:inline">
            Escolher arquivo
          </span>

          <Paperclip className="hidden h-4 w-4 text-blue-600 lg:block" />
        </Label>

        <Input
          id="image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          {...register("image")}
        />

        {errors.image && (
          <p className={errorClass}>{errors.image.message as string}</p>
        )}
      </div>

      {/* Urgência */}
      <div>
        <Label htmlFor="urgency" className={labelClass}>
          Grau de Urgência
        </Label>

        <Controller
          name="urgency"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger
                id="urgency"
                ref={field.ref}
                onBlur={field.onBlur}
                className={inputClass}
                aria-invalid={!!errors.urgency}
              >
                <SelectValue placeholder="Selecione o grau de urgência" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="BAIXA">Baixo</SelectItem>
                <SelectItem value="MEDIA">Médio</SelectItem>
                <SelectItem value="ALTA">Alto</SelectItem>
                <SelectItem value="CRITICA">Crítico</SelectItem>
              </SelectContent>
            </Select>
          )}
        />

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

        <Button
          type="submit"
          disabled={isSubmitting}
          className="
            flex items-center gap-2 bg-blue-950 px-5 py-3
            text-sm font-medium text-white hover:bg-blue-900
            lg:text-base
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
        </Button>
      </div>
    </form>
  );
};

export default OccurrenceForm;
