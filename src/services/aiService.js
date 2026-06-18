import { mockDelay } from './api';
import { addActivity } from './activityService';
import { sendMessage } from './workspaceService';

const normalize = (value) => String(value || '').toLowerCase();

const makeResponse = (content, metadata = {}) => ({
  id: `ai-${Date.now()}`,
  role: 'assistant',
  content,
  metadata,
  createdAt: new Date().toISOString()
});

function inferResponse(prompt, mode = 'chat') {
  const text = normalize(`${mode} ${prompt}`);

  if (text.includes('login') || text.includes('đăng nhập') || text.includes('dang nhap')) {
    return makeResponse(`API login mẫu:\n\n\`\`\`http\nPOST {{baseUrl}}/auth/login\nContent-Type: application/json\n\n{\n  "email": "user@example.com",\n  "password": "123456"\n}\n\`\`\`\n\nResponse:\n\n\`\`\`json\n{\n  "accessToken": "mock-access-token",\n  "refreshToken": "mock-refresh-token",\n  "user": {\n    "id": "user-1",\n    "email": "user@example.com",\n    "role": "USER"\n  }\n}\n\`\`\``, {
      apiRequest: {
        method: 'POST',
        url: '{{baseUrl}}/auth/login',
        headers: [{ key: 'Content-Type', value: 'application/json' }],
        body: JSON.stringify({ email: 'user@example.com', password: '123456' }, null, 2)
      }
    });
  }

  if (text.includes('react')) {
    return makeResponse(`Code React gọi API mẫu:\n\n\`\`\`jsx\nimport { useEffect, useState } from 'react';\n\nexport function UsersList({ token }) {\n  const [users, setUsers] = useState([]);\n  const [loading, setLoading] = useState(false);\n  const [error, setError] = useState('');\n\n  useEffect(() => {\n    setLoading(true);\n    fetch('{{baseUrl}}/users', {\n      headers: { Authorization: \`Bearer \${token}\` }\n    })\n      .then((response) => {\n        if (!response.ok) throw new Error('Request failed');\n        return response.json();\n      })\n      .then(setUsers)\n      .catch((err) => setError(err.message))\n      .finally(() => setLoading(false));\n  }, [token]);\n\n  if (loading) return <p>Loading...</p>;\n  if (error) return <p>{error}</p>;\n  return users.map((user) => <div key={user.id}>{user.email}</div>);\n}\n\`\`\``);
  }

  if (text.includes('spring boot')) {
    return makeResponse(`Spring Boot controller mẫu:\n\n\`\`\`java\n@RestController\n@RequestMapping("/api/auth")\npublic class AuthController {\n  @PostMapping("/login")\n  public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {\n    return ResponseEntity.ok(authService.login(request));\n  }\n}\n\`\`\``);
  }

  if (text.includes('database') || text.includes('schema') || text.includes('bảng') || text.includes('table')) {
    return makeResponse(`Schema database gợi ý:\n\n\`\`\`sql\nCREATE TABLE users (\n  id UUID PRIMARY KEY,\n  email VARCHAR(255) UNIQUE NOT NULL,\n  full_name VARCHAR(160),\n  created_at TIMESTAMP NOT NULL\n);\n\nCREATE TABLE bookings (\n  id UUID PRIMARY KEY,\n  user_id UUID NOT NULL,\n  status VARCHAR(32) NOT NULL,\n  total_amount DECIMAL(12,2) NOT NULL,\n  created_at TIMESTAMP NOT NULL\n);\n\`\`\``, {
      databaseSchema: {
        dbType: 'postgresql',
        tables: [
          {
            name: 'users',
            columns: [
              { name: 'id', type: 'UUID', primaryKey: true, nullable: false, unique: true },
              { name: 'email', type: 'VARCHAR(255)', primaryKey: false, nullable: false, unique: true },
              { name: 'full_name', type: 'VARCHAR(160)', primaryKey: false, nullable: true, unique: false },
              { name: 'created_at', type: 'TIMESTAMP', primaryKey: false, nullable: false, unique: false }
            ]
          },
          {
            name: 'bookings',
            columns: [
              { name: 'id', type: 'UUID', primaryKey: true, nullable: false, unique: true },
              { name: 'user_id', type: 'UUID', primaryKey: false, nullable: false, unique: false },
              { name: 'status', type: 'VARCHAR(32)', primaryKey: false, nullable: false, unique: false },
              { name: 'total_amount', type: 'DECIMAL(12,2)', primaryKey: false, nullable: false, unique: false },
              { name: 'created_at', type: 'TIMESTAMP', primaryKey: false, nullable: false, unique: false }
            ]
          }
        ]
      }
    });
  }

  if (text.includes('error') || text.includes('lỗi') || text.includes('401') || text.includes('403') || text.includes('500')) {
    return makeResponse(`Phân tích lỗi API:\n\n- 401 thường do token thiếu, hết hạn hoặc sai prefix Bearer.\n- 403 thường do user thiếu quyền.\n- 500 là lỗi server, cần kiểm tra trace/log backend.\n- Kiểm tra environment variable \`{{baseUrl}}\`, header \`Authorization\`, body JSON và CORS.\n\n\`\`\`json\n{\n  "nextStep": "Gửi lại request trong API Tester và xem tab AI Analysis"\n}\n\`\`\``);
  }

  if (text.includes('test api') || text.includes('api testing')) {
    return makeResponse(`Request test API mẫu:\n\n\`\`\`json\n{\n  "method": "GET",\n  "url": "{{baseUrl}}/users",\n  "headers": [\n    { "key": "Authorization", "value": "Bearer {{token}}" }\n  ]\n}\n\`\`\``, {
      apiRequest: {
        method: 'GET',
        url: '{{baseUrl}}/users',
        headers: [{ key: 'Authorization', value: 'Bearer {{token}}' }],
        body: ''
      }
    });
  }

  return makeResponse(`Mình đã nhận yêu cầu: "${prompt}".\n\nBạn có thể chuyển mode sang Sinh API, Sinh code, Debug lỗi, Thiết kế Database hoặc Viết tài liệu API để có output chuyên biệt hơn.`);
}

