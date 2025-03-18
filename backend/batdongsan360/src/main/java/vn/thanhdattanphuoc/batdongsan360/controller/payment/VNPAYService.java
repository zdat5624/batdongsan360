package vn.thanhdattanphuoc.batdongsan360.controller.payment;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.TimeZone;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.nimbusds.jose.shaded.gson.Gson;
import com.nimbusds.jose.shaded.gson.JsonObject;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import vn.thanhdattanphuoc.batdongsan360.domain.Transaction;
import vn.thanhdattanphuoc.batdongsan360.domain.User;
import vn.thanhdattanphuoc.batdongsan360.repository.TransactionRepository;
import vn.thanhdattanphuoc.batdongsan360.repository.UserRepository;
import vn.thanhdattanphuoc.batdongsan360.util.SecurityUtil;
import vn.thanhdattanphuoc.batdongsan360.util.constant.TransStatusEnum;
import vn.thanhdattanphuoc.batdongsan360.util.error.IdInvalidException;

@Service
public class VNPAYService {

    TransactionRepository transactionRepository;
    UserRepository userRepository;

    public VNPAYService(TransactionRepository transactionRepository, UserRepository userRepository) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    public String createVNPayLink(long inputAmount) throws UnsupportedEncodingException, IdInvalidException {

        String vnp_Version = "2.1.0";
        String vnp_Command = "pay";
        String orderType = "other";

        // amout
        long amount = inputAmount * 100;
        // long amount = Integer.parseInt(req.getParameter("amount")) * 100;

        // Bank code

        // String bankCode = req.getParameter("bankCode");

        // Lấy user hiện tại từ SecurityUtil
        String userEmail = SecurityUtil.getCurrentUserLogin()
                .orElseThrow(() -> new IdInvalidException("Chưa đăng nhập"));
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IdInvalidException("Không tìm thấy người dùng"));

        String vnp_TxnRef = Config.getRandomNumber(10);

        String vnp_IpAddr = "127.0.0.1";
        // String vnp_IpAddr = Config.getIpAddress(req);

        String vnp_TmnCode = Config.vnp_TmnCode;

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        vnp_Params.put("vnp_CurrCode", "VND");

        // if (bankCode != null && !bankCode.isEmpty()) {
        // vnp_Params.put("vnp_BankCode", bankCode);
        // }
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", "Thanh toán giao dịch nạp tiền id " + vnp_TxnRef);
        vnp_Params.put("vnp_OrderType", orderType);

        // language default: vn
        vnp_Params.put("vnp_Locale", "vn");

        // String locate = req.getParameter("language");
        // if (locate != null && !locate.isEmpty()) {
        // vnp_Params.put("vnp_Locale", locate);
        // } else {
        // vnp_Params.put("vnp_Locale", "vn");
        // }
        vnp_Params.put("vnp_ReturnUrl", Config.vnp_ReturnUrl);
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        List fieldNames = new ArrayList(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = (String) itr.next();
            String fieldValue = (String) vnp_Params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                // Build hash data
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                // Build query
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }
        String queryUrl = query.toString();
        String vnp_SecureHash = Config.hmacSHA512(Config.secretKey, hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
        String paymentUrl = Config.vnp_PayUrl + "?" + queryUrl;

        // Tạo giao dịch mới
        Transaction transaction = new Transaction();
        transaction.setAmount(inputAmount);
        transaction.setStatus(TransStatusEnum.PENDING);
        transaction.setDescription("Giao dịch đang chờ thanh toán");
        transaction.setUser(user);
        transaction.setPaymentLink(paymentUrl);
        transaction.setTxnId(vnp_TxnRef);
        this.transactionRepository.save(transaction);

        JsonObject job = new JsonObject();
        job.addProperty("code", "00");
        job.addProperty("message", "success");
        job.addProperty("data", paymentUrl);

        return new Gson().toJson(job);
    }

