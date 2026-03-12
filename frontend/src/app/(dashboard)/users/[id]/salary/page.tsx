'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { userService, salaryService } from '@/services/user.service';
import { UserSalary } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { ArrowLeft, Save, TrendingUp, Calendar, AlertCircle, Check } from 'lucide-react';

const MONTHS = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];

function fmt(n: number) {
  return n.toLocaleString('vi-VN') + ' đ';
}

type SalaryForm = {
  base_salary: string;
  working_days: string;
  paid_leave_days: string;
  absent_days: string;
  bonus: string;
  note: string;
};

function emptyForm(defaults?: Partial<UserSalary>): SalaryForm {
  return {
    base_salary:     String(defaults?.base_salary     ?? ''),
    working_days:    String(defaults?.working_days    ?? 26),
    paid_leave_days: String(defaults?.paid_leave_days ?? 0),
    absent_days:     String(defaults?.absent_days     ?? 0),
    bonus:           String(defaults?.bonus           ?? 0),
    note:            defaults?.note ?? '',
  };
}

function calcSummary(form: SalaryForm) {
  const base    = Number(form.base_salary)  || 0;
  const wdays   = Number(form.working_days) || 26;
  const paid    = Number(form.paid_leave_days) || 0;
  const absent  = Number(form.absent_days)  || 0;
  const bonus   = Number(form.bonus)        || 0;
  const daily   = wdays > 0 ? base / wdays : 0;
  const excess  = Math.max(0, absent - paid);
  const deduct  = excess * daily;
  const net     = base - deduct + bonus;
  return { daily, excess, deduct, net };
}

