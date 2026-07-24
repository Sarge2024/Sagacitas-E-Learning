import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 12000;

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

  // OAuth Authentication Endpoints
  app.get("/api/auth/url", (req, res) => {
    const provider = (req.query.provider as string) || "google";
    const host = req.headers.host || "localhost:3000";
    const isLocal = host.includes("localhost") || host.includes("127.0.0.1") || host.includes("0.0.0.0");
    const protocol = isLocal ? "http" : (req.headers["x-forwarded-proto"] || "https");
    const baseUrl = `${protocol}://${host}`;
    const redirectUri = `${baseUrl}/auth/callback`;

    // Check if custom OAuth credentials exist in environment variables
    const clientId = process.env.OAUTH_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
    
    if (clientId) {
      // Real OAuth flow (Google, GitHub, etc.)
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: "openid profile email",
        state: provider,
      });
      const providerAuthUrl =
        process.env.OAUTH_PROVIDER_URL || "https://accounts.google.com/o/oauth2/v2/auth";
      return res.json({ url: `${providerAuthUrl}?${params.toString()}` });
    }

    // Default or fallback: Simulated OAuth authorization screen
    const simAuthUrl = `${baseUrl}/auth/simulated-login-page?provider=${encodeURIComponent(
      provider
    )}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    
    return res.json({ url: simAuthUrl });
  });

  // Interactive Simulated OAuth Authorization Screen
  app.get("/auth/simulated-login-page", (req, res) => {
    const provider = (req.query.provider as string) || "Google OAuth 2.0";
    const redirectUri = (req.query.redirect_uri as string) || "/auth/callback";

    const isFirebase = provider.toLowerCase() === "firebase";
    const badgeText = isFirebase ? "Firebase Authentication" : `Provedor OAuth 2.0 • ${provider.toUpperCase()}`;
    const buttonBg = isFirebase ? "linear-gradient(135deg, #ffcb2b, #ff9100)" : "linear-gradient(135deg, #2fd9f4, #8083ff)";
    const buttonColor = isFirebase ? "#030914" : "#001f25";
    const buttonText = isFirebase ? "Autenticar via Firebase" : "Conectar e Autorizar Acesso";
    const descText = isFirebase 
      ? "O aplicativo <strong>Sagacitas E-Learning</strong> está solicitando autenticação integrada via Firebase Auth."
      : "O aplicativo <strong>Sagacitas E-Learning</strong> está solicitando permissão para autenticar o seu usuário.";

    res.send(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Autenticação • Sagacitas E-Learning</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background: #0b1326;
            color: #dae2fd;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
          }
          .card {
            background: #171f33;
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 24px;
            padding: 32px;
            max-width: 440px;
            width: 90%;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
            text-align: center;
          }
          .badge {
            display: inline-block;
            background: ${isFirebase ? "rgba(255, 203, 43, 0.15)" : "rgba(47, 217, 244, 0.15)"};
            color: ${isFirebase ? "#ffcb2b" : "#2fd9f4"};
            border: 1px solid ${isFirebase ? "rgba(255, 203, 43, 0.3)" : "rgba(47, 217, 244, 0.3)"};
            padding: 4px 12px;
            border-radius: 999px;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 16px;
          }
          h2 {
            margin: 0 0 8px 0;
            font-size: 22px;
            font-weight: 800;
            color: #fff;
          }
          p {
            font-size: 13px;
            color: #94a3b8;
            line-height: 1.5;
            margin-bottom: 24px;
          }
          .user-box {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 16px;
            margin-bottom: 24px;
            text-align: left;
          }
          .user-box label {
            display: block;
            font-size: 11px;
            font-weight: 700;
            color: #8083ff;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 6px;
          }
          .user-box input {
            width: 100%;
            box-sizing: border-box;
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 10px;
            padding: 10px 12px;
            color: #fff;
            font-size: 13px;
            outline: none;
          }
          .scopes {
            font-size: 11px;
            color: #cbd5e1;
            text-align: left;
            margin-bottom: 24px;
            background: rgba(255, 255, 255, 0.02);
            padding: 12px;
            border-radius: 12px;
            border: 1px solid rgba(255,255,255,0.05);
          }
          .scopes li {
            margin-bottom: 4px;
          }
          .btn {
            display: block;
            width: 100%;
            padding: 14px;
            background: ${buttonBg};
            color: ${buttonColor};
            border: none;
            border-radius: 14px;
            font-size: 14px;
            font-weight: 800;
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            transition: all 0.2s;
          }
          .btn:hover {
            opacity: 0.95;
            transform: translateY(-1px);
          }
        </style>
      </head>
      <body>
        <div class="card">
          <span class="badge">${badgeText}</span>
          <h2>${isFirebase ? "Firebase Auth Sign-In" : "Autorização de Acesso"}</h2>
          <p>${descText}</p>
          
          <form action="${redirectUri}" method="GET">
            <input type="hidden" name="code" value="oauth_auth_code_sagacitas_${Date.now()}">
            <input type="hidden" name="provider" value="${provider}">
            
            <div class="user-box">
              <label>Nome do Usuário</label>
              <input type="text" name="name" value="Gabriel Mendes" required>
              <br/><br/>
              <label>E-mail de Login OAuth</label>
              <input type="email" name="email" value="sagacitas.assessoria@gmail.com" required>
              <br/><br/>
              <label>Perfil / Role</label>
              <select name="role" style="width: 100%; box-sizing: border-box; background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 10px; padding: 10px 12px; color: #fff; font-size: 13px; outline: none; margin-bottom: 6px;">
                <option value="Master Admin" selected>Master Admin</option>
                <option value="Gestor">Gestor</option>
                <option value="Aluno Autenticado">Aluno Autenticado</option>
              </select>
            </div>

            <div class="scopes">
              <strong>Permissões Solicitadas:</strong>
              <ul style="padding-left: 18px; margin: 6px 0 0 0;">
                <li>Acesso ao perfil do aluno Sagacitas</li>
                <li>Sincronização do progresso DRE Alchymist</li>
                <li>Identificador único OAuth 2.0</li>
              </ul>
            </div>

            <button type="submit" class="btn">${buttonText}</button>
          </form>
        </div>
      </body>
      </html>
    `);
  });

  // OAuth Callback Handler
  const handleOAuthCallback = async (req: express.Request, res: express.Response) => {
    const code = req.query.code || "default_code";
    const email = (req.query.email as string) || "sagacitas.assessoria@gmail.com";
    const name = (req.query.name as string) || "Gabriel Mendes";
    const provider = (req.query.provider as string) || "Google OAuth 2.0";
    const role = (req.query.role as string) || "Master Admin";

    let companyName = "Nenhuma (Inscrição Individual)";
    let enrollmentType = "individual";
    let enrollmentNumber = "Não matriculado em turmas vigentes";
    let userId = `usr_${Date.now()}`;

    if (supabase) {
      try {
        // Find student by email
        const { data: student, error: studentError } = await supabase
          .from("students")
          .select("*")
          .eq("email", email)
          .maybeSingle();

        if (student) {
          userId = student.id;
          enrollmentType = student.enrollment_type === "corporate" || student.enrollment_type === "B2B" ? "corporate" : "individual";
          
          if (student.company_id) {
            // Get company details
            const { data: company } = await supabase
              .from("companies")
              .select("name")
              .eq("id", student.company_id)
              .maybeSingle();
            if (company) {
              companyName = company.name;
            }
          }

          // Get enrollment number
          const { data: enrollment } = await supabase
            .from("class_enrollments")
            .select("enrollment_number")
            .eq("student_id", student.id)
            .order("enrollment_date", { ascending: false })
            .limit(1)
            .maybeSingle();
          if (enrollment && enrollment.enrollment_number) {
            enrollmentNumber = enrollment.enrollment_number;
          }
        }
      } catch (err) {
        console.error("Erro ao sincronizar dados do aluno com o Supabase:", err);
      }
    }

    const userObj = {
      id: userId,
      name,
      email,
      provider: provider.includes("google") ? "Google OAuth 2.0" : provider.includes("github") ? "GitHub OAuth" : "OAuth 2.0 Sagacitas",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200",
      role: role,
      authenticatedAt: new Date().toISOString(),
      token: `oauth_token_sagacitas_${code}`,
      company_name: companyName,
      enrollment_type: enrollmentType,
      enrollment_number: enrollmentNumber,
    };

    res.send(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Autenticação Concluída</title>
        <style>
          body {
            background: #0b1326;
            color: #dae2fd;
            font-family: system-ui, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            text-align: center;
          }
          .box {
            background: #171f33;
            border: 1px solid rgba(47, 217, 244, 0.3);
            border-radius: 20px;
            padding: 30px;
            max-width: 400px;
          }
          h3 { color: #2fd9f4; margin-top: 0; }
        </style>
      </head>
      <body>
        <div class="box">
          <h3>✓ Login OAuth Realizado!</h3>
          <p>Conectando ${email} ao ambiente do aluno...</p>
          <script>
            const user = ${JSON.stringify(userObj)};
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', user }, '*');
              window.close();
            } else {
              localStorage.setItem('sagacitas_oauth_user', JSON.stringify(user));
              window.location.href = '/';
            }
          </script>
        </div>
      </body>
      </html>
    `);
  };

  app.get("/auth/callback", handleOAuthCallback);
  app.get("/auth/callback/", handleOAuthCallback);

  // Vite development middleware or Static server
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: {
          port: 12001
        }
      },
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
    console.log(`Sagacitas E-Learning Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
