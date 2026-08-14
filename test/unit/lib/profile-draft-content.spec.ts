import { describe, expect, test } from "vitest";
import {
  APPLICABLE_FIELDS,
  currentLines,
  defaultSelection,
  isProposalEmpty,
  proposalRows,
  proposedLines,
} from "@/lib/profile-draft-content";
import type { ProfileProposal, ProfileRecord } from "@/services";

const emptyProposal = (): ProfileProposal => ({
  languages: [],
  primarySkills: [],
  secondarySkills: [],
  directExperienceDomains: [],
  adjacentExperience: [],
  experiences: [],
  educations: [],
  certificates: [],
  projects: [],
  missing: [],
  notes: [],
});

const proposal = (overrides: Partial<ProfileProposal> = {}): ProfileProposal => ({
  ...emptyProposal(),
  headline: "Kỹ sư Backend 5 năm kinh nghiệm",
  primarySkills: ["TypeScript", "NestJS"],
  experiences: [
    {
      company: "Digistore",
      position: "Senior Backend Engineer",
      period: "03/2022 – nay",
      highlights: [],
    },
  ],
  ...overrides,
});

const profile = (overrides: Partial<ProfileRecord> = {}): ProfileRecord =>
  ({
    id: "p1",
    userId: "u1",
    completion: 20,
    headline: null,
    summary: null,
    location: null,
    country: null,
    citizenship: null,
    workPermit: null,
    employmentStatus: null,
    remotePreference: null,
    commuteConstraint: null,
    willingToRelocate: false,
    languages: [],
    primarySkills: [],
    secondarySkills: [],
    lackingSkills: [],
    directExperienceDomains: [],
    adjacentExperience: [],
    careerGoals: [],
    energizingTasks: [],
    drainingTasks: [],
    targetSectors: [],
    dealBreakers: [],
    experiences: null,
    educations: null,
    behavioralTraits: null,
    createdAt: "2026-08-12T00:00:00.000Z",
    updatedAt: "2026-08-12T00:00:00.000Z",
    ...overrides,
  }) as ProfileRecord;

describe("proposedLines", () => {
  test("trường chuỗi rỗng hoặc chỉ khoảng trắng thì coi như không có", () => {
    expect(proposedLines("headline", proposal({ headline: "" }))).toEqual([]);
    expect(proposedLines("headline", proposal({ headline: "   " }))).toEqual([]);
    expect(proposedLines("summary", proposal({ summary: undefined }))).toEqual([]);
  });

  test("gộp các phần của kinh nghiệm thành một dòng đọc được", () => {
    expect(proposedLines("experiences", proposal())).toEqual([
      "Senior Backend Engineer · Digistore · 03/2022 – nay",
    ]);
  });

  test("bỏ phần trống thay vì để lại dấu phân cách lửng", () => {
    const lines = proposedLines(
      "certificates",
      proposal({ certificates: [{ name: "AWS SAA" }] }),
    );
    expect(lines).toEqual(["AWS SAA"]);
    expect(lines[0]).not.toContain("·");
  });
});