export default function UserSalaryPage() {
  const params    = useParams();
  const userId    = Number(params.id);
  const qc        = useQueryClient();
  const [year, setYear]   = useState(new Date().getFullYear());
  const [selMonth, setSelMonth] = useState(new Date().getMonth() + 1); // 1-12
  const [form, setForm]   = useState<SalaryForm>(emptyForm());
  const [saved, setSaved] = useState(false);

  const monthStr = `${year}-${String(selMonth).padStart(2, '0')}`;

  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => userService.getById(userId),
  });

  const { data: yearData = [] } = useQuery<UserSalary[]>({
    queryKey: ['salaries', userId, year],
    queryFn: () => salaryService.getByYear(userId, year),
  });

  const { data: monthData } = useQuery<UserSalary | null>({
    queryKey: ['salary', userId, monthStr],
    queryFn: () => salaryService.getByMonth(userId, monthStr),
  });

  // Khi chọn tháng khác, load lại form
  useEffect(() => {
    setForm(emptyForm(monthData ?? undefined));
    setSaved(false);
  }, [monthData, monthStr]);

  const upsertMutation = useMutation({
    mutationFn: () => salaryService.upsert(userId, monthStr, {
      base_salary:     Number(form.base_salary),
      working_days:    Number(form.working_days),
      paid_leave_days: Number(form.paid_leave_days),
      absent_days:     Number(form.absent_days),
      bonus:           Number(form.bonus),
      note:            form.note,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['salaries', userId, year] });
      qc.invalidateQueries({ queryKey: ['salary', userId, monthStr] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const set = (f: keyof SalaryForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [f]: e.target.value }));

  const { daily, excess, deduct, net } = calcSummary(form);

  const annualTotal   = yearData.reduce((s, r) => s + r.net_salary, 0);
  const annualBonus   = yearData.reduce((s, r) => s + r.bonus, 0);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/users/${userId}`}>
            <Button variant="ghost" size="sm"><ArrowLeft size={16} /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Lương tháng — {user?.name ?? '...'}
            </h1>
            <p className="text-sm text-gray-500">Quản lý lương, thưởng và ngày phép</p>
          </div>
        </div>
        {/* Year selector */}
        <div className="flex items-center gap-2">
          {[new Date().getFullYear() - 1, new Date().getFullYear()].map((y) => (
            <button key={y} onClick={() => setYear(y)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${year === y ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              {y}
            </button>
          ))}
        </div>
      </div>

      {/* Annual summary */}
      {yearData.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg"><TrendingUp size={18} className="text-emerald-600" /></div>
              <div>
                <p className="text-xs text-gray-500">Lương thực nhận {year}</p>
                <p className="text-xl font-bold text-gray-900">{fmt(annualTotal)}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg"><TrendingUp size={18} className="text-yellow-600" /></div>
              <div>
                <p className="text-xs text-gray-500">Tổng thưởng {year}</p>
                <p className="text-xl font-bold text-yellow-700">{fmt(annualBonus)}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg"><Calendar size={18} className="text-blue-600" /></div>
              <div>
                <p className="text-xs text-gray-500">Số tháng đã nhập</p>
                <p className="text-xl font-bold text-gray-900">{yearData.length} / 12</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Month picker column */}
        <div className="col-span-1">
          <Card>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Chọn tháng — {year}</h3>
            <div className="grid grid-cols-3 gap-1.5">
              {MONTHS.map((label, idx) => {
                const m      = idx + 1;
                const mStr   = `${year}-${String(m).padStart(2, '0')}`;
                const record = yearData.find((r) => r.month === mStr);
                const active = selMonth === m;
                return (
                  <button
                    key={m}
                    onClick={() => setSelMonth(m)}
                    className={`relative px-2 py-2 rounded-lg text-xs font-medium transition-colors ${
                      active
                        ? 'bg-emerald-600 text-white'
                        : record
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {label}
                    {record && !active && (
                      <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Year overview table */}
            {yearData.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Tóm tắt năm</h3>
                <div className="space-y-1 text-xs">
                  {yearData.map((r) => (
                    <button
                      key={r.month}
                      onClick={() => { const m = parseInt(r.month.split('-')[1]); setSelMonth(m); }}
                      className="w-full flex justify-between items-center hover:bg-gray-50 rounded px-1 py-0.5"
                    >
                      <span className="text-gray-600">{r.month}</span>
                      <span className="font-medium text-emerald-700">{fmt(r.net_salary)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Form column */}
        <div className="col-span-2 space-y-4">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-800">
                Tháng {selMonth}/{year}
              </h3>
              {saved && (
                <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  <Check size={12} /> Đã lưu
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input label="Lương cơ bản (₫)" type="number" min="0"
                value={form.base_salary} onChange={set('base_salary')} />
              <Input label="Ngày công chuẩn / tháng" type="number" min="1" max="31"
                value={form.working_days} onChange={set('working_days')} />
              <Input label="Số ngày phép có lương" type="number" min="0" max="31"
                value={form.paid_leave_days} onChange={set('paid_leave_days')} />
              <Input label="Số ngày nghỉ thực tế" type="number" min="0" max="31" step="0.5"
                value={form.absent_days} onChange={set('absent_days')} />
              <Input label="Thưởng tháng (₫)" type="number" min="0"
                value={form.bonus} onChange={set('bonus')} />
              <Input label="Ghi chú" value={form.note} onChange={set('note')} />
            </div>

            <Button
              className="mt-4"
              size="sm"
              loading={upsertMutation.isPending}
              disabled={!form.base_salary}
              onClick={() => upsertMutation.mutate()}
            >
              <Save size={15} /> Lưu tháng {selMonth}/{year}
            </Button>
          </Card>

          {/* Calculation preview */}
          <Card>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Tính toán lương</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Lương cơ bản</span>
                <span className="font-medium">{fmt(Number(form.base_salary) || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Lương 1 ngày công ({form.working_days} ngày)</span>
                <span>{fmt(Math.round(daily))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Ngày nghỉ thực tế</span>
                <span>{form.absent_days} ngày</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Ngày phép có lương</span>
                <span className="text-green-600">− {form.paid_leave_days} ngày</span>
              </div>
              {excess > 0 ? (
                <div className="flex items-center justify-between bg-red-50 rounded-lg px-3 py-2 border border-red-100">
                  <span className="flex items-center gap-1.5 text-red-600"><AlertCircle size={14} /> Ngày nghỉ bị trừ lương ({excess} ngày)</span>
                  <span className="font-semibold text-red-600">− {fmt(Math.round(deduct))}</span>
                </div>
              ) : (
                <div className="flex justify-between bg-green-50 rounded-lg px-3 py-2 border border-green-100">
                  <span className="text-green-700">Trong ngày phép có lương — không trừ</span>
                  <span className="text-green-600">0 đ</span>
                </div>
              )}
              {Number(form.bonus) > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Thưởng</span>
                  <span className="text-yellow-700">+ {fmt(Number(form.bonus))}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t-2 border-gray-200 font-bold text-base">
                <span>Lương thực nhận</span>
                <span className="text-emerald-700">{fmt(Math.round(net))}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
