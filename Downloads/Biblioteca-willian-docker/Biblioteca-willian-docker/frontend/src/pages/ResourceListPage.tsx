import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Alert } from "../componentes/Alert";
import { DataTable } from "../componentes/DataTable";
import { Loading } from "../componentes/Loading";
import { PageHeader } from "../componentes/PageHeader";
import { Pagination } from "../componentes/Pagination";
import { RecursoInvalido } from "../componentes/RecursoInvalido";
import { SearchBox } from "../componentes/SearchBox";
import { useOpcoes, type FonteOpcoes } from "../hooks/useOpcoes";
import { RECURSOS } from "../resources";
import type { FieldConfig, ResourceConfig, ResourceItem } from "../resources/types";
import { createResourceService, type ListParams } from "../services/resourceService";
import type { Page } from "../types";
import { traduzirErroApi } from "../utils/erroApi";

const POR_PAGINA = 10;
const SEM_FILTROS: FieldConfig[] = [];

type Resultado = { chave: string; dados: Page<ResourceItem> | null; erro: string };
type EstadoLista = { mensagem?: string } | null;

function ListaRecurso({ config }: { config: ResourceConfig }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const servico = useMemo(() => createResourceService<ResourceItem>(`/${config.key}`), [config.key]);
  const filtros = config.filters ?? SEM_FILTROS;

  const fontes = useMemo<FonteOpcoes[]>(() => {
    const lista: FonteOpcoes[] = [];
    for (const filtro of filtros) {
      if (filtro.optionsSource) lista.push({ nome: filtro.name, source: filtro.optionsSource });
    }
    return lista;
  }, [filtros]);
  const { opcoes } = useOpcoes(fontes);

  const [versao, setVersao] = useState(0);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [mensagem, setMensagem] = useState(() => (location.state as EstadoLista)?.mensagem ?? "");
  const [erroAcao, setErroAcao] = useState("");

  const consulta = searchParams.toString();
  const chave = `${consulta}|${versao}`;
  const carregando = resultado?.chave !== chave;
  const pagina = Math.max(1, Number(searchParams.get("page")) || 1);
  const busca = searchParams.get("search") ?? "";

  useEffect(() => {
    let ativo = true;
    const parametros = new URLSearchParams(consulta);
    const listParams: ListParams = { page: Number(parametros.get("page")) || 1, limit: POR_PAGINA };

    const termo = parametros.get("search");
    if (termo) listParams.search = termo;
    for (const filtro of filtros) {
      const valor = parametros.get(filtro.name);
      if (valor) listParams[filtro.name] = valor;
    }

    servico
      .listar(listParams)
      .then((dados) => {
        if (ativo) setResultado({ chave, dados, erro: "" });
      })
      .catch((error: unknown) => {
        if (ativo) setResultado({ chave, dados: null, erro: traduzirErroApi(error).mensagem });
      });
    return () => {
      ativo = false;
    };
  }, [servico, consulta, filtros, chave]);

  function aplicarBusca(termo: string, valores: Record<string, string>) {
    const proximo = new URLSearchParams();
    if (termo) proximo.set("search", termo);
    for (const [nome, valor] of Object.entries(valores)) {
      if (valor) proximo.set(nome, valor);
    }
    setSearchParams(proximo);
  }

  function irParaPagina(numero: number) {
    const proximo = new URLSearchParams(searchParams);
    if (numero <= 1) proximo.delete("page");
    else proximo.set("page", String(numero));
    setSearchParams(proximo);
  }

  async function excluir(item: ResourceItem) {
    if (!window.confirm(`Deseja realmente excluir este registro de ${config.singular.toLowerCase()}?`)) return;

    setMensagem("");
    setErroAcao("");
    try {
      await servico.remover(item.id);
      setMensagem(`${config.singular} excluído(a) com sucesso.`);
      if (resultado?.dados?.data.length === 1 && pagina > 1) irParaPagina(pagina - 1);
      else setVersao((atual) => atual + 1);
    } catch (error) {
      setErroAcao(traduzirErroApi(error).mensagem);
    }
  }

  const valoresFiltros: Record<string, string> = {};
  const filtrosAtivos: string[] = [];
  for (const filtro of filtros) {
    const valor = searchParams.get(filtro.name) ?? "";
    valoresFiltros[filtro.name] = valor;
    if (!valor) continue;
    const rotuloValor = (filtro.options ?? opcoes[filtro.name] ?? []).find((opcao) => opcao.value === valor)?.label;
    filtrosAtivos.push(`${filtro.label}: ${rotuloValor ?? valor}`);
  }

  const dados = resultado?.chave === chave ? resultado.dados : null;
  const erroLista = resultado?.chave === chave ? resultado.erro : "";

  return (
    <>
      <PageHeader
        titulo={config.titulo}
        descricao={config.descricao}
        acoes={
          <Link className="btn btn-primary" to={`/${config.key}/novo`}>
            Novo cadastro
          </Link>
        }
      />

      {mensagem && <Alert variant="success">{mensagem}</Alert>}
      {erroAcao && <Alert variant="error">{erroAcao}</Alert>}

      <SearchBox
        key={consulta}
        placeholder={config.placeholderBusca}
        initialSearch={busca}
        filters={filtros}
        initialFilters={valoresFiltros}
        opcoes={opcoes}
        onApply={aplicarBusca}
      />

      {filtrosAtivos.length > 0 && (
        <p className="filtros-ativos">
          Exibindo resultados filtrados por: <strong>{filtrosAtivos.join(" · ")}</strong>
        </p>
      )}

      {carregando && <Loading />}
      {erroLista && <Alert variant="error">{erroLista}</Alert>}
      {dados && (
        <>
          <DataTable
            columns={config.columns}
            rows={dados.data}
            onEdit={(item) => navigate(`/${config.key}/${item.id}/editar`)}
            onDelete={excluir}
          />
          <Pagination page={dados.page} totalPages={dados.totalPages} total={dados.total} onChange={irParaPagina} />
        </>
      )}
    </>
  );
}

export function ResourceListPage() {
  const { recurso } = useParams();
  const config = recurso ? RECURSOS[recurso] : undefined;

  if (!config) return <RecursoInvalido />;
  return <ListaRecurso key={config.key} config={config} />;
}
