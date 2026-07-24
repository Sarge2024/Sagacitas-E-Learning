import { UnidadeConhecimento, LayoutTemplateAST } from '../types/edtechExpert';

export class DidacticCompilerService {
  /**
   * Compila um conjunto de UCs em um documento HTML limpo e imprimível (Apostila Didática Sagacitas Line)
   */
  static compilarApostilaHTML(
    tituloCurso: string,
    unidades: UnidadeConhecimento[]
  ): string {
    const dataAtual = new Date().toLocaleDateString('pt-BR');

    const capitulosHTML = unidades.map((uc, index) => {
      const ast: LayoutTemplateAST = uc.layout_template;

      const componentesHTML = (ast.components || []).map((comp) => {
        switch (comp.type) {
          case 'header':
            return `
              <div class="comp-header">
                <h3>${comp.title}</h3>
                <p>${comp.body}</p>
              </div>
            `;
          case 'concept':
            return `
              <div class="comp-concept">
                <h4>📌 Conceito Chave: ${comp.title}</h4>
                <p>${comp.body}</p>
              </div>
            `;
          case 'formula':
            return `
              <div class="comp-formula">
                <span class="label">📐 Fórmula / Algoritmo: ${comp.title}</span>
                <code>${comp.body}</code>
              </div>
            `;
          case 'simulation':
            return `
              <div class="comp-simulation">
                <h4>⚡ Simulação Prática (Sagacitas Builder): ${comp.title}</h4>
                <p>${comp.body}</p>
              </div>
            `;
          default:
            return `
              <div class="comp-general">
                <h4>${comp.title}</h4>
                <p>${comp.body}</p>
              </div>
            `;
        }
      }).join('\n');

      return `
        <section class="capitulo">
          <div class="capitulo-header">
            <span class="badge-bloom">Nível Cognitivo Bloom: ${uc.meta_bloom}</span>
            <h2>Capítulo ${index + 1}: ${uc.titulo}</h2>
            <span class="codigo-uc">Código UC: ${uc.codigo}</span>
          </div>
          <p class="descricao-uc">${uc.descricao_curta || ''}</p>
          <div class="conteudo-ast">
            ${componentesHTML}
          </div>
        </section>
        <hr class="divisor-capitulo" />
      `;
    }).join('\n');

    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <title>Material Didático: ${tituloCurso}</title>
        <style>
          body {
            font-family: 'Hanken Grotesk', 'Inter', system-ui, -apple-system, sans-serif;
            background-color: #ffffff;
            color: #0f172a;
            line-height: 1.6;
            margin: 0;
            padding: 40px;
          }
          .capa {
            text-align: center;
            padding: 60px 20px;
            border-bottom: 3px solid #1890ff;
            margin-bottom: 40px;
          }
          .capa h1 {
            font-size: 28px;
            color: #0f172a;
            margin-bottom: 10px;
          }
          .capa p {
            color: #64748b;
            font-size: 14px;
          }
          .capitulo {
            margin-bottom: 40px;
            page-break-inside: avoid;
          }
          .capitulo-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 15px;
          }
          .capitulo-header h2 {
            font-size: 20px;
            color: #0f172a;
            margin: 0;
          }
          .badge-bloom {
            background-color: #e6f7ff;
            color: #1890ff;
            border: 1px solid #91d5ff;
            padding: 4px 10px;
            border-radius: 8px;
            font-size: 11px;
            font-weight: bold;
          }
          .codigo-uc {
            font-family: monospace;
            background: #f1f5f9;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 11px;
            color: #475569;
          }
          .descricao-uc {
            color: #64748b;
            font-style: italic;
            font-size: 13px;
            margin-bottom: 20px;
          }
          .comp-concept {
            background-color: #f8fafc;
            border-left: 4px solid #1890ff;
            padding: 15px;
            border-radius: 0 12px 12px 0;
            margin-bottom: 15px;
          }
          .comp-formula {
            background-color: #f1f5f9;
            padding: 15px;
            border-radius: 12px;
            border: 1px solid #cbd5e1;
            margin-bottom: 15px;
          }
          .comp-formula code {
            display: block;
            font-family: monospace;
            font-size: 14px;
            color: #0f172a;
            margin-top: 5px;
            font-weight: bold;
          }
          .comp-simulation {
            background-color: #f0fdf4;
            border: 1px solid #bbf7d0;
            padding: 15px;
            border-radius: 12px;
            margin-bottom: 15px;
          }
          .comp-simulation h4 {
            color: #166534;
            margin: 0 0 8px 0;
          }
          .divisor-capitulo {
            border: none;
            border-top: 1px dashed #cbd5e1;
            margin: 40px 0;
          }
          @media print {
            body { padding: 0; }
            .capitulo { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="capa">
          <span style="color: #1890ff; font-weight: bold; font-size: 12px; letter-spacing: 1px;">SAGACITAS LINE • MATERIAL DIDÁTICO DESCRITIVO</span>
          <h1>${tituloCurso}</h1>
          <p>Gerado automaticamente via Compilador Didático em ${dataAtual}</p>
        </div>
        ${capitulosHTML}
      </body>
      </html>
    `;
  }
}
