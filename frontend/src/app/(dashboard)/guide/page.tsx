'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, BookOpen, ShoppingCart, TrendingUp, Users, Package, Boxes, BarChart3, Gift, UserCog, User, LayoutDashboard } from 'lucide-react';
import Card from '@/components/ui/Card';

interface Section {
  id: string;
  icon: React.ReactNode;
  title: string;
  color: string;
  items: { q: string; a: string | React.ReactNode }[];
}

const sections: Section[] = [
  {
    id: 'dashboard',
    icon: <LayoutDashboard size={20} />,
    title: 'Dashboard',
    color: 'text-blue-600 bg-blue-50',
    items: [
      {
        q: 'Dashboard hiển thị thông tin gì?',
        a: 'Dashboard hiển thị tổng quan hoạt động trong ngày hôm nay: tổng tiền mua vào, tổng tiền bán ra, lợi nhuận ước tính (Bán - Mua) và số đơn tương ứng.',
      },
      {
        q: 'Lợi nhuận ước tính được tính như thế nào?',
        a: 'Lợi nhuận = Tổng bán ra - Tổng mua vào trong ngày. Đây là ước tính sơ bộ, chưa tính chi phí vận hành.',
      },
    ],
  },
  {
    id: 'purchases',
    icon: <ShoppingCart size={20} />,
    title: 'Mua vào',
    color: 'text-emerald-600 bg-emerald-50',
    items: [
      {
        q: 'Cách tạo đơn mua vào?',
        a: (
          <ol className="list-decimal list-inside space-y-1">
            <li>Nhấn nút <strong>+ Tạo đơn</strong> ở góc trên phải trang Mua vào.</li>
            <li>Chọn <strong>Người bán</strong> (gõ tìm kiếm nhanh theo tên).</li>
            <li>Chọn <strong>ngày</strong> và <strong>giờ</strong> giao dịch.</li>
            <li>Nhấn <strong>+ Thêm vật liệu</strong>, chọn tên vật liệu, nhập cân nặng (kg) và đơn giá.</li>
            <li>Có thể thêm nhiều dòng vật liệu trong một đơn.</li>
            <li>Nhấn <strong>Tạo đơn mua</strong> để lưu. Tồn kho tự động cộng thêm.</li>
          </ol>
        ),
      },
      {
        q: 'Giá tự điền sẵn từ đâu?',
        a: 'Khi chọn vật liệu, hệ thống tự điền giá mặc định từ trang Vật liệu. Bạn có thể chỉnh sửa giá trực tiếp trên đơn — giá trên đơn đã lưu sẽ không thay đổi nếu giá mặc định cập nhật sau này.',
      },
      {
        q: 'Một người bán có thể bán nhiều lần trong ngày không?',
        a: 'Có. Hệ thống hỗ trợ chọn giờ giao dịch, nên có thể tạo nhiều đơn cùng ngày với cùng người bán ở các giờ khác nhau.',
      },
      {
        q: 'Cách huỷ đơn mua?',
        a: 'Vào chi tiết đơn hoặc danh sách, nhấn nút Huỷ đơn (biểu tượng X). Xác nhận trong hộp thoại. Tồn kho sẽ được hoàn lại tự động. Đơn đã huỷ không thể khôi phục.',
      },
      {
        q: 'Lọc đơn mua theo ngày?',
        a: 'Trên trang danh sách, dùng ô Từ ngày và Đến ngày để lọc. Nhấn Xoá lọc để xem tất cả.',
      },
    ],
  },
  {
    id: 'sales',
    icon: <TrendingUp size={20} />,
    title: 'Bán ra',
    color: 'text-orange-600 bg-orange-50',
    items: [
      {
        q: 'Cách tạo đơn bán ra?',
        a: (
          <ol className="list-decimal list-inside space-y-1">
            <li>Nhấn nút <strong>+ Tạo đơn</strong> ở trang Bán ra.</li>
            <li>Chọn <strong>Người mua</strong>, <strong>ngày</strong> và <strong>giờ</strong>.</li>
            <li>Thêm các dòng vật liệu với số lượng và đơn giá.</li>
            <li>Hệ thống kiểm tra tồn kho — sẽ báo lỗi nếu số lượng bán vượt quá tồn kho hiện tại.</li>
            <li>Nhấn <strong>Tạo đơn bán</strong>. Tồn kho tự động trừ đi.</li>
          </ol>
        ),
      },
      {
        q: 'Bán hàng khi tồn kho không đủ?',
        a: 'Hệ thống sẽ từ chối tạo đơn và thông báo vật liệu nào không đủ tồn kho. Cần mua vào trước hoặc điều chỉnh số lượng bán.',
      },
      {
        q: 'Cách huỷ đơn bán?',
        a: 'Tương tự đơn mua. Khi huỷ, tồn kho sẽ được cộng lại. Đơn đã huỷ không thể khôi phục.',
      },
    ],
  },
  {
    id: 'customers',
    icon: <Users size={20} />,
    title: 'Khách hàng',
    color: 'text-purple-600 bg-purple-50',
    items: [
      {
        q: 'Phân loại khách hàng như thế nào?',
        a: (
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Người bán (seller)</strong>: những người bán phế liệu cho kho — chọn khi tạo đơn mua vào.</li>
            <li><strong>Người mua (buyer)</strong>: những người mua hàng từ kho — chọn khi tạo đơn bán ra.</li>
          </ul>
        ),
      },
      {
        q: 'Cách thêm / sửa khách hàng?',
        a: 'Vào trang Khách hàng, nhấn + Thêm khách hàng. Điền tên, số điện thoại, địa chỉ, loại khách và % thưởng cuối năm. Nhấn vào biểu tượng chỉnh sửa (bút chì) để cập nhật thông tin.',
      },
      {
        q: 'Tìm kiếm khách hàng?',
        a: 'Gõ tên vào ô tìm kiếm — hỗ trợ tìm không dấu (gõ "nguyen" sẽ ra "Nguyễn"). Có thể lọc thêm theo loại khách.',
      },
      {
        q: '% Thưởng cuối năm là gì?',
        a: 'Mỗi khách hàng (người bán) có thể được thiết lập một tỷ lệ % thưởng riêng. Cuối năm, hệ thống tính thưởng = Tổng doanh thu × % thưởng. Xem chi tiết trong trang Thưởng cuối năm.',
      },
      {
        q: 'Xem thống kê doanh thu từng khách?',
        a: 'Nhấn vào biểu tượng thống kê (📊) bên cạnh mỗi khách hàng để xem doanh thu theo từng tháng trong năm.',
      },
    ],
  },
  {
    id: 'materials',
    icon: <Package size={20} />,
    title: 'Vật liệu',
    color: 'text-yellow-600 bg-yellow-50',
    items: [
      {
        q: 'Vật liệu dùng để làm gì?',
        a: 'Vật liệu (phế liệu) là danh mục các loại hàng kho giao dịch: đồng, nhôm, sắt, giấy... Mỗi vật liệu có đơn vị tính (kg), giá mua mặc định và giá bán mặc định.',
      },
      {
        q: 'Cách thêm vật liệu mới?',
        a: 'Vào trang Vật liệu, nhấn + Thêm vật liệu. Điền tên, đơn vị tính (mặc định: kg), giá mua và giá bán mặc định. Giá mặc định này sẽ tự điền khi tạo đơn mới.',
      },
      {
        q: 'Cập nhật giá có ảnh hưởng đơn cũ không?',
        a: 'Không. Giá trên đơn đã lưu là giá tại thời điểm tạo đơn, hoàn toàn độc lập. Cập nhật giá mặc định chỉ ảnh hưởng đến các đơn tạo mới sau đó.',
      },
    ],
  },
  {
    id: 'inventory',
    icon: <Boxes size={20} />,
    title: 'Tồn kho',
    color: 'text-teal-600 bg-teal-50',
    items: [
      {
        q: 'Tồn kho cập nhật như thế nào?',
        a: (
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Tạo đơn mua</strong>: tồn kho tự động cộng thêm số lượng trong đơn.</li>
            <li><strong>Tạo đơn bán</strong>: tồn kho tự động trừ đi.</li>
            <li><strong>Huỷ đơn</strong>: tồn kho tự động đảo ngược về trạng thái trước.</li>
          </ul>
        ),
      },
      {
        q: 'Xem tồn kho?',
        a: 'Trang Tồn kho hiển thị số lượng hiện tại của từng vật liệu và thời điểm cập nhật gần nhất.',
      },
    ],
  },
  {
    id: 'reports',
    icon: <BarChart3 size={20} />,
    title: 'Báo cáo',
    color: 'text-indigo-600 bg-indigo-50',
    items: [
      {
        q: 'Báo cáo gồm những gì?',
        a: (
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Tổng mua vào</strong>: tổng tiền và số đơn trong khoảng thời gian chọn.</li>
            <li><strong>Tổng bán ra</strong>: tổng tiền và số đơn.</li>
            <li><strong>Lợi nhuận ước tính</strong>: Bán - Mua.</li>
            <li><strong>Chi tiết theo ngày</strong>: bảng mua vào và bán ra từng ngày.</li>
          </ul>
        ),
      },
      {
        q: 'Lọc báo cáo theo thời gian?',
        a: 'Chọn Từ ngày và Đến ngày để lọc. Nhấn Tháng này để nhanh chóng xem dữ liệu tháng hiện tại.',
      },
    ],
  },
  {
    id: 'bonus',
    icon: <Gift size={20} />,
    title: 'Thưởng cuối năm',
    color: 'text-pink-600 bg-pink-50',
    items: [
      {
        q: 'Thưởng cuối năm hoạt động như thế nào?',
        a: 'Hệ thống tổng hợp doanh thu (tổng tiền mua vào) của từng người bán trong năm. Thưởng = Tổng doanh thu × % thưởng đã thiết lập cho từng người.',
      },
      {
        q: 'Điều chỉnh % thưởng cho từng người?',
        a: 'Vào trang Khách hàng, chỉnh sửa khách hàng và cập nhật trường "% Thưởng". Thay đổi sẽ có hiệu lực ngay khi xem báo cáo thưởng.',
      },
      {
        q: 'Xem thưởng cuối năm ở đâu?',
        a: 'Trang Thưởng cuối năm hiển thị bảng tổng hợp tất cả người bán, doanh thu và số tiền thưởng dự kiến. Có thể in/xuất bảng này.',
      },
      {
        q: 'Xem thống kê theo tháng của từng người?',
        a: 'Vào trang Khách hàng → nhấn biểu tượng thống kê của từng khách để xem doanh thu từng tháng trong năm.',
      },
    ],
  },
  {
    id: 'users',
    icon: <UserCog size={20} />,
    title: 'Quản lý nhân viên',
    color: 'text-gray-600 bg-gray-100',
    items: [
      {
        q: 'Các vai trò trong hệ thống?',
        a: (
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Chủ kho (owner)</strong>: toàn quyền — quản lý nhân viên, lương, xem mọi dữ liệu.</li>
            <li><strong>Quản lý (manager)</strong>: xem và thao tác hầu hết chức năng, quản lý nhân viên nhưng không đổi trạng thái tài khoản.</li>
            <li><strong>Nhân viên (employee)</strong>: chỉ xem và tạo đơn mua vào, xem hồ sơ cá nhân.</li>
          </ul>
        ),
      },
      {
        q: 'Thêm nhân viên mới?',
        a: 'Chủ kho / Quản lý vào trang Nhân viên, nhấn + Thêm nhân viên. Điền họ tên, email, mật khẩu và chọn vai trò.',
      },
      {
        q: 'Khoá / mở tài khoản nhân viên?',
        a: 'Chủ kho vào trang Nhân viên, nhấn nút khoá/mở khoá bên cạnh tài khoản cần thay đổi. Tài khoản bị khoá sẽ không đăng nhập được.',
      },
      {
        q: 'Quản lý lương nhân viên?',
        a: (
          <ol className="list-decimal list-inside space-y-1">
            <li>Vào trang Nhân viên → nhấn tên nhân viên để vào hồ sơ.</li>
            <li>Nhấn <strong>Quản lý lương</strong>.</li>
            <li>Chọn năm và tháng cần nhập.</li>
            <li>Điền lương cơ bản, ngày công chuẩn, số ngày phép có lương, số ngày nghỉ thực tế và thưởng tháng.</li>
            <li>Hệ thống tự tính lương thực nhận = Lương cơ bản - Lương ngày × Ngày nghỉ vượt phép + Thưởng.</li>
          </ol>
        ),
      },
    ],
  },
  {
    id: 'profile',
    icon: <User size={20} />,
    title: 'Hồ sơ cá nhân',
    color: 'text-cyan-600 bg-cyan-50',
    items: [
      {
        q: 'Cập nhật ảnh đại diện?',
        a: 'Vào hồ sơ cá nhân (nhấn avatar ở góc trên phải trên mobile, hoặc vào menu Nhân viên trên desktop). Nhấn vào ảnh đại diện để tải ảnh mới lên.',
      },
      {
        q: 'Đổi mật khẩu?',
        a: 'Trong trang hồ sơ cá nhân, kéo xuống phần Đổi mật khẩu. Nhân viên cần nhập mật khẩu cũ để xác nhận. Chủ kho có thể đặt lại mật khẩu cho nhân viên mà không cần mật khẩu cũ.',
      },
      {
        q: 'Đăng xuất?',
        a: 'Nhấn nút Đăng xuất ở cuối sidebar (trên mobile) hoặc ở góc trên phải màn hình (trên desktop), hoặc trong trang hồ sơ cá nhân.',
      },
    ],
  },
];

