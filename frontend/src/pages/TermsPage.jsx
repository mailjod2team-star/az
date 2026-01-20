import React from 'react';
import { motion } from 'framer-motion';

export const TermsPage = () => {
  return (
    <motion.div
      className="min-h-full bg-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Document Container - Word-like styling */}
      <div className="max-w-4xl mx-auto px-8 py-10">
        {/* Document Header */}
        <div className="text-center mb-12 pb-8 border-b-2 border-gray-300">
          <motion.h1 
            className="text-4xl font-bold text-gray-900 mb-4"
            initial={{ y: -20 }}
            animate={{ y: 0 }}
          >
            ĐIỀU KHOẢN SỬ DỤNG
          </motion.h1>
          <p className="text-lg text-gray-600 mb-2">Hệ Thống Quản Lý Salon - DearTech POS</p>
          <p className="text-sm text-gray-500">Phiên bản 1.0 - Cập nhật lần cuối: 01/01/2024</p>
        </div>

        {/* Document Content */}
        <div className="space-y-8 text-gray-800 leading-relaxed">
          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="text-emerald-600">1.</span>
              <span>Giới Thiệu</span>
            </h2>
            <div className="ml-8 space-y-3 text-justify">
              <p>
                Chào mừng bạn đến với DearTech POS - Hệ thống quản lý salon toàn diện. Bằng việc sử dụng 
                phần mềm này, bạn đồng ý tuân thủ các điều khoản và điều kiện được nêu dưới đây.
              </p>
              <p>
                Vui lòng đọc kỹ các điều khoản này trước khi sử dụng hệ thống. Nếu bạn không đồng ý với 
                bất kỳ phần nào của điều khoản, vui lòng ngừng sử dụng phần mềm.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="text-emerald-600">2.</span>
              <span>Phạm Vi Sử Dụng</span>
            </h2>
            <div className="ml-8 space-y-3">
              <p className="text-justify">
                DearTech POS được thiết kế để hỗ trợ quản lý các hoạt động kinh doanh salon bao gồm:
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Quản lý dịch vụ và sản phẩm</li>
                <li>Quản lý khách hàng và thẻ thành viên</li>
                <li>Đặt lịch hẹn và thu ngân</li>
                <li>Quản lý kho hàng và nhân viên</li>
                <li>Theo dõi doanh thu, chi phí và báo cáo</li>
                <li>Chương trình khuyến mãi và marketing</li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="text-emerald-600">3.</span>
              <span>Quyền và Trách Nhiệm Người Dùng</span>
            </h2>
            <div className="ml-8 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">3.1. Quyền của Người Dùng</h3>
                <ul className="list-disc ml-6 space-y-2 text-justify">
                  <li>Được sử dụng đầy đủ các tính năng của phần mềm trong thời gian bản quyền còn hiệu lực</li>
                  <li>Được hỗ trợ kỹ thuật và cập nhật phần mềm miễn phí</li>
                  <li>Được bảo mật thông tin và dữ liệu cá nhân</li>
                  <li>Được yêu cầu sao lưu và xuất dữ liệu khi cần thiết</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">3.2. Trách Nhiệm của Người Dùng</h3>
                <ul className="list-disc ml-6 space-y-2 text-justify">
                  <li>Bảo mật thông tin tài khoản và không chia sẻ cho bên thứ ba</li>
                  <li>Sử dụng phần mềm đúng mục đích và tuân thủ pháp luật</li>
                  <li>Thực hiện sao lưu dữ liệu định kỳ</li>
                  <li>Chịu trách nhiệm về tính chính xác của dữ liệu nhập vào hệ thống</li>
                  <li>Thanh toán đầy đủ phí sử dụng theo thỏa thuận</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="text-emerald-600">4.</span>
              <span>Bảo Mật Thông Tin</span>
            </h2>
            <div className="ml-8 space-y-3 text-justify">
              <p>
                DearTech cam kết bảo mật tuyệt đối thông tin của khách hàng. Dữ liệu được lưu trữ 
                cục bộ trên thiết bị của bạn (LocalStorage) và không được chia sẻ với bên thứ ba 
                mà không có sự đồng ý của bạn.
              </p>
              <p>
                Chúng tôi khuyến nghị bạn thường xuyên sao lưu dữ liệu và sử dụng mật khẩu mạnh 
                để bảo vệ tài khoản của mình.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="text-emerald-600">5.</span>
              <span>Giới Hạn Trách Nhiệm</span>
            </h2>
            <div className="ml-8 space-y-3 text-justify">
              <p>
                DearTech không chịu trách nhiệm đối với:
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Mất mát dữ liệu do lỗi người dùng hoặc thiết bị</li>
                <li>Gián đoạn dịch vụ do sự cố kỹ thuật bất khả kháng</li>
                <li>Thiệt hại gián tiếp phát sinh từ việc sử dụng phần mềm</li>
                <li>Sai sót trong dữ liệu do người dùng nhập vào</li>
              </ul>
            </div>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="text-emerald-600">6.</span>
              <span>Chính Sách Hoàn Tiền</span>
            </h2>
            <div className="ml-8 space-y-3 text-justify">
              <p>
                Khách hàng có thể yêu cầu hoàn tiền trong vòng 7 ngày kể từ ngày kích hoạt nếu 
                phần mềm không đáp ứng được các tính năng đã công bố. Sau thời gian này, chúng tôi 
                không chấp nhận yêu cầu hoàn tiền.
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="text-emerald-600">7.</span>
              <span>Cập Nhật và Bảo Trì</span>
            </h2>
            <div className="ml-8 space-y-3 text-justify">
              <p>
                DearTech cam kết cung cấp các bản cập nhật và cải tiến phần mềm định kỳ. Người dùng 
                được khuyến khích cập nhật lên phiên bản mới nhất để đảm bảo hiệu suất và bảo mật 
                tốt nhất.
              </p>
            </div>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="text-emerald-600">8.</span>
              <span>Thay Đổi Điều Khoản</span>
            </h2>
            <div className="ml-8 space-y-3 text-justify">
              <p>
                DearTech có quyền thay đổi, bổ sung các điều khoản sử dụng này bất cứ lúc nào. 
                Các thay đổi sẽ có hiệu lực ngay khi được công bố trên hệ thống. Việc tiếp tục 
                sử dụng phần mềm sau khi có thay đổi đồng nghĩa với việc bạn chấp nhận các điều 
                khoản mới.
              </p>
            </div>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="text-emerald-600">9.</span>
              <span>Liên Hệ Hỗ Trợ</span>
            </h2>
            <div className="ml-8 space-y-3">
              <p className="text-justify">
                Nếu bạn có bất kỳ câu hỏi nào về điều khoản sử dụng hoặc cần hỗ trợ, vui lòng liên hệ:
              </p>
              <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded">
                <p className="font-semibold text-gray-900 mb-2">Thông Tin Liên Hệ</p>
                <ul className="space-y-1 text-sm">
                  <li><strong>Email:</strong> support@deartech.vn</li>
                  <li><strong>Hotline:</strong> 1900 xxxx</li>
                  <li><strong>Website:</strong> www.deartech.vn</li>
                  <li><strong>Địa chỉ:</strong> Số xx, Đường xxx, Quận xxx, TP. Hồ Chí Minh</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 10 */}
          <section className="border-t-2 border-gray-300 pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="text-emerald-600">10.</span>
              <span>Chấp Nhận Điều Khoản</span>
            </h2>
            <div className="ml-8 space-y-3 text-justify">
              <p className="font-medium">
                Bằng việc sử dụng phần mềm DearTech POS, bạn xác nhận rằng bạn đã đọc, hiểu và 
                đồng ý với tất cả các điều khoản và điều kiện được nêu trong tài liệu này.
              </p>
            </div>
          </section>
        </div>

        {/* Document Footer */}
        <div className="mt-12 pt-8 border-t border-gray-300 text-center">
          <p className="text-sm text-gray-500 italic">
            © 2024 DearTech. All rights reserved.
          </p>
        </div>
      </div>
    </motion.div>
  );
};
