import { describe, expect, it } from "vitest";
import type { JobFilterValue } from "@/components/dashboard/job-filter-bar";
import {
  defaultSort,
  readFilter,
  writeFilter,
} from "@/app/dashboard/jobs/job-filter-url";

const empty = (scored = false): JobFilterValue => ({
  q: "",
  province: [],
  occupation: [],
  subOccupation: [],
  salaryMin: 0,
  postedWithin: 0,
  sort: defaultSort(scored),
  saved: false,
  applied: false,
});

const roundTrip = (filter: JobFilterValue, scored = false): JobFilterValue =>
  readFilter(new URLSearchParams(writeFilter(filter, 0, scored)), scored);

describe("writeFilter", () => {
  it("bỏ giá trị rỗng và giá trị mặc định khỏi URL", () => {
    expect(writeFilter(empty(), 0, false)).toBe("");
  });

  it("bỏ sort khi nó trùng mặc định của màn hình", () => {
    expect(writeFilter({ ...empty(), sort: "newest" }, 0, false)).toBe("");
    expect(writeFilter({ ...empty(true), sort: "match" }, 0, true)).toBe(
      "scored=1",
    );
  });

  it("giữ sort khi nó khác mặc định", () => {
    expect(writeFilter({ ...empty(), sort: "salary" }, 0, false)).toContain(
      "sort=salary",
    );
  });

  it("dùng append cho mảng nên nhiều lựa chọn không đè lên nhau", () => {
    const url = writeFilter(
      { ...empty(), province: ["HN", "HCM", "DN"] },
      0,
      false,
    );

    expect(new URLSearchParams(url).getAll("province")).toEqual([
      "HN",
      "HCM",
      "DN",
    ]);
  });

  it("bỏ offset 0 nhưng giữ offset khác 0", () => {
    expect(writeFilter(empty(), 0, false)).not.toContain("offset");
    expect(writeFilter(empty(), 40, false)).toContain("offset=40");
  });
});

describe("readFilter", () => {
  it("lùi về mặc định khi sort trên URL không hợp lệ", () => {
    const params = new URLSearchParams("sort=xoa-so-tui-tien");

    expect(readFilter(params, false).sort).toBe("newest");
    expect(readFilter(params, true).sort).toBe("match");
  });

  it("đọc số hỏng thành 0 chứ không thành NaN", () => {
    const filter = readFilter(
      new URLSearchParams("salaryMin=abc&postedWithin="),
      false,
    );

    expect(filter.salaryMin).toBe(0);
    expect(filter.postedWithin).toBe(0);
  });

  it("cờ chỉ bật khi đúng chuỗi '1'", () => {
    expect(readFilter(new URLSearchParams("saved=1"), false).saved).toBe(true);
    expect(readFilter(new URLSearchParams("saved=true"), false).saved).toBe(
      false,
    );
  });
});

describe("khứ hồi", () => {
  it("giữ nguyên bộ lọc rỗng", () => {
    expect(roundTrip(empty())).toEqual(empty());
  });

  it("giữ nguyên bộ lọc đầy đủ mọi trường", () => {
    const full: JobFilterValue = {
      q: "kế toán tổng hợp",
      province: ["HN", "HCM"],
      occupation: ["IT", "FINANCE"],
      subOccupation: ["IT_QA"],
      salaryMin: 15_000_000,
      postedWithin: 7,
      sort: "salary",
      saved: true,
      applied: true,
    };

    expect(roundTrip(full)).toEqual(full);
  });

  it("giữ nguyên trên màn hình đã chấm điểm", () => {
    const scoredFilter: JobFilterValue = { ...empty(true), q: "backend" };

    expect(roundTrip(scoredFilter, true)).toEqual(scoredFilter);
  });
});