    @Transactional
    public int handleOrderReturn(HttpServletRequest request) throws IdInvalidException {
        // Begin process return from VNPAY
        Map fields = new HashMap();
        for (Enumeration params = request.getParameterNames(); params.hasMoreElements();) {
            String fieldName = null;
            String fieldValue = null;
            try {
                fieldName = URLEncoder.encode((String) params.nextElement(),
                        StandardCharsets.US_ASCII.toString());
                fieldValue = URLEncoder.encode(request.getParameter(fieldName),
                        StandardCharsets.US_ASCII.toString());
            } catch (UnsupportedEncodingException e) {
                e.printStackTrace();
            }
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                fields.put(fieldName, fieldValue);
            }
        }

        String vnp_SecureHash = request.getParameter("vnp_SecureHash");
        if (fields.containsKey("vnp_SecureHashType")) {
            fields.remove("vnp_SecureHashType");
        }
        if (fields.containsKey("vnp_SecureHash")) {
            fields.remove("vnp_SecureHash");
        }
        String signValue = Config.hashAllFields(fields);

        String txnId = request.getParameter("vnp_TxnRef");
        String transactionStatus = request.getParameter("vnp_TransactionStatus");

        if (txnId == null) {
            throw new IdInvalidException("Không tìm thấy mã giao dịch.");
        }

        Transaction transaction = transactionRepository.findByTxnId(txnId)
                .orElseThrow(() -> new IdInvalidException("Giao dịch không tồn tại"));

        String description;
        TransStatusEnum status;

        switch (transactionStatus) {
            case "00":
                status = TransStatusEnum.SUCCESS;
                description = "Giao dịch thành công";
                break;
            case "07":
                status = TransStatusEnum.FAILED;
                description = "Trừ tiền thành công, giao dịch bị nghi ngờ (lừa đảo, bất thường)";
                break;
            case "09":
                status = TransStatusEnum.FAILED;
                description = "Thẻ/Tài khoản chưa đăng ký InternetBanking";
                break;
            case "10":
                status = TransStatusEnum.FAILED;
                description = "Xác thực thông tin thẻ/tài khoản không đúng quá 3 lần";
                break;
            case "11":
                status = TransStatusEnum.FAILED;
                description = "Hết hạn chờ thanh toán";
                break;
            case "12":
                status = TransStatusEnum.FAILED;
                description = "Thẻ/Tài khoản bị khóa";
                break;
            case "13":
                status = TransStatusEnum.FAILED;
                description = "Sai mật khẩu xác thực giao dịch (OTP)";
                break;
            case "24":
                status = TransStatusEnum.FAILED;
                description = "Khách hàng hủy giao dịch";
                break;
            case "51":
                status = TransStatusEnum.FAILED;
                description = "Không đủ số dư để thực hiện giao dịch";
                break;
            case "65":
                status = TransStatusEnum.FAILED;
                description = "Vượt quá hạn mức giao dịch trong ngày";
                break;
            case "75":
                status = TransStatusEnum.FAILED;
                description = "Ngân hàng thanh toán đang bảo trì";
                break;
            case "79":
                status = TransStatusEnum.FAILED;
                description = "Sai mật khẩu thanh toán quá số lần quy định";
                break;
            case "99":
                status = TransStatusEnum.FAILED;
                description = "Lỗi không xác định";
                break;
            default:
                status = TransStatusEnum.FAILED;
                description = "Lỗi không xác định (mã: " + transactionStatus + ")";
                break;
        }

        if (signValue.equals(vnp_SecureHash)) {
            // Cập nhật trạng thái và mô tả
            transaction.setStatus(status);
            transaction.setDescription(description);
            this.transactionRepository.save(transaction);
            if ("00".equals(request.getParameter("vnp_TransactionStatus"))) {

                User user = transaction.getUser();
                user.setBalance(user.getBalance() + transaction.getAmount());
                user = this.userRepository.save(user);
                return 1;
            } else {
                return 0;
            }

        } else {
            return -1;
        }

    }

}
