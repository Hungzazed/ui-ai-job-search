import { describe, expect, test } from "vitest";
import { formatJobSalary, formatSalary } from "@/utils";

const vnd = (min: number, max: number) =>
  ({ min, max, currency: "VND", period: "month" }) as const;

describe("formatSalary", () => {
  
  test("VND đầy đủ được chia trước khi gắn chữ triệu", () => {
    expect(formatSalary(vnd(28_000_000, 40_000_000))).toBe(
      "28 – 40 triệu/tháng",
    );
  });

  test("số lẻ giữ một chữ số thập phân", () => {
    expect(formatSalary(vnd(12_500_000, 17_800_000))).toBe(
      "12,5 – 17,8 triệu/tháng",
    );
  });

  test("hai đầu bằng nhau thì không in khoảng", () => {
    expect(formatSalary(vnd(20_000_000, 20_000_000))).toBe("20 triệu/tháng");
  });

  test("ngoại tệ giữ nguyên số, KHÔNG gắn chữ triệu", () => {
    expect(
      formatSalary({
        min: 700,
        max: 1500,
        currency: "USD",
        period: "month",
      }),
    ).toBe("$700 – $1,500/tháng");
  });

  test("lương năm thì đuôi phải là /năm", () => {
    expect(
      formatSalary({
        min: 20_000_000,
        max: 30_000_000,
        currency: "VND",
        period: "year",
      }),
    ).toBe("20 – 30 triệu/năm");
  });
});

describe("formatJobSalary", () => {
  test("không có số thì hiện nguyên văn của portal", () => {
    expect(
      formatJobSalary({ salary: null, salaryRaw: "Thương lượng" }),
    ).toBe("Thương lượng");
  });

  test("không có gì cả thì nói rõ, KHÔNG bịa số 0", () => {
    expect(formatJobSalary({ salary: null, salaryRaw: null })).toBe(
      "Lương thoả thuận",
    );
  });
});