describe("currentLines", () => {
  test("không có hồ sơ thì trả mảng rỗng, không vỡ", () => {
    for (const field of APPLICABLE_FIELDS) {
      expect(currentLines(field, null)).toEqual([]);
    }
  });

  test("đọc được khối JSON của hồ sơ hiện tại", () => {
    const lines = currentLines(
      "experiences",
      profile({
        experiences: [
          { company: "Cũ", position: "Dev", period: "2019 – 2021" },
        ] as unknown as ProfileRecord["experiences"],
      }),
    );
    expect(lines).toEqual(["Dev · Cũ · 2019 – 2021"]);
  });

  test("rút CÙNG một dòng chữ như phía đề xuất, với mọi loại mục", () => {
    /*
     * Lỗi thật đã thấy trên ảnh chụp: vừa áp dụng Chứng chỉ xong mà hàng đó vẫn
     * hiện nhãn "ghi đè".
     *
     * Nguyên nhân: hai phía dựng dòng theo hai cách. Phía đề xuất ghép
     * `[name, issuer, year]`; phía hồ sơ đọc một danh sách khoá cứng
     * `[position, company, school, field, name, period]` không có `year` lẫn
     * `issuer`. Cùng dữ liệu, hai dòng khác nhau, nên phép so luôn báo khác.
     *
     * `apply()` chép nguyên vẹn đề xuất sang hồ sơ, nên sau khi áp dụng hai bên
     * PHẢI rút ra chuỗi giống hệt. Đó là điều test này ghim.
     */
    const p = proposal({
      certificates: [{ name: "AWS SAA", issuer: "Amazon", year: "2023" }],
      projects: [
        { name: "Trợ lý AI", description: "x", technologies: ["NestJS", "Zod"] },
      ],
      educations: [
        { school: "ĐH Bách khoa", degree: "Cử nhân", field: "CNTT", period: "2015 – 2019" },
      ],
    });

    for (const field of ["certificates", "projects", "educations", "experiences"] as const) {
      const fromProposal = proposedLines(field, p);
      const fromProfile = currentLines(
        field,
        profile({
          [field]: p[field],
        } as unknown as Partial<ProfileRecord>),
      );
      expect(fromProfile, `trường ${field} rút ra khác nhau ở hai phía`).toEqual(
        fromProposal,
      );
    }
  });

  test("mảng lồng trong mục được ghép bằng dấu phẩy, không thành [object Object]", () => {
    const lines = currentLines(
      "projects",
      profile({
        projects: [
          { name: "Dự án", technologies: ["Go", "Redis"] },
        ],
      } as unknown as Partial<ProfileRecord>),
    );
    expect(lines).toEqual(["Dự án · Go, Redis"]);
    expect(lines[0]).not.toContain("object");
  });

  test("khối JSON hỏng thì bỏ đúng phần tử đó, không mất cả trường", () => {
    // Trường hợp thật: dữ liệu do phiên bản code cũ ghi, hoặc sửa tay.
    const lines = currentLines(
      "experiences",
      profile({
        experiences: [
          null,
          "chuỗi lạc",
          { company: "Tốt", position: "Dev" },
          42,
        ] as unknown as ProfileRecord["experiences"],
      }),
    );
    expect(lines).toEqual(["Dev · Tốt"]);
  });
});

describe("proposalRows", () => {
  test("luôn trả về đủ mọi trường áp dụng được, kể cả trường rỗng", () => {
    // Hàng rỗng vẫn phải hiện: bỏ đi thì người dùng tưởng model đã đọc được học
    // vấn của mình trong khi thực ra là không.
    const rows = proposalRows(emptyProposal(), null);
    expect(rows).toHaveLength(APPLICABLE_FIELDS.length);
    expect(rows.every((row) => row.isEmpty)).toBe(true);
  });

  test("đánh dấu overwrites khi hồ sơ đã có dữ liệu ở trường đó", () => {
    const rows = proposalRows(
      proposal(),
      profile({ primarySkills: ["Java"], headline: "Lập trình viên" }),
    );

    const skills = rows.find((row) => row.field === "primarySkills");
    expect(skills?.overwrites).toBe(true);
    expect(skills?.current).toEqual(["Java"]);

    // Trường model không có gì thì KHÔNG phải ghi đè, dù hồ sơ đang có dữ liệu —
    // không có gì để ghi thì không ghi đè được.
    const summary = rows.find((row) => row.field === "summary");
    expect(summary?.isEmpty).toBe(true);
    expect(summary?.overwrites).toBe(false);
  });

  test("giá trị trùng khít là `unchanged`, KHÔNG phải `overwrites`", () => {
    // Trường hợp thật đã thấy trên màn hình: hồ sơ ghi "Việt Nam", model cũng đề
    // xuất "Việt Nam", mà hàng lại hiện nhãn cảnh báo "ghi đè".
    const rows = proposalRows(
      proposal({ country: "Việt Nam" }),
      profile({ country: "Việt Nam" }),
    );
    const country = rows.find((row) => row.field === "country");

    expect(country?.unchanged).toBe(true);
    expect(country?.overwrites).toBe(false);
  });

  test("khác thứ tự nhưng cùng tập thì vẫn là `unchanged`", () => {
    // Model liệt kê kỹ năng theo thứ tự khác hồ sơ đang lưu vẫn là cùng một tập,
    // và báo "ghi đè" cho một phép sắp lại thứ tự là báo sai.
    const rows = proposalRows(
      proposal({ primarySkills: ["NestJS", "TypeScript"] }),
      profile({ primarySkills: ["TypeScript", "NestJS"] }),
    );
    const skills = rows.find((row) => row.field === "primarySkills");

    expect(skills?.unchanged).toBe(true);
    expect(skills?.overwrites).toBe(false);
  });

  test("hai tập CÙNG SỐ PHẦN TỬ nhưng khác nội dung không bị coi là giống nhau", () => {
    /*
     * Phải cùng số phần tử, nếu không test này vô dụng.
     *
     * Bản đầu dùng `["Go Rust"]` so với `["Go", "Rust"]` — một phần tử so với hai —
     * nên `a.length === b.length` chặn lại ngay và phép ghép chuỗi không bao giờ
     * được kiểm. Nhờ vậy nó vẫn xanh trong khi dấu phân cách thật sự là CHUỖI RỖNG.
     *
     * Hai mảng dưới đây đều 2 phần tử: ghép bằng chuỗi rỗng cho ra "abc" ở cả hai
     * bên, ghép bằng ký tự không có trong dữ liệu thì khác nhau.
     */
    const rows = proposalRows(
      proposal({ primarySkills: ["ab", "c"] }),
      profile({ primarySkills: ["a", "bc"] }),
    );
    const skills = rows.find((row) => row.field === "primarySkills");

    expect(skills?.unchanged).toBe(false);
    expect(skills?.overwrites).toBe(true);
  });

  test("dấu cách trong dữ liệu không làm hai tập khác nhau trùng nhau", () => {
    const rows = proposalRows(
      proposal({ primarySkills: ["Go Rust", "C"] }),
      profile({ primarySkills: ["Go", "Rust C"] }),
    );
    expect(rows.find((row) => row.field === "primarySkills")?.unchanged).toBe(
      false,
    );
  });

  test("mọi hàng đều có nhãn tiếng Việt, không lộ tên trường ra giao diện", () => {
    for (const row of proposalRows(proposal(), null)) {
      expect(row.label.length).toBeGreaterThan(0);
      expect(row.label).not.toBe(row.field);
      expect(row.label).not.toMatch(/[a-z][A-Z]/); // không phải camelCase
    }
  });
});

