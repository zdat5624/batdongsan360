/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.vnpay.common;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import java.io.IOException;
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
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 *
 * @author CTT VNPAY
 */
public class ajaxServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

        String vnp_Version = "2.1.0";
        String vnp_Command = "pay";
        String orderType = "other";
        long amount = Integer.parseInt(req.getParameter("amount")) * 100;
        String bankCode = req.getParameter("bankCode");

        String vnp_TxnRef = Config.getRandomNumber(8);
        String vnp_IpAddr = Config.getIpAddress(req);

        String vnp_TmnCode = Config.vnp_TmnCode;

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        vnp_Params.put("vnp_CurrCode", "VND");

        if (bankCode != null && !bankCode.isEmpty()) {
            vnp_Params.put("vnp_BankCode", bankCode);
        }
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang:" + vnp_TxnRef);
        vnp_Params.put("vnp_OrderType", orderType);

        String locate = req.getParameter("language");
        if (locate != null && !locate.isEmpty()) {
            vnp_Params.put("vnp_Locale", locate);
        } else {
            vnp_Params.put("vnp_Locale", "vn");
        }
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
        com.google.gson.JsonObject job = new JsonObject();
        job.addProperty("code", "00");
        job.addProperty("message", "success");
        job.addProperty("data", paymentUrl);
        Gson gson = new Gson();
        resp.getWriter().write(gson.toJson(job));
    }

    <%try

    {
                        
        /*  IPN URL: Record payment results from VNPAY
        Implementation steps:
        Check checksum
        Find transactions (vnp_TxnRef) in the database (checkOrderId)
        Check the payment status of transactions before updating (checkOrderStatus)
        Check the amount (vnp_Amount) of transactions before updating (checkAmount)
        Update results to Database
        Return recorded results to VNPAY
        */
                
            // ex:  	PaymnentStatus = 0; pending 
            //              PaymnentStatus = 1; success 
            //              PaymnentStatus = 2; Faile 
            
            //Begin process return from VNPAY	
            Map fields = new HashMap();

            
               Phiên bản 2.0.0, 2.0.1 thay đổi đoạn 
               for (Enumeration params = request.getParameterNames(); params.hasMoreElements();) {
                String fieldName = (String) params.nextElement();
                String fieldValue = request.getParameter(fieldName);
                if ((fieldValue != null) && (fieldValue.length() > 0)) 
                {
                    fields.put(fieldName, fieldValue);
                }
            }
            Thành:
            
            for (Enumeration params = request.getParameterNames(); params.hasMoreElements();) {
                String fieldName = URLEncoder.encode((String) params.nextElement(), StandardCharsets.US_ASCII.toString());
                String fieldValue = URLEncoder.encode(request.getParameter(fieldName), StandardCharsets.US_ASCII.toString());
                if ((fieldValue != null) && (fieldValue.length() > 0)) {
                    fields.put(fieldName, fieldValue);
                }
            }
    
            String vnp_SecureHash = request.getParameter("vnp_SecureHash");
            if (fields.containsKey("vnp_SecureHashType")) 
            {
                fields.remove("vnp_SecureHashType");
            }
            if (fields.containsKey("vnp_SecureHash")) 
            {
                fields.remove("vnp_SecureHash");
            }
            
            // Check checksum
            String signValue = Config.hashAllFields(fields);

            
               Trong đó Config.hashAllFields là:

    public static String hashAllFields(Map fields) {
                    // create a list and sort it
                    List fieldNames = new ArrayList(fields.keySet());
                    Collections.sort(fieldNames);
                    // create a buffer for the md5 input and add the secure secret first
                    StringBuilder sb = new StringBuilder();
                    //sb.append(com.vnpay.common.Config.vnp_HashSecret);
                    Iterator itr = fieldNames.iterator();
                    while (itr.hasNext()) {
                        String fieldName = (String) itr.next();
                        String fieldValue = (String) fields.get(fieldName);
                        if ((fieldValue != null) && (fieldValue.length() > 0)) {
                            sb.append(fieldName);
                            sb.append("=");
                            sb.append(fieldValue);
                        }
                        if (itr.hasNext()) {
                            sb.append("&");
                        }
                    }
                    //return Sha256(sb.toString());
                    return hmacSHA512(vnp_HashSecret,sb.toString());
                }

    if(signValue.equals(vnp_SecureHash))

    {
    
                boolean checkOrderId = true; // vnp_TxnRef exists in your database
                boolean checkAmount = true; // vnp_Amount is valid (Check vnp_Amount VNPAY returns compared to the 
                amount of

    the code (vnp_TxnRef) in the Your database).
                boolean checkOrderStatus = true; // PaymnentStatus = 0 (pending)
                
                
                if(checkOrderId)
                {
                    if(checkAmount)
                    {
                        if (checkOrderStatus)
                        {
                            if ("00".equals(request.getParameter("vnp_ResponseCode")))
                            {
                                
                                //Here Code update PaymnentStatus = 1 into your Database
                            }
                            else
                            {
                                
                                // Here Code update PaymnentStatus = 2 into your Database
                            }
                            out.print ("{\"RspCode\":\"00\",\"Message\":\"Confirm Success\"}");
                        }
                        else
                        {
                            
                            out.print("{\"RspCode\":\"02\",\"Message\":\"Order already confirmed\"}");
                        }
                    }
                    else
                    {
                       out.print("{\"RspCode\":\"04\",\"Message\":\"Invalid Amount\"}"); 
                    }
                }
                else
                {
                    out.print("{\"RspCode\":\"01\",\"Message\":\"Order not Found\"}");
                }
            }else

    {
        out.print("{\"RspCode\":\"97\",\"Message\":\"Invalid Checksum\"}");
    }}catch(
    Exception e)
    {
            out.print("{\"RspCode\":\"99\",\"Message\":\"Unknow error\"}");
        }%>

}