export async function sendChatMessage(payload) {
  if (payload.conversationId) {
    try {
      const res = await sendMessage(payload.conversationId, payload.message);
      addActivity({ module: 'chatDmp', action: 'Send AI message (Backend)', description: payload.message, status: 'success' });
      return {
        id: res.assistantMessage.id,
        role: 'assistant',
        content: res.assistantMessage.content,
        metadata: res.assistantMessage.metadata || {},
        createdAt: new Date(res.assistantMessage.timestamp || Date.now()).toISOString()
      };
    } catch (err) {
      console.error('Failed to send message via Backend, falling back to mock:', err);
    }
  }
  const response = inferResponse(payload.message, payload.mode);
  addActivity({ module: 'chatDmp', action: 'Send AI message', description: payload.message, status: 'success' });
  return mockDelay(response, 650);
}

export async function generateCode(payload) {
  return mockDelay(inferResponse(payload.prompt || payload.message || 'react code', 'generate_code'), 500);
}

export async function generateApiSpec(payload) {
  return mockDelay(inferResponse(payload.prompt || payload.message || 'login api', 'generate_api'), 500);
}

export async function generateTestRequest(payload) {
  const response = inferResponse(payload.prompt || payload.url || 'test api', 'api_testing');
  return mockDelay(response.metadata.apiRequest || {
    method: payload.method || 'POST',
    url: payload.url || '{{baseUrl}}/auth/login',
    headers: [{ key: 'Content-Type', value: 'application/json' }],
    body: JSON.stringify({ email: 'user@example.com', password: '123456' }, null, 2)
  }, 500);
}

export async function analyzeApiResponse(payload) {
  const status = payload.response?.status || payload.status || 'unknown';
  return mockDelay(makeResponse(`AI Analysis cho response status ${status}:\n\n- Kiểm tra request URL và environment variables.\n- Kiểm tra auth header/token nếu status là 401/403.\n- Kiểm tra body JSON và validation nếu status là 400/422.\n- Nếu là 5xx, cần xem log backend hoặc mock server.`), 500);
}

export async function generateDatabaseSchema(payload) {
  const response = inferResponse(payload.prompt || 'database schema', 'database_design');
  return mockDelay(response.metadata.databaseSchema, 500);
}

export async function generateDocumentation(payload) {
  return mockDelay(makeResponse(`## API Documentation\n\n### ${payload.method || 'GET'} ${payload.url || '{{baseUrl}}/endpoint'}\n\nMô tả endpoint, headers, params, body example, response example và error cases.`), 500);
}

export async function sendPrompt(prompt) {
  return sendChatMessage({ message: prompt, mode: 'chat' });
}
