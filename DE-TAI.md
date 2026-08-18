# ĐỀ TÀI: NỀN TẢNG AI-NATIVE CAREER AGENT DỰA TRÊN KIẾN TRÚC MULTI-AGENT

---

## 1. MẶT HẠN CHẾ & BỐI CẢNH THỰC TẾ

Hiện nay, ứng viên phải dành nhiều thời gian cho các công việc lặp lại như:
* Tìm kiếm tin tuyển dụng.
* Phân tích mô tả công việc (Job Description - JD).
* Chỉnh sửa CV và viết Cover Letter.
* Nộp hồ sơ thủ công.

> **Thách thức:** Việc sử dụng một CV chung cho nhiều vị trí làm giảm đáng kể khả năng vượt qua vòng sàng lọc (ATS / HR filter).

---

## 2. GIẢI PHÁP & MỤC TIÊU ĐỀ TÀI

Phát triển nền tảng **AI-Native Career Agent** dựa trên kiến trúc Multi-Agent, ứng dụng các công nghệ cốt lõi: **LLM và Vector Search**.

### Mục tiêu chính:
1. **Tự động hóa chuẩn bị hồ sơ ứng tuyển:** Tự động phân tích hồ sơ, đánh giá mức độ phù hợp với từng vị trí, tối ưu CV và tạo Cover Letter cá nhân hóa.
2. **Career Mentor:** Phân tích khoảng trống kỹ năng (Skill Gap), đề xuất lộ trình học tập cá nhân hóa và mô phỏng phỏng vấn giả lập 1-1 với AI.

---

## 3. DỰ KIẾN SẢN PHẨM NGHIÊN CỨU

### 3.1. Web Application (Full-stack)
Ứng dụng Web hoàn chỉnh gồm **2 phân hệ**:

* **Phân hệ Ứng viên:**
  * Upload CV, kết nối GitHub / LinkedIn.
  * Xem danh sách việc làm phù hợp và kiểm tra **Match Score**.
  * Tự động sinh CV & Cover Letter mới cho từng JD.
  * Theo dõi lịch sử ứng tuyển.
  * Giao diện theo dõi lộ trình học tập (Learning Path).
  * Phòng luyện tập phỏng vấn giả lập 1-1 với AI.
* **Phân hệ Admin:**
  * Quản lý người dùng và nguồn dữ liệu tuyển dụng.
  * Quản lý Prompt Template.
  * Theo dõi Log hoạt động của toàn bộ hệ thống AI Agents.

---

### 3.2. Hệ thống Multi-Agent AI
Bao gồm các AI Agent chuyên trách chạy ngầm, tích hợp các công nghệ lõi:

| STT | Agent | Vai trò & Công nghệ sử dụng |
| :---: | :--- | :--- |
| **1** | **Profile Understanding Agent** | Sử dụng **AI & OCR** để phân tích, trích xuất và chuẩn hóa thông tin từ CV, LinkedIn, GitHub và tài liệu đính kèm (bằng cấp, bảng điểm, chứng chỉ) thành dữ liệu có cấu trúc. |
| **2** | **Job Hunter Agent** | Tự động thu thập (**Web Scraping**) và cập nhật dữ liệu việc làm liên tục từ các nền tảng tuyển dụng lớn. |
| **3** | **Job Analysis Agent** | Sử dụng **LLM** để đọc tin tuyển dụng và tự động trích xuất các kỹ năng, yêu cầu trọng tâm từ JD. |
| **4** | **Matching Engine Agent** | Sử dụng **Embedding, Vector Search & LLM** để đối sánh hồ sơ ứng viên với JD. Tính toán **Match Score** (kỹ năng, kinh nghiệm, dự án, cấp bậc, mức lương). Phân tích **Skill Gap** và đề xuất **Learning Path** cá nhân hóa. |
| **5** | **CV Optimizer Agent** | Tự động tinh chỉnh và viết lại CV để khớp nhất với JD, tuân thủ nghiêm ngặt quy tắc **không bịa đặt dữ liệu**. |
| **6** | **Cover Letter Generator** | Tự động sinh thư ứng tuyển cá nhân hóa, mang tính độc bản dựa trên CV và JD. |
| **8** | **AI Mock Interviewer** | Đóng vai trò HR chuyên nghiệp, sử dụng CV đã tối ưu và JD để đặt câu hỏi phỏng vấn, đánh giá và phản hồi năng lực của ứng viên. |

