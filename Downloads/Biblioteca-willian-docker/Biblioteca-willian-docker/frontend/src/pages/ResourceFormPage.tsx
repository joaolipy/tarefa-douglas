import { useEffect, useMemo, useState, type SubmitEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Alert } from "../componentes/Alert";
import { Button } from "../componentes/Button";
import { CheckboxField } from "../componentes/CheckboxField";
import { FormField } from "../componentes/FormField";
import { Loading } from "../componentes/Loading";
import { PageHeader } from "../componentes/PageHeader";
import { RecursoInvalido } from "../componentes/RecursoInvalido";
import { SelectField } from "../componentes/SelectField";
import { TextAreaField } from "../componentes/TextAreaField";
import { useOpcoes, type FonteOpcoes } from "../hooks/useOpcoes";
import { RECURSOS } from "../resources";
import type { FieldConfig, FieldOption, FormMode, FormValues, ResourceConfig, ResourceItem } from "../resources/types";
import { createResourceService } from "../services/resourceService";
import { traduzirErroApi } from "../utils/erroApi";
import { campoVisivel, validarCampos } from "../utils/validarFormulario";

type FormularioProps = { config: ResourceConfig; itemId: number | undefined };

type CampoProps = {
  field: FieldConfig;
  values: FormValues;
  opcoes: FieldOption[];
  erro: string | undefined;
  desabilitado: boolean;
  onChange: (field: FieldConfig, valor: string | boolean) => void;
};

function Campo({ field, values, opcoes, erro, desabilitado, onChange }: CampoProps) {
  const valor = values[field.name];

  if (field.type === "checkbox") {
    return (
      <CheckboxField
        id={field.name}
        label={field.label}
        checked={valor === true}
        disabled={desabilitado}
        onChange={(marcado) => onChange(field, marcado)}
      />
    );
  }

  if (field.type === "select") {
    return (
      <SelectField
        id={field.name}
        label={field.label}
        value={typeof valor === "string" ? valor : ""}
        options={field.options ?? opcoes}
        error={erro}
        disabled={desabilitado}
        onChange={(novo) => onChange(field, novo)}
      />
    );
  }

  if (field.type === "textarea") {
    return (
      <TextAreaField
        id={field.name}
        label={field.label}
        placeholder={field.placeholder}
        value={typeof valor === "string" ? valor : ""}
        error={erro}
        disabled={desabilitado}
        onChange={(novo) => onChange(field, novo)}
      />
    );
  }

  return (
    <FormField
      id={field.name}
      label={field.label}
      type={field.type === "number" ? "number" : "text"}
      inputMode={field.type === "number" ? "numeric" : field.type === "decimal" ? "decimal" : "text"}
      placeholder={field.placeholder}
      value={typeof valor === "string" ? valor : ""}
      error={erro}
      disabled={desabilitado}
      onChange={(novo) => onChange(field, novo)}
    />
  );
}

function FormularioRecurso({ config, itemId }: FormularioProps) {
  const mode: FormMode = itemId === undefined ? "create" : "edit";
  const navigate = useNavigate();
  const servico = useMemo(() => createResourceService<ResourceItem>(`/${config.key}`), [config.key]);

  const [values, setValues] = useState<FormValues>(config.initialValues);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState("");
  const [carregandoItem, setCarregandoItem] = useState(mode === "edit");
  const [salvando, setSalvando] = useState(false);

  const fontes = useMemo<FonteOpcoes[]>(() => {
    const lista: FonteOpcoes[] = [];
    for (const field of config.fields) {
      if (field.optionsSource && campoVisivel(field, config.initialValues, mode)) {
        lista.push({ nome: field.name, source: field.optionsSource });
      }
    }
    return lista;
  }, [config, mode]);
  const { opcoes, erro: erroOpcoes } = useOpcoes(fontes);

  useEffect(() => {
    if (itemId === undefined) return;

    let ativo = true;
    servico
      .buscar(itemId)
      .then((item) => {
        if (ativo) setValues(config.toFormValues(item));
      })
      .catch((error: unknown) => {
        if (ativo) setErroGeral(traduzirErroApi(error).mensagem);
      })
      .finally(() => {
        if (ativo) setCarregandoItem(false);
      });

    return () => {
      ativo = false;
    };
  }, [config, itemId, servico]);

  function atualizar(field: FieldConfig, valor: string | boolean) {
    const final = typeof valor === "string" && field.mask ? field.mask(valor) : valor;
    setValues((atual) => ({ ...atual, [field.name]: final }));
    setErros((atual) => {
      const resto = { ...atual };
      delete resto[field.name];
      return resto;
    });
  }

  async function onSubmit(event: SubmitEvent) {
    event.preventDefault();
    setErroGeral("");

    const errosLocais = validarCampos(config.fields, values, mode);
    if (Object.keys(errosLocais).length > 0) {
      setErros(errosLocais);
      return;
    }

    setSalvando(true);
    try {
      const payload = config.toPayload(values, mode);
      if (itemId === undefined) await servico.criar(payload);
      else await servico.atualizar(itemId, payload);

      const acao = mode === "create" ? "cadastrado(a)" : "atualizado(a)";
      navigate(`/${config.key}`, { state: { mensagem: `${config.singular} ${acao} com sucesso.` } });
    } catch (error) {
      const { mensagem, campos } = traduzirErroApi(error);
      setErroGeral(mensagem);
      setErros((atual) => ({ ...atual, ...campos }));
    } finally {
      setSalvando(false);
    }
  }

  if (carregandoItem) return <Loading />;

  const titulo = mode === "create" ? `Novo cadastro: ${config.singular}` : `Editar: ${config.singular}`;
  const camposVisiveis = config.fields.filter((field) => campoVisivel(field, values, mode));

  return (
    <>
      <PageHeader titulo={titulo} descricao={config.descricao} />
      <form onSubmit={onSubmit} noValidate className="card form-card">
        {(erroGeral || erroOpcoes) && <Alert variant="error">{erroGeral || erroOpcoes}</Alert>}

        {camposVisiveis.map((field) => (
          <Campo
            key={field.name}
            field={field}
            values={values}
            opcoes={opcoes[field.name] ?? []}
            erro={erros[field.name]}
            desabilitado={salvando}
            onChange={atualizar}
          />
        ))}

        <div className="form-actions">
          <Button type="submit" loading={salvando}>
            Salvar
          </Button>
          <Link className="btn btn-secondary" to={`/${config.key}`}>
            Cancelar
          </Link>
        </div>
      </form>
    </>
  );
}

export function ResourceFormPage() {
  const { recurso, id } = useParams();
  const config = recurso ? RECURSOS[recurso] : undefined;
  const itemId = id === undefined ? undefined : Number(id);

  if (!config || (itemId !== undefined && !Number.isInteger(itemId))) return <RecursoInvalido />;
  return <FormularioRecurso key={`${config.key}-${id ?? "novo"}`} config={config} itemId={itemId} />;
}
