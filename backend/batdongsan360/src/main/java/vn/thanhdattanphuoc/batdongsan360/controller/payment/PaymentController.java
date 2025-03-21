package vn.thanhdattanphuoc.batdongsan360.controller.payment;

import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import vn.thanhdattanphuoc.batdongsan360.domain.request.CreatePaymentDTO;
import vn.thanhdattanphuoc.batdongsan360.util.error.IdInvalidException;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
public class PaymentController {

    @Value("${vnp.ReturnUrl.frontend}")
    private String vnp_ReturnUrl_frontend;

    private final VNPAYService vnpayService;

    public PaymentController(VNPAYService vnpayService) {
        this.vnpayService = vnpayService;
    }

    @PostMapping("/api/payment/create")
    public ResponseEntity<ResPaymentLinkDTO> createPayment(@RequestBody CreatePaymentDTO createPaymentDTO)
            throws UnsupportedEncodingException, IdInvalidException {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(this.vnpayService.createVNPayLink(createPaymentDTO.getAmount()));
    }

    @GetMapping("/api/payment/vnpay-payment-return")
    public void paymentCompleted(HttpServletRequest request, HttpServletResponse response)
            throws IOException, IdInvalidException {

        int paymentStatus = this.vnpayService.handleOrderReturn(request);

        String orderInfo = request.getParameter("vnp_OrderInfo");
        String paymentTime = request.getParameter("vnp_PayDate");
        String transactionId = request.getParameter("vnp_TransactionNo");
        String totalPrice = request.getParameter("vnp_Amount");

        String redirectUrl = vnp_ReturnUrl_frontend
                + "?status=" + paymentStatus
                + "&orderInfo=" + URLEncoder.encode(orderInfo, StandardCharsets.UTF_8)
                + "&paymentTime=" + URLEncoder.encode(paymentTime, StandardCharsets.UTF_8)
                + "&transactionId=" + URLEncoder.encode(transactionId, StandardCharsets.UTF_8)
                + "&totalPrice=" + URLEncoder.encode(totalPrice, StandardCharsets.UTF_8);

        response.sendRedirect(redirectUrl);
    }

}
