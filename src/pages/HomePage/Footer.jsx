import { useState } from 'react';
import { Bot, X } from 'lucide-react';

// ─── Nội dung modal ───────────────────────────────────────────────
export const MODAL_CONTENT = {
  // Chính sách bảo mật
  'Chính sách dữ liệu cá nhân': {
    title: 'Chính sách Dữ liệu Cá nhân',
    content: [
      {
        heading: '1. Thu thập dữ liệu',
        body: 'Chúng tôi thu thập thông tin cá nhân của bạn (email, tên, ảnh đại diện) khi bạn đăng ký tài khoản trên nền tảng AI Backend Builder. Dữ liệu được thu thập nhằm mục đích xác thực danh tính và cá nhân hóa trải nghiệm.',
      },
      {
        heading: '2. Sử dụng dữ liệu',
        body: 'Dữ liệu của bạn chỉ được dùng để vận hành dịch vụ, gửi thông báo liên quan đến tài khoản và cải thiện chất lượng nền tảng. Chúng tôi không bán hay chia sẻ dữ liệu cho bên thứ ba vì mục đích thương mại.',
      },
      {
        heading: '3. Lưu trữ & Bảo vệ',
        body: 'Toàn bộ dữ liệu được mã hóa AES-256 khi lưu trữ và TLS 1.3 khi truyền tải. Chúng tôi áp dụng kiểm soát truy cập nghiêm ngặt, chỉ nhân viên được ủy quyền mới có thể truy cập dữ liệu người dùng.',
      },
      {
        heading: '4. Quyền của bạn',
        body: 'Bạn có quyền yêu cầu xem, chỉnh sửa hoặc xóa toàn bộ dữ liệu cá nhân bất cứ lúc nào bằng cách liên hệ DMPVipProMax@gmail.com. Yêu cầu sẽ được xử lý trong vòng 7 ngày làm việc.',
      },
    ],
  },
  'Bảo mật tài khoản người dùng': {
    title: 'Bảo mật Tài khoản Người dùng',
    content: [
      {
        heading: '1. Xác thực hai lớp (2FA)',
        body: 'Chúng tôi khuyến nghị người dùng bật xác thực hai lớp qua OTP email để bảo vệ tài khoản. Tính năng này giúp ngăn chặn truy cập trái phép ngay cả khi mật khẩu bị lộ.',
      },
      {
        heading: '2. Chính sách mật khẩu',
        body: 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt. Mật khẩu được băm bằng bcrypt trước khi lưu — chúng tôi không bao giờ lưu mật khẩu dạng plaintext.',
      },
      {
        heading: '3. Phát hiện bất thường',
        body: 'Hệ thống tự động phát hiện các lần đăng nhập bất thường (địa điểm lạ, thiết bị mới) và gửi cảnh báo ngay đến email của bạn. Tài khoản sẽ bị khóa tạm thời sau 5 lần đăng nhập sai liên tiếp.',
      },
      {
        heading: '4. Phiên đăng nhập',
        body: 'Mỗi phiên làm việc có thời hạn 7 ngày. Bạn có thể xem và thu hồi tất cả phiên đăng nhập đang hoạt động trong phần Cài đặt tài khoản.',
      },
    ],
  },
  'Chính sách Cookie': {
    title: 'Chính sách Cookie',
    content: [
      {
        heading: '1. Cookie là gì?',
        body: 'Cookie là các tệp văn bản nhỏ được lưu trên thiết bị của bạn khi truy cập nền tảng. Chúng giúp chúng tôi ghi nhớ tùy chọn của bạn và cải thiện hiệu suất trang web.',
      },
      {
        heading: '2. Các loại cookie chúng tôi dùng',
        body: 'Cookie bắt buộc: duy trì phiên đăng nhập. Cookie phân tích: thu thập dữ liệu ẩn danh về cách người dùng sử dụng nền tảng (Google Analytics). Cookie tùy chọn: lưu ngôn ngữ và giao diện ưa thích.',
      },
      {
        heading: '3. Kiểm soát Cookie',
        body: 'Bạn có thể tắt cookie không thiết yếu trong phần Cài đặt nền tảng hoặc thông qua trình duyệt. Lưu ý: tắt cookie bắt buộc có thể ảnh hưởng đến chức năng đăng nhập.',
      },
    ],
  },
  'Quyền truy cập dữ liệu API': {
    title: 'Quyền truy cập Dữ liệu API',
    content: [
      {
        heading: '1. API key & phạm vi',
        body: 'Mỗi tài khoản được cấp API key riêng với phạm vi truy cập được giới hạn theo gói dịch vụ. API key cần được bảo mật và không được chia sẻ công khai.',
      },
      {
        heading: '2. Rate limiting',
        body: [
          '⭐ Gói miễn phí: 100 request/ngày.',
          '⭐⭐ Gói Pro: 5,000 request/ngày.',
          '⭐⭐⭐ Gói Ultra Promax Plus Unlimited: không giới hạn số lượng request trong ngày — vượt qua mọi sức tưởng tượng của bạn về nhân sinh.',
        ],
      },
      {
        heading: '3. Dữ liệu được truy cập',
        body: 'API chỉ trả về dữ liệu thuộc sở hữu của tài khoản đang xác thực. Không có endpoint nào cho phép truy cập dữ liệu của người dùng khác. Mọi truy vấn đều được ghi log để kiểm tra bảo mật.',
      },
    ],
  },

  // Điều khoản dịch vụ
  'Điều khoản sử dụng nền tảng': {
    title: 'Điều khoản Sử dụng Nền tảng',
    content: [
      {
        heading: '1. Chấp nhận điều khoản',
        body: 'Khi đăng ký và sử dụng AI Backend Builder, bạn đồng ý tuân thủ toàn bộ điều khoản này. Nếu không đồng ý, vui lòng ngừng sử dụng dịch vụ.',
      },
      {
        heading: '2. Tài khoản người dùng',
        body: 'Bạn chịu trách nhiệm bảo mật thông tin đăng nhập và mọi hoạt động xảy ra dưới tài khoản của mình. Nghiêm cấm chia sẻ tài khoản hoặc sử dụng tài khoản cho mục đích thương mại trái phép.',
      },
      {
        heading: '3. Sử dụng hợp lệ',
        body: 'Nền tảng chỉ được sử dụng cho mục đích phát triển phần mềm hợp pháp. Nghiêm cấm sử dụng để tạo mã độc, tấn công hệ thống, spam, hoặc vi phạm quyền sở hữu trí tuệ.',
      },
      {
        heading: '4. Chấm dứt dịch vụ',
        body: 'Chúng tôi có quyền tạm ngưng hoặc xóa tài khoản vi phạm điều khoản mà không cần thông báo trước. Người dùng có thể yêu cầu xóa tài khoản bất cứ lúc nào.',
      },
    ],
  },
  'Giới hạn trách nhiệm pháp lý': {
    title: 'Giới hạn Trách nhiệm Pháp lý',
    content: [
      {
        heading: '1. Không đảm bảo tuyệt đối',
        body: 'AI Backend Builder cung cấp dịch vụ theo trạng thái "AS IS". Chúng tôi không đảm bảo mã nguồn được AI tạo ra hoàn toàn không có lỗi hay phù hợp cho mọi môi trường production.',
      },
      {
        heading: '2. Giới hạn bồi thường',
        body: 'Trong mọi trường hợp, trách nhiệm bồi thường của DMP Company không vượt quá số tiền bạn đã thanh toán cho dịch vụ trong 3 tháng gần nhất. Chúng tôi không chịu trách nhiệm về thiệt hại gián tiếp.',
      },
      {
        heading: '3. Bảo trì & Downtime',
        body: 'Chúng tôi cam kết SLA 99.5% uptime mỗi tháng. Các khoảng thời gian bảo trì định kỳ sẽ được thông báo trước ít nhất 24 giờ qua email.',
      },
    ],
  },
  'Chính sách hoàn tiền': {
    title: 'Chính sách Hoàn tiền',
    content: [
      {
        heading: '1. Điều kiện hoàn tiền',
        body: 'Bạn có thể yêu cầu hoàn tiền 100% trong vòng 7 ngày kể từ ngày thanh toán nếu chưa sử dụng quá 20% hạn mức dịch vụ. Sau 7 ngày, không áp dụng hoàn tiền.',
      },
      {
        heading: '2. Quy trình hoàn tiền',
        body: 'Gửi email đến DMPVipProMax@gmail.com với tiêu đề "Yêu cầu hoàn tiền - [Mã đơn hàng]". Chúng tôi sẽ xử lý trong 3-5 ngày làm việc. Tiền được hoàn về phương thức thanh toán ban đầu.',
      },
      {
        heading: '3. Trường hợp không hoàn tiền',
        body: 'Không hoàn tiền nếu tài khoản vi phạm điều khoản sử dụng, đã hết thời hạn 7 ngày, hoặc yêu cầu hoàn tiền quá 2 lần trong 12 tháng.',
      },
    ],
  },
  'Quy định sử dụng AI': {
    title: 'Quy định Sử dụng AI',
    content: [
      {
        heading: '1. Sở hữu mã nguồn',
        body: 'Mã nguồn được AI tạo ra thuộc sở hữu của bạn. Bạn có toàn quyền sử dụng, chỉnh sửa và phân phối mã nguồn đó theo giấy phép bạn chọn cho dự án của mình.',
      },
      {
        heading: '2. Giới hạn nội dung',
        body: 'AI sẽ từ chối tạo mã phục vụ mục đích bất hợp pháp, bao gồm: malware, phishing, bypass bảo mật, hay nội dung vi phạm pháp luật. Prompt vi phạm sẽ bị ghi nhận và có thể dẫn đến khóa tài khoản.',
      },
      {
        heading: '3. Độ chính xác của AI',
        body: 'AI có thể tạo ra mã có lỗi. Chúng tôi khuyến nghị luôn review, test kỹ trước khi deploy lên môi trường production. DMP không chịu trách nhiệm về hậu quả của việc dùng trực tiếp mã AI chưa qua kiểm tra.',
      },
    ],
  },

  // Liên hệ
  'Hỗ trợ kỹ thuật': {
    title: 'Hỗ trợ Kỹ thuật',
    content: [
      {
        heading: 'Email hỗ trợ',
        body: 'DMPVipProMax@gmail.com — Thời gian phản hồi: trong vòng 24 giờ làm việc (Thứ 2 – Thứ 6, 8:00 – 17:30).',
      },
      {
        heading: 'Hotline',
        body: 'TEL: 1900-1chiecdeptong — Hỗ trợ trực tiếp từ 8:00 – 17:30 các ngày làm việc. Ngoài giờ vui lòng để lại tin nhắn, chúng tôi sẽ callback sớm nhất.',
      },
      {
        heading: 'Đội kỹ thuật',
        body:[ 'Lục xanh đuôi đỏ: Nguyễn Tuấn Đạt - nguyentuandat4@dtu.edu.vn',
          'Thợ nhậu: Bùi Văn Minh - buivanminh1@dtu.edu.vn',
          'Thợ đụng: Trần Hoàng Phú - tranhoangphu3@dtu.edu.vn'
        ]
      },
    ],
  },
  'Hợp tác kinh doanh': {
    title: 'Hợp tác Kinh doanh',
    content: [
      {
        heading: 'Đề xuất hợp tác',
        body: 'Chúng tôi chào đón các đề xuất hợp tác từ doanh nghiệp công nghệ, đơn vị đào tạo lập trình, và nhà đầu tư. Vui lòng gửi hồ sơ đề xuất đến DMPVipProMax@gmail.com.',
      },
      {
        heading: 'Chương trình đối tác',
        body: 'Trở thành đối tác reseller của DMP để nhận hoa hồng 20-30% trên mỗi gói dịch vụ bán được. Đối tác được hưởng hỗ trợ marketing và tài liệu đào tạo độc quyền.',
      },
      {
        heading: 'Địa chỉ văn phòng',
        body: 'Văn phòng 211, Tầng 2, Tòa nhà 15 LEHIENMAI. Đặt lịch gặp trực tiếp qua email hoặc hotline.',
      },
    ],
  },
  'Báo lỗi & Góp ý': {
    title: 'Báo lỗi & Góp ý',
    content: [
      {
        heading: 'Báo lỗi hệ thống',
        body: 'Nếu phát hiện lỗi, vui lòng gửi email về DMPVipProMax@gmail.com với tiêu đề "[BUG] Mô tả lỗi ngắn gọn", kèm ảnh chụp màn hình và bước tái hiện lỗi. Lỗi nghiêm trọng sẽ được xử lý trong 24 giờ.',
      },
      {
        heading: 'Góp ý tính năng',
        body: 'Chúng tôi luôn lắng nghe! Gửi ý tưởng tính năng mới qua email hoặc bình chọn trực tiếp trên bảng Feature Request (sắp ra mắt). Góp ý được cộng đồng vote nhiều nhất sẽ được ưu tiên phát triển.',
      },
      {
        heading: 'Bug Bounty',
        body: 'Phát hiện lỗ hổng bảo mật? Chúng tôi có chương trình Bug Bounty với phần thưởng từ 1.000đ – 10.000đ coi như lấy hương lấy hoa. Liên hệ ngay để biết thêm chi tiết.',
      },
    ],
  },
  'Tuyển dụng': {
    title: 'Tuyển dụng tại DMP',
    content: [
      {
        heading: 'Vị trí đang tuyển',
        body: 'Senior Full-stack Developer (React + Node.js), AI/ML Engineer (Python, LLM), Product Designer (UI/UX), DevOps Engineer (AWS, Docker, K8s). Xem chi tiết JD tại website (sắp ra mắt).',
      },
      {
        heading: 'Văn hóa công ty',
        body: 'DMP là startup công nghệ trẻ, môi trường flat hierarchy, đề cao sự sáng tạo và tự chủ. Remote-friendly, flexible hours, stock option cho nhân sự sớm tham gia.',
      },
      {
        heading: 'Nộp hồ sơ',
        body: 'Gửi CV về DMPVipProMax@gmail.com với tiêu đề "[APPLY] Tên vị trí – Họ tên". Quy trình: CV Review → Technical Test → Interview → Offer. Phản hồi trong vòng 5 ngày làm việc.',
      },
    ],
  },
};


