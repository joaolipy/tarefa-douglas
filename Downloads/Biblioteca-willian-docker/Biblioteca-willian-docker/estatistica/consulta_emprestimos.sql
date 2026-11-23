SELECT
  e.id AS id_emprestimo,
  e.leitorId AS id_leitor,
  CASE l.tipo WHEN 'LIVRO' THEN 'Livro' ELSE 'Revista' END AS tipo,
  l.genero AS genero,
  l.paginas AS paginas,
  DATE(e.dataEmprestimo) AS data_emprestimo,
  DATEDIFF(e.dataPrevista, e.dataEmprestimo) AS prazo_dias,
  DATEDIFF(e.dataDevolucao, e.dataEmprestimo) AS dias_emprestimo,
  GREATEST(0, DATEDIFF(e.dataDevolucao, e.dataPrevista)) AS dias_atraso,
  e.multa AS multa
FROM emprestimos e
JOIN livros l ON l.id = e.livroId
WHERE e.dataDevolucao IS NOT NULL
ORDER BY e.dataEmprestimo;