---

### 3.3. Tài liệu Nghiên cứu
* Báo cáo khóa luận tốt nghiệp chi tiết theo đúng tiêu chuẩn quy định của nhà trường.

---

## 4. KHẢ NĂNG ỨNG DỤNG THỰC TỄN

* **Tối ưu hóa thời gian & công sức:** Giảm thiểu thao tác thủ công, lặp đi lặp lại cho người tìm việc.
* **Tăng tỷ lệ trúng tuyển:** Nâng cao khả năng vượt qua vòng sàng lọc hồ sơ nhờ hồ sơ được cá nhân hóa sâu theo từng JD.
* **Đổi mới mô hình việc làm:** Cung cấp giải pháp **AI-Native** thực sự và tự động hóa toàn diện quy trình tuyển dụng / ứng tuyển.

---

## 5. YÊU CẦU KIẾN THỨC & KỸ NĂNG ĐỐI VỚI SINH VIÊN

Để thực hiện đề tài, sinh viên cần trang bị khối kiến thức nền tảng:

### 1. Web Full-stack & Hệ thống
* **Frontend & Backend:** Thành thạo ngôn ngữ lập trình để xây dựng giao diện và xử lý nghiệp vụ.
* **Database & Task Queue:** Thành thạo CSDL (SQL/NoSQL) và sử dụng **Redis Queue** để xử lý hàng đợi công việc.
* **Kiến trúc phân tán:** Tư duy thiết kế kiến trúc **Multi-Agent**, đảm bảo các Agent hoạt động độc lập nhưng giao tiếp và truyền dữ liệu mượt mà.

### 2. Trí tuệ Nhân tạo & NLP
* **LLM & Prompt Engineering:** Kỹ năng giao tiếp, tối ưu Prompt cho LLM đọc hiểu JD, trích xuất kỹ năng và sinh văn bản.
* **Xử lý dữ liệu thô (PDF Parsing & OCR):** Bóc tách văn bản từ PDF, áp dụng OCR để đọc bằng cấp, chứng chỉ.
* **Vector Search & AI Reasoning:** Hiểu về Embedding Model, chuyển đổi văn bản thành Vector và dùng Similarity / Vector Search để tính điểm phù hợp.

### 3. Thu thập Dữ liệu & Tự động hóa
* **Web Scraping:** Viết bot cào dữ liệu tuyển dụng từ các nền tảng lớn (*ITviec, LinkedIn, TopCV...*).

---

## 6. YÊU CẦU ĐẦU RÁ CỦA ĐỀ TÀI

1. **Sản phẩm Web App:** Hoạt động thực tế, tích hợp kiến trúc Multi-Agent hiện đại, hoàn thiện cả 2 phân hệ **Ứng viên** và **Admin**.
2. **Tính năng cốt lõi:**
   * Bóc tách chính xác CV, bằng cấp bằng LLM + OCR.
   * Tự động cào và phân tích JD bằng LLM.
   * Thuật toán **Matching Engine** tính điểm **Match Score** chính xác bằng Vector Search.
   * Tự động tối ưu CV và sinh Cover Letter độc bản (không hallucinate / bịa đặt).
3. **Hiệu năng & Nghiệp vụ:** Giảm thời gian tìm việc, tăng tỷ lệ khớp công việc và hỗ trợ ứng tuyển hiệu quả.
4. **Báo cáo Khóa luận:** Hoàn chỉnh theo đúng mẫu và chuẩn chất lượng của nhà trường.