// ─── Modal Component ───────────────────────────────────────────────
export function PolicyModal({ item, onClose }) {
  if (!item) return null;
  const data = MODAL_CONTENT[item];
  if (!data) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal box */}
      <div
        className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl shadow-2xl shadow-violet-900/30 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-white/10">
          <h3 className="text-lg font-bold text-white pr-4">{data.title}</h3>
          <button
            onClick={onClose}
            className="shrink-0 w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
          {data.content.map((section, i) => (
            <div key={i}>
              <p className="text-sm font-semibold text-violet-400 mb-1">{section.heading}</p>
              {Array.isArray(section.body)
                ? section.body.map((line, j) => (
                    <p key={j} className="text-sm text-gray-400 leading-relaxed">{line}</p>
                  ))
                : <p className="text-sm text-gray-400 leading-relaxed">{section.body}</p>
              }
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-indigo-600 rounded-lg hover:opacity-90 transition-opacity"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Footer Component ──────────────────────────────────────────────
export default function Footer() {
  const [activeModal, setActiveModal] = useState(null);

  const openModal = (key) => setActiveModal(key);
  const closeModal = () => setActiveModal(null);

  return (
    <>
      <footer className="border-t border-white/10 bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">

          {/* Logo + contact */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <Bot className="w-3 h-3 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight">AI Backend Builder</span>
            </div>
          </div>

          {/* Nav columns */}
          <div className="flex gap-12 text-sm">
            {/* Chính sách bảo mật */}
            <div className="flex flex-col gap-2">
              <p className="font-bold text-white">Chính sách bảo mật</p>
              {['Chính sách dữ liệu cá nhân', 'Bảo mật tài khoản người dùng', 'Chính sách Cookie', 'Quyền truy cập dữ liệu API'].map((item) => (
                <button key={item} onClick={() => openModal(item)} className="text-xs text-gray-500 hover:text-gray-300 transition-colors text-left">
                  {item}
                </button>
              ))}
            </div>

            {/* Điều khoản dịch vụ */}
            <div className="flex flex-col gap-2">
              <p className="font-bold text-white">Điều khoản dịch vụ</p>
              {['Điều khoản sử dụng nền tảng', 'Giới hạn trách nhiệm pháp lý', 'Chính sách hoàn tiền', 'Quy định sử dụng AI'].map((item) => (
                <button key={item} onClick={() => openModal(item)} className="text-xs text-gray-500 hover:text-gray-300 transition-colors text-left">
                  {item}
                </button>
              ))}
            </div>

            {/* Liên hệ */}
            <div className="flex flex-col gap-2">
              <p className="font-bold text-white">Liên hệ</p>
              {['Hỗ trợ kỹ thuật', 'Hợp tác kinh doanh', 'Báo lỗi & Góp ý', 'Tuyển dụng'].map((item) => (
                <button key={item} onClick={() => openModal(item)} className="text-xs text-gray-500 hover:text-gray-300 transition-colors text-left">
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Company info */}
          <div className="text-xs text-gray-500 text-center md:text-right space-y-0.5">
            <p>© 2026 DMP. All rights reserved.</p>
            <p>Công ty cổ phần Công nghệ Trí tuệ nhân tạo DMP Company</p>
            <p>Trụ sở chính : Văn phòng 211, Tầng 2, Tòa nhà 15 LEHIENMAI</p>
          </div>

        </div>
      </footer>

      {/* Modal */}
      <PolicyModal item={activeModal} onClose={closeModal} />
    </>
  );
}