describe("defaultSelection", () => {
  test("tích sẵn trường có dữ liệu mới và hồ sơ đang trống", () => {
    const rows = proposalRows(proposal(), profile());
    expect(defaultSelection(rows)).toEqual([
      "headline",
      "primarySkills",
      "experiences",
    ]);
  });

  test("KHÔNG tích sẵn trường sẽ ghi đè", () => {
    // Quy tắc quan trọng nhất của màn xác nhận. Tích sẵn một ô ghi đè lên dữ liệu
    // người dùng đã gõ tay là biến "đồng ý" thành "không kịp phản đối".
    const rows = proposalRows(
      proposal(),
      profile({ primarySkills: ["Java"], headline: "Lập trình viên" }),
    );
    const selected = defaultSelection(rows);

    expect(selected).not.toContain("primarySkills");
    expect(selected).not.toContain("headline");
    expect(selected).toContain("experiences");
  });

  test("KHÔNG tích sẵn trường rỗng", () => {
    expect(defaultSelection(proposalRows(emptyProposal(), null))).toEqual([]);
  });

  test("KHÔNG tích sẵn trường trùng khít", () => {
    // Ghi lại đúng giá trị đang có chỉ làm con số "đã chọn N trường" phồng lên mà
    // không đổi gì trong hồ sơ.
    const rows = proposalRows(
      proposal({ country: "Việt Nam" }),
      profile({ country: "Việt Nam" }),
    );
    expect(defaultSelection(rows)).not.toContain("country");
  });
});

describe("isProposalEmpty", () => {
  test("null là rỗng", () => {
    expect(isProposalEmpty(null)).toBe(true);
  });

  test("đề xuất không có trường nào là rỗng, dù có missing và notes", () => {
    // `missing`/`notes` là ghi chú của model về chính nó, không phải dữ liệu hồ sơ.
    // Một đề xuất chỉ có chúng thì với người dùng vẫn là "không đọc ra gì".
    expect(
      isProposalEmpty({
        ...emptyProposal(),
        missing: ["Học vấn"],
        notes: ["CV rất ngắn"],
      }),
    ).toBe(true);
  });

  test("có đúng một trường cũng không còn rỗng", () => {
    expect(isProposalEmpty(proposal({ primarySkills: ["Go"] }))).toBe(false);
  });
});
