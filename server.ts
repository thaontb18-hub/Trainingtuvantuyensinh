import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Enable JSON body parsing
app.use(express.json());

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Endpoint 1: Roleplay Chat
app.post('/api/simulation/chat', async (req, res) => {
  try {
    const { config, documents, history } = req.body;

    if (!config || !documents || !history) {
      return res.status(400).json({ error: 'Missing required parameters: config, documents, or history' });
    }

    // Prepare documents context
    const docsContext = documents.map((doc: any, idx: number) => {
      return `=== TÀI LIỆU TUYỂN SINH ${idx + 1}: ${doc.title} ===\n${doc.content}\n`;
    }).join('\n');

    // Build roleplay system prompt
    const roleLabel = config.role === 'parent' ? 'Phụ huynh học sinh' : 'Học sinh đang tìm hiểu trường';
    const personality = config.personality;
    const difficulty = config.difficulty;

    let personalityGuideline = '';
    if (personality === 'khó tính') {
      personalityGuideline = '- Bạn là người vô cùng khó tính, khắt khe, hay nghi ngờ và dò xét. Bạn muốn mọi thông tin phải rõ ràng, minh bạch, chi tiết từng số liệu. Bạn thường so sánh với các trường đại học khác để dìm giá hoặc thách thức tư vấn viên.';
    } else if (personality === 'cáu gắt') {
      personalityGuideline = '- Bạn là người thiếu kiên nhẫn, dễ bực mình và cáu gắt. Hãy dùng các câu nói cộc lốc, sắc sảo. Ghét sự dài dòng, nói lý thuyết suông. Luôn muốn câu trả lời thẳng thắn, trực diện, đi vào trọng tâm ngay lập tức. Nếu tư vấn viên dài dòng, hãy bắt bẻ họ ngay.';
    } else if (personality === 'rụt rè') {
      personalityGuideline = '- Bạn rất nhút nhát, rụt rè, hay e ngại và nói năng ngập ngừng. Dùng các từ cảm thán như "dạ...", "em/tôi hơi lo...", "không biết là...". Bạn hỏi từng chút một, cần tư vấn viên phải khích lệ, động viên và chủ động gợi ý thông tin.';
    } else if (personality === 'thực dụng') {
      personalityGuideline = '- Bạn rất thực tế và quan tâm sâu sắc tới khía cạnh tài chính & cam kết. Bạn liên tục xoáy sâu vào học phí, tiền đóng phạt, chi phí phát sinh, các mức học bổng trừ trực tiếp thế nào, học xong có chắc chắn có việc làm lương bao nhiêu, và giá trị thực chất của đồng tiền bỏ ra.';
    } else if (personality === 'kiêu căng') {
      personalityGuideline = '- Bạn tự tin thái quá, kiêu căng, thích thể hiện mình có điều kiện hoặc có học lực xuất sắc. Bạn thường đặt mình ở vị thế bề trên, hỏi những câu mang tính chất "thử thách" kiến thức và năng lực xử lý của tư vấn viên.';
    } else {
      personalityGuideline = `- Bạn có tính cách: ${personality}. Hãy thể hiện tính cách này một cách tự nhiên và rõ nét nhất trong các câu hỏi.`;
    }

    let difficultyGuideline = '';
    if (difficulty === 'easy') {
      difficultyGuideline = '- Hãy chỉ đặt các câu hỏi xoay quanh thông tin trực tiếp, rõ ràng có sẵn trong các tài liệu tuyển sinh được cung cấp.';
    } else {
      difficultyGuideline = '- Bên cạnh các câu hỏi bám sát tài liệu tuyển sinh, bạn cần XEN KẼ các câu hỏi khó, hóc búa nằm NGOÀI tài liệu để thử thách tư vấn viên (ví dụ hỏi về điều kiện cơ sở vật chất chi tiết, quy chế kỷ luật, cuộc sống cá nhân của sinh viên, việc học dở dang có được chuyển trường không, thủ tục du học Anh Quốc sau khi học xong, học phí tăng hàng năm cụ thể ra sao, cơ hội thăng tiến thực sự...). Hãy tự nhiên đưa các câu hỏi này vào câu chuyện.';
    }

    const systemInstruction = `Bạn là một người dùng Việt Nam đang tham gia trải nghiệm cuộc đối thoại mô phỏng với tư vấn viên tuyển sinh của trường đại học.
Nhiệm vụ của bạn là đóng vai và trò chuyện, lần lượt đưa ra các câu hỏi/phản hồi để tư vấn viên (người dùng) trả lời.

Thông tin nhân vật của bạn:
- Vai trò: ${roleLabel}
- Tính cách: ${personality}
- Mô tả tính cách chi tiết:
${personalityGuideline}

Mức độ khó của buổi mô phỏng: ${difficulty}
Mô tả mức độ khó chi tiết:
${difficultyGuideline}

DƯỚI ĐÂY LÀ TÀI LIỆU TUYỂN SINH NỀN MÀ BẠN ĐÃ ĐỌC (Hoặc đây chính là thông tin về trường đại học bạn đang tìm hiểu. Bạn sẽ hỏi những thông tin liên quan tài liệu này, hoặc thỉnh thoảng hỏi xoáy những câu ngoài lề nếu ở chế độ khó):
${docsContext}

QUY TẮC PHẢN HỒI QUAN TRỌNG:
1. Bạn phải đóng vai cực kỳ nhập tâm. Nói bằng ngôn ngữ nói tự nhiên, thân thiện hoặc cộc lốc tùy tính cách đã chọn. KHÔNG được giải thích, không viết ghi chú, không tự trả lời thay cho tư vấn viên.
2. Mỗi lượt phản hồi của bạn phải NGẮN GỌN (chỉ khoảng 1 đến 3 câu). Tránh viết đoạn văn dài lê thê vì đây là giao diện chat trực tuyến giống Messenger/Zalo.
3. Ở mỗi lượt, hãy đưa ra một câu phản ứng ngắn với câu trả lời vừa rồi của tư vấn viên (phù hợp với tính cách của bạn, ví dụ: nghi ngờ, cáu gắt, hài lòng hoặc lo lắng), sau đó ĐẶT RA MỘT CÂU HỎI TIẾP THEO để tư vấn viên trả lời. Chỉ hỏi một câu hỏi duy nhất tại một thời điểm để giữ mạch trò chuyện tự nhiên.
4. Nếu đây là lượt trò chuyện đầu tiên (lịch sử chat trống), hãy bắt đầu bằng một câu chào và câu hỏi đầu tiên thật tự nhiên tương ứng với vai trò và tính cách của bạn.
5. Tuyệt đối không dùng phong cách viết văn rập khuôn hoặc giải thích luật chơi. Trực tiếp nói câu của nhân vật.`;

    // Format chat history for Gemini API
    // We will build contents list.
    const contents: any[] = [];
    
    // We add history.
    history.forEach((msg: any) => {
      contents.push({
        role: msg.sender === 'bot' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      });
    });

    // Call Gemini
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contents.length > 0 ? contents : 'Hãy bắt đầu cuộc hội thoại bằng câu chào và đặt câu hỏi tuyển sinh đầu tiên theo đúng vai trò và tính cách của bạn.',
      config: {
        systemInstruction: systemInstruction,
        temperature: 1.0,
      }
    });

    const reply = response.text || 'Dạ, tôi có thể hỏi thêm thông tin gì không?';
    res.json({ reply });

  } catch (error: any) {
    console.error('Error in /api/simulation/chat:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// Endpoint 2: Evaluation
app.post('/api/simulation/evaluate', async (req, res) => {
  try {
    const { config, documents, history } = req.body;

    if (!config || !documents || !history || history.length === 0) {
      return res.status(400).json({ error: 'Missing required parameters or empty history' });
    }

    // Prepare documents context
    const docsContext = documents.map((doc: any, idx: number) => {
      return `=== TÀI LIỆU TUYỂN SINH ${idx + 1}: ${doc.title} ===\n${doc.content}\n`;
    }).join('\n');

    // Prepare chat history text for evaluation
    let chatHistoryText = '';
    history.forEach((msg: any, idx: number) => {
      const senderName = msg.sender === 'bot' ? 'KHÁCH HÀNG (Phụ huynh/Học sinh)' : 'TƯ VẤN VIÊN (Người dùng)';
      chatHistoryText += `Lượt ${idx + 1} - ${senderName}: ${msg.text}\n`;
    });

    const roleLabel = config.role === 'parent' ? 'Phụ huynh học sinh' : 'Học sinh đang tìm hiểu trường';
    const personality = config.personality;

    const evaluationPrompt = `Bạn là một chuyên gia đào tạo kỹ năng tư vấn tuyển sinh đại học hàng đầu.
Nhiệm vụ của bạn là đọc kỹ cuộc hội thoại mô phỏng dưới đây giữa một tư vấn viên tuyển sinh (người dùng) và một khách hàng đóng vai (do AI mô phỏng với vai trò: ${roleLabel}, tính cách: ${personality}).

Sau đó, hãy đối chiếu từng câu trả lời của tư vấn viên với TÀI LIỆU TUYỂN SINH NỀN của trường để đánh giá độ chính xác, độ thuyết phục và thái độ ứng xử.

DƯỚI ĐÂY LÀ TÀI LIỆU TUYỂN SINH NỀN CHUẨN CỦA TRƯỜNG:
${docsContext}

DƯỚI ĐÂY LÀ TOÀN BỘ LỊCH SỬ CUỘC HỘI THOẠI CHAT:
${chatHistoryText}

HÃY THỰC HIỆN ĐÁNH GIÁ CHI TIẾT VÀ TRẢ VỀ DƯỚI DẠNG JSON KHỚP HOÀN TOÀN VỚI SCHEMA ĐƯỢC ĐỊNH NGHĨA.

Các tiêu chí đánh giá chính:
1. Độ chính xác thông tin (accuracy): Tư vấn viên có nói đúng số liệu, điều kiện học bổng, ưu đãi, quy định trong tài liệu nền không? Có bị nhầm lẫn hay đoán mò không?
2. Độ thuyết phục (persuasiveness): Cách trình bày có rõ ràng, hấp dẫn, làm nổi bật được giá trị của trường để thu hút khách hàng không?
3. Thái độ ứng xử (attitude): Có giữ được sự lịch sự, kiên nhẫn, chuyên nghiệp trước những câu hỏi cáu gắt, thách thức hoặc khó tính không? Có chủ động giải đáp và dẫn dắt tâm lý không?

Trong phần 'analysis' (mảng các lượt hội thoại):
- Chỉ phân tích các lượt mà TƯ VẤN VIÊN trả lời (tức là khi Tư vấn viên phản hồi lại câu hỏi của khách hàng).
- 'turnIndex' bắt đầu từ 1 ứng với lượt trả lời của Tư vấn viên.
- 'question' là câu hỏi ngay trước đó của khách hàng.
- 'answer' là câu trả lời của tư vấn viên.
- Nhận xét chi tiết những chỗ sai sót, thiếu thông tin (errorsOrOmissions) so với tài liệu nền.
- Đưa ra câu trả lời mẫu hoàn hảo (modelAnswer) bám sát tài liệu nền nhưng hành văn tự nhiên, thuyết phục.
- Đưa ra mẹo/gợi ý tâm lý (handlingTip) để xoa dịu hoặc ứng phó tốt nhất với thái độ khách hàng ở lượt cụ thể đó.

Hãy đảm bảo phản hồi bằng tiếng Việt và xuất ra dữ liệu JSON chuẩn xác, sạch sẽ.`;

    // Define strict response schema for reliable JSON output
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: evaluationPrompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.INTEGER, description: 'Điểm tổng thể từ 0 đến 100' },
            metrics: {
              type: Type.OBJECT,
              properties: {
                accuracy: { type: Type.INTEGER, description: 'Độ chính xác thông tin (0-100)' },
                persuasiveness: { type: Type.INTEGER, description: 'Độ thuyết phục (0-100)' },
                attitude: { type: Type.INTEGER, description: 'Thái độ ứng xử của tư vấn viên (0-100)' }
              },
              required: ['accuracy', 'persuasiveness', 'attitude']
            },
            generalFeedback: { type: Type.STRING, description: 'Nhận xét tổng quan ưu điểm, nhược điểm và hướng cải thiện' },
            analysis: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  turnIndex: { type: Type.INTEGER, description: 'Lượt trả lời của tư vấn viên' },
                  question: { type: Type.STRING, description: 'Câu hỏi của khách hàng' },
                  answer: { type: Type.STRING, description: 'Câu trả lời của tư vấn viên' },
                  accuracyScore: { type: Type.INTEGER, description: 'Điểm chính xác của lượt này (0-100)' },
                  persuasivenessScore: { type: Type.INTEGER, description: 'Điểm thuyết phục của lượt này (0-100)' },
                  attitudeScore: { type: Type.INTEGER, description: 'Điểm thái độ ứng xử của lượt này (0-100)' },
                  errorsOrOmissions: { type: Type.STRING, description: 'Những lỗi sai, nhầm lẫn số liệu hoặc thông tin còn thiếu so với tài liệu nền' },
                  modelAnswer: { type: Type.STRING, description: 'Câu trả lời mẫu tối ưu, chính xác và chuyên nghiệp nhất' },
                  handlingTip: { type: Type.STRING, description: 'Lời khuyên tâm lý cách ứng xử với thái độ/tâm lý khách hàng tại lượt này' }
                },
                required: [
                  'turnIndex', 'question', 'answer', 'accuracyScore', 'persuasivenessScore',
                  'attitudeScore', 'errorsOrOmissions', 'modelAnswer', 'handlingTip'
                ]
              }
            }
          },
          required: ['overallScore', 'metrics', 'generalFeedback', 'analysis']
        }
      }
    });

    const jsonText = response.text || '{}';
    res.json(JSON.parse(jsonText));

  } catch (error: any) {
    console.error('Error in /api/simulation/evaluate:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// Configure Vite middleware in dev or static serving in prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