function AccordionItem({ item }: { item: { q: string; a: string | React.ReactNode } }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-3 py-3 text-left"
      >
        <span className="text-sm font-medium text-gray-800">{item.q}</span>
        {open
          ? <ChevronDown size={16} className="shrink-0 text-gray-400 mt-0.5" />
          : <ChevronRight size={16} className="shrink-0 text-gray-400 mt-0.5" />
        }
      </button>
      {open && (
        <div className="pb-3 text-sm text-gray-600 leading-relaxed">
          {item.a}
        </div>
      )}
    </div>
  );
}

export default function GuidePage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-emerald-100 rounded-xl">
          <BookOpen size={22} className="text-emerald-600" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Hướng dẫn sử dụng</h1>
          <p className="text-sm text-gray-500">Hướng dẫn chi tiết từng chức năng của hệ thống RWM</p>
        </div>
      </div>

      {/* Quick nav — scrollable chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => {
              setActiveSection(activeSection === s.id ? null : s.id);
              setTimeout(() => document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
              activeSection === s.id
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-400 hover:text-emerald-600'
            }`}
          >
            {s.title}
          </button>
        ))}
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {sections.map((section) => (
          <Card key={section.id} id={section.id}>
            {/* Section header */}
            <button
              onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
              className="w-full flex items-center justify-between gap-3 -m-1 p-1 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${section.color}`}>
                  {section.icon}
                </div>
                <h2 className="text-base font-semibold text-gray-800">{section.title}</h2>
                <span className="text-xs text-gray-400">{section.items.length} mục</span>
              </div>
              {activeSection === section.id
                ? <ChevronDown size={18} className="text-gray-400 shrink-0" />
                : <ChevronRight size={18} className="text-gray-400 shrink-0" />
              }
            </button>

            {/* Accordion items */}
            {activeSection === section.id && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                {section.items.map((item, i) => (
                  <AccordionItem key={i} item={item} />
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>

      <p className="text-xs text-gray-400 text-center mb-2">
        RWM — Hệ thống quản lý kho ve chai · Liên hệ chủ kho nếu cần hỗ trợ thêm
      </p>
      <p className="text-xs text-gray-400 text-center mb-2">
        Hỗ trợ kỹ thuật: 0908700917 (Nguyễn Văn Phúc)
      </p>
      <p className="text-xs text-gray-400 text-center mb-2">
        Email: nvphuc.adw@gmail.com
      </p>
    </div>
  );
}
