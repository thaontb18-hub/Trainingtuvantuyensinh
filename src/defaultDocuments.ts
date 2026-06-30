import { AdmissionDocument } from './types';

export const DEFAULT_DOCUMENTS: AdmissionDocument[] = [
  {
    id: 'greenwich-scholarship-2025',
    title: 'Học bổng & Ưu đãi học phí Greenwich Việt Nam 2025',
    isTemplate: true,
    content: `QUYẾT ĐỊNH VỀ CHƯƠNG TRÌNH HỌC BỔNG VÀ ƯU ĐÃI HỌC PHÍ - GREENWICH VIỆT NAM NĂM 2025
(Kèm theo Quyết định số 977/QĐ-ĐHFPT ngày 09/09/2024 của Hiệu trưởng trường Đại học FPT)

I. ĐỐI TƯỢNG VÀ ĐIỀU KIỆN ÁP DỤNG
1. Đối tượng xét học bổng:
- Học sinh tốt nghiệp Trung học phổ thông (THPT) năm 2025 trở về trước.
- Hoàn thành thủ tục xét tuyển (nộp hồ sơ và các loại phí theo quy định).
- Thỏa mãn một trong các điều kiện của loại học bổng xét duyệt tương ứng.
- Không áp dụng cho sinh viên Greenwich đã thôi học sau đó nhập học trở lại.

2. Chương trình học bổng, ưu đãi học phí cụ thể:

2.1 Học bổng GRE Talent:
- Điều kiện xét tuyển (Thỏa mãn 1 trong 4 điều kiện sau để được tham gia PHỎNG VẤN học bổng):
  + Điều kiện 1: Có ít nhất 06 (sáu) môn học có điểm trung bình môn cả năm lớp 11 hoặc học kỳ 1 lớp 12 hoặc cả năm lớp 12 đạt từ 9,0 điểm trở lên.
  + Điều kiện 2: Đạt giải khuyến khích trở lên trong các kỳ thi cấp quốc gia, quốc tế hoặc giải Ba trở lên cấp Tỉnh/Thành phố thuộc trung ương đối với một trong các môn học THPT (Toán, Lý, Hóa, Văn, Anh, Sử, Địa, Sinh, Tin).
  + Điều kiện 3: Chứng chỉ IELTS còn hạn tại thời điểm nộp hồ sơ xét tuyển đạt từ 8.0 trở lên (áp dụng tại cơ sở Hà Nội / TP.HCM) hoặc từ 7.0 trở lên (áp dụng tại cơ sở Đà Nẵng / Cần Thơ).
  + Điều kiện 4: Đạt thành tích cao hoặc đóng góp nổi bật trong các hoạt động nghệ thuật, văn hóa, xã hội, thể thao.
- Quy trình: Thí sinh thỏa mãn 1 trong các điều kiện trên sẽ tham gia phỏng vấn với hội đồng chuyên môn.
  + Thí sinh đạt phỏng vấn: Được cấp mức học bổng từ 30% - 50% - 70% - 100% học phí các kỳ học chuyên ngành. Số tiền tương ứng được trừ thẳng vào tiền học phí các học kỳ chuyên ngành.
  + Thí sinh KHÔNG đạt phỏng vấn: Mặc định được cấp học bổng Golden Compass (nếu thỏa ĐK 1, 2, 4) hoặc Golden Passport (nếu thỏa ĐK 3).

2.2 Các loại học bổng xét theo ĐIỂM HỒ SƠ (Không cần phỏng vấn):

2.2.1 Học bổng Golden Passport:
- Điều kiện: Thí sinh có điểm IELTS (còn hạn) đạt từ 7.0 trở lên (xét tuyển tại cơ sở Hà Nội / TP.HCM) hoặc từ 6.0 trở lên (xét tuyển tại cơ sở Đà Nẵng / Cần Thơ).
- Giá trị: 20% học phí giai đoạn chuyên ngành. Trừ thẳng vào tiền học phí phải nộp hàng kỳ.

2.2.2 Học bổng Silver Passport:
- Điều kiện: Thí sinh có điểm IELTS (còn hạn) đạt từ 6.0 trở lên (xét tuyển tại cơ sở Hà Nội / TP.HCM) hoặc từ 5.5 trở lên (xét tuyển tại cơ sở Đà Nẵng / Cần Thơ).
- Giá trị: 15% học phí giai đoạn chuyên ngành. Trừ thẳng vào tiền học phí phải nộp hàng kỳ.

2.2.3 Học bổng Golden Compass:
- Điều kiện (Thỏa mãn 1 trong 3 điều kiện):
  + Điều kiện 1: Tổng điểm trung bình 3 môn bất kỳ (trong các môn Toán, Văn, Anh, Lý, Hóa, Sinh, Sử, Địa, Tin) của cả năm lớp 11 hoặc kỳ 1 lớp 12 hoặc cả năm lớp 12 đạt từ 25 điểm trở lên. Trong tổ hợp phải có ít nhất 1 trong 2 môn Toán hoặc Ngữ Văn.
  + Điều kiện 2: Tổng điểm 3 môn thi kỳ thi Tốt nghiệp THPT năm 2025 (không nhân hệ số, không tính điểm ưu tiên) đạt từ 25 điểm trở lên.
  + Điều kiện 3: Tốt nghiệp các chương trình cấp chứng chỉ A-level/IB và không có môn nào dưới điểm C.
- Giá trị: 35.000.000 VNĐ. Trừ đều vào học phí các kỳ tiếng Anh và kỳ chuyên ngành, mỗi lần trừ 5.000.000 VNĐ cho đến khi hết giá trị.

2.2.4 Học bổng Silver Compass:
- Điều kiện (Thỏa mãn 1 trong 2 điều kiện):
  + Điều kiện 1: Tổng điểm trung bình 3 môn bất kỳ (trong các môn Toán, Văn, Anh, Lý, Hóa, Sinh, Sử, Địa, Tin) của cả năm lớp 11 hoặc kỳ 1 lớp 12 hoặc cả năm lớp 12 đạt từ 23 điểm trở lên. Trong tổ hợp có ít nhất 1 trong 2 môn Toán hoặc Ngữ Văn.
  + Điều kiện 2: Tổng điểm 3 môn thi kỳ thi Tốt nghiệp THPT năm 2025 (không nhân hệ số, không tính điểm ưu tiên) đạt từ 23 điểm trở lên.
- Giá trị: 25.000.000 VNĐ. Trừ đều vào học phí các kỳ tiếng Anh và kỳ chuyên ngành, mỗi lần trừ 5.000.000 VNĐ cho đến khi hết giá trị.

2.3 Các chương trình Ưu đãi nhập học khác:

2.3.1 Ưu đãi Công nghệ:
- Giá trị: 5.000.000 VNĐ/suất (số lượng có hạn: tối đa 300 suất).
- Điều kiện: Thí sinh trúng tuyển và hoàn thành các khoản phí nhập học theo quy định trước ngày 31/07/2025.
- Hình thức áp dụng: Trừ trực tiếp vào phí nộp lần đầu khi trúng tuyển. KHÔNG áp dụng chung với học bổng, ưu đãi khác.

2.3.2 Ưu đãi dành cho học sinh THPT FPT:
- Đối tượng: Thí sinh trúng tuyển, hoàn thành các khoản phí nhập học và tốt nghiệp từ các trường THPT FPT.
- Giá trị: 25.000.000 VNĐ.
- Hình thức áp dụng: Trừ đều vào học phí các kỳ tiếng Anh và kỳ chuyên ngành, mỗi lần trừ 5.000.000 VNĐ cho đến khi hết giá trị.

2.3.3 Ưu đãi dành cho cán bộ nhân viên tổ chức FPT Education (FE) và người thân:
- Đối tượng: Con ruột hoặc anh/chị/em ruột của cán bộ nhân viên thuộc FE.
- Giá trị: Giảm 30% học phí suốt khóa học chuyên ngành (Áp dụng theo quyết định số 02/QĐ-CTGDFPT ngày 19/01/2022).

II. CÁC QUY ĐỊNH BỔ SUNG VÀ QUẢN LÝ HỌC BỔNG:
- Nộp phí giữ học bổng: Thí sinh đủ điều kiện trúng tuyển cần nộp phí giữ học bổng/ưu đãi bằng học phí kỳ tiếng Anh đầu tiên trừ đi học bổng/ưu đãi được hưởng. Khoản phí này không hoàn lại và sẽ chuyển thành học phí khi nhập học chính thức.
- Nguyên tắc cộng dồn: Trường hợp thí sinh thỏa mãn nhiều loại học bổng và ưu đãi thì chỉ được hưởng 01 loại duy nhất có giá trị lớn nhất.
- Tính chính chủ và quy đổi: Học bổng và ưu đãi là đích danh, không được chuyển nhượng cho người khác và không có giá trị quy đổi thành tiền mặt.
- Phạm vi áp dụng: Học bổng không bao gồm phí tuyển sinh, phí dã ngoại, lệ phí thi lại hay các khoản phí khác ngoài học phí.
- Khống chế tỷ lệ: Số lượng học bổng và ưu đãi thực tế cấp ra được khống chế không vượt quá 10% tổng học phí chuẩn của toàn khóa tuyển sinh.`
  },
  {
    id: 'greenwich-tuition-programs-2025',
    title: 'Học phí và Chương trình đào tạo Greenwich Việt Nam',
    isTemplate: true,
    content: `CHƯƠNG TRÌNH ĐÀO TẠO VÀ HỌC PHÍ GREENWICH VIỆT NAM (Dữ liệu tham khảo tiêu chuẩn)

1. Giới thiệu chung:
Greenwich Việt Nam là chương trình liên kết quốc tế giữa Đại học FPT và Đại học Greenwich (Vương Quốc Anh) từ năm 2009. Sinh viên học tại Việt Nam nhưng nhận bằng Cử nhân chính quy do Đại học Greenwich, Vương Quốc Anh cấp, có giá trị toàn cầu và được Bộ Giáo dục và Đào tạo Việt Nam công nhận.

2. Lộ trình học tập (Tổng thời gian khoảng 3 - 4 năm):
- Giai đoạn 1: Chuẩn bị Tiếng Anh (English Preparation):
  + Dành cho sinh viên chưa đạt chuẩn tiếng Anh đầu vào (IELTS 6.0 hoặc tương đương).
  + Gồm tối đa 5 cấp độ tiếng Anh. Mỗi cấp độ kéo dài 2 tháng.
  + Học phí tiếng Anh: Khoảng 11.300.000 VNĐ/cấp độ (tùy cơ sở).
- Giai đoạn 2: Học chuyên ngành (Gồm 3 năm theo tiêu chuẩn Anh Quốc):
  + Năm 1: Các môn nền tảng chuyên ngành và kỹ năng.
  + Năm 2: Học chuyên sâu chuyên ngành và đi thực tập doanh nghiệp (OJT - On the Job Training) từ 4 - 8 tháng tại các tập đoàn đối tác (FPT Software, FPT Telecom, ngân hàng, khách sạn lớn...).
  + Năm 3: Các môn nâng cao và thực hiện đồ án tốt nghiệp (Capstole Project).

3. Các ngành đào tạo chính:
- Công nghệ thông tin (Information Technology) - Chuyên ngành sâu: Trí tuệ nhân tạo (AI), Kỹ nghệ phần mềm, An toàn thông tin.
- Quản trị kinh doanh (Business Administration) - Chuyên ngành sâu: Quản trị Marketing, Quản trị sự kiện, Quản trị truyền thông.
- Thiết kế đồ họa & Kỹ thuật số (Graphic and Digital Design).
- Quản trị Công nghệ Truyền thông (Media Technology Management).

4. Học phí chuyên ngành chuẩn (chưa áp dụng học bổng):
- Một năm học chia làm 3 học kỳ (Spring, Summer, Autumn).
- Tổng số kỳ học chuyên ngành: 9 kỳ (chia đều trong 3 năm chuyên ngành).
- Học phí chuyên ngành trung bình tại Hà Nội & TP.HCM: Khoảng 28.200.000 VNĐ/kỳ. Tổng học phí chuyên ngành khoảng 253.800.000 VNĐ cho toàn khóa.
- Học phí chuyên ngành tại Đà Nẵng & Cần Thơ: Khoảng 20.100.000 VNĐ/kỳ. Tổng học phí chuyên ngành khoảng 180.900.000 VNĐ cho toàn khóa.
- Lưu ý: Học phí có thể điều chỉnh nhẹ theo năm học nhưng cam kết không vượt quá 10% biên độ tăng hàng năm và luôn thông báo trước.

5. Bằng cấp và cơ hội học tiếp:
- Bằng Cử nhân (Bachelor of Science hoặc Bachelor of Arts) do Đại học Greenwich Anh Quốc trực tiếp cấp. Bằng giống hệt bằng cấp cho sinh viên học tại London, không ghi địa điểm học tại Việt Nam.
- Được Bộ GD&ĐT Việt Nam cấp công nhận văn bằng chính thức.
- Sau khi tốt nghiệp, sinh viên đủ điều kiện học thẳng lên Thạc sĩ (Master) tại các trường đại học ở Anh, Mỹ, Úc, Việt Nam mà không phải học bổ túc.`
  }
];
