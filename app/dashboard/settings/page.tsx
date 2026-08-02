"use client";

import { useState } from "react";
import { Bell, Shield, UserCog } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/form";

export default function SettingsPage() {
  const [language, setLanguage] = useState("vi");
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader title="Thiết lập" subtitle="Quản lý tài khoản, thông báo và quyền riêng tư" />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="h-fit lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="size-4.5 text-primary-600" />
              Thông tin tài khoản
            </CardTitle>
            <CardDescription>Cập nhật thông tin hiển thị trên hồ sơ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="s-name">Họ và tên</Label>
                <Input id="s-name" defaultValue="Nguyễn Minh An" />
              </div>
              <div>
                <Label htmlFor="s-email">Email</Label>
                <Input id="s-email" type="email" defaultValue="minhan.nguyen@gmail.com" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="s-phone">Số điện thoại</Label>
                <Input id="s-phone" defaultValue="+84 90 123 4567" />
              </div>
              <div>
                <Label htmlFor="s-language">Ngôn ngữ giao diện</Label>
                <Select
                  id="s-language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="vi">Tiếng Việt</option>
                  <option value="en">English</option>
                </Select>
              </div>
            </div>
            <Button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}>
              {saved ? "Đã lưu ✓" : "Lưu thay đổi"}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="size-4.5 text-primary-600" />
              Thông báo
            </CardTitle>
            <p className="mt-1 text-xs text-slate-400">Nhận gợi ý việc làm mới từ AI</p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="outline" className="flex-1">Hàng ngày</Button>
              <Button size="sm" className="flex-1">Real-time</Button>
            </div>
          </Card>

          <Card className="p-5">
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="size-4.5 text-primary-600" />
              Quyền riêng tư
            </CardTitle>
            <p className="mt-1 text-xs text-slate-400">
              Hồ sơ của bạn chỉ được hiển thị cho nhà tuyển dụng khi bạn chủ động ứng tuyển.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
