import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini AI Client lazily or safely with User-Agent header
  const getAi = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined in environment.");
    }
    return new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  };

  // AI Tutor API Route
  app.post("/api/tutor", async (req, res) => {
    try {
      const { message, lessonTitle, moduleTitle, history } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        // Fallback friendly response if key is missing during local dev test
        return res.json({
          reply: `[Sagacitas E-Learning] Entendi sua dúvida sobre "${message}". No treinamento Alchymist Manager | Dominando a DRE do Restaurante, este conceito de ${lessonTitle || "DRE Gerencial"} é fundamental para identificar o CMV, calcular margens de lucro e tomar decisões de gestão para o seu restaurante.`,
        });
      }

      const ai = getAi();
      const systemInstruction = `Você é o Tutor de IA da Sagacitas E-Learning, especialista no sistema de gestão Alchymist Manager e no programa educacional "Alchymist Manager | Dominando a DRE do Restaurante".
Você responde sempre de forma acolhedora, prática, clara, encorajadora, objetiva e tecnicamente precisa em português do Brasil.

Público-Alvo: Empresários individuais, proprietários de pequenos restaurantes, hamburguerias, marmitarias, pizzarias e negócios familiares do setor de alimentação.
Princípios Orientadores:
1. DRE não é relatório para contador; é painel de decisão para o dono do restaurante.
2. Fluxo de caixa mostra fôlego (quando o dinheiro entra/sai); DRE mostra desempenho (se a operação gerou ou consumiu resultado).
3. Número sem ação não melhora resultado.
4. Estrutura essencial da DRE no Alchymist Manager:
   - Receita Bruta (tudo que foi vendido)
   - Deduções (taxas de cartão, comissões de delivery, impostos diretos)
   - Receita Líquida = Receita Bruta - Deduções
   - CMV (Custo da Mercadoria Vendida: proteínas, hortifrúti, laticínios, embalagens, bebidas, insumos diretos)
   - Lucro Bruto = Receita Líquida - CMV
   - Despesas Operacionais (aluguel, folha, energia, sistemas, marketing)
   - EBITDA e EBIT (resultado operacional)
   - Lucro Líquido = Sobra final após todos os custos e despesas.

Cenários de Análise Gerencial:
- Cenário 1 (Faturamento sobe e lucro cai): Investigar aumento do CMV, mix de vendas menos rentável, descontos/promoções ruins, taxas de canal ou despesas operacionais em alta.
- Cenário 2 (Margem bruta cai): Problemas na cozinha ou compras (insumo mais caro, desperdício, porcionamento fora do padrão, roubo, precificação desatualizada).
- Cenário 3 (EBITDA pressionado com margem bruta razoável): Estrutura pesada (folha alta, aluguel, utilidades, custos fixos desproporcionais).
- Cenário 4 (Faturamento próximo do ponto de equilíbrio): Negócio operando sem margem de segurança (sem "colchão").

Você está apoiando o aluno na aula: "${lessonTitle || "Dominando a DRE"}" do módulo "${moduleTitle || "Alchymist Manager"}".
Responda de forma direta e estruturada (2 a 4 parágrafos) focando em aplicação prática no dia a dia do restaurante.`;

      // Build conversation contents
      const chatMessages = Array.isArray(history) && history.length > 0
        ? history.map((msg: { sender: string; text: string }) => ({
            role: msg.sender === "user" ? "user" : "model",
            parts: [{ text: msg.text }],
          }))
        : [];

      // Append current message
      chatMessages.push({
        role: "user",
        parts: [{ text: message }],
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: chatMessages,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const replyText = response.text || "Desculpe, não consegui gerar uma resposta no momento. Pode tentar novamente?";
      return res.json({ reply: replyText });
    } catch (err: any) {
      console.error("Error calling Gemini API:", err);
      return res.status(500).json({
        reply: "Ocorreu um erro ao processar sua pergunta com o Tutor Sagacitas E-Learning. Por favor, tente novamente em instantes.",
      });
    }
  });

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Vite development middleware or Static server
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Lumina Academy Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
